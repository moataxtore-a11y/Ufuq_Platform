const bcrypt = require('bcrypt')
const { User, USER_ROLES } = require('../models/User')
const { Course } = require('../models/Course')
const { Assignment } = require('../models/Assignment')
const { Submission } = require('../models/Submission')
const { Grade } = require('../models/Grade')
const { asyncHandler } = require('../utils/asyncHandler')
const { Unit } = require('../models/Unit')
const { Lesson } = require('../models/Lesson')
const { Assessment } = require('../models/Assessment')
const { AssessmentAttempt } = require('../models/AssessmentAttempt')
const { StudentVideoProgress } = require('../models/StudentVideoProgress')
const mongoose = require('mongoose')

async function generateUniqueTeamId() {
    const year = String(new Date().getFullYear())
    for (let i = 0; i < 50; i++) {
        const rand5 = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
        const code = `${year}${rand5}`
        const exists = await User.findOne({ teamId: code }).select('_id')
        if (!exists) return code
    }
    throw new Error('Failed to generate unique teamId')
}

function isValidTeamId(teamId) {
    return typeof teamId === 'string' && /^\d{4}\d{5}$/.test(teamId)
}

async function generateUniqueStudentId() {
    const year = String(new Date().getFullYear())
    for (let i = 0; i < 50; i++) {
        const rand5 = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
        const code = `${year}${rand5}`
        const exists = await User.findOne({ studentId: code }).select('_id')
        if (!exists) return code
    }
    throw new Error('Failed to generate unique studentId')
}

function isValidStudentId(studentId) {
    return typeof studentId === 'string' && /^\d{4}\d{5}$/.test(studentId)
}

const listUsers = asyncHandler(async (req, res) => {
    const { role, q } = req.query
    const filter = {}
    if (role) filter.role = role
    if (q) {
        const qq = String(q).trim()
        if (qq) {
            filter.$or = [
                { name: new RegExp(qq, 'i') },
                { email: new RegExp(qq, 'i') },
                { teamId: new RegExp(qq, 'i') },
                { studentId: new RegExp(qq, 'i') }
            ]
        }
    }
    const users = await User.find(filter).select('name email role teamId studentId mustChangePassword createdAt profile isSuspended suspendedAt')
    res.json(users)
})

const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, teamId, teachingSubject, teachingSection, teachingGradeYear, teamTask, teamPermissions } = req.body || {}
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'name, email, password, role are required' })
    }
    if (!USER_ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' })

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() })
    if (existing) return res.status(409).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 12)

    const finalTeamId = typeof teamId === 'string' && teamId.trim() ? teamId.trim() : (
        (role === 'team' || role === 'teacher') ? await generateUniqueTeamId() : undefined
    )
    const studentId = role === 'student' ? await generateUniqueStudentId() : undefined

    const profile = {}
    if (role === 'teacher') {
        if (typeof teachingSubject === 'string') profile.teachingSubject = teachingSubject.trim()
        const teachingSectionsRaw = req.body && req.body.teachingSections
        const normalizedSections = Array.isArray(teachingSectionsRaw) ?
            teachingSectionsRaw.map((x) => String(x).trim()).filter(Boolean) :
            []

        if (normalizedSections.length) {
            profile.teachingSections = normalizedSections
            profile.teachingSection = normalizedSections[0]
        } else if (typeof teachingSection === 'string') {
            const v = teachingSection.trim()
            profile.teachingSection = v
            profile.teachingSections = v ? [v] : undefined
        }
        if (typeof teachingGradeYear === 'string') profile.teachingGradeYear = teachingGradeYear.trim()
    }

    const perms = role === 'team' ? (
        Array.isArray(teamPermissions) ?
            teamPermissions.map((p) => String(p)).filter(Boolean) : ['courses', 'students', 'grading']
    ) : undefined

    const user = await User.create({
        name,
        email: String(email).toLowerCase().trim(),
        password: hashed,
        role,
        ...(finalTeamId ? { teamId: finalTeamId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(Object.keys(profile).length ? { profile } : {}),
        ...(role === 'team' && typeof teamTask === 'string' ? { teamTask: teamTask.trim() } : {}),
        ...(role === 'team' && perms ? { teamPermissions: perms } : {}),
        mustChangePassword: true
    })

    res.status(201).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        teamTask: user.teamTask,
        teamPermissions: user.teamPermissions,
        studentId: user.studentId,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt
    })
})

const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { name, email, role, teamId, mustChangePassword, password, teachingSubject, teachingSection, teachingGradeYear, teamTask, teamPermissions } = req.body || {}

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (role && !USER_ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' })

    if (typeof name === 'string' && name.trim()) user.name = name.trim()
    if (typeof email === 'string' && email.trim()) user.email = email.toLowerCase().trim()
    if (typeof role === 'string') user.role = role
    if (typeof teamId === 'string') user.teamId = teamId.trim() || undefined
    if (typeof mustChangePassword === 'boolean') user.mustChangePassword = mustChangePassword

    if (typeof teamTask === 'string') user.teamTask = teamTask.trim()
    if (Array.isArray(teamPermissions)) user.teamPermissions = teamPermissions.map((p) => String(p)).filter(Boolean)

    if (typeof teachingSubject === 'string') {
        user.profile = user.profile || {}
        user.profile.teachingSubject = teachingSubject.trim()
    }
    const teachingSectionsRaw = req.body && req.body.teachingSections
    if (Array.isArray(teachingSectionsRaw)) {
        const normalizedSections = teachingSectionsRaw.map((x) => String(x).trim()).filter(Boolean)
        user.profile = user.profile || {}
        if (normalizedSections.length) {
            user.profile.teachingSections = normalizedSections
            user.profile.teachingSection = normalizedSections[0]
        } else {
            user.profile.teachingSections = undefined
            user.profile.teachingSection = ''
        }
    } else if (typeof teachingSection === 'string') {
        const v = teachingSection.trim()
        user.profile = user.profile || {}
        user.profile.teachingSection = v
        user.profile.teachingSections = v ? [v] : undefined
    }
    if (typeof teachingGradeYear === 'string') {
        user.profile = user.profile || {}
        user.profile.teachingGradeYear = teachingGradeYear.trim()
    }

    if (typeof role === 'string' && role === 'team' && !isValidTeamId(user.teamId)) {
        user.teamId = await generateUniqueTeamId()
    }

    if (typeof role === 'string' && role === 'team') {
        user.studentId = undefined
    }

    if (typeof role === 'string' && role === 'teacher' && (!user.teamId || !String(user.teamId).trim())) {
        user.teamId = await generateUniqueTeamId()
    }

    if (typeof role === 'string' && role === 'student' && !isValidStudentId(user.studentId)) {
        user.studentId = await generateUniqueStudentId()
    }

    if (typeof password === 'string' && password.length > 0) {
        const hashed = await bcrypt.hash(password, 12)
        user.password = hashed
    }

    await user.save()

    res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        teamTask: user.teamTask,
        teamPermissions: user.teamPermissions,
        studentId: user.studentId,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt
    })
})

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete current user' })
    }

    await User.deleteOne({ _id: userId })
    res.json({ message: 'Deleted' })
})

const stats = asyncHandler(async (req, res) => {
    const [users, courses, assignments, submissions, grades] = await Promise.all([
        User.countDocuments({}),
        Course.countDocuments({}),
        Assignment.countDocuments({}),
        Submission.countDocuments({}),
        Grade.countDocuments({})
    ])

    const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $project: { _id: 0, role: '$_id', count: 1 } }
    ])

    res.json({
        users,
        courses,
        assignments,
        submissions,
        grades,
        usersByRole
    })
})

const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId)
        .select('name email role teamId teamTask teamPermissions studentId profile mustChangePassword status approvedAt approvedBy rejectionReason createdAt updatedAt isSuspended suspendedAt suspendedBy suspendedReason')
        .populate('approvedBy', 'name email role')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
})

const getUserByEmail = asyncHandler(async (req, res) => {
    const emailRaw = typeof req.query.email === 'string' ? req.query.email : ''
    const email = String(emailRaw || '').toLowerCase().trim()
    if (!email) return res.status(400).json({ message: 'email is required' })

    const user = await User.findOne({ email }).select('name email role teamId studentId mustChangePassword status createdAt')
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot reuse admin user' })
    if (user.role === 'teacher') return res.status(400).json({ message: 'Cannot reuse teacher user' })

    res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        studentId: user.studentId,
        mustChangePassword: user.mustChangePassword,
        status: user.status,
        createdAt: user.createdAt
    })
})

const suspendUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { reason } = req.body || {}
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ message: 'Cannot suspend current user' })
    }

    user.isSuspended = true
    user.suspendedAt = new Date()
    user.suspendedBy = req.user.id
    user.suspendedReason = typeof reason === 'string' ? reason.trim() : ''
    await user.save()

    res.json({
        id: user._id.toString(),
        isSuspended: true,
        suspendedAt: user.suspendedAt,
        suspendedReason: user.suspendedReason
    })
})

const activateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.isSuspended = false
    user.suspendedAt = null
    user.suspendedBy = null
    user.suspendedReason = ''
    await user.save()

    res.json({ id: user._id.toString(), isSuspended: false })
})

const getUserStats = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const me = await User.findById(userId).select('role profile')
    if (!me) return res.status(404).json({ message: 'Not found' })
    if (me.role !== 'student') return res.status(400).json({ message: 'User is not a student' })

    const profile = me && me.profile ? me.profile : {}
    const gradeYear = typeof profile.gradeYear === 'string' ? profile.gradeYear.trim() : ''
    const section = typeof profile.section === 'string' ? profile.section.trim() : ''

    const enrolledCourses = await Course.find({ students: userId })
        .select('_id title teacher gradeYear section isFree price discountPercent')
        .populate('teacher', 'name')
    const enrolledTotal = enrolledCourses.length

    const strictSameYear = gradeYear
        ? enrolledCourses.filter((c) => String(c.gradeYear || '').trim() === gradeYear)
        : enrolledCourses
    const sameYearCourses = strictSameYear.length > 0 ? strictSameYear : enrolledCourses
    const usedFallback = strictSameYear.length === 0 && enrolledCourses.length > 0

    const sameYearCourseIds = sameYearCourses.map((c) => c._id)
    const sameYearTeachers = Array.from(
        new Set(
            sameYearCourses
                .map((c) => (c.teacher ? String(c.teacher._id || c.teacher) : ''))
                .filter(Boolean)
        )
    )

    const sameYearCoursesDetails = sameYearCourses.map((c) => ({
        id: c._id.toString(),
        title: c.title || '',
        teacherName: c.teacher && c.teacher.name ? c.teacher.name : '',
        gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
        section: typeof c.section === 'string' ? c.section : '',
        isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
        price: typeof c.price === 'number' ? c.price : Number(c.price || 0),
        discountPercent: typeof c.discountPercent === 'number' ? c.discountPercent : Number(c.discountPercent || 0)
    }))

    const watchedAgg = sameYearCourseIds.length
        ? await StudentVideoProgress.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(userId), course: { $in: sameYearCourseIds } } },
            { $group: { _id: '$course', seconds: { $sum: '$totalSecondsWatched' } } }
        ])
        : []
    const watchedByCourseId = new Map(watchedAgg.map((r) => [String(r._id), Number(r.seconds || 0)]))

    let watchedTotalSeconds = 0
    for (const v of watchedByCourseId.values()) watchedTotalSeconds += Number(v || 0)
    const watchedTotalHours = Math.round((watchedTotalSeconds / 3600) * 100) / 100

    const units = sameYearCourseIds.length
        ? await Unit.find({ course: { $in: sameYearCourseIds } }).select('_id course')
        : []
    const unitIds = units.map((u) => u._id)
    const unitCourseById = new Map(units.map((u) => [String(u._id), String(u.course)]))

    const lessons = unitIds.length
        ? await Lesson.find({ unit: { $in: unitIds } }).select('unit contentSections')
        : []
    const totalVideoSecondsByCourseId = new Map()

    for (const l of lessons) {
        const uid = l && l.unit ? String(l.unit) : ''
        const courseId = unitCourseById.get(uid) || ''
        if (!courseId) continue

        let sum = totalVideoSecondsByCourseId.get(courseId) || 0
        const sections = Array.isArray(l && l.contentSections) ? l.contentSections : []
        for (const s of sections) {
            if (s && s.enabled === false) continue
            const vids = Array.isArray(s && s.videos) ? s.videos : []
            for (const v of vids) {
                const d = typeof v.durationSec === 'number' ? v.durationSec : Number(v.durationSec || 0)
                if (Number.isFinite(d) && d > 0) sum += d
            }
        }
        totalVideoSecondsByCourseId.set(courseId, sum)
    }

    let totalVideoSecondsAll = 0
    for (const v of totalVideoSecondsByCourseId.values()) totalVideoSecondsAll += Number(v || 0)
    const totalVideoHoursAll = Math.round((totalVideoSecondsAll / 3600) * 100) / 100

    const sameYearCoursesWithWatch = sameYearCoursesDetails.map((c) => {
        const seconds = watchedByCourseId.get(String(c.id)) || 0
        const hours = Math.round((seconds / 3600) * 100) / 100
        const totalVideoSeconds = totalVideoSecondsByCourseId.get(String(c.id)) || 0
        const completionPercent = totalVideoSeconds > 0
            ? Math.min(100, Math.max(0, Math.round((seconds / totalVideoSeconds) * 10000) / 100))
            : null
        return { ...c, watchedSeconds: seconds, watchedHours: hours, totalVideoSeconds, completionPercent }
    })

    const allCourseIds = enrolledCourses.map((c) => c._id)
    const assessmentDocs = allCourseIds.length
        ? await Assessment.find({ course: { $in: allCourseIds } })
            .select('_id title type course')
            .populate('course', 'title')
        : []
    const assessmentIds = assessmentDocs.map((a) => a._id)

    const attempts = assessmentIds.length
        ? await AssessmentAttempt.find({ student: userId, assessment: { $in: assessmentIds } })
            .select('status score maxScore assessment submittedAt createdAt')
            .populate('assessment', 'title type course')
        : []

    const gradedWithScore = attempts.filter(
        (a) => a && a.status === 'graded' && Number(a.maxScore || 0) > 0
    )
    const percents = gradedWithScore.map((a) => (Number(a.score || 0) / Number(a.maxScore || 0)) * 100)

    const avgPercent = percents.length
        ? Math.round((percents.reduce((s, p) => s + p, 0) / percents.length) * 100) / 100
        : 0
    const bestPercent = percents.length ? Math.round(Math.max(...percents) * 100) / 100 : 0

    const sortedGraded = gradedWithScore
        .slice()
        .sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime())

    const lastGradedAttempt = sortedGraded[0] || null
    const lastPercent = lastGradedAttempt
        ? Math.round(((Number(lastGradedAttempt.score || 0) / Number(lastGradedAttempt.maxScore || 0)) * 100) * 100) / 100
        : null

    const recentResults = sortedGraded.slice(0, 20).map((a) => {
        const pct = (Number(a.score || 0) / Number(a.maxScore || 0)) * 100
        const assessment = a.assessment || null
        const course = assessment && assessment.course ? assessment.course : null
        return {
            attemptId: a._id.toString(),
            assessmentTitle: assessment && assessment.title ? assessment.title : '',
            assessmentType: assessment && assessment.type ? assessment.type : '',
            courseTitle: course && course.title ? course.title : '',
            percent: Math.round(pct * 100) / 100,
            score: typeof a.score === 'number' ? a.score : 0,
            maxScore: typeof a.maxScore === 'number' ? a.maxScore : 0,
            submittedAt: a.submittedAt || null,
            createdAt: a.createdAt
        }
    })

    res.json({
        profile: { gradeYear, section },
        usedFallback,
        courses: {
            enrolledTotal,
            enrolledSameYear: sameYearCourses.length,
            teachersSameYear: sameYearTeachers.length,
            watchedTotalSeconds,
            watchedTotalHours,
            totalVideoSeconds: totalVideoSecondsAll,
            totalVideoHours: totalVideoHoursAll,
            items: sameYearCoursesWithWatch
        },
        assessments: {
            attemptsTotal: attempts.length,
            gradedAttempts: gradedWithScore.length,
            avgPercent,
            bestPercent,
            lastPercent,
            recentResults
        }
    })
})

module.exports = { listUsers, createUser, updateUser, deleteUser, stats, getUserProfile, getUserByEmail, suspendUser, activateUser, getUserStats }
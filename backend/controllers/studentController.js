const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Unit } = require('../models/Unit')
const { Lesson } = require('../models/Lesson')
const { Assessment } = require('../models/Assessment')
const { AssessmentAttempt } = require('../models/AssessmentAttempt')
const { StudentVideoProgress } = require('../models/StudentVideoProgress')
const { asyncHandler } = require('../utils/asyncHandler')

async function getScopedTeacherIds(viewer) {
    if (!viewer) return []
    if (viewer.role === 'teacher') return [new mongoose.Types.ObjectId(String(viewer.id))]
    if (viewer.role === 'team') {
        const teamId = String(viewer.teamId || '').trim()
        if (!teamId) return []
        const teachers = await User.find({ role: 'teacher', teamId, status: 'approved' }).select('_id')
        return teachers.map((t) => t._id)
    }
    return []
}

async function viewerCanManageStudent(viewer, studentUserId) {
    if (!viewer || (viewer.role !== 'teacher' && viewer.role !== 'team')) return false
    const targetId = String(studentUserId || '').trim()
    if (!mongoose.Types.ObjectId.isValid(targetId)) return false

    const teacherIds = await getScopedTeacherIds(viewer)
    if (!teacherIds.length) return false

    const rows = await Course.aggregate([
        { $match: { teacher: { $in: teacherIds }, students: new mongoose.Types.ObjectId(targetId) } },
        { $limit: 1 },
        { $project: { _id: 1 } }
    ])

    return rows.length > 0
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

const listStudents = asyncHandler(async (req, res) => {
    const { q, status } = req.query
    const filter = { role: 'student' }

    const role = req.user && req.user.role
    const teamIdScoped = req.user && req.user.teamId
    const isScoped = role === 'teacher' || role === 'team'
    if (isScoped && teamIdScoped) {
        filter.teamId = req.user.teamId
    }

    if (status) filter.status = status
    if (q) {
        const qq = String(q).trim()
        if (qq) {
            filter.$or = [{ name: new RegExp(qq, 'i') }, { email: new RegExp(qq, 'i') }, { studentId: new RegExp(qq, 'i') }]
        }
    }

    const users = await User.find(filter).select('name email role teamId studentId status mustChangePassword createdAt')
    res.json(users)
})

const suspendStudent = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const { reason } = req.body || {}

    const user = await User.findById(studentUserId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role !== 'student') return res.status(400).json({ message: 'Target user is not a student' })

    const ok = await viewerCanManageStudent(req.user, user._id)
    if (!ok) return res.status(403).json({ message: 'Forbidden' })

    user.isSuspended = true
    user.suspendedAt = new Date()
    user.suspendedBy = req.user.id
    user.suspendedReason = typeof reason === 'string' ? reason.trim() : ''
    await user.save()

    res.json({ id: user._id.toString(), isSuspended: true, suspendedAt: user.suspendedAt })
})

const activateStudent = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const user = await User.findById(studentUserId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role !== 'student') return res.status(400).json({ message: 'Target user is not a student' })

    const ok = await viewerCanManageStudent(req.user, user._id)
    if (!ok) return res.status(403).json({ message: 'Forbidden' })

    user.isSuspended = false
    user.suspendedAt = null
    user.suspendedBy = null
    user.suspendedReason = ''
    await user.save()

    res.json({ id: user._id.toString(), isSuspended: false })
})

const createStudent = asyncHandler(async (req, res) => {
    const { name, email, password, status, teamId } = req.body || {}
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'name, email, password are required' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) return res.status(409).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 12)
    const studentId = await generateUniqueStudentId()

    const role = req.user && req.user.role
    const isScoped = role === 'teacher' || role === 'team'
    const finalTeamId = isScoped ? (req.user && req.user.teamId) : (typeof teamId === 'string' && teamId.trim() ? teamId.trim() : undefined)

    const user = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashed,
        role: 'student',
        studentId,
        ...(finalTeamId ? { teamId: finalTeamId } : {}),
        status: typeof status === 'string' ? status : 'approved',
        mustChangePassword: true
    })

    res.status(201).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        studentId: user.studentId,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt
    })
})

const updateStudent = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const { name, email, password, status, teamId, mustChangePassword } = req.body || {}

    const user = await User.findById(studentUserId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role !== 'student') return res.status(400).json({ message: 'Target user is not a student' })

    if (typeof name === 'string' && name.trim()) user.name = name.trim()
    if (typeof email === 'string' && email.trim()) user.email = email.toLowerCase().trim()
    if (typeof status === 'string') user.status = status

    const role = req.user && req.user.role
    const isScoped = role === 'teacher' || role === 'team'
    if (isScoped && req.user && req.user.teamId) {
        user.teamId = req.user.teamId
    } else if (typeof teamId === 'string') {
        user.teamId = teamId.trim() || undefined
    }
    if (typeof mustChangePassword === 'boolean') user.mustChangePassword = mustChangePassword

    if (typeof password === 'string' && password.length > 0) {
        const hashed = await bcrypt.hash(password, 12)
        user.password = hashed
    }

    if (!user.studentId) {
        user.studentId = await generateUniqueStudentId()
    }

    await user.save()

    res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        studentId: user.studentId,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt
    })
})

const deleteStudent = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const user = await User.findById(studentUserId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role !== 'student') return res.status(400).json({ message: 'Target user is not a student' })

    const role = req.user && req.user.role
    if (role !== 'admin') {
        const scopedTeamId = req.user && req.user.teamId ? String(req.user.teamId) : ''
        const userTeamId = user.teamId ? String(user.teamId) : ''
        if (!scopedTeamId || !userTeamId || scopedTeamId !== userTeamId) {
            return res.status(403).json({ message: 'Forbidden' })
        }
    }

    await Course.updateMany({ students: user._id }, { $pull: { students: user._id } })
    await User.deleteOne({ _id: studentUserId })
    res.json({ message: 'Deleted' })
})

const getStudentProfile = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const user = await User.findById(studentUserId).select('name email role studentId status teamId profile createdAt')
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role !== 'student') return res.status(400).json({ message: 'Target user is not a student' })
    res.json(user)
})

const getStudentStats = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const targetId = String(studentUserId || '').trim()
    if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ message: 'Invalid student id' })

    const student = await User.findById(targetId).select('role profile name email')
    if (!student) return res.status(404).json({ message: 'User not found' })
    if (student.role !== 'student') return res.status(400).json({ message: 'Target user is not a student' })

    const profile = student && student.profile ? student.profile : {}
    const gradeYear = typeof profile.gradeYear === 'string' ? profile.gradeYear.trim() : ''
    const section = typeof profile.section === 'string' ? profile.section.trim() : ''

    // Scope courses based on viewer
    let courseFilter = { students: targetId }
    if (req.user.role === 'teacher') {
        courseFilter = { ...courseFilter, teacher: req.user.id }
    } else if (req.user.role === 'team') {
        const teamId = String(req.user.teamId || '').trim()
        if (!teamId) return res.json({
            student: { id: targetId, name: student.name, email: student.email },
            profile: { gradeYear, section },
            courses: { enrolledTotal: 0, enrolledSameYear: 0, teachersSameYear: 0, watchedTotalSeconds: 0, watchedTotalHours: 0, totalVideoSeconds: 0, totalVideoHours: 0, items: [] },
            assessments: { attemptsTotal: 0, gradedAttempts: 0, avgPercent: 0, bestPercent: 0, lastPercent: null, recentResults: [] }
        })
        const teachers = await User.find({ role: 'teacher', teamId, status: 'approved' }).select('_id')
        const teacherIds = teachers.map((t) => t._id)
        courseFilter = { ...courseFilter, teacher: { $in: teacherIds } }
    }

    const enrolledCourses = await Course.find(courseFilter)
        .select('_id title teacher gradeYear section isFree price discountPercent')
        .populate('teacher', 'name')

    const enrolledTotal = enrolledCourses.length

    const strictSameYear = gradeYear
        ? enrolledCourses.filter((c) => String(c.gradeYear || '').trim() === gradeYear)
        : enrolledCourses
    const sameYearCourses = strictSameYear.length > 0 ? strictSameYear : enrolledCourses
    const sameYearCourseIds = sameYearCourses.map((c) => c._id)
    const sameYearTeachers = Array.from(new Set(sameYearCourses.map((c) => (c.teacher ? String(c.teacher._id || c.teacher) : '')).filter(Boolean)))

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

    const watchedAgg = sameYearCourseIds.length ? await StudentVideoProgress.aggregate([
        { $match: { student: new mongoose.Types.ObjectId(targetId), course: { $in: sameYearCourseIds } } },
        { $group: { _id: '$course', seconds: { $sum: '$totalSecondsWatched' } } }
    ]) : []
    const watchedByCourseId = new Map(watchedAgg.map((r) => [String(r._id), Number(r.seconds || 0)]))

    let watchedTotalSeconds = 0
    for (const v of watchedByCourseId.values()) watchedTotalSeconds += Number(v || 0)
    const watchedTotalHours = Math.round((watchedTotalSeconds / 3600) * 100) / 100

    const units = sameYearCourseIds.length ? await Unit.find({ course: { $in: sameYearCourseIds } }).select('_id course') : []
    const unitIds = units.map((u) => u._id)
    const unitCourseById = new Map(units.map((u) => [String(u._id), String(u.course)]))

    const lessons = unitIds.length ? await Lesson.find({ unit: { $in: unitIds } }).select('unit contentSections') : []
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
                const durationRaw = v && v.durationSec
                const d = typeof durationRaw === 'number' ? durationRaw : Number(durationRaw || 0)
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
        const totalVideoHours = Math.round((totalVideoSeconds / 3600) * 100) / 100
        const completionPercent = totalVideoSeconds > 0 ? Math.min(100, Math.max(0, (seconds / totalVideoSeconds) * 100)) : null
        const completionPercentRounded = typeof completionPercent === 'number' ? Math.round(completionPercent * 100) / 100 : null
        return { ...c, watchedSeconds: seconds, watchedHours: hours, totalVideoSeconds, totalVideoHours, completionPercent: completionPercentRounded }
    })

    const assessments = sameYearCourseIds.length ? await Assessment.find({ course: { $in: sameYearCourseIds } }).select('_id title type course')
        .populate('course', 'title') : []
    const assessmentIds = assessments.map((a) => a._id)

    const attempts = assessmentIds.length ? await AssessmentAttempt.find({ student: targetId, assessment: { $in: assessmentIds } })
        .select('status score maxScore assessment createdAt')
        .populate('assessment', 'title type course') : []

    const graded = attempts.filter((a) => a && a.status === 'graded' && Number(a.maxScore || 0) > 0)
    const percents = graded.map((a) => (Number(a.score || 0) / Number(a.maxScore || 0)) * 100)
    const avgPercent = percents.length ? Math.round((percents.reduce((s, p) => s + p, 0) / percents.length) * 100) / 100 : 0
    const bestPercent = percents.length ? Math.round((Math.max(...percents)) * 100) / 100 : 0
    const lastGradedAttempt = graded.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    const lastPercent = lastGradedAttempt ? Math.round(((Number(lastGradedAttempt.score || 0) / Number(lastGradedAttempt.maxScore || 0)) * 100) * 100) / 100 : null

    const recentResults = graded.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
        .map((a) => {
            const pct = Number(a.maxScore || 0) > 0 ? (Number(a.score || 0) / Number(a.maxScore || 0)) * 100 : 0
            const assessment = a.assessment || null
            const course = assessment && assessment.course ? assessment.course : null
            return {
                attemptId: a._id.toString(),
                assessmentTitle: assessment && assessment.title ? assessment.title : '',
                courseTitle: course && course.title ? course.title : '',
                percent: Math.round(pct * 100) / 100,
                createdAt: a.createdAt
            }
        })

    res.json({
        student: { id: targetId, name: student.name, email: student.email },
        profile: { gradeYear, section },
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
            gradedAttempts: graded.length,
            avgPercent,
            bestPercent,
            lastPercent,
            recentResults
        }
    })
})

module.exports = {
    listStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    suspendStudent,
    activateStudent,
    getStudentProfile,
    getStudentStats
}
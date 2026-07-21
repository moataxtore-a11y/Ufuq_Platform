const bcrypt = require('bcrypt')
const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const SALT_ROUNDS = 12

async function generateUniqueTeamId() {
    const year = String(new Date().getFullYear())
    for (let i = 0; i < 50; i++) {
        const rand5 = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
        const code = `${year}${rand5}`
        const exists = await prisma.user.findFirst({ where: { teamId: code }, select: { id: true } })
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
        const exists = await prisma.user.findFirst({ where: { studentId: code }, select: { id: true } })
        if (!exists) return code
    }
    throw new Error('Failed to generate unique studentId')
}

function isValidStudentId(studentId) {
    return typeof studentId === 'string' && /^\d{4}\d{5}$/.test(studentId)
}

const listUsers = asyncHandler(async (req, res) => {
    const { role, q } = req.query
    const where = {}
    if (typeof role === 'string' && role.trim()) where.role = role.trim()
    if (typeof q === 'string' && q.trim()) {
        const qq = q.trim()
        where.OR = [
            { name: { contains: qq, mode: 'insensitive' } },
            { email: { contains: qq, mode: 'insensitive' } },
            { teamId: { contains: qq, mode: 'insensitive' } },
            { studentId: { contains: qq, mode: 'insensitive' } }
        ]
    }
    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true, name: true, email: true, role: true, teamId: true,
            studentId: true, mustChangePassword: true, createdAt: true,
            profile: true, isSuspended: true, suspendedAt: true
        }
    })
    res.json(users)
})

const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, teamId, teachingSubject, teachingSection, teachingGradeYear, teamTask, teamPermissions } = req.body || {}
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'name, email, password, role are required' })
    }
    const validRoles = ['admin', 'teacher', 'team', 'student']
    if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' })

    const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() }, select: { id: true } })
    if (existing) return res.status(409).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, SALT_ROUNDS)

    const finalTeamId = typeof teamId === 'string' && teamId.trim() ? teamId.trim() : (
        (role === 'team' || role === 'teacher') ? await generateUniqueTeamId() : undefined
    )
    const studentId = role === 'student' ? await generateUniqueStudentId() : undefined

    const profile = {}
    if (role === 'teacher') {
        if (typeof teachingSubject === 'string') profile.teachingSubject = teachingSubject.trim()
        const teachingSectionsRaw = req.body && req.body.teachingSections
        const normalizedSections = Array.isArray(teachingSectionsRaw)
            ? teachingSectionsRaw.map((x) => String(x).trim()).filter(Boolean)
            : []
        if (normalizedSections.length) {
            profile.teachingSections = normalizedSections
            profile.teachingSection = normalizedSections[0]
        } else if (typeof teachingSection === 'string') {
            const v = teachingSection.trim()
            profile.teachingSection = v
            if (v) profile.teachingSections = [v]
        }
        if (typeof teachingGradeYear === 'string') profile.teachingGradeYear = teachingGradeYear.trim()
    }

    const perms = role === 'team'
        ? (Array.isArray(teamPermissions) ? teamPermissions.map((p) => String(p)).filter(Boolean) : ['courses', 'students', 'grading'])
        : undefined

    const user = await prisma.user.create({
        data: {
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
        }
    })

    res.status(201).json({
        id: user.id,
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

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const validRoles = ['admin', 'teacher', 'team', 'student']
    if (role && !validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' })

    const data = {}
    if (typeof name === 'string' && name.trim()) data.name = name.trim()
    if (typeof email === 'string' && email.trim()) data.email = email.toLowerCase().trim()
    if (typeof role === 'string') data.role = role
    if (typeof teamId === 'string') data.teamId = teamId.trim() || null
    if (typeof mustChangePassword === 'boolean') data.mustChangePassword = mustChangePassword
    if (typeof teamTask === 'string') data.teamTask = teamTask.trim()
    if (Array.isArray(teamPermissions)) data.teamPermissions = teamPermissions.map((p) => String(p)).filter(Boolean)

    const profile = user.profile ? { ...user.profile } : {}
    if (typeof teachingSubject === 'string') profile.teachingSubject = teachingSubject.trim()
    const teachingSectionsRaw = req.body && req.body.teachingSections
    if (Array.isArray(teachingSectionsRaw)) {
        const normalizedSections = teachingSectionsRaw.map((x) => String(x).trim()).filter(Boolean)
        if (normalizedSections.length) {
            profile.teachingSections = normalizedSections
            profile.teachingSection = normalizedSections[0]
        } else {
            delete profile.teachingSections
            profile.teachingSection = ''
        }
    } else if (typeof teachingSection === 'string') {
        profile.teachingSection = teachingSection.trim()
        profile.teachingSections = teachingSection.trim() ? [teachingSection.trim()] : undefined
    }
    if (typeof teachingGradeYear === 'string') profile.teachingGradeYear = teachingGradeYear.trim()

    if (Object.keys(profile).length > 0) data.profile = profile

    if (typeof role === 'string' && role === 'team' && !isValidTeamId(user.teamId)) {
        data.teamId = await generateUniqueTeamId()
    }
    if (typeof role === 'string' && role === 'teacher' && (!user.teamId || !String(user.teamId).trim())) {
        data.teamId = await generateUniqueTeamId()
    }
    if (typeof role === 'string' && role === 'student' && !isValidStudentId(user.studentId)) {
        data.studentId = await generateUniqueStudentId()
    }

    if (typeof password === 'string' && password.length > 0) {
        data.password = await bcrypt.hash(password, SALT_ROUNDS)
    }

    const updated = await prisma.user.update({ where: { id: userId }, data })

    res.json({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        teamId: updated.teamId,
        teamTask: updated.teamTask,
        teamPermissions: updated.teamPermissions,
        studentId: updated.studentId,
        mustChangePassword: updated.mustChangePassword,
        createdAt: updated.createdAt
    })
})

const deleteUserAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot delete current user' })
    await prisma.user.delete({ where: { id: userId } })
    res.json({ message: 'Deleted' })
})

const stats = asyncHandler(async (req, res) => {
    const [users, courses, assignments] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.assignment.count()
    ])

    const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
    })

    res.json({
        users,
        courses,
        assignments,
        usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role }))
    })
})

const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true, name: true, email: true, role: true, teamId: true,
            teamTask: true, teamPermissions: true, studentId: true,
            profile: true, mustChangePassword: true, status: true,
            approvedAt: true, approvedBy: true, rejectionReason: true,
            createdAt: true, updatedAt: true, isSuspended: true,
            suspendedAt: true, suspendedBy: true, suspendedReason: true
        }
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    let approvedByUser = null
    if (user.approvedBy) {
        approvedByUser = await prisma.user.findUnique({
            where: { id: user.approvedBy },
            select: { id: true, name: true, email: true, role: true }
        })
    }

    res.json({ ...user, approvedBy: approvedByUser })
})

const getUserByEmail = asyncHandler(async (req, res) => {
    const emailRaw = typeof req.query.email === 'string' ? req.query.email : ''
    const email = String(emailRaw || '').toLowerCase().trim()
    if (!email) return res.status(400).json({ message: 'email is required' })

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, role: true, teamId: true, studentId: true, mustChangePassword: true, status: true, createdAt: true }
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot reuse admin user' })
    if (user.role === 'teacher') return res.status(400).json({ message: 'Cannot reuse teacher user' })

    res.json(user)
})

const suspendUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { reason } = req.body || {}
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot suspend current user' })

    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            isSuspended: true,
            suspendedAt: new Date(),
            suspendedBy: req.user.id,
            suspendedReason: typeof reason === 'string' ? reason.trim() : ''
        }
    })

    res.json({ id: updated.id, isSuspended: true, suspendedAt: updated.suspendedAt, suspendedReason: updated.suspendedReason })
})

const activateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { isSuspended: false, suspendedAt: null, suspendedBy: null, suspendedReason: '' }
    })
    res.json({ id: updated.id, isSuspended: false })
})

const getUserStats = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, profile: true }
    })
    if (!me) return res.status(404).json({ message: 'Not found' })
    if (me.role !== 'student') return res.status(400).json({ message: 'User is not a student' })

    const profile = me.profile || {}
    const gradeYear = typeof profile.gradeYear === 'string' ? profile.gradeYear.trim() : ''
    const section = typeof profile.section === 'string' ? profile.section.trim() : ''

    const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: userId },
        include: {
            course: {
                select: { id: true, title: true, teacherId: true, gradeYear: true, section: true, isFree: true, price: true, discountPercent: true }
            }
        }
    })

    const enrolledTotal = enrollments.length
    const enrolledCourses = enrollments.map((e) => e.course)

    const strictSameYear = gradeYear
        ? enrolledCourses.filter((c) => String(c.gradeYear || '').trim() === gradeYear)
        : enrolledCourses
    const sameYearCourses = strictSameYear.length > 0 ? strictSameYear : enrolledCourses
    const usedFallback = strictSameYear.length === 0 && enrolledCourses.length > 0

    const sameYearCourseIds = sameYearCourses.map((c) => c.id)
    const sameYearTeachers = [...new Set(sameYearCourses.map((c) => c.teacherId).filter(Boolean))]

    const teachers = sameYearTeachers.length
        ? await prisma.user.findMany({
            where: { id: { in: sameYearTeachers } },
            select: { id: true, name: true }
          })
        : []
    const teacherNameMap = new Map(teachers.map((t) => [t.id, t.name]))

    const sameYearCoursesDetails = sameYearCourses.map((c) => ({
        id: c.id,
        title: c.title || '',
        teacherName: teacherNameMap.get(c.teacherId) || '',
        gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
        section: typeof c.section === 'string' ? c.section : '',
        isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
        price: typeof c.price === 'number' ? c.price : 0,
        discountPercent: typeof c.discountPercent === 'number' ? c.discountPercent : 0
    }))

    const videoProgress = sameYearCourseIds.length
        ? await prisma.studentVideoProgress.findMany({
            where: { studentId: userId, courseId: { in: sameYearCourseIds } },
            select: { courseId: true, totalSecondsWatched: true }
          })
        : []

    const watchedByCourseId = new Map()
    let watchedTotalSeconds = 0
    for (const vp of videoProgress) {
        const prev = watchedByCourseId.get(vp.courseId) || 0
        watchedByCourseId.set(vp.courseId, prev + Number(vp.totalSecondsWatched || 0))
        watchedTotalSeconds += Number(vp.totalSecondsWatched || 0)
    }
    const watchedTotalHours = Math.round((watchedTotalSeconds / 3600) * 100) / 100

    const units = sameYearCourseIds.length
        ? await prisma.unit.findMany({
            where: { courseId: { in: sameYearCourseIds } },
            select: { id: true, courseId: true }
          })
        : []
    const unitIds = units.map((u) => u.id)
    const unitCourseById = new Map(units.map((u) => [u.id, u.courseId]))

    const lessons = unitIds.length
        ? await prisma.lesson.findMany({
            where: { unitId: { in: unitIds } },
            select: { unitId: true, contentSections: true }
          })
        : []

    const totalVideoSecondsByCourseId = new Map()
    for (const l of lessons) {
        const courseId = unitCourseById.get(l.unitId) || ''
        if (!courseId) continue
        const sections = Array.isArray(l.contentSections) ? l.contentSections : []
        let sum = totalVideoSecondsByCourseId.get(courseId) || 0
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
        const seconds = watchedByCourseId.get(c.id) || 0
        const hours = Math.round((seconds / 3600) * 100) / 100
        const totalVideoSeconds = totalVideoSecondsByCourseId.get(c.id) || 0
        const completionPercent = totalVideoSeconds > 0
            ? Math.min(100, Math.max(0, Math.round((seconds / totalVideoSeconds) * 10000) / 100))
            : null
        return { ...c, watchedSeconds: seconds, watchedHours: hours, totalVideoSeconds, completionPercent }
    })

    const allCourseIds = enrolledCourses.map((c) => c.id)
    const assessments = allCourseIds.length
        ? await prisma.assessment.findMany({
            where: { courseId: { in: allCourseIds } },
            select: { id: true, title: true, type: true, courseId: true }
          })
        : []
    const assessmentIds = assessments.map((a) => a.id)
    const assessmentCourseMap = new Map(assessments.map((a) => [a.id, a]))

    const attempts = assessmentIds.length
        ? await prisma.assessmentAttempt.findMany({
            where: { studentId: userId, assessmentId: { in: assessmentIds } },
            select: { id: true, status: true, score: true, maxScore: true, assessmentId: true, submittedAt: true, createdAt: true }
          })
        : []

    const gradedWithScore = attempts.filter((a) => a.status === 'graded' && Number(a.maxScore || 0) > 0)
    const percents = gradedWithScore.map((a) => (Number(a.score || 0) / Number(a.maxScore || 0)) * 100)
    const avgPercent = percents.length ? Math.round((percents.reduce((s, p) => s + p, 0) / percents.length) * 100) / 100 : 0
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
        const asm = assessmentCourseMap.get(a.assessmentId)
        return {
            attemptId: a.id,
            assessmentTitle: asm ? asm.title : '',
            assessmentType: asm ? asm.type : '',
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

module.exports = {
    listUsers, createUser, updateUser, deleteUser: deleteUserAdmin,
    stats, getUserProfile, getUserByEmail, suspendUser, activateUser, getUserStats
}

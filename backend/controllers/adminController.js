const bcrypt = require('bcryptjs')
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

async function detachUserReferences(userId) {
    await prisma.user.updateMany({ where: { suspendedBy: userId }, data: { suspendedBy: null } })
    await prisma.user.updateMany({ where: { approvedBy: userId }, data: { approvedBy: null } })
    await prisma.assignment.updateMany({ where: { createdBy: userId }, data: { createdBy: null } })
    await prisma.joinTeacherApplication.updateMany({ where: { assignedById: userId }, data: { assignedById: null } })
}

async function deleteStudentOwnedData(userId) {
    await prisma.assessmentAttempt.deleteMany({ where: { studentId: userId } })
    await prisma.grade.deleteMany({ where: { studentId: userId } })
    await prisma.submission.deleteMany({ where: { studentId: userId } })
    await prisma.studentVideoProgress.deleteMany({ where: { studentId: userId } })
    await prisma.studentLessonProgress.deleteMany({ where: { studentId: userId } })
    await prisma.studentMessageDismissal.deleteMany({ where: { userId } })
    await prisma.courseEnrollment.deleteMany({ where: { studentId: userId } })
    await prisma.walletTransaction.deleteMany({ where: { userId } })
}

async function deleteAssessmentsByIds(assessmentIds) {
    if (!assessmentIds.length) return
    await prisma.assessmentAttempt.deleteMany({ where: { assessmentId: { in: assessmentIds } } })
    await prisma.assessment.deleteMany({ where: { id: { in: assessmentIds } } })
}

async function deleteCoursesOwnedByUser(userId) {
    const courses = await prisma.course.findMany({ where: { teacherId: userId }, select: { id: true } })
    const courseIds = courses.map((course) => course.id).filter(Boolean)
    if (!courseIds.length) return

    const assessments = await prisma.assessment.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true }
    })
    await deleteAssessmentsByIds(assessments.map((assessment) => assessment.id).filter(Boolean))

    const assignments = await prisma.assignment.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true }
    })
    const assignmentIds = assignments.map((assignment) => assignment.id).filter(Boolean)

    await prisma.grade.deleteMany({ where: { courseId: { in: courseIds } } })
    if (assignmentIds.length) {
        await prisma.submission.deleteMany({ where: { assignmentId: { in: assignmentIds } } })
        await prisma.assignment.deleteMany({ where: { id: { in: assignmentIds } } })
    }

    await prisma.courseEnrollment.deleteMany({ where: { courseId: { in: courseIds } } })
    await prisma.studentVideoProgress.deleteMany({ where: { courseId: { in: courseIds } } })
    await prisma.studentLessonProgress.deleteMany({ where: { courseId: { in: courseIds } } })
    await prisma.courseAccessCode.deleteMany({ where: { courseId: { in: courseIds } } })
    await prisma.courseDiscountCode.deleteMany({ where: { courseId: { in: courseIds } } })

    const units = await prisma.unit.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } })
    const unitIds = units.map((unit) => unit.id).filter(Boolean)
    if (unitIds.length) await prisma.lesson.deleteMany({ where: { unitId: { in: unitIds } } })
    await prisma.unit.deleteMany({ where: { courseId: { in: courseIds } } })
    await prisma.course.deleteMany({ where: { id: { in: courseIds } } })
}

async function reassignStaffRecords(userId, replacementUserId) {
    await prisma.grade.updateMany({ where: { correctedBy: userId }, data: { correctedBy: replacementUserId } })
    await prisma.assessment.updateMany({ where: { createdById: userId }, data: { createdById: replacementUserId } })
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
    res.json(users.map((user) => ({
        ...user,
        teamId: ['teacher', 'team'].includes(user.role) ? user.teamId : null,
        studentId: user.role === 'student' ? user.studentId : null
    })))
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
        const teachingGradeYearsRaw = req.body && req.body.teachingGradeYears
        const normalizedGradeYears = Array.isArray(teachingGradeYearsRaw)
            ? teachingGradeYearsRaw.map((x) => String(x).trim()).filter(Boolean)
            : []
        if (normalizedGradeYears.length) {
            profile.teachingGradeYears = normalizedGradeYears
            profile.teachingGradeYear = normalizedGradeYears[0]
        } else if (typeof teachingGradeYear === 'string') {
            const v = teachingGradeYear.trim()
            profile.teachingGradeYear = v
            if (v) profile.teachingGradeYears = [v]
        }
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
    const teachingGradeYearsRaw = req.body && req.body.teachingGradeYears
    if (Array.isArray(teachingGradeYearsRaw)) {
        const normalizedGradeYears = teachingGradeYearsRaw.map((x) => String(x).trim()).filter(Boolean)
        if (normalizedGradeYears.length) {
            profile.teachingGradeYears = normalizedGradeYears
            profile.teachingGradeYear = normalizedGradeYears[0]
        } else {
            delete profile.teachingGradeYears
            profile.teachingGradeYear = ''
        }
    } else if (typeof teachingGradeYear === 'string') {
        profile.teachingGradeYear = teachingGradeYear.trim()
        profile.teachingGradeYears = teachingGradeYear.trim() ? [teachingGradeYear.trim()] : undefined
    }

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
    if (typeof role === 'string' && role !== 'student') {
        data.studentId = null
    }
    if (typeof role === 'string' && !['teacher', 'team'].includes(role)) {
        data.teamId = null
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
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot delete current user' })

    await detachUserReferences(userId)

    if (user.role === 'student') {
        await deleteStudentOwnedData(userId)
    } else {
        await deleteCoursesOwnedByUser(userId)
        await reassignStaffRecords(userId, req.user.id)
        await prisma.walletTransaction.deleteMany({ where: { userId } })
    }

    await prisma.user.delete({ where: { id: userId } })
    res.json({ message: 'Deleted' })
})

const stats = asyncHandler(async (req, res) => {
    const [users, courses, assignments, submissions, grades, enrollments, assessments, assessmentAttempts] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.assignment.count(),
        prisma.submission.count(),
        prisma.grade.count(),
        prisma.courseEnrollment.count(),
        prisma.assessment.count(),
        prisma.assessmentAttempt.count()
    ])

    const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
    })

    res.json({
        users,
        courses,
        assignments,
        submissions,
        grades,
        enrollments,
        assessments,
        assessmentAttempts,
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

    res.json({
        ...user,
        teamId: ['teacher', 'team'].includes(user.role) ? user.teamId : null,
        studentId: user.role === 'student' ? user.studentId : null,
        approvedBy: approvedByUser
    })
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

const { calculateStudentStats } = require('../utils/studentStats')

const getUserStats = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    })
    if (!me) return res.status(404).json({ message: 'Not found' })
    if (me.role !== 'student') return res.status(400).json({ message: 'User is not a student' })

    const statsData = await calculateStudentStats(userId)
    if (!statsData) return res.status(404).json({ message: 'User stats not found' })

    res.json(statsData)
})

module.exports = {
    listUsers, createUser, updateUser, deleteUser: deleteUserAdmin,
    stats, getUserProfile, getUserByEmail, suspendUser, activateUser, getUserStats
}

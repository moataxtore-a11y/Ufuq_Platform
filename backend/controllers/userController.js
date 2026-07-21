const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const getMyProfile = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile: user.profile || {},
        status: user.status,
        teamId: user.teamId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    })
})

const updateMyProfile = asyncHandler(async (req, res) => {
    const { name, phone, profile } = req.body || {}
    const data = {}
    if (typeof name === 'string' && name.trim()) data.name = name.trim()
    if (typeof phone === 'string' && phone.trim()) data.phone = phone.trim()
    if (profile && typeof profile === 'object') {
        const existing = await prisma.user.findUnique({ where: { id: req.user.id }, select: { profile: true } })
        data.profile = { ...(existing?.profile || {}), ...profile }
    }
    const updated = await prisma.user.update({ where: { id: req.user.id }, data })
    res.json({
        id: updated.id, name: updated.name, email: updated.email,
        phone: updated.phone, profile: updated.profile || {},
        role: updated.role, status: updated.status
    })
})

const getMyStats = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const enrollmentCount = await prisma.courseEnrollment.count({ where: { studentId: userId } })
    const completedLessons = await prisma.studentLessonProgress.count({ where: { studentId: userId, completedAt: { not: null } } })
    const allLessons = await prisma.lesson.findMany({
        where: { course: { enrollments: { some: { studentId: userId } } } },
        select: { id: true }
    })
    res.json({ enrolledCourses: enrollmentCount, completedLessons, totalLessons: allLessons.length })
})

const listUsers = asyncHandler(async (req, res) => {
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''
    const where = {}
    if (typeof req.query.role === 'string' && req.query.role.trim()) where.role = req.query.role.trim()
    if (typeof req.query.status === 'string' && req.query.status.trim()) where.status = req.query.status.trim()
    if (role !== 'admin') {
        if (!teamId) return res.json([])
        where.teamId = teamId
    }
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, status: true, teamId: true, createdAt: true, profile: true } })
    res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, teamId: u.teamId, createdAt: u.createdAt, profile: u.profile || {} })))
})

const getUserById = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, name: true, email: true, role: true, status: true, teamId: true, phone: true, profile: true, createdAt: true, updatedAt: true, walletBalance: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
})

const updateUserById = asyncHandler(async (req, res) => {
    const { name, email, role, phone, profile, teamId } = req.body || {}
    const data = {}
    if (typeof name === 'string' && name.trim()) data.name = name.trim()
    if (typeof email === 'string' && email.trim()) data.email = email.toLowerCase().trim()
    if (typeof phone === 'string') data.phone = phone.trim()
    if (typeof role === 'string' && role.trim()) data.role = role.trim()
    if (teamId !== undefined) data.teamId = (typeof teamId === 'string' && teamId.trim()) ? teamId.trim() : null
    if (profile && typeof profile === 'object') {
        const existing = await prisma.user.findUnique({ where: { id: req.params.id }, select: { profile: true } })
        data.profile = { ...(existing?.profile || {}), ...profile }
    }
    const updated = await prisma.user.update({ where: { id: req.params.id }, data })
    res.json({ id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role, status: updated.status, teamId: updated.teamId, profile: updated.profile || {} })
})

const deleteUser = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, role: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' })
    await prisma.user.delete({ where: { id: user.id } })
    res.json({ message: 'Deleted', id: user.id })
})

const getStudents = asyncHandler(async (req, res) => {
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''
    const where = { role: 'student' }
    if (role !== 'admin') {
        if (!teamId) return res.json([])
        where.teamId = teamId
    }
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }]
    const students = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, status: true, teamId: true, createdAt: true, walletBalance: true, profile: true } })
    res.json(students.map((s) => ({ id: s.id, name: s.name, email: s.email, status: s.status, teamId: s.teamId, createdAt: s.createdAt, walletBalance: typeof s.walletBalance === 'number' ? s.walletBalance : 0, profile: s.profile || {} })))
})

const updateStudentStatus = asyncHandler(async (req, res) => {
    const { status, rejectionReason } = req.body || {}
    const valid = ['pending', 'approved', 'suspended', 'rejected']
    if (!status || !valid.includes(status)) return res.status(400).json({ message: 'Invalid status' })
    const data = { status }
    if (status === 'rejected' && typeof rejectionReason === 'string' && rejectionReason.trim()) data.rejectionReason = rejectionReason.trim()
    else if (status === 'approved') { data.rejectionReason = null; data.approvedAt = new Date(); data.approvedBy = req.user.id }
    const updated = await prisma.user.update({ where: { id: req.params.userId }, data })
    res.json({ id: updated.id, status: updated.status })
})

const getTeachers = asyncHandler(async (req, res) => {
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const where = { role: 'teacher' }
    if (role !== 'admin') {
        if (!teamId) return res.json([])
        where.teamId = teamId
    }
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }]
    const teachers = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, status: true, teamId: true, createdAt: true, profile: true } })
    res.json(teachers.map((t) => ({ id: t.id, name: t.name, email: t.email, role: t.role, status: t.status, teamId: t.teamId, createdAt: t.createdAt, profile: t.profile || {} })))
})

const getStudentsByStatus = asyncHandler(async (req, res) => {
    const statusFilter = String(req.params.status || '').trim()
    const valid = ['pending', 'approved', 'rejected', 'suspended']
    if (!valid.includes(statusFilter)) return res.status(400).json({ message: `Invalid status: ${statusFilter}` })
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''
    const where = { role: 'student', status: statusFilter }
    if (role !== 'admin') {
        if (!teamId) return res.json([])
        where.teamId = teamId
    }
    const students = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, status: true, teamId: true, createdAt: true, profile: true } })
    res.json(students.map((s) => ({ id: s.id, name: s.name, email: s.email, status: s.status, teamId: s.teamId, createdAt: s.createdAt, profile: s.profile || {} })))
})

const getTeamMembers = asyncHandler(async (req, res) => {
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''
    const where = { role: 'team' }
    if (role !== 'admin') {
        if (!teamId) return res.json([])
        where.teamId = teamId
    }
    const members = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, status: true, teamId: true, createdAt: true, profile: true } })
    res.json(members.map((m) => ({ id: m.id, name: m.name, email: m.email, role: m.role, status: m.status, teamId: m.teamId, createdAt: m.createdAt, profile: m.profile || {} })))
})

module.exports = {
    getMyProfile, updateMyProfile, getMyStats,
    listUsers, getUserById, updateUserById, deleteUser,
    getStudents, updateStudentStatus, getTeachers, getStudentsByStatus, getTeamMembers
}

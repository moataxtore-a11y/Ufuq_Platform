const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const listStudents = asyncHandler(async (req, res) => {
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
    res.json(students)
})

const createStudent = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {}
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password are required' })
    const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() }, select: { id: true } })
    if (existing) return res.status(409).json({ message: 'Email already exists' })
    const bcrypt = require('bcryptjs')
    const hashed = await bcrypt.hash(password, 12)
    const profile = {}
    const teamId = req.user && (req.user.role === 'teacher' || req.user.role === 'team') ? req.user.teamId : null
    const user = await prisma.user.create({ data: { name, email: String(email).toLowerCase().trim(), password: hashed, role: 'student', profile, ...(teamId ? { teamId } : {}), mustChangePassword: true } })
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, teamId: user.teamId, createdAt: user.createdAt })
})

const updateStudent = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const { name, email, status } = req.body || {}
    const data = {}
    if (typeof name === 'string' && name.trim()) data.name = name.trim()
    if (typeof email === 'string' && email.trim()) data.email = email.toLowerCase().trim()
    if (typeof status === 'string' && ['pending', 'approved', 'suspended', 'rejected'].includes(status)) data.status = status
    const updated = await prisma.user.update({ where: { id: studentUserId }, data })
    res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role, status: updated.status })
})

const deleteStudent = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const user = await prisma.user.findUnique({ where: { id: studentUserId }, select: { id: true } })
    if (!user) return res.status(404).json({ message: 'Student not found' })
    await prisma.user.delete({ where: { id: studentUserId } })
    res.json({ message: 'Deleted' })
})

const suspendStudent = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const updated = await prisma.user.update({ where: { id: studentUserId }, data: { isSuspended: true, suspendedAt: new Date(), suspendedBy: req.user.id, suspendedReason: '' } })
    res.json({ id: updated.id, isSuspended: true, suspendedAt: updated.suspendedAt })
})

const activateStudent = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const updated = await prisma.user.update({ where: { id: studentUserId }, data: { isSuspended: false, suspendedAt: null, suspendedBy: null, suspendedReason: '' } })
    res.json({ id: updated.id, isSuspended: false })
})

const getStudentProfile = asyncHandler(async (req, res) => {
    const { studentUserId } = req.params
    const user = await prisma.user.findUnique({ where: { id: studentUserId }, select: { id: true, name: true, email: true, role: true, status: true, teamId: true, phone: true, profile: true, walletBalance: true, createdAt: true, updatedAt: true } })
    if (!user) return res.status(404).json({ message: 'Student not found' })
    res.json(user)
})

const getStudentStats = asyncHandler(async (req, res) => {
    const studentId = req.params.studentUserId || req.user.id
    const enrollmentCount = await prisma.courseEnrollment.count({ where: { studentId } })
    const completedLessons = await prisma.studentLessonProgress.count({ where: { studentId, completedAt: { not: null } } })
    const allLessons = await prisma.lesson.findMany({ where: { course: { enrollments: { some: { studentId } } } }, select: { id: true } })
    res.json({ enrolledCourses: enrollmentCount, completedLessons, totalLessons: allLessons.length })
})

module.exports = { listStudents, createStudent, updateStudent, deleteStudent, suspendStudent, activateStudent, getStudentProfile, getStudentStats }

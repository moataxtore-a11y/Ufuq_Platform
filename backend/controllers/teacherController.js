const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')
const bcrypt = require('bcryptjs')

const listPublicTeachers = asyncHandler(async (req, res) => {
    const querySubject = typeof req.query.subject === 'string' ? req.query.subject.trim().toLowerCase() : ''
    const where = { role: 'teacher', status: 'approved' }
    if (querySubject) where.profile = { path: ['teachingSubject'], string_contains: querySubject }
    // Use a more portable approach
    const teachers = await prisma.user.findMany({
        where: { role: 'teacher', status: 'approved' },
        select: { id: true, name: true, profile: true, createdAt: true }
    })
    let filtered = teachers
    if (querySubject) {
        filtered = teachers.filter((t) => {
            const subj = t.profile && typeof t.profile.teachingSubject === 'string' ? t.profile.teachingSubject.toLowerCase() : ''
            return subj.includes(querySubject)
        })
    }
    res.json(filtered.map((t) => ({ id: t.id, name: t.name, profile: t.profile || {}, createdAt: t.createdAt })))
})

const getPublicTeacherById = asyncHandler(async (req, res) => {
    const { teacherId } = req.params
    const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: { id: true, name: true, email: true, role: true, status: true, profile: true, createdAt: true }
    })
    if (!teacher || teacher.role !== 'teacher') return res.status(404).json({ message: 'Teacher not found' })
    const courseCount = await prisma.course.count({ where: { teacherId } })
    const studentCount = await prisma.courseEnrollment.groupBy({ by: ['studentId'], where: { course: { teacherId } }, _count: { studentId: true } })
    res.json({ id: teacher.id, name: teacher.name, email: teacher.email, profile: teacher.profile || {}, createdAt: teacher.createdAt, stats: { courses: courseCount, students: studentCount.length } })
})

const listMyTeam = asyncHandler(async (req, res) => {
    const teamId = req.user.teamId
    if (!teamId) return res.json([])
    const members = await prisma.user.findMany({ where: { teamId, role: 'team' }, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, teamTask: true, teamPermissions: true } })
    res.json(members)
})

const createMyTeamMember = asyncHandler(async (req, res) => {
    const { name, email, password, teamTask, teamPermissions } = req.body || {}
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password are required' })
    const teamId = req.user.teamId
    if (!teamId) return res.status(400).json({ message: 'No team ID. Generate one first.' })
    const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() }, select: { id: true } })
    if (existing) return res.status(409).json({ message: 'Email already exists' })
    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { name, email: String(email).toLowerCase().trim(), password: hashed, role: 'team', teamId, teamTask: typeof teamTask === 'string' ? teamTask.trim() : '', teamPermissions: Array.isArray(teamPermissions) ? teamPermissions : ['courses', 'students', 'grading'], mustChangePassword: true } })
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, teamId: user.teamId, teamTask: user.teamTask, teamPermissions: user.teamPermissions, createdAt: user.createdAt })
})

const updateMyTeamMember = asyncHandler(async (req, res) => {
    const { memberId } = req.params
    const { name, email, teamTask, teamPermissions } = req.body || {}
    const data = {}
    if (typeof name === 'string' && name.trim()) data.name = name.trim()
    if (typeof email === 'string' && email.trim()) data.email = email.toLowerCase().trim()
    if (typeof teamTask === 'string') data.teamTask = teamTask.trim()
    if (Array.isArray(teamPermissions)) data.teamPermissions = teamPermissions
    const updated = await prisma.user.update({ where: { id: memberId }, data })
    res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role, teamTask: updated.teamTask, teamPermissions: updated.teamPermissions })
})

const ensureMyTeamId = asyncHandler(async (req, res) => {
    if (req.user.teamId) return res.json({ teamId: req.user.teamId })
    const year = String(new Date().getFullYear())
    for (let i = 0; i < 50; i++) {
        const rand5 = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
        const code = `${year}${rand5}`
        const exists = await prisma.user.findFirst({ where: { teamId: code }, select: { id: true } })
        if (!exists) {
            await prisma.user.update({ where: { id: req.user.id }, data: { teamId: code } })
            return res.json({ teamId: code })
        }
    }
    res.status(500).json({ message: 'Failed to generate team ID' })
})

module.exports = { listPublicTeachers, getPublicTeacherById, listMyTeam, createMyTeamMember, updateMyTeamMember, ensureMyTeamId }

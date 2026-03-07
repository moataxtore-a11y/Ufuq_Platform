const bcrypt = require('bcrypt')
const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { asyncHandler } = require('../utils/asyncHandler')

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

const listPublicTeachers = asyncHandler(async(req, res) => {

    const limitRaw = Number(req.query.limit)
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 24) : 6

    const teachingSection = typeof req.query.section === 'string' ? req.query.section.trim() : ''
    const teachingGradeYear = typeof req.query.gradeYear === 'string' ? req.query.gradeYear.trim() : ''

    const teacherBaseFilter = { role: 'teacher', status: 'approved' }

    const and = []
    if (teachingSection) {
        and.push({ $or: [{ 'profile.teachingSection': teachingSection }, { 'profile.teachingSections': teachingSection }] })
    }
    if (teachingGradeYear) {
        and.push({ 'profile.teachingGradeYear': teachingGradeYear })
    }
    const filter = and.length ? {...teacherBaseFilter, $and: and } : teacherBaseFilter

    const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name profile createdAt updatedAt')

    res.json(
        users.map((u) => ({
            id: u._id.toString(),
            name: u.name,
            avatarUrl: u.profile && u.profile.avatarUrl || '',
            bio: u.profile && u.profile.bio || '',
            teachingSubject: u.profile && u.profile.teachingSubject || '',
            teachingSection: u.profile && u.profile.teachingSection || '',
            teachingSections: Array.isArray(u.profile && u.profile.teachingSections) ? u.profile.teachingSections : [],
            teachingGradeYear: u.profile && u.profile.teachingGradeYear || '',
            updatedAt: u.updatedAt
        }))
    )
})

const getPublicTeacherById = asyncHandler(async(req, res) => {
    const { teacherId } = req.params
    const user = await User.findOne({ _id: teacherId, role: 'teacher', status: 'approved' }).select('name profile createdAt updatedAt')
    if (!user) return res.status(404).json({ message: 'Teacher not found' })

    res.set('Cache-Control', 'no-store')

    res.json({
        id: user._id.toString(),
        name: user.name,
        avatarUrl: user.profile && user.profile.avatarUrl ? user.profile.avatarUrl : '',
        bio: user.profile && user.profile.bio ? user.profile.bio : '',
        teachingSubject: user.profile && user.profile.teachingSubject ? user.profile.teachingSubject : '',
        teachingSection: user.profile && user.profile.teachingSection ? user.profile.teachingSection : '',
        teachingSections: Array.isArray(user.profile && user.profile.teachingSections) ? user.profile.teachingSections : [],
        teachingGradeYear: user.profile && user.profile.teachingGradeYear ? user.profile.teachingGradeYear : '',
        updatedAt: user.updatedAt
    })
})

const listMyTeam = asyncHandler(async(req, res) => {
    const teamId = req.user && req.user.teamId
    if (!teamId) return res.json([])

    const users = await User.find({ role: 'team', teamId }).select(
        'name email role teamId teamTask teamPermissions mustChangePassword createdAt'
    )
    res.json(users)
})

const createMyTeamMember = asyncHandler(async(req, res) => {
    const teamId = req.user && req.user.teamId
    if (!teamId) return res.status(400).json({ message: 'Teacher has no teamId' })

    const { name, email, password, teamTask, teamPermissions } = req.body || {}
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'name, email, password are required' })
    }
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const normalizedEmail = String(email).toLowerCase().trim()
    const existing = await User.findOne({ email: normalizedEmail }).select('_id')
    if (existing) return res.status(409).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 12)

    const perms = Array.isArray(teamPermissions) ?
        teamPermissions.map((p) => String(p)).filter(Boolean) : ['courses', 'students', 'grading']

    const user = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashed,
        role: 'team',
        teamId,
        teamTask: typeof teamTask === 'string' ? teamTask : '',
        teamPermissions: perms,
        mustChangePassword: true,
        status: 'approved'
    })

    res.status(201).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        teamTask: user.teamTask || '',
        teamPermissions: Array.isArray(user.teamPermissions) ? user.teamPermissions : [],
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt
    })
})

const updateMyTeamMember = asyncHandler(async(req, res) => {
    const teamId = req.user && req.user.teamId
    if (!teamId) return res.status(400).json({ message: 'Teacher has no teamId' })

    const { memberId } = req.params
    const { teamTask, teamPermissions } = req.body || {}

    const member = await User.findOne({ _id: memberId, role: 'team', teamId })
    if (!member) return res.status(404).json({ message: 'Team member not found' })

    if (typeof teamTask === 'string') member.teamTask = teamTask
    if (Array.isArray(teamPermissions)) member.teamPermissions = teamPermissions.map((p) => String(p))

    await member.save()

    res.json({
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
        teamId: member.teamId,
        teamTask: member.teamTask || '',
        teamPermissions: Array.isArray(member.teamPermissions) ? member.teamPermissions : [],
        mustChangePassword: member.mustChangePassword,
        createdAt: member.createdAt
    })
})

const ensureMyTeamId = asyncHandler(async(req, res) => {
    const teacher = await User.findById(req.user.id)
    if (!teacher) return res.status(404).json({ message: 'Not found' })
    if (teacher.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' })

    if (teacher.teamId) {
        return res.json({ teamId: teacher.teamId })
    }

    teacher.teamId = await generateUniqueTeamId()
    await teacher.save()
    return res.status(201).json({ teamId: teacher.teamId })
})

module.exports = { listPublicTeachers, getPublicTeacherById, listMyTeam, createMyTeamMember, updateMyTeamMember, ensureMyTeamId }
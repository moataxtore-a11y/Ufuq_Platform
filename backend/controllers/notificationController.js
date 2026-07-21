const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const getBadges = asyncHandler(async (req, res) => {
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''

    const studentWhere = { role: 'student', status: 'pending' }
    if (role === 'teacher' || role === 'team') {
        if (teamId) studentWhere.teamId = teamId
        else return res.json({ pendingStudents: 0, joinTeamApplications: 0, total: 0 })
    }

    const appWhere = {}
    if (role === 'admin') {
        appWhere.OR = [
            { assignedTeamId: null },
            { assignedTeamId: '' }
        ]
    } else if (role === 'team' || role === 'teacher') {
        if (teamId) appWhere.assignedTeamId = teamId
        else return res.json({ pendingStudents: 0, joinTeamApplications: 0, total: 0 })
    }

    const [pendingStudents, joinTeamApplications] = await Promise.all([
        prisma.user.count({ where: studentWhere }),
        prisma.joinTeacherApplication.count({ where: appWhere })
    ])

    res.set('Cache-Control', 'no-store')
    return res.json({
        pendingStudents,
        joinTeamApplications,
        total: pendingStudents + joinTeamApplications
    })
})

module.exports = { getBadges }

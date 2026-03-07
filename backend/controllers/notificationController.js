const { User } = require('../models/User')
const { JoinTeacherApplication } = require('../models/JoinTeacherApplication')
const { asyncHandler } = require('../utils/asyncHandler')

const getBadges = asyncHandler(async(req, res) => {
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''

    const studentFilter = { role: 'student', status: 'pending' }
    if (role === 'teacher' || role === 'team') {
        if (teamId) studentFilter.teamId = teamId
        else return res.json({ pendingStudents: 0, joinTeamApplications: 0, total: 0 })
    }

    const appFilter = {}
    if (role === 'admin') {
        appFilter.$or = [
            { assignedTeamId: { $exists: false } },
            { assignedTeamId: null },
            { assignedTeamId: '' }
        ]
    } else if (role === 'team' || role === 'teacher') {
        if (teamId) appFilter.assignedTeamId = teamId
        else return res.json({ pendingStudents: 0, joinTeamApplications: 0, total: 0 })
    }

    const [pendingStudents, joinTeamApplications] = await Promise.all([
        User.countDocuments(studentFilter),
        JoinTeacherApplication.countDocuments(appFilter)
    ])

    res.set('Cache-Control', 'no-store')
    return res.json({
        pendingStudents,
        joinTeamApplications,
        total: pendingStudents + joinTeamApplications
    })
})

module.exports = { getBadges }
const { User } = require('../models/User')
const { asyncHandler } = require('../utils/asyncHandler')

const listPendingStudents = asyncHandler(async(req, res) => {
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''

    const filter = { role: 'student', status: 'pending' }
    if (role === 'admin') {
        // admin sees all pending students
    } else if (role === 'teacher' || role === 'team') {
        if (!teamId) return res.json([])
        filter.teamId = teamId
    }

    const users = await User.find(filter).select('name email role teamId status createdAt')
    res.json(users)
})

const approveUser = asyncHandler(async(req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.status = 'approved'
    user.rejectionReason = undefined
    user.approvedAt = new Date()
    user.approvedBy = req.user ? req.user.id : null;

    await user.save()

    res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        approvedAt: user.approvedAt
    })
})

const rejectUser = asyncHandler(async(req, res) => {
    const { userId } = req.params
    const { reason } = req.body || {}

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.status = 'rejected'
    user.rejectionReason = typeof reason === 'string' ? reason : undefined
    user.approvedAt = undefined
    user.approvedBy = undefined

    await user.save()

    res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        rejectionReason: user.rejectionReason
    })
})

module.exports = { listPendingStudents, approveUser, rejectUser }
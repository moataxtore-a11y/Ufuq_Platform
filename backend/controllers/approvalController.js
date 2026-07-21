const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const listPendingStudents = asyncHandler(async (req, res) => {
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''

    const where = { role: 'student', status: 'pending' }
    if (role === 'admin') {
        // admin sees all
    } else if (role === 'teacher' || role === 'team') {
        if (!teamId) return res.json([])
        where.teamId = teamId
    }

    const users = await prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, teamId: true, status: true, createdAt: true }
    })
    res.json(users)
})

const approveUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            status: 'approved',
            rejectionReason: null,
            approvedAt: new Date(),
            approvedBy: req.user ? req.user.id : null
        }
    })

    res.json({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        approvedAt: updated.approvedAt
    })
})

const rejectUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { reason } = req.body || {}

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            status: 'rejected',
            rejectionReason: typeof reason === 'string' ? reason : null,
            approvedAt: null,
            approvedBy: null
        }
    })

    res.json({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        rejectionReason: updated.rejectionReason
    })
})

module.exports = { listPendingStudents, approveUser, rejectUser }

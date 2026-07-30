const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const getWallet = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { walletBalance: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const transactions = await prisma.walletTransaction.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    })
    res.json({ balance: typeof user.walletBalance === 'number' ? user.walletBalance : 0, transactions })
})

const createTopup = asyncHandler(async (req, res) => {
    const amountRaw = Number(req.body?.amount)
    if (!Number.isFinite(amountRaw) || amountRaw <= 0) return res.status(400).json({ message: 'Invalid amount' })
    const amount = Math.round(amountRaw * 100) / 100
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { walletBalance: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const balanceBefore = typeof user.walletBalance === 'number' ? user.walletBalance : 0
    const tx = await prisma.walletTransaction.create({
        data: {
            userId: req.user.id,
            type: 'deposit',
            amount,
            description: 'Topup request',
            referenceType: 'wallet_topup',
            referenceId: req.user.id,
            balanceBefore,
            balanceAfter: balanceBefore,
            status: 'pending'
        }
    })
    res.status(201).json({ transaction: tx, balance: balanceBefore })
})

const listTopups = asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' && req.query.status.trim()
        ? req.query.status.trim()
        : 'pending'
    const where = { type: 'deposit', referenceType: 'wallet_topup' }
    if (status !== 'all') where.status = status

    const transactions = await prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100
    })

    const userIds = [...new Set(transactions.map((tx) => tx.userId).filter(Boolean))]
    const users = userIds.length
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, studentId: true, walletBalance: true }
        })
        : []
    const userMap = new Map(users.map((u) => [u.id, u]))

    res.json(transactions.map((tx) => ({ ...tx, user: userMap.get(tx.userId) || null })))
})

const confirmTopup = asyncHandler(async (req, res) => {
    const { txId } = req.params
    const tx = await prisma.walletTransaction.findUnique({ where: { id: txId } })
    if (!tx) return res.status(404).json({ message: 'Transaction not found' })
    if (tx.type !== 'deposit' || tx.referenceType !== 'wallet_topup') {
        return res.status(400).json({ message: 'Transaction is not a topup request' })
    }
    if (tx.status === 'completed') return res.json({ message: 'Already confirmed', transaction: tx })
    if (tx.status !== 'pending') return res.status(400).json({ message: 'Only pending topups can be confirmed' })

    const user = await prisma.user.findUnique({ where: { id: tx.userId }, select: { walletBalance: true } })
    if (!user) return res.status(404).json({ message: 'Student not found' })

    const amount = Math.round(Number(tx.amount || 0) * 100) / 100
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Invalid topup amount' })

    const balanceBefore = typeof user.walletBalance === 'number' ? user.walletBalance : 0
    const balanceAfter = Math.round((balanceBefore + amount) * 100) / 100
    const updated = await prisma.walletTransaction.update({
        where: { id: txId },
        data: {
            status: 'completed',
            description: `Topup confirmed by ${req.user.name || req.user.id}`,
            referenceId: req.user.id,
            balanceBefore,
            balanceAfter,
            updatedAt: new Date()
        }
    })
    await prisma.user.update({ where: { id: tx.userId }, data: { walletBalance: balanceAfter } })

    res.json({ message: 'Confirmed', transaction: updated, balance: balanceAfter })
})

const rejectTopup = asyncHandler(async (req, res) => {
    const { txId } = req.params
    const tx = await prisma.walletTransaction.findUnique({ where: { id: txId } })
    if (!tx) return res.status(404).json({ message: 'Transaction not found' })
    if (tx.type !== 'deposit' || tx.referenceType !== 'wallet_topup') {
        return res.status(400).json({ message: 'Transaction is not a topup request' })
    }
    if (tx.status !== 'pending') return res.status(400).json({ message: 'Only pending topups can be rejected' })

    const updated = await prisma.walletTransaction.update({
        where: { id: txId },
        data: {
            status: 'rejected',
            description: `Topup rejected by ${req.user.name || req.user.id}`,
            referenceId: req.user.id,
            updatedAt: new Date()
        }
    })

    res.json({ message: 'Rejected', transaction: updated })
})

const grantWallet = asyncHandler(async (req, res) => {
    const { studentId, amount } = req.body || {}
    if (!studentId || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ message: 'studentId and amount are required' })
    }
    const amt = Math.round(Number(amount) * 100) / 100
    const student = await prisma.user.findUnique({ where: { id: studentId }, select: { walletBalance: true } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const balanceBefore = typeof student.walletBalance === 'number' ? student.walletBalance : 0
    const balanceAfter = balanceBefore + amt
    await Promise.all([
        prisma.walletTransaction.create({ data: { userId: studentId, type: 'deposit', amount: amt, description: `Granted by ${req.user.name || req.user.id}`, referenceType: 'grant', referenceId: req.user.id, balanceBefore, balanceAfter, status: 'completed' } }),
        prisma.user.update({ where: { id: studentId }, data: { walletBalance: balanceAfter } })
    ])
    res.json({ message: 'Granted', amount: amt, balanceAfter })
})

const listGrantTeachers = asyncHandler(async (req, res) => {
    const teachers = await prisma.user.findMany({
        where: { role: 'teacher', status: 'approved' },
        select: { id: true, name: true, profile: true }
    })
    res.json(teachers)
})

const payForCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.body || {}
    if (!courseId) return res.status(400).json({ message: 'courseId is required' })
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, price: true, isFree: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    const isFree = Boolean(course.isFree) || Number(course.price || 0) <= 0
    if (isFree) return res.status(400).json({ message: 'Course is free' })
    const existing = await prisma.courseEnrollment.findFirst({ where: { courseId, studentId: req.user.id } })
    if (existing) return res.status(400).json({ message: 'Already enrolled' })
    const price = typeof course.price === 'number' ? course.price : 0
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { walletBalance: true } })
    const balance = typeof user?.walletBalance === 'number' ? user.walletBalance : 0
    if (balance < price) return res.status(400).json({ message: 'Insufficient balance' })
    const balanceBefore = balance
    const balanceAfter = balanceBefore - price
    await Promise.all([
        prisma.user.update({ where: { id: req.user.id }, data: { walletBalance: balanceAfter } }),
        prisma.walletTransaction.create({ data: { userId: req.user.id, type: 'payment', amount: price, description: `Payment for course ${courseId}`, referenceType: 'course_enrollment', referenceId: courseId, balanceBefore, balanceAfter, status: 'completed' } }),
        prisma.courseEnrollment.create({ data: { courseId, studentId: req.user.id } })
    ])
    res.status(201).json({ message: 'Enrolled', courseId, amountPaid: price })
})

module.exports = { getWallet, createTopup, listTopups, confirmTopup, rejectTopup, grantWallet, listGrantTeachers, payForCourse }

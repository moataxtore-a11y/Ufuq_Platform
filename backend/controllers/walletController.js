const mongoose = require('mongoose')
const { asyncHandler } = require('../utils/asyncHandler')
const { WalletTransaction } = require('../models/WalletTransaction')
const { Course } = require('../models/Course')
const { User } = require('../models/User')

async function computeBalance(userId, { scopeTeacherId } = {}) {
    const match = {
        user: new mongoose.Types.ObjectId(String(userId)),
        status: 'confirmed'
    }

    if (typeof scopeTeacherId === 'string') {
        match.scopeTeacher = new mongoose.Types.ObjectId(String(scopeTeacherId))
    } else if (scopeTeacherId === null) {
        match.scopeTeacher = { $exists: false }
    }

    const rows = await WalletTransaction.aggregate([
        { $match: match },
        { $group: { _id: '$user', total: { $sum: '$amount' } } }
    ])

    const total = rows && rows[0] && typeof rows[0].total === 'number' ? rows[0].total : 0
    return Number.isFinite(total) ? total : 0
}

const getWallet = asyncHandler(async(req, res) => {
    const userId = req.user.id

    const totalBalance = await computeBalance(userId)
    const globalBalance = await computeBalance(userId, { scopeTeacherId: null })

    const scoped = await WalletTransaction.aggregate([{
            $match: {
                user: new mongoose.Types.ObjectId(String(userId)),
                status: 'confirmed',
                scopeTeacher: { $exists: true, $ne: null }
            }
        },
        { $group: { _id: '$scopeTeacher', total: { $sum: '$amount' } } }
    ])

    const balancesByTeacher = (scoped || [])
        .filter((r) => r && r._id)
        .map((r) => ({ teacherId: String(r._id), balance: typeof r.total === 'number' ? r.total : 0 }))

    const tx = await WalletTransaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .select('type status amount reference scopeTeacher grantedBy course note createdAt confirmedAt')

    res.json({
        balance: totalBalance,
        balanceGlobal: globalBalance,
        balancesByTeacher,
        transactions: tx
    })
})

const createTopup = asyncHandler(async(req, res) => {
    const userId = req.user.id
    const { amount, reference, note } = req.body || {}

    const n = Number(amount)
    if (!Number.isFinite(n) || n <= 0) return res.status(400).json({ message: 'amount must be a positive number' })

    const tx = await WalletTransaction.create({
        user: userId,
        type: 'topup',
        status: 'pending',
        amount: n,
        reference: typeof reference === 'string' ? reference.trim() : '',
        note: typeof note === 'string' ? note : ''
    })

    res.status(201).json({ id: tx._id.toString(), status: tx.status })
})

const confirmTopup = asyncHandler(async(req, res) => {
    const { txId } = req.params

    const tx = await WalletTransaction.findById(txId)
    if (!tx) return res.status(404).json({ message: 'Transaction not found' })
    if (tx.type !== 'topup') return res.status(400).json({ message: 'Not a topup transaction' })

    if (tx.status === 'confirmed') {
        const balance = await computeBalance(tx.user)
        return res.json({ message: 'Already confirmed', balance })
    }

    tx.status = 'confirmed'
    tx.confirmedAt = new Date()
    tx.confirmedBy = req.user.id
    await tx.save()

    const balance = await computeBalance(tx.user)
    res.json({ message: 'Confirmed', balance })
})

function randomAmount(min, max) {
    const a = Number(min)
    const b = Number(max)
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 0
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    if (hi <= 0) return 0
    const value = lo + Math.random() * (hi - lo)
    return Math.round(value * 100) / 100
}

const grantWallet = asyncHandler(async(req, res) => {
    const { studentIds, amountMode, amount, minAmount, maxAmount, note, teacherId } = req.body || {}

    const ids = Array.isArray(studentIds) ? studentIds.filter(Boolean).map(String) : []
    if (ids.length === 0) return res.status(400).json({ message: 'studentIds is required' })

    let scopeTeacherId = null
    if (req.user.role === 'teacher') {
        scopeTeacherId = req.user.id
    } else if (req.user.role === 'team') {
        if (!teacherId) return res.status(400).json({ message: 'teacherId is required for team grants' })
        const t = await User.findById(teacherId).select('_id role teamId')
        if (!t || t.role !== 'teacher') return res.status(400).json({ message: 'Invalid teacherId' })
        if (String(req.user.teamId || '') && String(t.teamId || '') && String(req.user.teamId) !== String(t.teamId)) {
            return res.status(403).json({ message: 'Forbidden' })
        }
        scopeTeacherId = t._id.toString()
    } else {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const mode = amountMode === 'fixed' || amountMode === 'random' ? amountMode : 'fixed'
    const fixed = Number(amount)
    const minA = Number(minAmount)
    const maxA = Number(maxAmount)

    if (mode === 'fixed') {
        if (!Number.isFinite(fixed) || fixed <= 0) return res.status(400).json({ message: 'amount must be a positive number' })
    } else {
        if (!Number.isFinite(minA) || !Number.isFinite(maxA) || minA <= 0 || maxA <= 0) {
            return res.status(400).json({ message: 'minAmount and maxAmount must be positive numbers' })
        }
    }

    const uniqueIds = Array.from(new Set(ids))
    const users = await User.find({ _id: { $in: uniqueIds }, role: 'student' }).select('_id')
    const validStudentIds = users.map((u) => u._id.toString())
    if (validStudentIds.length === 0) return res.status(400).json({ message: 'No valid students found' })

    const now = new Date()

    const docs = validStudentIds.map((sid) => {
        const amt = mode === 'fixed' ? fixed : randomAmount(minA, maxA)
        return {
            user: new mongoose.Types.ObjectId(String(sid)),
            type: 'adjustment',
            status: 'confirmed',
            amount: amt,
            scopeTeacher: new mongoose.Types.ObjectId(String(scopeTeacherId)),
            grantedBy: new mongoose.Types.ObjectId(String(req.user.id)),
            note: typeof note === 'string' ? note : 'Teacher grant',
            confirmedAt: now,
            confirmedBy: new mongoose.Types.ObjectId(String(req.user.id))
        }
    })

    const created = await WalletTransaction.insertMany(docs)
    const totalGranted = created.reduce((sum, d) => sum + (typeof d.amount === 'number' ? d.amount : 0), 0)

    res.status(201).json({
        message: 'Granted',
        teacherId: scopeTeacherId,
        count: created.length,
        totalAmount: Math.round(totalGranted * 100) / 100
    })
})

const listGrantTeachers = asyncHandler(async(req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    const teamId = String(req.user.teamId || '').trim()
    if (!teamId) return res.json([])

    const teachers = await User.find({ role: 'teacher', teamId, status: 'approved' }).select('name teamId createdAt')
    res.json(
        teachers.map((t) => ({
            id: t._id.toString(),
            name: t.name
        }))
    )
})

const payForCourse = asyncHandler(async(req, res) => {
    const userId = req.user.id
    const { courseId } = req.body || {}
    if (!courseId) return res.status(400).json({ message: 'courseId is required' })

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const courseTeacherId = course.teacher ? String(course.teacher) : ''
    if (!courseTeacherId) return res.status(400).json({ message: 'Invalid course teacher' })

    const isFree = Boolean(course.isFree) || Number(course.price || 0) <= 0
    if (isFree) return res.status(400).json({ message: 'Course is free' })

    const alreadyEnrolled = Array.isArray(course.students) && course.students.some((s) => String(s) === String(userId))
    if (alreadyEnrolled) {
        const balance = await computeBalance(userId)
        return res.json({ message: 'Already enrolled', alreadyEnrolled: true, balance })
    }

    const price = Number(course.price || 0)
    if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ message: 'Invalid course price' })

    const dpRaw = course.discountPercent
    const dp = typeof dpRaw === 'number' ? dpRaw : Number(dpRaw || 0)
    const pct = Number.isFinite(dp) ? Math.max(0, Math.min(90, dp)) : 0
    const computedFinal = Math.round((price * (1 - pct / 100)) * 100) / 100
    const finalPrice = Number.isFinite(computedFinal) ? Math.max(0, computedFinal) : price
    if (finalPrice <= 0) return res.status(400).json({ message: 'Invalid final price' })

    const scopedBalance = await computeBalance(userId, { scopeTeacherId: courseTeacherId })
    const globalBalance = await computeBalance(userId, { scopeTeacherId: null })
    const total = scopedBalance + globalBalance
    if (total < finalPrice) return res.status(400).json({ message: 'Insufficient wallet balance' })

    const now = new Date()

    const fromScoped = Math.max(0, Math.min(scopedBalance, finalPrice))
    const remaining = Math.round((finalPrice - fromScoped) * 100) / 100

    if (fromScoped > 0) {
        await WalletTransaction.create({
            user: userId,
            type: 'purchase',
            status: 'confirmed',
            amount: -fromScoped,
            scopeTeacher: new mongoose.Types.ObjectId(String(courseTeacherId)),
            course: course._id,
            note: 'Wallet course purchase (teacher scoped)',
            confirmedAt: now,
            confirmedBy: userId
        })
    }

    if (remaining > 0) {
        await WalletTransaction.create({
            user: userId,
            type: 'purchase',
            status: 'confirmed',
            amount: -remaining,
            course: course._id,
            note: 'Wallet course purchase',
            confirmedAt: now,
            confirmedBy: userId
        })
    }

    course.students = Array.isArray(course.students) ? course.students : []
    course.students.push(new mongoose.Types.ObjectId(String(userId)))
    await course.save()

    const after = await computeBalance(userId)
    res.json({ message: 'Enrolled', balance: after })
})

module.exports = {
    getWallet,
    createTopup,
    confirmTopup,
    grantWallet,
    listGrantTeachers,
    payForCourse
}
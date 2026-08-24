const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const generateDiscountCodes = asyncHandler(async (req, res) => {
    const { courseId, allowedCourseIds, discountPercent, count, quantity, maxUses, expiresAt } = req.body || {}
    const targetCourseId = courseId || (Array.isArray(allowedCourseIds) && allowedCourseIds[0])
    if (!targetCourseId) return res.status(400).json({ message: 'courseId is required' })
    const num = Math.min(Math.max(1, Number(quantity || count) || 1), 1000)
    const discountVal = Math.min(100, Math.max(0, Number(discountPercent) || 0))
    const maxUsesVal = typeof maxUses === 'number' && maxUses > 0 ? Math.floor(maxUses) : null
    const expiresAtVal = expiresAt ? new Date(expiresAt) : null

    const dataToInsert = []
    for (let i = 0; i < num; i++) {
        const code = Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')
        dataToInsert.push({
            code,
            courseId: targetCourseId,
            discountPercent: discountVal,
            maxUses: maxUsesVal,
            expiresAt: expiresAtVal
        })
    }

    await prisma.courseDiscountCode.createMany({
        data: dataToInsert
    })

    const generatedCodes = await prisma.courseDiscountCode.findMany({
        where: {
            courseId: targetCourseId,
            code: { in: dataToInsert.map(d => d.code) }
        },
        select: { id: true, code: true, discountPercent: true }
    })

    res.status(201).json({ codes: generatedCodes, count: generatedCodes.length })
})

const listMyDiscountCodes = asyncHandler(async (req, res) => {
    const where = {}
    if (typeof req.query.courseId === 'string' && req.query.courseId.trim()) where.courseId = req.query.courseId.trim()
    const docs = await prisma.courseDiscountCode.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(docs)
})

const validateDiscountCode = asyncHandler(async (req, res) => {
    const { code, courseId } = req.body || {}
    if (!code || !courseId) return res.status(400).json({ message: 'code and courseId are required' })
    const doc = await prisma.courseDiscountCode.findFirst({
        where: { code: String(code).trim(), courseId, isActive: true }
    })
    if (!doc) return res.status(400).json({ message: 'Invalid or expired discount code' })
    if (doc.maxUses !== null && typeof doc.maxUses === 'number' && doc.usedCount >= doc.maxUses) {
        return res.status(400).json({ message: 'Discount code has reached its usage limit' })
    }
    if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
        return res.status(400).json({ message: 'Discount code has expired' })
    }
    res.json({ code: doc.code, discountPercent: doc.discountPercent, valid: true })
})

const redeemDiscountCode = asyncHandler(async (req, res) => {
    const { code, courseId } = req.body || {}
    if (!code || !courseId) return res.status(400).json({ message: 'code and courseId are required' })
    const doc = await prisma.courseDiscountCode.findFirst({
        where: { code: String(code).trim(), courseId, isActive: true }
    })
    if (!doc) return res.status(400).json({ message: 'Invalid or expired discount code' })
    if (doc.maxUses !== null && doc.usedCount >= doc.maxUses) {
        return res.status(400).json({ message: 'Discount code has reached its usage limit' })
    }
    if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
        return res.status(400).json({ message: 'Discount code has expired' })
    }
    const existing = await prisma.courseEnrollment.findFirst({ where: { courseId, studentId: req.user.id } })
    if (existing) return res.status(400).json({ message: 'Already enrolled' })
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { price: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    const originalPrice = typeof course.price === 'number' ? course.price : 0
    const discountPct = doc.discountPercent
    const finalPrice = Math.max(0, originalPrice - (originalPrice * discountPct / 100))
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { walletBalance: true } })
    const balance = typeof user?.walletBalance === 'number' ? user.walletBalance : 0
    if (finalPrice > 0 && balance < finalPrice) {
        return res.status(400).json({ message: 'Insufficient wallet balance' })
    }
    const balanceBefore = balance
    const balanceAfter = balanceBefore - finalPrice
    if (finalPrice > 0) {
        await Promise.all([
            prisma.user.update({ where: { id: req.user.id }, data: { walletBalance: balanceAfter } }),
            prisma.walletTransaction.create({ data: { userId: req.user.id, type: 'payment', amount: finalPrice, description: `Enrollment with discount code ${doc.code}`, referenceType: 'course_enrollment', referenceId: courseId, balanceBefore, balanceAfter, status: 'completed' } })
        ])
    }
    await prisma.courseEnrollment.create({ data: { courseId, studentId: req.user.id } })
    await prisma.courseDiscountCode.update({ where: { id: doc.id }, data: { usedCount: { increment: 1 }, isActive: doc.maxUses !== null ? doc.usedCount + 1 < doc.maxUses : true } })
    res.status(201).json({ message: 'Enrolled successfully', courseId, discountApplied: discountPct, finalPrice })
})

module.exports = { generateDiscountCodes, listMyDiscountCodes, validateDiscountCode, redeemDiscountCode }

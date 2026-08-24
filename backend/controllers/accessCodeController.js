const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const generateCourseAccessCodes = asyncHandler(async (req, res) => {
    const { courseId, count, allowedCourseIds, quantity, maxUses } = req.body || {}
    
    // Support array of allowedCourseIds or single courseId
    const courseIdsList = Array.isArray(allowedCourseIds) && allowedCourseIds.length > 0 
        ? allowedCourseIds 
        : (courseId ? [courseId] : [])

    if (courseIdsList.length === 0) {
        return res.status(400).json({ message: 'At least one courseId (or allowedCourseIds) is required' })
    }

    const num = Math.min(Math.max(1, Number(quantity || count) || 1), 1000)
    const primaryCourseId = courseIdsList[0]
    const maxUsesVal = typeof maxUses === 'number' && maxUses > 0 ? Math.floor(maxUses) : 1

    const dataToInsert = []
    for (let i = 0; i < num; i++) {
        const code = Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')
        dataToInsert.push({
            courseId: primaryCourseId,
            code,
            maxUses: maxUsesVal,
            isActive: true
        })
    }

    // Process insertion in chunks of 100 for reliability
    const chunkSize = 100
    for (let i = 0; i < dataToInsert.length; i += chunkSize) {
        const chunk = dataToInsert.slice(i, i + chunkSize)
        await prisma.courseAccessCode.createMany({
            data: chunk
        })
    }

    const generatedCodes = await prisma.courseAccessCode.findMany({
        where: {
            courseId: primaryCourseId,
            code: { in: dataToInsert.map(d => d.code) }
        },
        select: { id: true, code: true }
    })

    res.status(201).json({ codes: generatedCodes, count: generatedCodes.length })
})

const listMyCourseAccessCodes = asyncHandler(async (req, res) => {
    const where = {}
    if (typeof req.query.courseId === 'string' && req.query.courseId.trim()) where.courseId = req.query.courseId.trim()
    const limit = Math.min(Number(req.query.limit) || 200, 500)
    const codes = await prisma.courseAccessCode.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit })
    res.json(codes)
})

const validateCourseAccessCode = asyncHandler(async (req, res) => {
    const { code } = req.body || {}
    if (!code) return res.status(400).json({ message: 'Code is required' })
    const doc = await prisma.courseAccessCode.findFirst({
        where: { code: String(code).trim(), isActive: true }
    })
    if (!doc) return res.status(400).json({ message: 'Invalid or expired access code' })
    if (doc.maxUses > 0 && doc.usedCount >= doc.maxUses) {
        return res.status(400).json({ message: 'Access code has reached its usage limit' })
    }
    res.json({ valid: true, codeId: doc.id, courseId: doc.courseId, usedCount: doc.usedCount, maxUses: doc.maxUses })
})

const chooseCourseForAccessCode = asyncHandler(async (req, res) => {
    const { code } = req.body || {}
    if (!code) return res.status(400).json({ message: 'Code is required' })
    const codeDoc = await prisma.courseAccessCode.findFirst({
        where: { code: String(code).trim(), isActive: true }
    })
    if (!codeDoc) return res.status(400).json({ message: 'Invalid or expired access code' })
    if (codeDoc.maxUses > 0 && codeDoc.usedCount >= codeDoc.maxUses) {
        return res.status(400).json({ message: 'Access code has reached its usage limit' })
    }
    const existing = await prisma.courseEnrollment.findFirst({
        where: { courseId: codeDoc.courseId, studentId: req.user.id }
    })
    if (existing) return res.status(400).json({ message: 'Already enrolled in this course' })
    await prisma.courseEnrollment.create({ data: { courseId: codeDoc.courseId, studentId: req.user.id } })
    await prisma.courseAccessCode.update({
        where: { id: codeDoc.id },
        data: { usedCount: { increment: 1 }, lastUsedAt: new Date(), lastUsedBy: req.user.id }
    })
    res.status(201).json({ message: 'Enrolled successfully', courseId: codeDoc.courseId })
})

module.exports = { generateCourseAccessCodes, listMyCourseAccessCodes, validateCourseAccessCode, chooseCourseForAccessCode }

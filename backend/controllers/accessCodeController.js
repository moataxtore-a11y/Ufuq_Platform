const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const generateCourseAccessCodes = asyncHandler(async (req, res) => {
    const { courseId, count, maxUses } = req.body || {}
    if (!courseId) return res.status(400).json({ message: 'courseId is required' })
    const num = Math.min(Math.max(1, Number(count) || 1), 100)
    const codes = []
    for (let i = 0; i < num; i++) {
        const code = Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')
        const doc = await prisma.courseAccessCode.create({
            data: {
                courseId,
                code,
                maxUses: typeof maxUses === 'number' && maxUses > 0 ? Math.floor(maxUses) : 1,
                isActive: true
            }
        })
        codes.push({ id: doc.id, code: doc.code })
    }
    res.status(201).json({ codes, count: codes.length })
})

const listMyCourseAccessCodes = asyncHandler(async (req, res) => {
    const where = {}
    if (typeof req.query.courseId === 'string' && req.query.courseId.trim()) where.courseId = req.query.courseId.trim()
    const codes = await prisma.courseAccessCode.findMany({ where, orderBy: { createdAt: 'desc' } })
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

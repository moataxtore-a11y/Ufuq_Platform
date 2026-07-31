const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

function canManage(req) {
    return Boolean(req?.user && ['admin', 'teacher', 'team'].includes(req.user.role))
}

function normalizeUrl(url) {
    if (!url) return ''
    const s = String(url).trim()
    if (!s) return ''
    const lower = s.toLowerCase()
    if (lower.startsWith('javascript:') || lower.startsWith('data:')) return ''
    return s
}

const getActiveForStudent = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const messages = await prisma.motivationalMessage.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
        take: 1
    })
    const message = messages[0]
    if (!message) return res.json({ message: null })

    const dismissed = await prisma.studentMessageDismissal.findFirst({
        where: { userId, messageId: message.id }
    })
    if (dismissed) return res.json({ message: null })

    return res.json({
        message: {
            id: message.id,
            title: message.title,
            body: message.body,
            ctaLabel: message.ctaLabel,
            ctaUrl: message.ctaUrl,
            updatedAt: message.updatedAt
        }
    })
})

const upsertMessage = asyncHandler(async (req, res) => {
    if (!canManage(req)) return res.status(403).json({ message: 'Forbidden' })

    const title = String(req.body?.title || '').trim()
    const body = String(req.body?.body || '').trim()
    const ctaLabel = String(req.body?.ctaLabel || '').trim()
    const ctaUrl = normalizeUrl(req.body?.ctaUrl)

    if (!title && !body) {
        return res.status(400).json({ message: 'Title or body is required' })
    }

    const messages = await prisma.motivationalMessage.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
        take: 1
    })
    let message = messages[0]

    if (!message) {
        message = await prisma.motivationalMessage.create({
            data: { title, body, ctaLabel, ctaUrl, isActive: true, updatedBy: req.user.id }
        })
    } else {
        await prisma.motivationalMessage.update({
            where: { id: message.id },
            data: { title, body, ctaLabel, ctaUrl, updatedBy: req.user.id }
        })
        await prisma.studentMessageDismissal.deleteMany({ where: { messageId: message.id } })
        message = { ...message, title, body, ctaLabel, ctaUrl, updatedBy: req.user.id }
    }

    return res.json({
        message: {
            id: message.id,
            title: message.title,
            body: message.body,
            ctaLabel: message.ctaLabel,
            ctaUrl: message.ctaUrl,
            updatedAt: message.updatedAt
        }
    })
})

const deleteMessage = asyncHandler(async (req, res) => {
    if (!canManage(req)) return res.status(403).json({ message: 'Forbidden' })

    const messages = await prisma.motivationalMessage.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
        take: 1
    })
    const message = messages[0]
    if (!message) return res.json({ ok: true })

    await prisma.studentMessageDismissal.deleteMany({ where: { messageId: message.id } })
    await prisma.motivationalMessage.delete({ where: { id: message.id } })

    return res.json({ ok: true })
})

const dismissForMe = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' })

    const messageId = String(req.body?.messageId || '').trim()
    if (!messageId) return res.status(400).json({ message: 'messageId is required' })

    await prisma.studentMessageDismissal.upsert({
        where: { userId_messageId: { userId, messageId } },
        update: {},
        create: { userId, messageId, dismissedAt: new Date() }
    })

    return res.json({ ok: true })
})

const getActiveForManager = asyncHandler(async (req, res) => {
    if (!canManage(req)) return res.status(403).json({ message: 'Forbidden' })

    const messages = await prisma.motivationalMessage.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
        take: 1
    })
    const message = messages[0]
    if (!message) return res.json({ message: null })

    return res.json({
        message: {
            id: message.id,
            title: message.title,
            body: message.body,
            ctaLabel: message.ctaLabel,
            ctaUrl: message.ctaUrl,
            updatedAt: message.updatedAt
        }
    })
})

module.exports = {
    getActiveForStudent, upsertMessage, deleteMessage,
    dismissForMe, getActiveForManager
}

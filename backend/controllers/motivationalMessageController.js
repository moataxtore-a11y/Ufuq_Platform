const { MotivationalMessage } = require('../models/MotivationalMessage')
const { StudentMessageDismissal } = require('../models/StudentMessageDismissal')

function canManage(req) {
    return Boolean(req?.user && ['admin', 'teacher', 'team'].includes(req.user.role))
}

function normalizeUrl(url) {
    if (!url) return ''
    const s = String(url).trim()
    if (!s) return ''
    return s
}

async function getActiveForStudent(req, res) {
    // Student sees the message unless they dismissed it.
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const message = await MotivationalMessage.findOne({ isActive: true }).sort({ updatedAt: -1 })
    if (!message) return res.json({ message: null })

    const dismissed = await StudentMessageDismissal.findOne({ userId, messageId: message._id })
    if (dismissed) return res.json({ message: null })

    return res.json({
        message: {
            id: message._id,
            title: message.title,
            body: message.body,
            ctaLabel: message.ctaLabel,
            ctaUrl: message.ctaUrl,
            updatedAt: message.updatedAt
        }
    })
}

async function upsertMessage(req, res) {
    if (!canManage(req)) return res.status(403).json({ message: 'Forbidden' })

    const title = String(req.body?.title || '').trim()
    const body = String(req.body?.body || '').trim()
    const ctaLabel = String(req.body?.ctaLabel || '').trim()
    const ctaUrl = normalizeUrl(req.body?.ctaUrl)

    if (!title && !body) {
        return res.status(400).json({ message: 'Title or body is required' })
    }

    // Keep a single active message document (upsert latest).
    let message = await MotivationalMessage.findOne({ isActive: true }).sort({ updatedAt: -1 })

    if (!message) {
        message = await MotivationalMessage.create({
            title,
            body,
            ctaLabel,
            ctaUrl,
            isActive: true,
            updatedBy: req.user.id
        })
    } else {
        message.title = title
        message.body = body
        message.ctaLabel = ctaLabel
        message.ctaUrl = ctaUrl
        message.updatedBy = req.user.id
        await message.save()

        // When message changes, all students should see it again.
        await StudentMessageDismissal.deleteMany({ messageId: message._id })
    }

    return res.json({
        message: {
            id: message._id,
            title: message.title,
            body: message.body,
            ctaLabel: message.ctaLabel,
            ctaUrl: message.ctaUrl,
            updatedAt: message.updatedAt
        }
    })
}

async function deleteMessage(req, res) {
    if (!canManage(req)) return res.status(403).json({ message: 'Forbidden' })

    const message = await MotivationalMessage.findOne({ isActive: true }).sort({ updatedAt: -1 })
    if (!message) return res.json({ ok: true })

    // Hard delete for simplicity.
    await StudentMessageDismissal.deleteMany({ messageId: message._id })
    await MotivationalMessage.deleteOne({ _id: message._id })

    return res.json({ ok: true })
}

async function dismissForMe(req, res) {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' })

    const messageId = String(req.body?.messageId || '').trim()
    if (!messageId) return res.status(400).json({ message: 'messageId is required' })

    await StudentMessageDismissal.updateOne(
        { userId, messageId },
        { $setOnInsert: { userId, messageId, dismissedAt: new Date() } },
        { upsert: true }
    )

    return res.json({ ok: true })
}

async function getActiveForManager(req, res) {
    if (!canManage(req)) return res.status(403).json({ message: 'Forbidden' })

    const message = await MotivationalMessage.findOne({ isActive: true }).sort({ updatedAt: -1 })
    if (!message) return res.json({ message: null })

    return res.json({
        message: {
            id: message._id,
            title: message.title,
            body: message.body,
            ctaLabel: message.ctaLabel,
            ctaUrl: message.ctaUrl,
            updatedAt: message.updatedAt
        }
    })
}

module.exports = {
    getActiveForStudent,
    upsertMessage,
    deleteMessage,
    dismissForMe,
    getActiveForManager
}

const mongoose = require('mongoose')
const crypto = require('crypto')

const { Course } = require('../models/Course')
const { User } = require('../models/User')
const { CourseDiscountCode } = require('../models/CourseDiscountCode')
const { asyncHandler } = require('../utils/asyncHandler')

function generateCode(length = 10) {
    const bytes = crypto.randomBytes(Math.ceil(length * 1.2))
    return bytes
        .toString('base64')
        .replace(/[^A-Z0-9]/gi, '')
        .toUpperCase()
        .slice(0, length)
}

async function resolveTeacherIdForRequestUser(user) {
    if (!user) return null
    if (user.role === 'teacher') return user.id
    if (user.role !== 'team') return null
    if (!user.teamId) return null
    const teacher = await User.findOne({ role: 'teacher', teamId: user.teamId }).select('_id')
    return teacher ? teacher._id.toString() : null
}

function clampPercent(value) {
    const n = Number(value)
    if (!Number.isFinite(n)) return null
    return Math.max(0, Math.min(90, n))
}

const generateDiscountCodes = asyncHandler(async(req, res) => {
    const { allowedCourseIds, quantity, minPercent, maxPercent } = req.body || {}

    const ids = Array.isArray(allowedCourseIds) ? allowedCourseIds.map((x) => String(x || '').trim()).filter(Boolean) : []
    if (!ids.length) return res.status(400).json({ message: 'allowedCourseIds is required' })

    for (const id of ids) {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid allowedCourseIds' })
    }

    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0 || qty > 500) {
        return res.status(400).json({ message: 'quantity must be between 1 and 500' })
    }

    const minP = clampPercent(minPercent)
    const maxP = clampPercent(maxPercent)
    if (minP === null || maxP === null) return res.status(400).json({ message: 'minPercent and maxPercent are required' })
    const low = Math.min(minP, maxP)
    const high = Math.max(minP, maxP)

    if (req.user.role !== 'teacher' && req.user.role !== 'team') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const teacherId = await resolveTeacherIdForRequestUser(req.user)
    if (!teacherId) return res.status(403).json({ message: 'Forbidden' })

    const courses = await Course.find({ _id: { $in: ids } }).select('_id teacher title')
    if (!courses.length) return res.status(404).json({ message: 'Courses not found' })
    if (courses.length !== ids.length) return res.status(404).json({ message: 'Some courses not found' })
    for (const c of courses) {
        if (String(c.teacher) !== String(teacherId)) return res.status(403).json({ message: 'Forbidden' })
    }

    const docs = []
    for (let i = 0; i < qty; i += 1) {
        const pct = low === high ? low : (low + Math.random() * (high - low))
        const pctRounded = Math.round(pct)
        docs.push({
            code: generateCode(10),
            allowedCourses: ids.map((id) => new mongoose.Types.ObjectId(id)),
            discountPercent: Math.max(0, Math.min(90, pctRounded)),
            createdBy: new mongoose.Types.ObjectId(req.user.id),
            teamId: req.user.role === 'team' ? String(req.user.teamId || '') : '',
            maxRedemptions: 1,
            redemptions: []
        })
    }

    let created
    for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
            // eslint-disable-next-line no-await-in-loop
            created = await CourseDiscountCode.insertMany(docs, { ordered: false })
            break
        } catch (err) {
            if (err && err.code === 11000) {
                const dupKeys = new Set()
                if (Array.isArray(err.writeErrors)) {
                    for (const we of err.writeErrors) {
                        const c = we && we.err && we.err.op ? we.err.op.code : null
                        if (c) dupKeys.add(c)
                    }
                }
                for (const d of docs) {
                    if (!d.code || dupKeys.has(d.code)) d.code = generateCode(10)
                }
                // eslint-disable-next-line no-continue
                continue
            }
            throw err
        }
    }

    if (!created) return res.status(500).json({ message: 'Failed to generate codes' })

    res.status(201).json({
        allowedCourses: courses.map((c) => ({ id: c._id.toString(), title: c.title })),
        quantity: created.length,
        minPercent: low,
        maxPercent: high,
        codes: created.map((d) => ({
            id: d._id.toString(),
            code: d.code,
            discountPercent: d.discountPercent,
            redeemedCount: Array.isArray(d.redemptions) ? d.redemptions.length : 0,
            maxRedemptions: d.maxRedemptions,
            createdAt: d.createdAt
        }))
    })
})

const listMyDiscountCodes = asyncHandler(async(req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'team') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const teacherId = await resolveTeacherIdForRequestUser(req.user)
    if (!teacherId) return res.status(403).json({ message: 'Forbidden' })

    const teacherCourses = await Course.find({ teacher: teacherId }).select('_id')

    const docs = await CourseDiscountCode.find({ allowedCourses: { $in: teacherCourses.map((c) => c._id) } })
        .sort({ createdAt: -1 })
        .limit(2000)
        .select('code allowedCourses discountPercent maxRedemptions redemptions createdAt')
        .populate('allowedCourses', 'title')
        .populate('redemptions.student', 'name email')
        .populate('redemptions.course', 'title')

    res.json(
        docs.map((d) => ({
            id: d._id.toString(),
            code: d.code,
            discountPercent: d.discountPercent,
            allowedCourses: Array.isArray(d.allowedCourses) ?
                d.allowedCourses.map((c) => ({ id: c && c._id ? c._id.toString() : '', title: c && c.title ? c.title : '' })) :
                [],
            redeemedCount: Array.isArray(d.redemptions) ? d.redemptions.length : 0,
            redeemedBy: Array.isArray(d.redemptions) && d.redemptions.length ? {
                studentId: d.redemptions[0].student && d.redemptions[0].student._id ? d.redemptions[0].student._id.toString() : '',
                studentName: d.redemptions[0].student && d.redemptions[0].student.name ? d.redemptions[0].student.name : '',
                redeemedAt: d.redemptions[0].redeemedAt,
                courseId: d.redemptions[0].course && d.redemptions[0].course._id ? d.redemptions[0].course._id.toString() : '',
                courseTitle: d.redemptions[0].course && d.redemptions[0].course.title ? d.redemptions[0].course.title : ''
            } : null,
            maxRedemptions: d.maxRedemptions,
            createdAt: d.createdAt
        }))
    )
})

const validateDiscountCode = asyncHandler(async(req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const { code, courseId } = req.body || {}
    const normalized = typeof code === 'string' ? code.trim().toUpperCase() : ''
    if (!normalized) return res.status(400).json({ message: 'code is required' })
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) return res.status(400).json({ message: 'courseId is required' })

    const doc = await CourseDiscountCode.findOne({ code: normalized })
        .select('allowedCourses discountPercent maxRedemptions redemptions')
    if (!doc) return res.status(404).json({ message: 'Invalid code' })

    const redeemedCount = Array.isArray(doc.redemptions) ? doc.redemptions.length : 0
    if (redeemedCount >= Number(doc.maxRedemptions || 1)) return res.status(400).json({ message: 'Code already used' })

    const allowed = (doc.allowedCourses || []).some((c) => String(c) === String(courseId))
    if (!allowed) return res.status(400).json({ message: 'Course not allowed for this code' })

    res.json({
        message: 'Valid',
        discountPercent: typeof doc.discountPercent === 'number' ? doc.discountPercent : 0
    })
})

const redeemDiscountCode = asyncHandler(async(req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' })

    const { code, courseId } = req.body || {}
    const normalized = typeof code === 'string' ? code.trim().toUpperCase() : ''
    if (!normalized) return res.status(400).json({ message: 'code is required' })
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) return res.status(400).json({ message: 'courseId is required' })

    const updated = await CourseDiscountCode.findOneAndUpdate({
        code: normalized,
        $and: [
            { redemptions: { $not: { $elemMatch: { student: new mongoose.Types.ObjectId(req.user.id) } } } },
            { $expr: { $lt: [{ $size: '$redemptions' }, '$maxRedemptions'] } },
            { allowedCourses: new mongoose.Types.ObjectId(courseId) }
        ]
    }, {
        $push: { redemptions: { student: new mongoose.Types.ObjectId(req.user.id), course: new mongoose.Types.ObjectId(courseId), redeemedAt: new Date() } }
    }, { new: true })

    if (!updated) return res.status(400).json({ message: 'Code already used' })

    res.json({ message: 'Redeemed', discountPercent: updated.discountPercent })
})

module.exports = { generateDiscountCodes, listMyDiscountCodes, validateDiscountCode, redeemDiscountCode }

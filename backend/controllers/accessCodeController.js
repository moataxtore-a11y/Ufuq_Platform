const mongoose = require('mongoose')
const crypto = require('crypto')

const { Course } = require('../models/Course')
const { User } = require('../models/User')
const { CourseAccessCode } = require('../models/CourseAccessCode')
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

const generateCourseAccessCodes = asyncHandler(async (req, res) => {
    const { allowedCourseIds, quantity, expiresAt } = req.body || {}

    const ids = Array.isArray(allowedCourseIds) ? allowedCourseIds.map((x) => String(x || '').trim()).filter(Boolean) : []
    if (!ids.length) return res.status(400).json({ message: 'allowedCourseIds is required' })

    for (const id of ids) {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid allowedCourseIds' })
    }

    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0 || qty > 500) {
        return res.status(400).json({ message: 'quantity must be between 1 and 500' })
    }

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

    let expires = undefined
    if (expiresAt) {
        const d = new Date(expiresAt)
        if (!Number.isNaN(d.getTime())) expires = d
    }

    const docs = []
    for (let i = 0; i < qty; i += 1) {
        docs.push({
            code: generateCode(10),
            allowedCourses: ids.map((id) => new mongoose.Types.ObjectId(id)),
            chosenCourse: undefined,
            createdBy: new mongoose.Types.ObjectId(req.user.id),
            teamId: req.user.role === 'team' ? String(req.user.teamId || '') : '',
            maxRedemptions: 1,
            redemptions: [],
            expiresAt: expires
        })
    }

    let created
    for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
            // eslint-disable-next-line no-await-in-loop
            created = await CourseAccessCode.insertMany(docs, { ordered: false })
            break
        } catch (err) {
            if (err && err.code === 11000) {
                // regenerate colliding codes and retry
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
        codes: created.map((d) => ({
            id: d._id.toString(),
            code: d.code,
            redeemedCount: Array.isArray(d.redemptions) ? d.redemptions.length : 0,
            maxRedemptions: d.maxRedemptions,
            expiresAt: d.expiresAt || null,
            createdAt: d.createdAt
        }))
    })
})

const listMyCourseAccessCodes = asyncHandler(async (req, res) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'team') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const teacherId = await resolveTeacherIdForRequestUser(req.user)
    if (!teacherId) return res.status(403).json({ message: 'Forbidden' })

    const filter = {}

    const teacherCourses = await Course.find({ teacher: teacherId }).select('_id')
    filter.allowedCourses = { $in: teacherCourses.map((c) => c._id) }

    const docs = await CourseAccessCode.find(filter)
        .sort({ createdAt: -1 })
        .limit(2000)
        .select('code allowedCourses chosenCourse maxRedemptions redemptions expiresAt createdAt')
        .populate('allowedCourses', 'title')
        .populate('chosenCourse', 'title')
        .populate('redemptions.student', 'name email')

    res.json(
        docs.map((d) => ({
            id: d._id.toString(),
            code: d.code,
            allowedCourses: Array.isArray(d.allowedCourses) ?
                d.allowedCourses.map((c) => ({ id: c && c._id ? c._id.toString() : '', title: c && c.title ? c.title : '' })) :
                [],
            chosenCourse: d.chosenCourse && d.chosenCourse._id ? { id: d.chosenCourse._id.toString(), title: d.chosenCourse.title || '' } : null,
            redeemedCount: Array.isArray(d.redemptions) ? d.redemptions.length : 0,
            redeemedBy: Array.isArray(d.redemptions) && d.redemptions.length ? {
                studentId: d.redemptions[0].student && d.redemptions[0].student._id ? d.redemptions[0].student._id.toString() : '',
                studentName: d.redemptions[0].student && d.redemptions[0].student.name ? d.redemptions[0].student.name : '',
                redeemedAt: d.redemptions[0].redeemedAt
            } : null,
            maxRedemptions: d.maxRedemptions,
            expiresAt: d.expiresAt || null,
            createdAt: d.createdAt
        }))
    )
})

const validateCourseAccessCode = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const { code } = req.body || {}
    const normalized = typeof code === 'string' ? code.trim().toUpperCase() : ''
    if (!normalized) return res.status(400).json({ message: 'code is required' })

    const doc = await CourseAccessCode.findOne({ code: normalized })
        .select('allowedCourses chosenCourse maxRedemptions redemptions expiresAt')
        .populate('allowedCourses', 'title description thumbnailUrl isFree price discountPercent totalHours createdAt updatedAt')
    if (!doc) return res.status(404).json({ message: 'Invalid code' })

    if (doc.expiresAt && new Date(doc.expiresAt).getTime() < Date.now()) return res.status(400).json({ message: 'Code expired' })

    const redeemedCount = Array.isArray(doc.redemptions) ? doc.redemptions.length : 0
    if (redeemedCount >= Number(doc.maxRedemptions || 1)) return res.status(400).json({ message: 'Code already used' })
    if (doc.chosenCourse) return res.status(400).json({ message: 'Code already used' })

    res.json({
        message: 'Valid',
        allowedCourses: Array.isArray(doc.allowedCourses) ?
            doc.allowedCourses.map((c) => ({
                id: c && c._id ? c._id.toString() : '',
                _id: c && c._id ? c._id.toString() : '',
                title: c && c.title ? c.title : '',
                description: c?.description || '',
                thumbnailUrl: c?.thumbnailUrl || '',
                isFree: c?.isFree || false,
                price: c?.price || 0,
                discountPercent: c?.discountPercent || 0,
                totalHours: c?.totalHours || 0,
                createdAt: c?.createdAt || null,
                updatedAt: c?.updatedAt || null
            })) : []
    })
})

const chooseCourseForAccessCode = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' })

    const { code, courseId } = req.body || {}
    const normalized = typeof code === 'string' ? code.trim().toUpperCase() : ''
    if (!normalized) return res.status(400).json({ message: 'code is required' })
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) return res.status(400).json({ message: 'courseId is required' })

    const doc = await CourseAccessCode.findOne({ code: normalized }).select('allowedCourses expiresAt')
    if (!doc) return res.status(404).json({ message: 'Invalid code' })
    if (doc.expiresAt && new Date(doc.expiresAt).getTime() < Date.now()) return res.status(400).json({ message: 'Code expired' })

    const allowed = (doc.allowedCourses || []).some((c) => String(c) === String(courseId))
    if (!allowed) return res.status(400).json({ message: 'Course not allowed for this code' })

    const updated = await CourseAccessCode.findOneAndUpdate({
        code: normalized,
        chosenCourse: { $exists: false },
        $and: [
            { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
            { redemptions: { $not: { $elemMatch: { student: new mongoose.Types.ObjectId(req.user.id) } } } },
            { $expr: { $lt: [{ $size: '$redemptions' }, '$maxRedemptions'] } },
            { allowedCourses: new mongoose.Types.ObjectId(courseId) }
        ]
    }, {
        $set: { chosenCourse: new mongoose.Types.ObjectId(courseId) },
        $push: { redemptions: { student: new mongoose.Types.ObjectId(req.user.id), redeemedAt: new Date() } }
    }, { new: true })
    if (!updated) return res.status(400).json({ message: 'Code already used' })

    const course = await Course.findById(courseId).select('_id students')
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const inCourse = (course.students || []).some((s) => String(s) === String(req.user.id))
    if (!inCourse) {
        course.students.push(req.user.id)
        await course.save()
    }

    res.json({ message: 'Redeemed', courseId: course._id.toString() })
})

module.exports = { generateCourseAccessCodes, listMyCourseAccessCodes, validateCourseAccessCode, chooseCourseForAccessCode }
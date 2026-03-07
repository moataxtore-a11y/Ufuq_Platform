const { Course } = require('../models/Course')
const { Unit } = require('../models/Unit')
const { Lesson } = require('../models/Lesson')
const { asyncHandler } = require('../utils/asyncHandler')

function normalizeBool(value) {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value === 1
    if (typeof value === 'string') {
        const v = value.trim().toLowerCase()
        if (['true', '1', 'yes', 'on'].includes(v)) return true
        if (['false', '0', 'no', 'off'].includes(v)) return false
    }
    return undefined
}

const listCourses = asyncHandler(async(req, res) => {
    const qRaw = typeof req.query.q === 'string' ? req.query.q : ''
    const q = String(qRaw || '').trim()
    const hiddenRaw = req.query.hidden
    const pinnedRaw = req.query.pinned

    const filter = {}
    if (q) {
        filter.$or = [
            { title: new RegExp(q, 'i') },
            { description: new RegExp(q, 'i') }
        ]
    }

    const hidden = normalizeBool(hiddenRaw)
    if (typeof hidden === 'boolean') {
        filter.isHiddenFromStudents = hidden
    }

    const pinned = normalizeBool(pinnedRaw)
    if (typeof pinned === 'boolean') {
        filter.pinnedAt = pinned ? { $ne: null } : null
    }

    const courses = await Course.find(filter)
        .sort({ pinnedAt: -1, createdAt: -1 })
        .select('title description thumbnailUrl teacher isFree price discountPercent createdAt updatedAt section gradeYear isIndividual courseType isHiddenFromStudents pinnedAt')
        .populate('teacher', 'name email')

    res.json(courses.map((c) => ({
        id: c._id.toString(),
        _id: c._id.toString(),
        title: c.title,
        description: c.description || '',
        thumbnailUrl: c.thumbnailUrl || '',
        teacherId: c.teacher && c.teacher._id ? c.teacher._id.toString() : '',
        teacherName: c.teacher && c.teacher.name ? c.teacher.name : '',
        isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
        price: typeof c.price === 'number' ? c.price : 0,
        discountPercent: typeof c.discountPercent === 'number' ? c.discountPercent : 0,
        section: typeof c.section === 'string' ? c.section : '',
        gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
        isIndividual: Boolean(c.isIndividual),
        courseType: c.courseType === 'individual' ? 'individual' : 'monthly',
        isHiddenFromStudents: Boolean(c.isHiddenFromStudents),
        pinnedAt: c.pinnedAt || null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
    })))
})

const pinCourse = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    course.pinnedAt = new Date()
    await course.save()
    res.json({ message: 'Pinned', courseId: String(courseId), pinnedAt: course.pinnedAt })
})

const unpinCourse = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    course.pinnedAt = null
    await course.save()
    res.json({ message: 'Unpinned', courseId: String(courseId) })
})

const hideCourseFromStudents = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    course.isHiddenFromStudents = true
    await course.save()
    res.json({ message: 'Hidden', courseId: String(courseId) })
})

const unhideCourseFromStudents = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    course.isHiddenFromStudents = false
    await course.save()
    res.json({ message: 'Unhidden', courseId: String(courseId) })
})

const deleteCourseAsAdmin = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const units = await Unit.find({ course: courseId }).select('_id')
    const unitIds = units.map((u) => u._id)
    if (unitIds.length) {
        await Lesson.deleteMany({ unit: { $in: unitIds } })
    }
    await Unit.deleteMany({ course: courseId })

    await Course.deleteOne({ _id: courseId })
    res.json({ message: 'Deleted', courseId: String(courseId) })
})

module.exports = {
    listCourses,
    pinCourse,
    unpinCourse,
    hideCourseFromStudents,
    unhideCourseFromStudents,
    deleteCourseAsAdmin
}
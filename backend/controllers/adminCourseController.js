const { prisma } = require('../config/prisma')
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

const listCourses = asyncHandler(async (req, res) => {
    const qRaw = typeof req.query.q === 'string' ? req.query.q : ''
    const q = String(qRaw || '').trim()
    const hiddenRaw = req.query.hidden
    const pinnedRaw = req.query.pinned

    const where = {}
    if (q) {
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
        ]
    }

    const hidden = normalizeBool(hiddenRaw)
    if (typeof hidden === 'boolean') {
        where.isHiddenFromStudents = hidden
    }

    const pinned = normalizeBool(pinnedRaw)
    if (typeof pinned === 'boolean') {
        where.pinnedAt = pinned ? { not: null } : null
    }

    const courses = await prisma.course.findMany({
        where,
        orderBy: [{ pinnedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
        include: { teacher: { select: { id: true, name: true, email: true } } }
    })

    res.json(
        courses.map((c) => ({
            id: c.id,
            _id: c.id,
            title: c.title,
            description: c.description || '',
            thumbnailUrl: c.thumbnailUrl || '',
            teacherId: c.teacher ? c.teacher.id : '',
            teacherName: c.teacher ? c.teacher.name : '',
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
        }))
    )
})

const pinCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    const updated = await prisma.course.update({
        where: { id: courseId },
        data: { pinnedAt: new Date() }
    })
    res.json({ message: 'Pinned', courseId, pinnedAt: updated.pinnedAt })
})

const unpinCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    await prisma.course.update({ where: { id: courseId }, data: { pinnedAt: null } })
    res.json({ message: 'Unpinned', courseId })
})

const hideCourseFromStudents = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    await prisma.course.update({ where: { id: courseId }, data: { isHiddenFromStudents: true } })
    res.json({ message: 'Hidden', courseId })
})

const unhideCourseFromStudents = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    await prisma.course.update({ where: { id: courseId }, data: { isHiddenFromStudents: false } })
    res.json({ message: 'Unhidden', courseId })
})

const deleteCourseAsAdmin = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const units = await prisma.unit.findMany({ where: { courseId }, select: { id: true } })
    const unitIds = units.map((u) => u.id)
    if (unitIds.length) {
        await prisma.lesson.deleteMany({ where: { unitId: { in: unitIds } } })
    }
    await prisma.unit.deleteMany({ where: { courseId } })
    await prisma.course.delete({ where: { id: courseId } })

    res.json({ message: 'Deleted', courseId })
})

module.exports = {
    listCourses, pinCourse, unpinCourse,
    hideCourseFromStudents, unhideCourseFromStudents, deleteCourseAsAdmin
}

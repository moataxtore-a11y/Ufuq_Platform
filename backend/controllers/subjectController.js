const { asyncHandler } = require('../utils/asyncHandler')
const { User } = require('../models/User')
const { Course } = require('../models/Course')

function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const listSubjects = asyncHandler(async(req, res) => {
    const section = typeof req.query.section === 'string' ? req.query.section.trim() : ''
    const gradeYear = typeof req.query.gradeYear === 'string' ? req.query.gradeYear.trim() : ''

    const filter = { role: 'teacher', status: 'approved', 'profile.teachingSubject': { $exists: true, $ne: '' } }

    const teachers = await User.find(filter).select('_id profile')

    const subjectToTeacherIds = new Map()
    for (const t of teachers) {
        const subject = (t.profile && typeof t.profile.teachingSubject === 'string') ? t.profile.teachingSubject.trim() : ''
        if (!subject) continue
        if (!subjectToTeacherIds.has(subject)) subjectToTeacherIds.set(subject, [])
        subjectToTeacherIds.get(subject).push(t._id)
    }

    const out = []
    for (const [subject, teacherIds] of subjectToTeacherIds.entries()) {
        const courseFilter = { teacher: { $in: teacherIds } }
        if (section) {
            courseFilter.$or = [{ section: '' }, { section }]
        }
        if (gradeYear) {
            courseFilter.$and = [{ $or: [{ gradeYear: '' }, { gradeYear }] }]
        }

        const courseCount = await Course.countDocuments(courseFilter)
        out.push({ subject, teacherCount: teacherIds.length, courseCount })
    }

    out.sort((a, b) => a.subject.localeCompare(b.subject, 'ar'))

    res.json(out)
})

const listSubjectCourses = asyncHandler(async(req, res) => {
    const subjectRaw = typeof req.params.subject === 'string' ? req.params.subject : ''
    const subject = decodeURIComponent(subjectRaw).trim()
    if (!subject) return res.status(400).json({ message: 'Subject is required' })

    const section = typeof req.query.section === 'string' ? req.query.section.trim() : ''
    const gradeYear = typeof req.query.gradeYear === 'string' ? req.query.gradeYear.trim() : ''

    const filter = { role: 'teacher', status: 'approved' }
    filter['profile.teachingSubject'] = new RegExp(`^${escapeRegExp(subject)}$`, 'i')

    const teachers = await User.find(filter).select('_id')
    const teacherIds = teachers.map((t) => t._id)
    if (!teacherIds.length) return res.json([])

    const limitRaw = Number(req.query.limit)
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 48) : 48

    const courseFilter = { teacher: { $in: teacherIds } }
    if (section) {
        courseFilter.$or = [{ section: '' }, { section }]
    }
    if (gradeYear) {
        courseFilter.$and = [{ $or: [{ gradeYear: '' }, { gradeYear }] }]
    }

    const courses = await Course.find(courseFilter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title description thumbnailUrl teacher isFree price createdAt section gradeYear')
        .populate('teacher', 'name')

    res.json(
        courses.map((c) => ({
            id: c._id.toString(),
            title: c.title,
            description: c.description || '',
            thumbnailUrl: c.thumbnailUrl || '',
            isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
            price: typeof c.price === 'number' ? c.price : 0,
            section: typeof c.section === 'string' ? c.section : '',
            gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
            teacherId: c.teacher && c.teacher._id ? c.teacher._id.toString() : '',
            teacherName: c.teacher && c.teacher.name ? c.teacher.name : ''
        }))
    )
})

module.exports = { listSubjects, listSubjectCourses }
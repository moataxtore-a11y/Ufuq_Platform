const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const listSubjects = asyncHandler(async (req, res) => {
    const section = typeof req.query.section === 'string' ? req.query.section.trim() : ''
    const gradeYear = typeof req.query.gradeYear === 'string' ? req.query.gradeYear.trim() : ''

    const teachers = await prisma.user.findMany({
        where: { role: 'teacher', status: 'approved' },
        select: { id: true, profile: true }
    })

    const subjectToTeacherIds = new Map()
    for (const t of teachers) {
        const p = t.profile || {}
        const subject = typeof p.teachingSubject === 'string' ? p.teachingSubject.trim() : ''
        if (!subject) continue
        if (!subjectToTeacherIds.has(subject)) subjectToTeacherIds.set(subject, [])
        subjectToTeacherIds.get(subject).push(t.id)
    }

    const out = []
    for (const [subject, teacherIds] of subjectToTeacherIds.entries()) {
        const courseWhere = { teacherId: { in: teacherIds } }
        if (section) {
            courseWhere.OR = [{ section: '' }, { section }]
        }
        if (gradeYear) {
            courseWhere.AND = [{ OR: [{ gradeYear: '' }, { gradeYear }] }]
        }

        const courseCount = await prisma.course.count({ where: courseWhere })
        out.push({ subject, teacherCount: teacherIds.length, courseCount })
    }

    out.sort((a, b) => a.subject.localeCompare(b.subject, 'ar'))
    res.json(out)
})

const listSubjectCourses = asyncHandler(async (req, res) => {
    const subjectRaw = typeof req.params.subject === 'string' ? req.params.subject : ''
    const subject = decodeURIComponent(subjectRaw).trim()
    if (!subject) return res.status(400).json({ message: 'Subject is required' })

    const section = typeof req.query.section === 'string' ? req.query.section.trim() : ''
    const gradeYear = typeof req.query.gradeYear === 'string' ? req.query.gradeYear.trim() : ''

    const teachers = await prisma.user.findMany({
        where: { role: 'teacher', status: 'approved' },
        select: { id: true, profile: true }
    })
    const teacherIds = teachers
        .filter((t) => {
            const p = t.profile || {}
            return typeof p.teachingSubject === 'string' && p.teachingSubject.toLowerCase() === subject.toLowerCase()
        })
        .map((t) => t.id)

    if (!teacherIds.length) return res.json([])

    const limitRaw = Number(req.query.limit)
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 48) : 48

    const courseWhere = { teacherId: { in: teacherIds } }
    if (section) {
        courseWhere.OR = [{ section: '' }, { section }]
    }
    if (gradeYear) {
        courseWhere.AND = [{ OR: [{ gradeYear: '' }, { gradeYear }] }]
    }

    const courses = await prisma.course.findMany({
        where: courseWhere,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
            id: true, title: true, description: true, thumbnailUrl: true,
            isFree: true, price: true, createdAt: true, section: true, gradeYear: true, teacherId: true
        }
    })

    const teacherMap = new Map(teachers.map((t) => [t.id, t.profile?.teachingSubject || '']))

    res.json(
        courses.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description || '',
            thumbnailUrl: c.thumbnailUrl || '',
            isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
            price: typeof c.price === 'number' ? c.price : 0,
            section: typeof c.section === 'string' ? c.section : '',
            gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
            teacherId: c.teacherId || '',
            teacherName: teacherMap.get(c.teacherId) || ''
        }))
    )
})

module.exports = { listSubjects, listSubjectCourses }

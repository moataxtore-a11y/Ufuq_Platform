const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

function normalizeBoolean(value) {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value === 1
    if (typeof value === 'string') {
        const v = value.trim().toLowerCase()
        if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true
        if (v === 'false' || v === '0' || v === 'no' || v === 'off') return false
    }
    return undefined
}

async function canAccessCourse(course, user) {
    if (!course) return false
    if (!user) return false
    if (user.role === 'admin') return true
    const courseIsFree = Boolean(course.isFree) || Number(course.price || 0) <= 0
    const teacherId = typeof course.teacherId === 'string' ? course.teacherId : ''

    if (user.role === 'teacher') return teacherId === user.id
    if (user.role === 'team') {
        if (!user.teamId || !teacherId) return false
        const teacher = await prisma.user.findUnique({ where: { id: teacherId }, select: { teamId: true, role: true } })
        if (!teacher || teacher.role !== 'teacher') return false
        return String(teacher.teamId || '') === String(user.teamId)
    }
    if (user.role === 'student') {
        if (courseIsFree) return true
        const enrollment = await prisma.courseEnrollment.findFirst({
            where: { courseId: course.id, studentId: user.id }
        })
        return !!enrollment
    }
    return false
}

function normalizeSection(sec) {
    const obj = sec && typeof sec === 'object' ? sec : {}
    return {
        key: typeof obj.key === 'string' ? obj.key : '',
        enabled: typeof obj.enabled === 'boolean' ? obj.enabled : true,
        videos: Array.isArray(obj.videos) ? obj.videos.map(normalizeAttachmentItem) : [],
        pdfs: Array.isArray(obj.pdfs) ? obj.pdfs.map(normalizeAttachmentItem) : [],
        images: Array.isArray(obj.images) ? obj.images.map(normalizeAttachmentItem) : [],
        assessmentId: typeof obj.assessmentId === 'string' && obj.assessmentId ? obj.assessmentId : undefined
    }
}

function normalizeAttachmentItem(it) {
    const obj = it && typeof it === 'object' ? it : {}
    const durationRaw = obj.durationSec
    const durationNum = typeof durationRaw === 'number' && Number.isFinite(durationRaw) ? durationRaw : null
    return {
        name: typeof obj.name === 'string' ? obj.name : '',
        description: typeof obj.description === 'string' ? obj.description : '',
        url: typeof obj.url === 'string' ? obj.url : '',
        storageRef: typeof obj.storageRef === 'string' ? obj.storageRef : '',
        durationSec: durationNum
    }
}

function stripAttachmentUrls(section) {
    const sec = section && typeof section === 'object' ? section : {}
    return {
        key: typeof sec.key === 'string' ? sec.key : '',
        enabled: typeof sec.enabled === 'boolean' ? sec.enabled : true,
        assessmentId: typeof sec.assessmentId === 'string' && sec.assessmentId ? sec.assessmentId : undefined,
        videos: Array.isArray(sec.videos) ? sec.videos.map((it) => ({
            name: typeof it.name === 'string' ? it.name : '',
            description: typeof it.description === 'string' ? it.description : '',
            url: '', storageRef: '',
            durationSec: typeof it.durationSec === 'number' && Number.isFinite(it.durationSec) ? it.durationSec : null
        })) : [],
        pdfs: Array.isArray(sec.pdfs) ? sec.pdfs.map((it) => ({
            name: typeof it.name === 'string' ? it.name : '', description: typeof it.description === 'string' ? it.description : '', url: '', storageRef: ''
        })) : [],
        images: Array.isArray(sec.images) ? sec.images.map((it) => ({
            name: typeof it.name === 'string' ? it.name : '', description: typeof it.description === 'string' ? it.description : '', url: '', storageRef: ''
        })) : []
    }
}

const listPublicCourses = asyncHandler(async (req, res) => {
    const limitRaw = Number(req.query.limit)
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 24) : 6
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const section = typeof req.query.section === 'string' ? req.query.section.trim() : ''
    const gradeYear = typeof req.query.gradeYear === 'string' ? req.query.gradeYear.trim() : ''

    const where = {}
    const andConditions = []
    if (q) {
        andConditions.push({
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } }
            ]
        })
    }
    if (section) {
        andConditions.push({
            OR: [{ section: '' }, { section }, { section: null }]
        })
    }
    if (gradeYear) {
        andConditions.push({
            OR: [{ gradeYear: '' }, { gradeYear }, { gradeYear: null }]
        })
    }
    if (andConditions.length > 0) where.AND = andConditions

    if (!req.user || req.user.role === 'student') {
        where.isHiddenFromStudents = { not: true }
    }

    const courses = await prisma.course.findMany({
        where,
        orderBy: [{ pinnedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
        take: limit,
        include: { teacher: { select: { id: true, name: true } } }
    })

    res.json(
        courses.map((c) => ({
            id: c.id,
            _id: c.id,
            title: c.title,
            description: c.description || '',
            thumbnailUrl: c.thumbnailUrl || '',
            isIndividual: Boolean(c.isIndividual),
            courseType: c.courseType === 'individual' ? 'individual' : 'monthly',
            isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
            price: typeof c.price === 'number' ? c.price : 0,
            discountPercent: typeof c.discountPercent === 'number' ? c.discountPercent : 0,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            section: typeof c.section === 'string' ? c.section : '',
            gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
            isHiddenFromStudents: Boolean(c.isHiddenFromStudents),
            pinnedAt: c.pinnedAt || null,
            teacherId: c.teacher ? c.teacher.id : '',
            teacherName: c.teacher ? c.teacher.name : ''
        }))
    )
})

const listPublicCoursesForTeacher = asyncHandler(async (req, res) => {
    const { teacherId } = req.params
    const limitRaw = Number(req.query.limit)
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 48) : 24

    const courses = await prisma.course.findMany({
        where: { teacherId },
        orderBy: [{ pinnedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
        take: limit,
        include: { teacher: { select: { id: true, name: true } } }
    })

    res.json(
        courses.map((c) => ({
            id: c.id,
            _id: c.id,
            title: c.title,
            description: c.description || '',
            thumbnailUrl: c.thumbnailUrl || '',
            isIndividual: Boolean(c.isIndividual),
            courseType: c.courseType === 'individual' ? 'individual' : 'monthly',
            isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
            price: typeof c.price === 'number' ? c.price : 0,
            discountPercent: typeof c.discountPercent === 'number' ? c.discountPercent : 0,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            section: typeof c.section === 'string' ? c.section : '',
            gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
            isHiddenFromStudents: Boolean(c.isHiddenFromStudents),
            pinnedAt: c.pinnedAt || null,
            teacherId: c.teacher ? c.teacher.id : '',
            teacherName: c.teacher ? c.teacher.name : ''
        }))
    )
})

const createCourse = asyncHandler(async (req, res) => {
    const { title, description, thumbnailUrl, price, isFree, section, gradeYear, isIndividual, courseType, discountPercent, pinned } = req.body || {}
    if (!title) return res.status(400).json({ message: 'title is required' })

    const normalizedIsFree = normalizeBoolean(isFree)
    const normalizedIsIndividual = normalizeBoolean(isIndividual)
    const normalizedCourseType = courseType === 'individual' ? 'individual' : courseType === 'monthly' ? 'monthly' : undefined
    const effectiveCourseType = normalizedCourseType || (normalizedIsIndividual ? 'individual' : 'monthly')

    const p = (typeof normalizedIsFree === 'boolean' && normalizedIsFree) ? 0 : (price === undefined || price === null || price === '' ? 0 : Number(price))
    if (!Number.isFinite(p) || p < 0) return res.status(400).json({ message: 'price must be a non-negative number' })

    const dpRaw = discountPercent === undefined || discountPercent === null || discountPercent === '' ? 0 : Number(discountPercent)
    if (!Number.isFinite(dpRaw) || dpRaw < 0 || dpRaw > 100) return res.status(400).json({ message: 'discountPercent must be between 0 and 100' })
    const dp = p <= 0 ? 0 : dpRaw

    const normalizedPinned = normalizeBoolean(pinned)

    let teacherId = req.user.id
    if (req.user.role === 'team') {
        if (!req.user.teamId) return res.status(403).json({ message: 'Forbidden' })
        const teacher = await prisma.user.findFirst({
            where: { role: 'teacher', teamId: req.user.teamId },
            select: { id: true }
        })
        if (!teacher) return res.status(400).json({ message: 'No teacher found for this team scope' })
        teacherId = teacher.id
    }

    const course = await prisma.course.create({
        data: {
            title,
            description: description || '',
            thumbnailUrl: typeof thumbnailUrl === 'string' ? thumbnailUrl : '',
            pinnedAt: normalizedPinned ? new Date() : null,
            isIndividual: effectiveCourseType === 'individual',
            courseType: effectiveCourseType,
            isFree: typeof normalizedIsFree === 'boolean' ? normalizedIsFree : p <= 0,
            price: p,
            discountPercent: dp,
            section: typeof section === 'string' ? section.trim() : '',
            gradeYear: typeof gradeYear === 'string' ? gradeYear.trim() : '',
            teacherId
        }
    })

    res.status(201).json(course)
})

const updateCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const { title, description, price, isFree, section, gradeYear, isIndividual, courseType, discountPercent } = req.body || {}

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const data = {}
    if (typeof title === 'string' && title.trim()) data.title = title.trim()
    if (typeof description === 'string') data.description = description

    const normalizedIsIndividual = normalizeBoolean(isIndividual)
    const normalizedCourseType = courseType === 'individual' ? 'individual' : courseType === 'monthly' ? 'monthly' : undefined
    if (normalizedCourseType) {
        data.courseType = normalizedCourseType
        data.isIndividual = normalizedCourseType === 'individual'
    } else if (typeof normalizedIsIndividual === 'boolean') {
        data.isIndividual = normalizedIsIndividual
        data.courseType = normalizedIsIndividual ? 'individual' : 'monthly'
    }

    const normalizedIsFree = normalizeBoolean(isFree)
    if (typeof normalizedIsFree === 'boolean') {
        data.isFree = normalizedIsFree
        if (normalizedIsFree) data.price = 0
    }

    if (price !== undefined && price !== null && price !== '') {
        const p = Number(price)
        if (!Number.isFinite(p) || p < 0) return res.status(400).json({ message: 'price must be a non-negative number' })
        data.price = p
        if (p <= 0) data.isFree = true
    }

    if (discountPercent !== undefined && discountPercent !== null && discountPercent !== '') {
        const dp = Number(discountPercent)
        if (!Number.isFinite(dp) || dp < 0 || dp > 100) return res.status(400).json({ message: 'discountPercent must be between 0 and 100' })
        const finalFree = typeof data.isFree === 'boolean' ? data.isFree : (Boolean(course.isFree) || Number(data.price != null ? data.price : course.price || 0) <= 0)
        data.discountPercent = finalFree ? 0 : dp
    }

    const finalFree = typeof data.isFree === 'boolean' ? data.isFree : (Boolean(course.isFree) || Number(data.price != null ? data.price : course.price || 0) <= 0)
    if (finalFree) data.discountPercent = 0

    if (typeof section === 'string') data.section = section.trim()
    if (typeof gradeYear === 'string') data.gradeYear = gradeYear.trim()

    const updated = await prisma.course.update({ where: { id: courseId }, data })

    res.json({
        id: updated.id,
        title: updated.title,
        description: updated.description || '',
        thumbnailUrl: updated.thumbnailUrl || '',
        isIndividual: Boolean(updated.isIndividual),
        courseType: updated.courseType === 'individual' ? 'individual' : 'monthly',
        isFree: Boolean(updated.isFree) || Number(updated.price || 0) <= 0,
        price: typeof updated.price === 'number' ? updated.price : 0,
        discountPercent: typeof updated.discountPercent === 'number' ? updated.discountPercent : 0,
        section: typeof updated.section === 'string' ? updated.section : '',
        gradeYear: typeof updated.gradeYear === 'string' ? updated.gradeYear : '',
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
    })
})

const myCourses = asyncHandler(async (req, res) => {
    function mapCourseForCard(c) {
        return {
            id: c.id,
            _id: c.id,
            title: c.title,
            description: c.description || '',
            thumbnailUrl: c.thumbnailUrl || '',
            isIndividual: Boolean(c.isIndividual),
            courseType: c.courseType === 'individual' ? 'individual' : 'monthly',
            isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
            price: typeof c.price === 'number' ? c.price : 0,
            discountPercent: typeof c.discountPercent === 'number' ? c.discountPercent : 0,
            isHiddenFromStudents: Boolean(c.isHiddenFromStudents),
            pinnedAt: c.pinnedAt || null,
            section: typeof c.section === 'string' ? c.section : '',
            gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }
    }

    const selectFields = { id: true, title: true, description: true, thumbnailUrl: true, isFree: true, price: true, discountPercent: true, createdAt: true, updatedAt: true, section: true, gradeYear: true, isIndividual: true, courseType: true, isHiddenFromStudents: true, pinnedAt: true }

    if (req.user.role === 'teacher') {
        const courses = await prisma.course.findMany({ where: { teacherId: req.user.id }, orderBy: { createdAt: 'desc' }, select: selectFields })
        return res.json(courses.map(mapCourseForCard))
    }
    if (req.user.role === 'student') {
        const enrollments = await prisma.courseEnrollment.findMany({ where: { studentId: req.user.id }, select: { courseId: true } })
        const courseIds = enrollments.map((e) => e.courseId)
        if (!courseIds.length) return res.json([])
        const courses = await prisma.course.findMany({ where: { id: { in: courseIds } }, orderBy: { createdAt: 'desc' }, select: selectFields })
        return res.json(courses.map(mapCourseForCard))
    }
    if (req.user.role === 'team') {
        if (!req.user.teamId) return res.json([])
        const teachers = await prisma.user.findMany({ where: { role: 'teacher', teamId: req.user.teamId }, select: { id: true } })
        const teacherIds = teachers.map((t) => t.id)
        if (!teacherIds.length) return res.json([])
        const courses = await prisma.course.findMany({ where: { teacherId: { in: teacherIds } }, orderBy: { createdAt: 'desc' }, select: selectFields })
        return res.json(courses.map(mapCourseForCard))
    }
    return res.status(403).json({ message: 'Forbidden' })
})

const getCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    if (!['teacher', 'student', 'admin', 'team'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            teacher: { select: { id: true, name: true, email: true, teamId: true, role: true } },
            enrollments: { include: { student: { select: { id: true, name: true, email: true } } } }
        }
    })
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role === 'teacher') {
        if (course.teacherId !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
        return res.json(course)
    }
    if (req.user.role === 'team' || req.user.role === 'student') {
        if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })
        return res.json(course)
    }
    return res.json(course)
})

const getPublicCourseOutline = asyncHandler(async (req, res) => {
    const { courseId } = req.params

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { teacher: { select: { id: true, name: true } } }
    })
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const units = await prisma.unit.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, description: true, order: true }
    })

    const unitIds = units.map((u) => u.id)
    const lessons = await prisma.lesson.findMany({
        where: { unitId: { in: unitIds } },
        orderBy: { order: 'asc' },
        select: { id: true, unitId: true, title: true, order: true, isFree: true, coverImageUrl: true, videoUrl: true, pdfUrl: true, imageUrls: true, kind: true, contentSections: true, createdAt: true }
    })

    let lessonsCount = 0
    let videoLessonsCount = 0
    const lessonsByUnitId = new Map()

    const courseIsFree = Boolean(course.isFree) || Number(course.price || 0) <= 0
    const canRevealCourseContent = Boolean(req.user && req.user.id && courseIsFree)

    for (const l of lessons) {
        lessonsCount++
        if (l.videoUrl) videoLessonsCount++
        const uid = l.unitId || ''
        if (!lessonsByUnitId.has(uid)) lessonsByUnitId.set(uid, [])
        const isFree = Boolean(l.isFree)
        const canRevealContent = canRevealCourseContent || (isFree && req.user && req.user.id)

        const normalizedSections = Array.isArray(l.contentSections) ? l.contentSections.map(normalizeSection) : []
        const revealedSections = canRevealContent ? normalizedSections : normalizedSections.map(stripAttachmentUrls)
        const imageUrls = Array.isArray(l.imageUrls) ? l.imageUrls : []

        lessonsByUnitId.get(uid).push({
            id: l.id,
            title: l.title,
            order: l.order,
            kind: l.kind || 'lesson',
            isFree,
            coverImageUrl: canRevealContent ? (l.coverImageUrl || '') : '',
            videoUrl: canRevealContent ? (l.videoUrl || '') : '',
            pdfUrl: canRevealContent ? (l.pdfUrl || '') : '',
            imageUrls: canRevealContent ? imageUrls : [],
            contentSections: revealedSections
        })
    }

    const unitsWithLessons = units.map((u) => ({
        id: u.id,
        title: u.title,
        description: u.description || '',
        order: u.order,
        lessons: lessonsByUnitId.get(u.id) || []
    }))

    res.json({
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnailUrl: course.thumbnailUrl || '',
        isIndividual: Boolean(course.isIndividual),
        courseType: course.courseType === 'individual' ? 'individual' : 'monthly',
        isFree: Boolean(course.isFree) || Number(course.price || 0) <= 0,
        price: typeof course.price === 'number' ? course.price : 0,
        discountPercent: typeof course.discountPercent === 'number' ? course.discountPercent : 0,
        units: unitsWithLessons,
        lessonsCount,
        videoLessonsCount
    })
})

const getCourseStats = asyncHandler(async (req, res) => {
    const { courseId } = req.params

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const units = await prisma.unit.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, description: true, order: true }
    })

    const unitIds = units.map((u) => u.id)
    const lessons = await prisma.lesson.findMany({
        where: { unitId: { in: unitIds } },
        orderBy: { order: 'asc' }
    })

    let lessonsCount = 0
    let videoLessonsCount = 0
    const lessonsByUnitId = new Map()

    for (const l of lessons) {
        lessonsCount++
        if (l.videoUrl) videoLessonsCount++
        const uid = l.unitId || ''
        if (!lessonsByUnitId.has(uid)) lessonsByUnitId.set(uid, [])
        const imageUrls = Array.isArray(l.imageUrls) ? l.imageUrls : []
        const contentSections = Array.isArray(l.contentSections) ? l.contentSections.map(normalizeSection) : []

        lessonsByUnitId.get(uid).push({
            id: l.id,
            title: l.title,
            order: l.order,
            kind: l.kind || 'lesson',
            isFree: Boolean(l.isFree),
            coverImageUrl: l.coverImageUrl || '',
            videoUrl: l.videoUrl || '',
            pdfUrl: l.pdfUrl || '',
            imageUrls,
            contentSections
        })
    }

    const unitsWithLessons = units.map((u) => ({
        id: u.id,
        title: u.title,
        description: u.description || '',
        order: u.order,
        lessons: lessonsByUnitId.get(u.id) || []
    }))

    res.json({
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnailUrl: course.thumbnailUrl || '',
        isIndividual: Boolean(course.isIndividual),
        courseType: course.courseType === 'individual' ? 'individual' : 'monthly',
        isFree: Boolean(course.isFree) || Number(course.price || 0) <= 0,
        price: typeof course.price === 'number' ? course.price : 0,
        discountPercent: typeof course.discountPercent === 'number' ? course.discountPercent : 0,
        units: unitsWithLessons,
        lessonsCount,
        videoLessonsCount
    })
})

const updateCourseThumbnail = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const { thumbnailUrl } = req.body || {}

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const data = {}
    if (typeof thumbnailUrl === 'string') data.thumbnailUrl = thumbnailUrl
    const updated = await prisma.course.update({ where: { id: courseId }, data })

    res.json({
        id: updated.id,
        title: updated.title,
        description: updated.description || '',
        thumbnailUrl: updated.thumbnailUrl || '',
        isIndividual: Boolean(updated.isIndividual),
        courseType: updated.courseType === 'individual' ? 'individual' : 'monthly',
        isFree: Boolean(updated.isFree) || Number(updated.price || 0) <= 0,
        price: typeof updated.price === 'number' ? updated.price : 0,
        discountPercent: typeof updated.discountPercent === 'number' ? updated.discountPercent : 0,
        section: typeof updated.section === 'string' ? updated.section : '',
        gradeYear: typeof updated.gradeYear === 'string' ? updated.gradeYear : ''
    })
})

const pinCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })
    const updated = await prisma.course.update({ where: { id: courseId }, data: { pinnedAt: new Date() } })
    res.json({ message: 'Pinned', courseId, pinnedAt: updated.pinnedAt })
})

const unpinCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })
    await prisma.course.update({ where: { id: courseId }, data: { pinnedAt: null } })
    res.json({ message: 'Unpinned', courseId })
})

const deleteCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })
    await prisma.course.delete({ where: { id: courseId } })
    res.json({ message: 'Deleted', courseId })
})

const listUnits = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (!['teacher', 'student', 'admin', 'team'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' })
    }
    const units = await prisma.unit.findMany({ where: { courseId }, orderBy: { order: 'asc' } })
    res.json(units)
})

const listLessonsForUnit = asyncHandler(async (req, res) => {
    const { unitId } = req.params
    const unit = await prisma.unit.findUnique({ where: { id: unitId } })
    if (!unit) return res.status(404).json({ message: 'Unit not found' })
    const course = await prisma.course.findUnique({ where: { id: unit.courseId }, select: { id: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (!['teacher', 'student', 'admin', 'team'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' })
    }
    const lessons = await prisma.lesson.findMany({ where: { unitId }, orderBy: { order: 'asc' } })
    res.json(lessons)
})

const listStudents = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const enrollments = await prisma.courseEnrollment.findMany({
        where: { courseId },
        include: { student: { select: { id: true, name: true, email: true } } }
    })
    res.json(enrollments.map((e) => e.student))
})

const listMyCourseStudents = asyncHandler(async (req, res) => {
    const { q, status } = req.query
    if (req.user.role !== 'teacher' && req.user.role !== 'team') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    let teacherIds = []
    if (req.user.role === 'teacher') {
        teacherIds = [req.user.id]
    } else {
        if (!req.user.teamId) return res.json([])
        const teachers = await prisma.user.findMany({ where: { role: 'teacher', teamId: req.user.teamId }, select: { id: true } })
        teacherIds = teachers.map((t) => t.id)
    }

    if (!teacherIds.length) return res.json([])

    const enrollments = await prisma.courseEnrollment.findMany({
        where: { course: { teacherId: { in: teacherIds } } },
        select: { studentId: true }
    })
    const studentIds = [...new Set(enrollments.map((e) => e.studentId))]
    if (!studentIds.length) return res.json([])

    const where = { id: { in: studentIds }, role: 'student' }
    if (typeof status === 'string' && status.trim()) where.status = status.trim()
    if (q) {
        const qq = String(q).trim()
        if (qq) {
            where.OR = [
                { name: { contains: qq, mode: 'insensitive' } },
                { email: { contains: qq, mode: 'insensitive' } },
                { studentId: { contains: qq, mode: 'insensitive' } }
            ]
        }
    }

    const users = await prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, teamId: true, studentId: true, status: true, mustChangePassword: true, profile: true, createdAt: true, isSuspended: true, suspendedAt: true }
    })
    res.json(users)
})

const addUnit = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const { title, description, order } = req.body || {}

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const unit = await prisma.unit.create({
        data: {
            courseId,
            title: title || '',
            description: description || '',
            order: order || 0
        }
    })

    res.status(201).json(unit)
})

const addLesson = asyncHandler(async (req, res) => {
    const { unitId } = req.params
    const { title, isFree, coverImageUrl, videoUrl, pdfUrl, imageUrls, order, gateAssessmentId, gateNextLessons, kind, assessmentId, contentSections } = req.body || {}

    const unit = await prisma.unit.findUnique({ where: { id: unitId } })
    if (!unit) return res.status(404).json({ message: 'Unit not found' })

    const course = await prisma.course.findUnique({ where: { id: unit.courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const normalizedKind = kind === 'exam' ? 'exam' : 'lesson'
    const normalizedIsFree = normalizeBoolean(isFree)
    const normalizedGateNextLessons = normalizeBoolean(gateNextLessons)
    const normalizedContentSections = Array.isArray(contentSections) ? contentSections.map(normalizeSection) : undefined

    const lesson = await prisma.lesson.create({
        data: {
            unitId,
            kind: normalizedKind,
            title,
            isFree: typeof normalizedIsFree === 'boolean' ? normalizedIsFree : false,
            coverImageUrl: coverImageUrl || '',
            videoUrl: videoUrl || '',
            pdfUrl: pdfUrl || '',
            imageUrls: Array.isArray(imageUrls) ? imageUrls : undefined,
            contentSections: normalizedContentSections,
            assessmentId: typeof assessmentId === 'string' && assessmentId ? assessmentId : null,
            gateAssessmentId: typeof gateAssessmentId === 'string' && gateAssessmentId ? gateAssessmentId : null,
            gateNextLessons: typeof normalizedGateNextLessons === 'boolean' ? normalizedGateNextLessons : false,
            order: order || 0
        }
    })
    res.status(201).json(lesson)
})

const deleteUnit = asyncHandler(async (req, res) => {
    const { unitId } = req.params
    const unit = await prisma.unit.findUnique({ where: { id: unitId } })
    if (!unit) return res.status(404).json({ message: 'Unit not found' })
    const course = await prisma.course.findUnique({ where: { id: unit.courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    await prisma.lesson.deleteMany({ where: { unitId } })
    await prisma.unit.delete({ where: { id: unitId } })
    res.json({ message: 'Unit deleted', unitId, courseId: course.id })
})

const updateLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params
    const { title, isFree, coverImageUrl, videoUrl, pdfUrl, imageUrls, order, gateAssessmentId, gateNextLessons, kind, assessmentId, contentSections } = req.body || {}

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' })
    const unit = await prisma.unit.findUnique({ where: { id: lesson.unitId } })
    if (!unit) return res.status(404).json({ message: 'Unit not found' })
    const course = await prisma.course.findUnique({ where: { id: unit.courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const data = {}
    const normalizedIsFree = normalizeBoolean(isFree)
    const normalizedGateNextLessons = normalizeBoolean(gateNextLessons)
    if (typeof title === 'string') data.title = title
    if (typeof normalizedIsFree === 'boolean') data.isFree = normalizedIsFree
    if (typeof coverImageUrl === 'string') data.coverImageUrl = coverImageUrl
    if (typeof videoUrl === 'string') data.videoUrl = videoUrl
    if (typeof pdfUrl === 'string') data.pdfUrl = pdfUrl
    if (Array.isArray(imageUrls)) data.imageUrls = imageUrls
    if (Array.isArray(contentSections)) data.contentSections = contentSections.map(normalizeSection)
    if (typeof order === 'number') data.order = order
    if (typeof kind === 'string') data.kind = kind === 'exam' ? 'exam' : 'lesson'
    if (typeof assessmentId === 'string') data.assessmentId = assessmentId || null
    if (typeof gateAssessmentId === 'string') data.gateAssessmentId = gateAssessmentId || null
    if (typeof normalizedGateNextLessons === 'boolean') data.gateNextLessons = normalizedGateNextLessons

    const updated = await prisma.lesson.update({ where: { id: lessonId }, data })
    res.json(updated)
})

const deleteLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' })
    const unit = await prisma.unit.findUnique({ where: { id: lesson.unitId } })
    if (!unit) return res.status(404).json({ message: 'Unit not found' })
    const course = await prisma.course.findUnique({ where: { id: unit.courseId } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })
    await prisma.lesson.delete({ where: { id: lessonId } })
    res.json({ message: 'Deleted', lessonId })
})

const selfEnrollFreeCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' })

    const courseDoc = await prisma.course.findUnique({ where: { id: courseId } })
    if (!courseDoc) return res.status(404).json({ message: 'Course not found' })

    const courseIsFree = Boolean(courseDoc.isFree) || Number(courseDoc.price || 0) <= 0
    if (!courseIsFree) return res.status(403).json({ message: 'Course locked' })

    const existing = await prisma.courseEnrollment.findFirst({ where: { courseId, studentId: req.user.id } })
    if (!existing) {
        await prisma.courseEnrollment.create({ data: { courseId, studentId: req.user.id } })
    }

    res.json({ message: 'Enrolled', courseId, studentId: req.user.id })
})

const enrollStudent = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const { studentId } = req.body || {}
    if (!studentId) return res.status(400).json({ message: 'studentId is required' })

    const courseDoc = await prisma.course.findUnique({ where: { id: courseId } })
    if (!courseDoc) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(courseDoc, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const studentIdRaw = String(studentId).trim()
    const student = await prisma.user.findFirst({
        where: { OR: [{ id: studentIdRaw }, { studentId: studentIdRaw }], role: 'student' },
        select: { id: true, role: true }
    })
    if (!student || student.role !== 'student') return res.status(400).json({ message: 'Student not found' })

    const existing = await prisma.courseEnrollment.findFirst({ where: { courseId, studentId: student.id } })
    if (!existing) {
        await prisma.courseEnrollment.create({ data: { courseId, studentId: student.id } })
    }
    res.json({ message: 'Enrolled', courseId, studentId: student.id })
})

const removeStudent = asyncHandler(async (req, res) => {
    const { courseId, studentId } = req.params

    const courseDoc = await prisma.course.findUnique({ where: { id: courseId } })
    if (!courseDoc) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(courseDoc, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const studentIdRaw = String(studentId).trim()
    const student = await prisma.user.findFirst({
        where: { OR: [{ id: studentIdRaw }, { studentId: studentIdRaw }], role: 'student' },
        select: { id: true }
    })
    if (!student) return res.status(400).json({ message: 'Student not found' })

    await prisma.courseEnrollment.deleteMany({ where: { courseId, studentId: student.id } })
    res.json({ message: 'Removed', courseId, studentId: studentIdRaw })
})

module.exports = {
    listPublicCourses, listPublicCoursesForTeacher, getPublicCourseOutline,
    createCourse, myCourses, getCourse, getCourseStats, updateCourse,
    updateCourseThumbnail, pinCourse, unpinCourse, listUnits, listLessonsForUnit,
    listStudents, listMyCourseStudents, addUnit, addLesson, deleteUnit,
    deleteCourse, updateLesson, deleteLesson, selfEnrollFreeCourse,
    enrollStudent, removeStudent
}

const mongoose = require('mongoose')
const { Course } = require('../models/Course')
const { Unit } = require('../models/Unit')
const { Lesson } = require('../models/Lesson')
const { User } = require('../models/User')
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

function courseTeacherId(course) {
    if (!course) return null
    if (course.teacher && course.teacher._id) return course.teacher._id.toString()
    if (course.teacher) return course.teacher.toString()
    return null
}

async function canAccessCourse(course, user) {
    if (!course) return false
    if (!user) return false
    if (user.role === 'admin') return true

    const courseIsFree = Boolean(course.isFree) || Number(course.price || 0) <= 0
    const teacherId = courseTeacherId(course)

    if (user.role === 'teacher') {
        return teacherId === user.id
    }

    if (user.role === 'team') {
        if (!user.teamId) return false
        if (!teacherId) return false
        const teacher = await User.findById(teacherId).select('teamId role')
        if (!teacher || teacher.role !== 'teacher') return false
        return String(teacher.teamId || '') === String(user.teamId)
    }

    if (user.role === 'student') {
        if (courseIsFree) return true
        return (course.students || []).some((s) => {
            const sid = s && s._id ? s._id.toString() : s ? s.toString() : null
            return sid === user.id
        })
    }

    return false
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

function normalizeSection(sec) {
    const obj = sec && typeof sec === 'object' ? sec : {}
    const key = typeof obj.key === 'string' ? obj.key : ''
    return {
        key,
        enabled: typeof obj.enabled === 'boolean' ? obj.enabled : true,
        videos: Array.isArray(obj.videos) ? obj.videos.map(normalizeAttachmentItem) : [],
        pdfs: Array.isArray(obj.pdfs) ? obj.pdfs.map(normalizeAttachmentItem) : [],
        images: Array.isArray(obj.images) ? obj.images.map(normalizeAttachmentItem) : [],
        assessmentId: typeof obj.assessmentId === 'string' && obj.assessmentId ? obj.assessmentId : undefined
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
            url: '',
            storageRef: '',
            durationSec: typeof it.durationSec === 'number' && Number.isFinite(it.durationSec) ? it.durationSec : null
        })) : [],
        pdfs: Array.isArray(sec.pdfs) ? sec.pdfs.map((it) => ({
            name: typeof it.name === 'string' ? it.name : '',
            description: typeof it.description === 'string' ? it.description : '',
            url: '',
            storageRef: ''
        })) : [],
        images: Array.isArray(sec.images) ? sec.images.map((it) => ({
            name: typeof it.name === 'string' ? it.name : '',
            description: typeof it.description === 'string' ? it.description : '',
            url: '',
            storageRef: ''
        })) : []
    }
}

const listPublicCourses = asyncHandler(async(req, res) => {
    const limitRaw = Number(req.query.limit)
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 24) : 6

    const qRaw = typeof req.query.q === 'string' ? req.query.q : ''
    const q = String(qRaw || '').trim()

    const section = typeof req.query.section === 'string' ? req.query.section.trim() : ''
    const gradeYear = typeof req.query.gradeYear === 'string' ? req.query.gradeYear.trim() : ''

    const filter = {}
    const and = []
    if (q) {
        and.push({
            $or: [
                { title: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') }
            ]
        })
    }
    if (section) {
        and.push({ $or: [{ section: '' }, { section }, { section: { $exists: false } }] })
    }
    if (gradeYear) {
        const cond = [{ gradeYear: '' }, { gradeYear }, { gradeYear: { $exists: false } }]
        and.push({ $or: cond })
    }
    if (and.length) filter.$and = and

    if (!req.user || req.user.role === 'student') {
        filter.isHiddenFromStudents = { $ne: true }
    }

    const courses = await Course.find(filter)
        .sort({ pinnedAt: -1, createdAt: -1 })
        .limit(limit)
        .select('title description thumbnailUrl teacher isFree price discountPercent createdAt updatedAt section gradeYear isIndividual courseType isHiddenFromStudents pinnedAt')
        .populate('teacher', 'name')

    res.json(
        courses.map((c) => ({
            id: c._id.toString(),
            _id: c._id.toString(),
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
            teacherId: c.teacher && c.teacher._id ? c.teacher._id.toString() : '',
            teacherName: c.teacher && c.teacher.name ? c.teacher.name : ''
        }))
    )
})

const listPublicCoursesForTeacher = asyncHandler(async(req, res) => {
    const { teacherId } = req.params

    const limitRaw = Number(req.query.limit)
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 48) : 24

    const courses = await Course.find({ teacher: teacherId })
        .sort({ pinnedAt: -1, createdAt: -1 })
        .limit(limit)
        .select('title description thumbnailUrl teacher isFree price discountPercent createdAt updatedAt section gradeYear isIndividual courseType isHiddenFromStudents pinnedAt')
        .populate('teacher', 'name')

    res.json(
        courses.map((c) => ({
            id: c._id.toString(),
            _id: c._id.toString(),
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
            teacherId: c.teacher && c.teacher._id ? c.teacher._id.toString() : '',
            teacherName: c.teacher && c.teacher.name ? c.teacher.name : ''
        }))
    )
})

const createCourse = asyncHandler(async(req, res) => {
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
        const teacher = await User.findOne({ role: 'teacher', teamId: req.user.teamId }).select('_id')
        if (!teacher) return res.status(400).json({ message: 'No teacher found for this team scope' })
        teacherId = teacher._id
    }

    const course = await Course.create({
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
        teacher: teacherId,
        students: []
    })

    res.status(201).json(course)
})

const updateCourse = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const { title, description, price, isFree, section, gradeYear, isIndividual, courseType, discountPercent } = req.body || {}

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    if (typeof title === 'string' && title.trim()) course.title = title.trim()
    if (typeof description === 'string') course.description = description

    const normalizedIsIndividual = normalizeBoolean(isIndividual)
    const normalizedCourseType = courseType === 'individual' ? 'individual' : courseType === 'monthly' ? 'monthly' : undefined
    if (normalizedCourseType) {
        course.courseType = normalizedCourseType
        course.isIndividual = normalizedCourseType === 'individual'
    } else if (typeof normalizedIsIndividual === 'boolean') {
        course.isIndividual = normalizedIsIndividual
        course.courseType = normalizedIsIndividual ? 'individual' : 'monthly'
    }

    const normalizedIsFree = normalizeBoolean(isFree)
    if (typeof normalizedIsFree === 'boolean') {
        course.isFree = normalizedIsFree
        if (normalizedIsFree) course.price = 0
    }

    if (price !== undefined && price !== null && price !== '') {
        const p = Number(price)
        if (!Number.isFinite(p) || p < 0) return res.status(400).json({ message: 'price must be a non-negative number' })
        course.price = p
        if (p <= 0) course.isFree = true
    }

    if (discountPercent !== undefined && discountPercent !== null && discountPercent !== '') {
        const dp = Number(discountPercent)
        if (!Number.isFinite(dp) || dp < 0 || dp > 100) return res.status(400).json({ message: 'discountPercent must be between 0 and 100' })
        course.discountPercent = (Boolean(course.isFree) || Number(course.price || 0) <= 0) ? 0 : dp
    }

    if (Boolean(course.isFree) || Number(course.price || 0) <= 0) {
        course.discountPercent = 0
    }

    if (typeof section === 'string') course.section = section.trim()
    if (typeof gradeYear === 'string') course.gradeYear = gradeYear.trim()

    await course.save()

    res.json({
        id: course._id.toString(),
        title: course.title,
        description: course.description || '',
        thumbnailUrl: course.thumbnailUrl || '',
        isIndividual: Boolean(course.isIndividual),
        courseType: course.courseType === 'individual' ? 'individual' : 'monthly',
        isFree: Boolean(course.isFree) || Number(course.price || 0) <= 0,
        price: typeof course.price === 'number' ? course.price : 0,
        discountPercent: typeof course.discountPercent === 'number' ? course.discountPercent : 0,
        section: typeof course.section === 'string' ? course.section : '',
        gradeYear: typeof course.gradeYear === 'string' ? course.gradeYear : '',
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
    })
})

const myCourses = asyncHandler(async(req, res) => {
    function mapCourseForCard(c) {
        const id = c && c._id ? c._id.toString() : ''
        return {
            id,
            _id: id,
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

    const selectFields = 'title description thumbnailUrl isFree price discountPercent createdAt updatedAt section gradeYear isIndividual courseType isHiddenFromStudents pinnedAt'

    if (req.user.role === 'teacher') {
        const courses = await Course.find({ teacher: req.user.id }).sort({ createdAt: -1 }).select(selectFields)
        return res.json(courses.map(mapCourseForCard))
    }
    if (req.user.role === 'student') {
        const courses = await Course.find({ students: req.user.id }).sort({ createdAt: -1 }).select(selectFields)
        return res.json(courses.map(mapCourseForCard))
    }
    if (req.user.role === 'team') {
        if (!req.user.teamId) return res.json([])
        const teachers = await User.find({ role: 'teacher', teamId: req.user.teamId }).select('_id')
        const teacherIds = teachers.map((t) => t._id)
        const courses = await Course.find({ teacher: { $in: teacherIds } }).sort({ createdAt: -1 }).select(selectFields)
        return res.json(courses.map(mapCourseForCard))
    }
    return res.status(403).json({ message: 'Forbidden' })
})

const getCourse = asyncHandler(async(req, res) => {
    const { courseId } = req.params

    if (req.user.role !== 'teacher' && req.user.role !== 'student' && req.user.role !== 'admin' && req.user.role !== 'team') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const course = await Course.findById(courseId)
        .populate('teacher', 'name email teamId role')
        .populate('students', 'name email')

    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role === 'teacher') {
        if (courseTeacherId(course) !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
        return res.json(course)
    }

    if (req.user.role === 'team') {
        if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })
        return res.json(course)
    }

    if (req.user.role === 'student') {
        if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })
        return res.json(course)
    }

    return res.json(course)
})

const getPublicCourseOutline = asyncHandler(async(req, res) => {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
        .select('title description thumbnailUrl teacher createdAt isFree price discountPercent isIndividual courseType')
        .populate('teacher', 'name')

    if (!course) return res.status(404).json({ message: 'Course not found' })

    const units = await Unit.find({ course: courseId }).sort({ order: 1, createdAt: 1 }).select('_id title description order')

    const unitIds = units.map((u) => u._id)
    const lessons = await Lesson.find({ unit: { $in: unitIds } })
        .sort({ order: 1, createdAt: 1 })
        .select('_id unit title order createdAt isFree coverImageUrl videoUrl pdfUrl imageUrls kind contentSections')

    let lessonsCount = 0
    let videoLessonsCount = 0

    const lessonsByUnitId = new Map()

    const courseIsFree = Boolean(course.isFree) || Number(course.price || 0) <= 0
    const canRevealCourseContent = Boolean(req.user && req.user.id && courseIsFree)

    for (const l of lessons) {
        lessonsCount += 1
        if (l.videoUrl) videoLessonsCount += 1
        const uid = l.unit ? l.unit.toString() : ''
        if (!lessonsByUnitId.has(uid)) lessonsByUnitId.set(uid, [])
        const isFree = Boolean(l.isFree)
        const canRevealContent = canRevealCourseContent || (isFree && req.user && req.user.id)
        const normalizedSections = Array.isArray(l.contentSections) ? l.contentSections.map(normalizeSection) : []
        const revealedSections = canRevealContent ? normalizedSections : normalizedSections.map(stripAttachmentUrls)

        lessonsByUnitId.get(uid).push({
            id: l._id.toString(),
            title: l.title,
            order: l.order,
            kind: l.kind || 'lesson',
            isFree,
            coverImageUrl: canRevealContent ? (l.coverImageUrl || '') : '',
            videoUrl: canRevealContent ? (l.videoUrl || '') : '',
            pdfUrl: canRevealContent ? (l.pdfUrl || '') : '',
            imageUrls: canRevealContent ? (Array.isArray(l.imageUrls) ? l.imageUrls : []) : [],
            contentSections: revealedSections
        })
    }

    const unitsWithLessons = units.map((u) => ({
        id: u._id.toString(),
        title: u.title,
        description: u.description || '',
        order: u.order,
        lessons: lessonsByUnitId.get(u._id.toString()) || []
    }))

    res.json({
        id: course._id.toString(),
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

const getCourseStats = asyncHandler(async(req, res) => {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const units = await Unit.find({ course: courseId }).sort({ order: 1, createdAt: 1 }).select('_id title description order')

    const unitIds = units.map((u) => u._id)
    const lessons = await Lesson.find({ unit: { $in: unitIds } })
        .sort({ order: 1, createdAt: 1 })
        .select('_id unit title order createdAt isFree coverImageUrl videoUrl pdfUrl imageUrls kind contentSections')

    let lessonsCount = 0
    let videoLessonsCount = 0

    const lessonsByUnitId = new Map()

    for (const l of lessons) {
        lessonsCount += 1
        if (l.videoUrl) videoLessonsCount += 1
        const uid = l.unit ? l.unit.toString() : ''
        if (!lessonsByUnitId.has(uid)) lessonsByUnitId.set(uid, [])
        lessonsByUnitId.get(uid).push({
            id: l._id.toString(),
            title: l.title,
            order: l.order,
            kind: l.kind || 'lesson',
            isFree: Boolean(l.isFree),
            coverImageUrl: l.coverImageUrl || '',
            videoUrl: l.videoUrl || '',
            pdfUrl: l.pdfUrl || '',
            imageUrls: Array.isArray(l.imageUrls) ? l.imageUrls : [],
            contentSections: Array.isArray(l.contentSections) ? l.contentSections.map(normalizeSection) : []
        })
    }

    const unitsWithLessons = units.map((u) => ({
        id: u._id.toString(),
        title: u.title,
        description: u.description || '',
        order: u.order,
        lessons: lessonsByUnitId.get(u._id.toString()) || []
    }))

    res.json({
        id: course._id.toString(),
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

const updateCourseThumbnail = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const { thumbnailUrl } = req.body || {}

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    if (typeof thumbnailUrl === 'string') course.thumbnailUrl = thumbnailUrl

    await course.save()

    res.json({
        id: course._id.toString(),
        title: course.title,
        description: course.description || '',
        thumbnailUrl: course.thumbnailUrl || '',
        isIndividual: Boolean(course.isIndividual),
        courseType: course.courseType === 'individual' ? 'individual' : 'monthly',
        isFree: Boolean(course.isFree) || Number(course.price || 0) <= 0,
        price: typeof course.price === 'number' ? course.price : 0,
        discountPercent: typeof course.discountPercent === 'number' ? course.discountPercent : 0,
        section: typeof course.section === 'string' ? course.section : '',
        gradeYear: typeof course.gradeYear === 'string' ? course.gradeYear : ''
    })
})

const pinCourse = asyncHandler(async(req, res) => {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    course.pinnedAt = new Date()
    await course.save()

    res.json({ message: 'Pinned', courseId: String(courseId), pinnedAt: course.pinnedAt })
})

const unpinCourse = asyncHandler(async(req, res) => {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    course.pinnedAt = null
    await course.save()

    res.json({ message: 'Unpinned', courseId: String(courseId) })
})

const deleteCourse = asyncHandler(async(req, res) => {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    await Course.deleteOne({ _id: courseId })
    res.json({ message: 'Deleted', courseId: String(courseId) })
})

const listUnits = asyncHandler(async(req, res) => {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'student' && req.user.role !== 'admin' && req.user.role !== 'team') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const units = await Unit.find({ course: courseId }).sort({ order: 1, createdAt: 1 }).select('_id title description order')

    res.json(units)
})

const listLessonsForUnit = asyncHandler(async(req, res) => {
    const { unitId } = req.params

    const unit = await Unit.findById(unitId)
    if (!unit) return res.status(404).json({ message: 'Unit not found' })

    const course = await Course.findById(unit.course)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'student' && req.user.role !== 'admin' && req.user.role !== 'team') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const lessons = await Lesson.find({ unit: unitId })
        .sort({ order: 1, createdAt: 1 })
        .select('_id unit title order createdAt isFree coverImageUrl videoUrl pdfUrl imageUrls kind contentSections assessmentId gateAssessmentId gateNextLessons')

    res.json(lessons)
})

const listStudents = asyncHandler(async(req, res) => {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const students = await User.find({ _id: { $in: course.students } }).select('_id name email')

    res.json(students)
})

const listMyCourseStudents = asyncHandler(async(req, res) => {
    const { q, status } = req.query

    if (req.user.role !== 'teacher' && req.user.role !== 'team') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    let teacherIds = []
    if (req.user.role === 'teacher') {
        teacherIds = [new mongoose.Types.ObjectId(String(req.user.id))]
    } else {
        if (!req.user.teamId) return res.json([])
        const teachers = await User.find({ role: 'teacher', teamId: req.user.teamId }).select('_id')
        teacherIds = teachers.map((t) => t._id)
    }

    const rows = await Course.aggregate([
        { $match: { teacher: { $in: teacherIds } } },
        { $unwind: '$students' },
        { $group: { _id: '$students' } }
    ])

    const studentIds = rows.map((r) => r && r._id).filter(Boolean)
    if (studentIds.length === 0) return res.json([])

    const filter = { _id: { $in: studentIds }, role: 'student' }
    if (typeof status === 'string' && status) filter.status = status
    if (q) {
        const qq = String(q).trim()
        if (qq) {
            filter.$or = [
                { name: new RegExp(qq, 'i') },
                { email: new RegExp(qq, 'i') },
                { studentId: new RegExp(qq, 'i') }
            ]
        }
    }

    const users = await User.find(filter).select('name email role teamId studentId status mustChangePassword profile createdAt isSuspended suspendedAt')
    res.json(users)
})

const addUnit = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const { title, description, order } = req.body || {}

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const unit = await Unit.create({
        course: courseId,
        title: title || '',
        description: description || '',
        order: order || 0
    })

    res.status(201).json(unit)
})

const addLesson = asyncHandler(async(req, res) => {
    const { unitId } = req.params
    const { title, isFree, coverImageUrl, videoUrl, pdfUrl, imageUrls, order, gateAssessmentId, gateNextLessons, kind, assessmentId, contentSections } = req.body || {}

    const unit = await Unit.findById(unitId)
    if (!unit) return res.status(404).json({ message: 'Unit not found' })

    const course = await Course.findById(unit.course)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const normalizedKind = kind === 'exam' ? 'exam' : 'lesson'

    const normalizedIsFree = normalizeBoolean(isFree)
    const normalizedGateNextLessons = normalizeBoolean(gateNextLessons)

    const normalizedContentSections = Array.isArray(contentSections) ? contentSections.map(normalizeSection) : undefined

    const lesson = await Lesson.create({
        unit: unit._id,
        kind: normalizedKind,
        title,
        isFree: typeof normalizedIsFree === 'boolean' ? normalizedIsFree : false,
        coverImageUrl: coverImageUrl || '',
        videoUrl: videoUrl || '',
        pdfUrl: pdfUrl || '',
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
        contentSections: normalizedContentSections,
        assessmentId: typeof assessmentId === 'string' && assessmentId ? assessmentId : undefined,
        gateAssessmentId: typeof gateAssessmentId === 'string' && gateAssessmentId ? gateAssessmentId : undefined,
        gateNextLessons: typeof normalizedGateNextLessons === 'boolean' ? normalizedGateNextLessons : false,
        order: order || 0
    })
    res.status(201).json(lesson)
})

const deleteUnit = asyncHandler(async(req, res) => {
    const { unitId } = req.params

    const unit = await Unit.findById(unitId)
    if (!unit) return res.status(404).json({ message: 'Unit not found' })

    const course = await Course.findById(unit.course)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    await Lesson.deleteMany({ unit: unitId })
    await Unit.deleteOne({ _id: unitId })

    res.json({ message: 'Unit deleted', unitId: String(unitId), courseId: String(course._id) })
})

const updateLesson = asyncHandler(async(req, res) => {
    const { lessonId } = req.params
    const { title, isFree, coverImageUrl, videoUrl, pdfUrl, imageUrls, order, gateAssessmentId, gateNextLessons, kind, assessmentId, contentSections } = req.body || {}

    const lesson = await Lesson.findById(lessonId)
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' })
    const unit = await Unit.findById(lesson.unit)
    if (!unit) return res.status(404).json({ message: 'Unit not found' })

    const course = await Course.findById(unit.course)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const normalizedIsFree = normalizeBoolean(isFree)
    const normalizedGateNextLessons = normalizeBoolean(gateNextLessons)

    if (typeof title === 'string') lesson.title = title
    if (typeof normalizedIsFree === 'boolean') lesson.isFree = normalizedIsFree
    if (typeof coverImageUrl === 'string') lesson.coverImageUrl = coverImageUrl
    if (typeof videoUrl === 'string') lesson.videoUrl = videoUrl
    if (typeof pdfUrl === 'string') lesson.pdfUrl = pdfUrl
    if (Array.isArray(imageUrls)) lesson.imageUrls = imageUrls
    if (Array.isArray(contentSections)) lesson.contentSections = contentSections.map(normalizeSection)

    if (typeof order === 'number') lesson.order = order
    if (typeof kind === 'string') {
        lesson.kind = kind === 'exam' ? 'exam' : 'lesson'
    }
    if (typeof assessmentId === 'string') {
        lesson.assessmentId = assessmentId ? assessmentId : undefined
    }
    if (typeof gateAssessmentId === 'string') {
        lesson.gateAssessmentId = gateAssessmentId ? gateAssessmentId : undefined
    }

    if (typeof normalizedGateNextLessons === 'boolean') lesson.gateNextLessons = normalizedGateNextLessons

    await lesson.save()
    res.json(lesson)
})

const deleteLesson = asyncHandler(async(req, res) => {
    const { lessonId } = req.params

    const lesson = await Lesson.findById(lessonId)
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' })

    const unit = await Unit.findById(lesson.unit)
    if (!unit) return res.status(404).json({ message: 'Unit not found' })

    const course = await Course.findById(unit.course)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(course, req.user))) return res.status(403).json({ message: 'Forbidden' })
    await Lesson.deleteOne({ _id: lessonId })
    res.json({ message: 'Deleted', lessonId: String(lessonId) })
})

const selfEnrollFreeCourse = asyncHandler(async(req, res) => {
    const { courseId } = req.params

    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' })
    if (!mongoose.Types.ObjectId.isValid(courseId)) return res.status(400).json({ message: 'Invalid courseId' })

    const courseDoc = await Course.findById(courseId)
    if (!courseDoc) return res.status(404).json({ message: 'Course not found' })

    const courseIsFree = Boolean(courseDoc.isFree) || Number(courseDoc.price || 0) <= 0
    if (!courseIsFree) return res.status(403).json({ message: 'Course locked' })

    const exists = (courseDoc.students || []).some((s) => String(s) === String(req.user.id))
    if (!exists) {
        courseDoc.students.push(req.user.id)
        await courseDoc.save()
    }

    res.json({ message: 'Enrolled', courseId: String(courseId), studentId: String(req.user.id) })
})

const enrollStudent = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const { studentId } = req.body || {}
    if (!studentId) return res.status(400).json({ message: 'studentId is required' })

    if (!mongoose.Types.ObjectId.isValid(courseId)) return res.status(400).json({ message: 'Invalid courseId' })
    const studentIdRaw = String(studentId).trim()
    const isMongoId = mongoose.Types.ObjectId.isValid(studentIdRaw)

    const courseDoc = await Course.findById(courseId)
    if (!courseDoc) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(courseDoc, req.user))) return res.status(403).json({ message: 'Forbidden' })

    const student = isMongoId ?
        await User.findById(studentIdRaw).select('_id role studentId') :
        await User.findOne({ studentId: studentIdRaw }).select('_id role studentId')
    if (!student || student.role !== 'student') return res.status(400).json({ message: 'Student not found' })

    const exists = (courseDoc.students || []).some((s) => String(s) === String(student._id))
    if (!exists) {
        courseDoc.students.push(student._id)
        await courseDoc.save()
    }
    res.json({ message: 'Enrolled', courseId: String(courseId), studentId: String(student._id) })
})

const removeStudent = asyncHandler(async(req, res) => {
    const { courseId, studentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(courseId)) return res.status(400).json({ message: 'Invalid courseId' })
    const studentIdRaw = String(studentId).trim()
    const isMongoId = mongoose.Types.ObjectId.isValid(studentIdRaw)
    let studentObjectId = null
    if (isMongoId) {
        studentObjectId = studentIdRaw
    } else {
        const student = await User.findOne({ studentId: studentIdRaw }).select('_id')
        if (!student) return res.status(400).json({ message: 'Student not found' })
        studentObjectId = student._id.toString()
    }

    const courseDoc = await Course.findById(courseId)
    if (!courseDoc) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role !== 'teacher' && req.user.role !== 'team') return res.status(403).json({ message: 'Forbidden' })
    if (!(await canAccessCourse(courseDoc, req.user))) return res.status(403).json({ message: 'Forbidden' })

    courseDoc.students = (courseDoc.students || []).filter((s) => String(s) !== String(studentObjectId))
    await courseDoc.save()
    res.json({ message: 'Removed', courseId: String(courseId), studentId: String(studentIdRaw) })
})

module.exports = {
    listPublicCourses,
    listPublicCoursesForTeacher,
    getPublicCourseOutline,
    createCourse,
    myCourses,
    getCourse,
    getCourseStats,
    updateCourse,
    updateCourseThumbnail,
    pinCourse,
    unpinCourse,
    listUnits,
    listLessonsForUnit,
    listStudents,
    listMyCourseStudents,
    addUnit,
    addLesson,
    deleteUnit,
    deleteCourse,
    updateLesson,
    deleteLesson,
    selfEnrollFreeCourse,
    enrollStudent,
    removeStudent
}
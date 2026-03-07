const mongoose = require('mongoose')
const { User } = require('../models/User')
const { Course } = require('../models/Course')
const { Unit } = require('../models/Unit')
const { Lesson } = require('../models/Lesson')
const { Assessment } = require('../models/Assessment')
const { AssessmentAttempt } = require('../models/AssessmentAttempt')
const { StudentVideoProgress } = require('../models/StudentVideoProgress')
const { asyncHandler } = require('../utils/asyncHandler')

// ── GET /users/me ────────────────────────────────────────────────────────────
const getMyProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('name email role teamId studentId profile createdAt')
    if (!user) return res.status(404).json({ message: 'Not found' })
    res.json(user)
})

// ── PUT /users/me ────────────────────────────────────────────────────────────
const updateMyProfile = asyncHandler(async (req, res) => {
    const { name, profile } = req.body || {}

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'Not found' })

    if (typeof name === 'string' && name.trim()) {
        user.name = name.trim()
    }

    const p = profile || {}
    // Shared / common fields
    if (p.avatarUrl === null || p.avatarUrl === '') user.profile.avatarUrl = ''
    else if (typeof p.avatarUrl === 'string') user.profile.avatarUrl = p.avatarUrl
    if (typeof p.phone === 'string') user.profile.phone = p.phone
    if (typeof p.address === 'string') user.profile.address = p.address
    if (typeof p.bio === 'string') user.profile.bio = p.bio

    // Student-specific fields (from RegisterPage)
    if (typeof p.studentPhone === 'string') user.profile.studentPhone = p.studentPhone
    if (typeof p.parentPhone === 'string') user.profile.parentPhone = p.parentPhone
    if (typeof p.schoolName === 'string') user.profile.schoolName = p.schoolName
    if (typeof p.section === 'string') user.profile.section = p.section
    if (typeof p.gradeYear === 'string') user.profile.gradeYear = p.gradeYear
    if (typeof p.governorate === 'string') user.profile.governorate = p.governorate
    if (typeof p.nationalId === 'string') user.profile.nationalId = p.nationalId
    if (p.birthDate !== undefined) {
        if (p.birthDate === '' || p.birthDate === null) {
            user.profile.birthDate = undefined
        } else {
            const d = new Date(p.birthDate)
            if (!isNaN(d.getTime())) user.profile.birthDate = d
        }
    }

    // Staff/teacher fields (from JoinTeachersPage – stored on profile too)
    if (typeof p.jobTitle === 'string') user.profile.jobTitle = p.jobTitle
    if (typeof p.subject === 'string') user.profile.subject = p.subject
    if (typeof p.expectedSalary === 'string') user.profile.expectedSalary = p.expectedSalary
    if (typeof p.cvUrl === 'string') user.profile.cvUrl = p.cvUrl
    if (typeof p.photoUrl === 'string') user.profile.photoUrl = p.photoUrl

    await user.save()

    const fresh = await User.findById(req.user.id).select('name email role teamId studentId profile createdAt')
    res.json(fresh)
})

// ── GET /users/me/stats ──────────────────────────────────────────────────────
const getMyStats = asyncHandler(async (req, res) => {
    const userId = String(req.user.id)
    const me = await User.findById(userId).select('role profile')
    if (!me) return res.status(404).json({ message: 'Not found' })
    if (me.role !== 'student') return res.status(403).json({ message: 'Forbidden' })

    const profile = me && me.profile ? me.profile : {}
    const gradeYear = typeof profile.gradeYear === 'string' ? profile.gradeYear.trim() : ''
    const section = typeof profile.section === 'string' ? profile.section.trim() : ''

    // ── 1. All enrolled courses ──────────────────────────────────────────────
    const enrolledCourses = await Course.find({ students: userId })
        .select('_id title teacher gradeYear section isFree price discountPercent')
        .populate('teacher', 'name')
    const enrolledTotal = enrolledCourses.length

    // Try same-year filter first; fall back to ALL enrolled if it yields nothing
    const strictSameYear = gradeYear
        ? enrolledCourses.filter((c) => String(c.gradeYear || '').trim() === gradeYear)
        : enrolledCourses
    const sameYearCourses = strictSameYear.length > 0 ? strictSameYear : enrolledCourses
    const usedFallback = strictSameYear.length === 0 && enrolledCourses.length > 0

    const sameYearCourseIds = sameYearCourses.map((c) => c._id)
    const sameYearTeachers = Array.from(
        new Set(
            sameYearCourses
                .map((c) => (c.teacher ? String(c.teacher._id || c.teacher) : ''))
                .filter(Boolean)
        )
    )

    const sameYearCoursesDetails = sameYearCourses.map((c) => ({
        id: c._id.toString(),
        title: c.title || '',
        teacherName: c.teacher && c.teacher.name ? c.teacher.name : '',
        gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
        section: typeof c.section === 'string' ? c.section : '',
        isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
        price: typeof c.price === 'number' ? c.price : Number(c.price || 0),
        discountPercent: typeof c.discountPercent === 'number' ? c.discountPercent : Number(c.discountPercent || 0)
    }))

    // ── 2. Video progress ────────────────────────────────────────────────────
    const watchedAgg = sameYearCourseIds.length
        ? await StudentVideoProgress.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(userId), course: { $in: sameYearCourseIds } } },
            { $group: { _id: '$course', seconds: { $sum: '$totalSecondsWatched' } } }
        ])
        : []
    const watchedByCourseId = new Map(watchedAgg.map((r) => [String(r._id), Number(r.seconds || 0)]))

    let watchedTotalSeconds = 0
    for (const v of watchedByCourseId.values()) watchedTotalSeconds += Number(v || 0)
    const watchedTotalHours = Math.round((watchedTotalSeconds / 3600) * 100) / 100

    // ── 3. Total video duration per course ───────────────────────────────────
    const units = sameYearCourseIds.length
        ? await Unit.find({ course: { $in: sameYearCourseIds } }).select('_id course')
        : []
    const unitIds = units.map((u) => u._id)
    const unitCourseById = new Map(units.map((u) => [String(u._id), String(u.course)]))

    const lessons = unitIds.length
        ? await Lesson.find({ unit: { $in: unitIds } }).select('unit contentSections')
        : []
    const totalVideoSecondsByCourseId = new Map()

    for (const l of lessons) {
        const uid = l && l.unit ? String(l.unit) : ''
        const courseId = unitCourseById.get(uid) || ''
        if (!courseId) continue

        let sum = totalVideoSecondsByCourseId.get(courseId) || 0
        const sections = Array.isArray(l && l.contentSections) ? l.contentSections : []
        for (const s of sections) {
            if (s && s.enabled === false) continue
            const vids = Array.isArray(s && s.videos) ? s.videos : []
            for (const v of vids) {
                const d = typeof v.durationSec === 'number' ? v.durationSec : Number(v.durationSec || 0)
                if (Number.isFinite(d) && d > 0) sum += d
            }
        }
        totalVideoSecondsByCourseId.set(courseId, sum)
    }

    let totalVideoSecondsAll = 0
    for (const v of totalVideoSecondsByCourseId.values()) totalVideoSecondsAll += Number(v || 0)
    const totalVideoHoursAll = Math.round((totalVideoSecondsAll / 3600) * 100) / 100

    const sameYearCoursesWithWatch = sameYearCoursesDetails.map((c) => {
        const seconds = watchedByCourseId.get(String(c.id)) || 0
        const hours = Math.round((seconds / 3600) * 100) / 100
        const totalVideoSeconds = totalVideoSecondsByCourseId.get(String(c.id)) || 0
        const completionPercent = totalVideoSeconds > 0
            ? Math.min(100, Math.max(0, Math.round((seconds / totalVideoSeconds) * 10000) / 100))
            : null
        return { ...c, watchedSeconds: seconds, watchedHours: hours, totalVideoSeconds, completionPercent }
    })

    // ── 4. Assessments — use ALL enrolled courses for accurate stats ──────────
    const allCourseIds = enrolledCourses.map((c) => c._id)
    const assessmentDocs = allCourseIds.length
        ? await Assessment.find({ course: { $in: allCourseIds } })
            .select('_id title type course')
            .populate('course', 'title')
        : []
    const assessmentIds = assessmentDocs.map((a) => a._id)

    const attempts = assessmentIds.length
        ? await AssessmentAttempt.find({ student: userId, assessment: { $in: assessmentIds } })
            .select('status score maxScore assessment submittedAt createdAt')
            .populate('assessment', 'title type course')
        : []

    // Attempts with a real score (graded only for percent stats)
    const gradedWithScore = attempts.filter(
        (a) => a && a.status === 'graded' && Number(a.maxScore || 0) > 0
    )
    const percents = gradedWithScore.map((a) => (Number(a.score || 0) / Number(a.maxScore || 0)) * 100)

    const avgPercent = percents.length
        ? Math.round((percents.reduce((s, p) => s + p, 0) / percents.length) * 100) / 100
        : 0
    const bestPercent = percents.length ? Math.round(Math.max(...percents) * 100) / 100 : 0

    const sortedGraded = gradedWithScore
        .slice()
        .sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime())

    const lastGradedAttempt = sortedGraded[0] || null
    const lastPercent = lastGradedAttempt
        ? Math.round(((Number(lastGradedAttempt.score || 0) / Number(lastGradedAttempt.maxScore || 0)) * 100) * 100) / 100
        : null

    const recentResults = sortedGraded.slice(0, 20).map((a) => {
        const pct = (Number(a.score || 0) / Number(a.maxScore || 0)) * 100
        const assessment = a.assessment || null
        const course = assessment && assessment.course ? assessment.course : null
        return {
            attemptId: a._id.toString(),
            assessmentTitle: assessment && assessment.title ? assessment.title : '',
            assessmentType: assessment && assessment.type ? assessment.type : '',
            courseTitle: course && course.title ? course.title : '',
            percent: Math.round(pct * 100) / 100,
            score: typeof a.score === 'number' ? a.score : 0,
            maxScore: typeof a.maxScore === 'number' ? a.maxScore : 0,
            submittedAt: a.submittedAt || null,
            createdAt: a.createdAt
        }
    })

    res.json({
        profile: { gradeYear, section },
        usedFallback,
        courses: {
            enrolledTotal,
            enrolledSameYear: sameYearCourses.length,
            teachersSameYear: sameYearTeachers.length,
            watchedTotalSeconds,
            watchedTotalHours,
            totalVideoSeconds: totalVideoSecondsAll,
            totalVideoHours: totalVideoHoursAll,
            items: sameYearCoursesWithWatch
        },
        assessments: {
            attemptsTotal: attempts.length,
            gradedAttempts: gradedWithScore.length,
            avgPercent,
            bestPercent,
            lastPercent,
            recentResults
        }
    })
})

module.exports = { getMyProfile, updateMyProfile, getMyStats }
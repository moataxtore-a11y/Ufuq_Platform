const { prisma } = require('../config/prisma')

async function calculateStudentStats(userId) {
    const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, profile: true }
    })
    if (!me) return null

    const profile = me.profile || {}
    const gradeYear = typeof profile.gradeYear === 'string' ? profile.gradeYear.trim() : ''
    const section = typeof profile.section === 'string' ? profile.section.trim() : ''

    const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: userId },
        select: { courseId: true }
    })

    const enrolledTotal = enrollments.length
    const courseIds = enrollments.map((e) => e.courseId).filter(Boolean)

    const enrolledCourses = courseIds.length
        ? await prisma.course.findMany({
            where: { id: { in: courseIds } },
            select: { id: true, title: true, teacherId: true, gradeYear: true, section: true, isFree: true, price: true, discountPercent: true }
          })
        : []

    const strictSameYear = gradeYear
        ? enrolledCourses.filter((c) => String(c.gradeYear || '').trim() === gradeYear)
        : enrolledCourses
    const sameYearCourses = strictSameYear.length > 0 ? strictSameYear : enrolledCourses
    const usedFallback = strictSameYear.length === 0 && enrolledCourses.length > 0

    const sameYearCourseIds = sameYearCourses.map((c) => c.id)
    const sameYearTeachers = [...new Set(sameYearCourses.map((c) => c.teacherId).filter(Boolean))]

    const teachers = sameYearTeachers.length
        ? await prisma.user.findMany({
            where: { id: { in: sameYearTeachers } },
            select: { id: true, name: true }
          })
        : []
    const teacherNameMap = new Map(teachers.map((t) => [t.id, t.name]))

    const sameYearCoursesDetails = sameYearCourses.map((c) => ({
        id: c.id,
        title: c.title || '',
        teacherName: teacherNameMap.get(c.teacherId) || '',
        gradeYear: typeof c.gradeYear === 'string' ? c.gradeYear : '',
        section: typeof c.section === 'string' ? c.section : '',
        isFree: Boolean(c.isFree) || Number(c.price || 0) <= 0,
        price: typeof c.price === 'number' ? c.price : 0,
        discountPercent: typeof c.discountPercent === 'number' ? c.discountPercent : 0
    }))

    const videoProgress = sameYearCourseIds.length
        ? await prisma.studentVideoProgress.findMany({
            where: { studentId: userId, courseId: { in: sameYearCourseIds } },
            select: { courseId: true, totalSecondsWatched: true }
          })
        : []

    const watchedByCourseId = new Map()
    let watchedTotalSeconds = 0
    for (const vp of videoProgress) {
        const prev = watchedByCourseId.get(vp.courseId) || 0
        watchedByCourseId.set(vp.courseId, prev + Number(vp.totalSecondsWatched || 0))
        watchedTotalSeconds += Number(vp.totalSecondsWatched || 0)
    }
    const watchedTotalHours = Math.round((watchedTotalSeconds / 3600) * 100) / 100

    const units = sameYearCourseIds.length
        ? await prisma.unit.findMany({
            where: { courseId: { in: sameYearCourseIds } },
            select: { id: true, courseId: true }
          })
        : []
    const unitIds = units.map((u) => u.id)
    const unitCourseById = new Map(units.map((u) => [u.id, u.courseId]))

    const lessons = unitIds.length
        ? await prisma.lesson.findMany({
            where: { unitId: { in: unitIds } },
            select: { unitId: true, contentSections: true }
          })
        : []

    const totalVideoSecondsByCourseId = new Map()
    for (const l of lessons) {
        const courseId = unitCourseById.get(l.unitId) || ''
        if (!courseId) continue
        const sections = Array.isArray(l.contentSections) ? l.contentSections : []
        let sum = totalVideoSecondsByCourseId.get(courseId) || 0
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
        const seconds = watchedByCourseId.get(c.id) || 0
        const hours = Math.round((seconds / 3600) * 100) / 100
        const totalVideoSeconds = totalVideoSecondsByCourseId.get(c.id) || 0
        const completionPercent = totalVideoSeconds > 0
            ? Math.min(100, Math.max(0, Math.round((seconds / totalVideoSeconds) * 10000) / 100))
            : null
        return { ...c, watchedSeconds: seconds, watchedHours: hours, totalVideoSeconds, completionPercent }
    })

    const allCourseIds = enrolledCourses.map((c) => c.id)
    const assessments = allCourseIds.length
        ? await prisma.assessment.findMany({
            where: { courseId: { in: allCourseIds } },
            select: { id: true, title: true, type: true, courseId: true }
          })
        : []
    const assessmentIds = assessments.map((a) => a.id)
    const assessmentCourseMap = new Map(assessments.map((a) => [a.id, a]))

    const attempts = assessmentIds.length
        ? await prisma.assessmentAttempt.findMany({
            where: { studentId: userId, assessmentId: { in: assessmentIds } },
            select: { id: true, status: true, score: true, maxScore: true, assessmentId: true, submittedAt: true, createdAt: true }
          })
        : []

    const gradedWithScore = attempts.filter((a) => a.status === 'graded' && Number(a.maxScore || 0) > 0)
    const percents = gradedWithScore.map((a) => (Number(a.score || 0) / Number(a.maxScore || 0)) * 100)
    const avgPercent = percents.length ? Math.round((percents.reduce((s, p) => s + p, 0) / percents.length) * 100) / 100 : 0
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
        const asm = assessmentCourseMap.get(a.assessmentId)
        return {
            attemptId: a.id,
            assessmentTitle: asm ? asm.title : '',
            assessmentType: asm ? asm.type : '',
            percent: Math.round(pct * 100) / 100,
            score: typeof a.score === 'number' ? a.score : 0,
            maxScore: typeof a.maxScore === 'number' ? a.maxScore : 0,
            submittedAt: a.submittedAt || null,
            createdAt: a.createdAt
        }
    })

    return {
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
    }
}

module.exports = { calculateStudentStats }

const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

async function ensureEnrolled(studentId, courseId) {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, isFree: true, price: true }
    })
    if (!course) return false
    const isFree = Boolean(course.isFree) || Number(course.price || 0) <= 0
    if (isFree) return true

    const enrollment = await prisma.courseEnrollment.findFirst({
        where: { courseId, studentId }
    })
    return !!enrollment
}

const markLessonOpened = asyncHandler(async (req, res) => {
    const studentId = req.user.id
    const { courseId, lessonId } = req.body || {}
    if (!courseId || !lessonId) return res.status(400).json({ message: 'courseId and lessonId are required' })

    const ok = await ensureEnrolled(studentId, courseId)
    if (!ok) return res.status(403).json({ message: 'Forbidden' })

    await prisma.studentLessonProgress.upsert({
        where: { studentId_courseId_lessonId: { studentId, courseId, lessonId } },
        update: {},
        create: { studentId, courseId, lessonId, openedAt: new Date() }
    })

    res.json({ ok: true })
})

const markLessonCompleted = asyncHandler(async (req, res) => {
    const studentId = req.user.id
    const { courseId, lessonId } = req.body || {}
    if (!courseId || !lessonId) return res.status(400).json({ message: 'courseId and lessonId are required' })

    const ok = await ensureEnrolled(studentId, courseId)
    if (!ok) return res.status(403).json({ message: 'Forbidden' })

    const now = new Date()
    await prisma.studentLessonProgress.upsert({
        where: { studentId_courseId_lessonId: { studentId, courseId, lessonId } },
        update: { completedAt: now, openedAt: now },
        create: { studentId, courseId, lessonId, openedAt: now, completedAt: now }
    })

    res.json({ ok: true })
})

const reportVideoWatch = asyncHandler(async (req, res) => {
    const studentId = req.user.id
    const { courseId, lessonId, videoUrl, deltaSeconds, positionSeconds, durationSeconds } = req.body || {}
    if (!courseId || !lessonId || !videoUrl) return res.status(400).json({ message: 'courseId, lessonId, videoUrl are required' })

    const d = Number(deltaSeconds || 0)
    if (!Number.isFinite(d) || d <= 0) return res.json({ ok: true })

    const delta = Math.min(120, Math.max(0, Math.floor(d)))
    if (!delta) return res.json({ ok: true })

    const ok = await ensureEnrolled(studentId, courseId)
    if (!ok) return res.status(403).json({ message: 'Forbidden' })

    const pos = Number(positionSeconds || 0)
    const dur = Number(durationSeconds || 0)

    const existing = await prisma.studentVideoProgress.findFirst({
        where: { studentId, courseId, lessonId, videoUrl: String(videoUrl) }
    })

    if (existing) {
        await prisma.studentVideoProgress.update({
            where: { id: existing.id },
            data: {
                totalSecondsWatched: { increment: delta },
                lastPositionSeconds: Number.isFinite(pos) ? Math.max(0, pos) : existing.lastPositionSeconds,
                lastDurationSeconds: Number.isFinite(dur) ? Math.max(0, dur) : existing.lastDurationSeconds
            }
        })
    } else {
        await prisma.studentVideoProgress.create({
            data: {
                studentId, courseId, lessonId, videoUrl: String(videoUrl),
                totalSecondsWatched: delta,
                lastPositionSeconds: Number.isFinite(pos) ? Math.max(0, pos) : 0,
                lastDurationSeconds: Number.isFinite(dur) ? Math.max(0, dur) : 0
            }
        })
    }

    res.json({ ok: true })
})

module.exports = { markLessonOpened, markLessonCompleted, reportVideoWatch }

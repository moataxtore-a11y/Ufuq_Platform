const mongoose = require('mongoose')
const { Course } = require('../models/Course')
const { StudentVideoProgress } = require('../models/StudentVideoProgress')
const { StudentLessonProgress } = require('../models/StudentLessonProgress')
const { asyncHandler } = require('../utils/asyncHandler')

async function ensureEnrolled(studentId, courseId) {
    if (!mongoose.Types.ObjectId.isValid(courseId)) return false
    const course = await Course.findById(courseId).select('students isFree price')
    if (!course) return false
    const isFree = Boolean(course.isFree) || Number(course.price || 0) <= 0
    const enrolled = Array.isArray(course.students) && course.students.some((s) => String(s) === String(studentId))
    return Boolean(enrolled || isFree)
}

const markLessonOpened = asyncHandler(async(req, res) => {
    const studentId = req.user.id
    const { courseId, lessonId } = req.body || {}
    if (!courseId || !lessonId) return res.status(400).json({ message: 'courseId and lessonId are required' })

    const ok = await ensureEnrolled(studentId, courseId)
    if (!ok) return res.status(403).json({ message: 'Forbidden' })

    const now = new Date()
    await StudentLessonProgress.findOneAndUpdate(
        { student: studentId, course: courseId, lesson: lessonId },
        { $setOnInsert: { openedAt: now } },
        { upsert: true, new: true }
    )

    res.json({ ok: true })
})

const markLessonCompleted = asyncHandler(async(req, res) => {
    const studentId = req.user.id
    const { courseId, lessonId } = req.body || {}
    if (!courseId || !lessonId) return res.status(400).json({ message: 'courseId and lessonId are required' })

    const ok = await ensureEnrolled(studentId, courseId)
    if (!ok) return res.status(403).json({ message: 'Forbidden' })

    const now = new Date()
    await StudentLessonProgress.findOneAndUpdate(
        { student: studentId, course: courseId, lesson: lessonId },
        { $set: { completedAt: now }, $setOnInsert: { openedAt: now } },
        { upsert: true, new: true }
    )

    res.json({ ok: true })
})

const reportVideoWatch = asyncHandler(async(req, res) => {
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

    await StudentVideoProgress.findOneAndUpdate(
        { student: studentId, course: courseId, lesson: lessonId, videoUrl: String(videoUrl) },
        {
            $inc: { totalSecondsWatched: delta },
            $max: { lastPositionSeconds: Number.isFinite(pos) ? Math.max(0, pos) : 0 },
            $set: { lastDurationSeconds: Number.isFinite(dur) ? Math.max(0, dur) : 0 }
        },
        { upsert: true, new: true }
    )

    res.json({ ok: true })
})

module.exports = { markLessonOpened, markLessonCompleted, reportVideoWatch }

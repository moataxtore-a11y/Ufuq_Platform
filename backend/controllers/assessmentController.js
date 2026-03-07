const mongoose = require('mongoose')
const { Assessment } = require('../models/Assessment')
const { AssessmentAttempt } = require('../models/AssessmentAttempt')
const { Course } = require('../models/Course')
const { Unit } = require('../models/Unit')
const { Lesson } = require('../models/Lesson')
const { asyncHandler } = require('../utils/asyncHandler')

async function resolveCourseIdFromAssessment(assessment) {
    if (assessment.course) return assessment.course.toString()
    if (assessment.lesson) {
        const lesson = await Lesson.findById(assessment.lesson).select('unit')
        if (!lesson) return null
        const unit = await Unit.findById(lesson.unit).select('course')
        return unit ? unit.course.toString() : null
    }
    if (assessment.unit) {
        const unit = await Unit.findById(assessment.unit).select('course')
        return unit ? unit.course.toString() : null
    }
    return null
}

async function canAccessAssessmentAsStudent(assessment, userId) {
    const courseId = await resolveCourseIdFromAssessment(assessment)
    if (!courseId) return false
    const course = await Course.findById(courseId).select('students teacher')
    if (!course) return false
    return course.students.some((s) => s.toString() === userId)
}

function nowInWindow(assessment) {
    const now = new Date()
    if (assessment.startAt && now < assessment.startAt) return { ok: false, message: 'Assessment not started' }
    if (assessment.endAt && now > assessment.endAt) return { ok: false, message: 'Assessment ended' }
    return { ok: true }
}

function isAfterEnd(assessment) {
    const now = new Date()
    if (!assessment.endAt) return false
    return now > assessment.endAt
}

function canShowScore(assessment, attempt) {
    const policy = assessment.releaseScorePolicy || 'immediate'
    // If attempt is still waiting for manual grading, do not show any score.
    if (attempt.status === 'submitted') return false
    if (policy === 'immediate') return attempt.status === 'graded'
    if (policy === 'after_end') return isAfterEnd(assessment)
    if (policy === 'after_graded') return attempt.status === 'graded'
    return false
}

function canShowCorrectAnswers(assessment, attempt) {
    const policy = assessment.showCorrectAnswersPolicy || 'never'
    if (policy === 'never') return false
    if (policy === 'after_submit') return attempt.status === 'graded' || attempt.status === 'submitted'
    if (policy === 'after_end') return isAfterEnd(assessment)
    if (policy === 'after_graded') return attempt.status === 'graded'
    return false
}

function normalizeAttemptStatus(attempt) {
    if (!attempt) return 'not_attempted'
    if (attempt.status === 'in_progress') return 'in_progress'
    if (attempt.status === 'submitted') return 'submitted'
    if (attempt.status === 'graded') return 'graded'
    return 'not_attempted'
}

function attemptStatusRank(status) {
    if (status === 'graded') return 3
    if (status === 'submitted') return 2
    if (status === 'in_progress') return 1
    return 0
}

function pickBetterAttempt(a, b) {
    if (!a) return b
    if (!b) return a
    const ra = attemptStatusRank(a.status)
    const rb = attemptStatusRank(b.status)
    if (ra !== rb) return ra > rb ? a : b
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return ta >= tb ? a : b
}

function sanitizeAssessmentForStudent(assessment) {
    const obj = assessment.toObject({ virtuals: false })
    if (Array.isArray(obj.questions)) {
        obj.questions = obj.questions.map((q) => {
            const out = {
                _id: q._id,
                type: q.type,
                prompt: q.prompt,
                imageUrl: q.imageUrl,
                points: q.points,
                required: q.required
            }
            if (q.type === 'mcq') {
                out.options = (q.options || []).map((o) => ({ _id: o._id, text: o.text }))
            }
            return out
        })
    }
    return obj
}

function assessmentWithCorrectAnswers(assessment) {
    return assessment.toObject({ virtuals: false })
}

function computeScores(assessment, answers) {
    const answerByQ = new Map()
    for (const a of answers || []) {
        if (a && a.questionId) answerByQ.set(String(a.questionId), a)
    }

    let maxScore = 0
    let autoGradedScore = 0
    let needsManual = false

    for (const q of assessment.questions || []) {
        const points = Number(q.points || 0)
        maxScore += points

        const a = answerByQ.get(String(q._id))
        if (!a) continue

        if (q.type === 'mcq') {
            if (q.correctOptionId && a.selectedOptionId && String(a.selectedOptionId) === String(q.correctOptionId)) {
                autoGradedScore += points
            }
        } else if (q.type === 'true_false') {
            if (typeof q.correctBoolean === 'boolean' && typeof a.booleanAnswer === 'boolean' && a.booleanAnswer === q.correctBoolean) {
                autoGradedScore += points
            }
        } else if (q.type === 'short_answer') {
            if (typeof q.correctText === 'string' && typeof a.textAnswer === 'string') {
                if (a.textAnswer.trim().toLowerCase() === q.correctText.trim().toLowerCase()) {
                    autoGradedScore += points
                }
            } else {
                needsManual = true
            }
        } else if (q.type === 'essay' || q.type === 'file_upload') {
            needsManual = true
        }
    }

    return { maxScore, autoGradedScore, needsManual }
}

const createAssessment = asyncHandler(async (req, res) => {
    const {
        type,
        title,
        description,
        courseId,
        unitId,
        lessonId,
        durationMinutes,
        startAt,
        endAt,
        attemptLimit,
        showCorrectAnswersPolicy,
        releaseScorePolicy,
        questions
    } = req.body || {}

    if (!type || !title) return res.status(400).json({ message: 'type and title are required' })

    const normalizedQuestions = Array.isArray(questions) ? questions : []

    const assessment = await Assessment.create({
        type,
        title,
        description: description || '',
        course: courseId || undefined,
        unit: unitId || undefined,
        lesson: lessonId || undefined,
        durationMinutes: durationMinutes || undefined,
        startAt: startAt ? new Date(startAt) : undefined,
        endAt: endAt ? new Date(endAt) : undefined,
        attemptLimit: typeof attemptLimit === 'number' ? attemptLimit : undefined,
        showCorrectAnswersPolicy: showCorrectAnswersPolicy || 'after_submit',
        releaseScorePolicy: releaseScorePolicy || undefined,
        questions: normalizedQuestions,
        createdBy: req.user.id
    })

    // Map correctOptionIndex (sent from frontend) to correctOptionId after Mongoose generates option _id.
    let touched = false
    for (const q of assessment.questions || []) {
        if (q.type !== 'mcq') continue
        const idx = q.correctOptionIndex
        if (!Number.isInteger(idx)) continue
        if (Array.isArray(q.options) && idx >= 0 && idx < q.options.length) {
            q.correctOptionId = q.options[idx]._id
            touched = true
        }
        q.correctOptionIndex = undefined
    }
    if (touched) await assessment.save()

    res.status(201).json(assessment)
})

const updateAssessment = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const {
        type,
        title,
        description,
        durationMinutes,
        startAt,
        endAt,
        attemptLimit,
        showCorrectAnswersPolicy,
        releaseScorePolicy,
        questions
    } = req.body || {}

    const assessment = await Assessment.findById(assessmentId)
    if (!assessment) return res.status(404).json({ message: 'Not found' })

    const courseId = await resolveCourseIdFromAssessment(assessment)
    if (!courseId) return res.status(400).json({ message: 'Assessment is not linked to a course' })
    const course = await Course.findById(courseId).select('teacher')
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role === 'teacher' && String(course.teacher) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' })
    }
    if (req.user.role === 'team' && String(assessment.createdBy) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    if (typeof type === 'string') assessment.type = type
    if (typeof title === 'string') assessment.title = title
    if (typeof description === 'string') assessment.description = description
    if (typeof durationMinutes === 'number') assessment.durationMinutes = durationMinutes
    if (startAt === null) assessment.startAt = undefined
    if (endAt === null) assessment.endAt = undefined
    if (typeof startAt === 'string' && startAt) assessment.startAt = new Date(startAt)
    if (typeof endAt === 'string' && endAt) assessment.endAt = new Date(endAt)
    if (typeof attemptLimit === 'number') assessment.attemptLimit = attemptLimit
    if (typeof showCorrectAnswersPolicy === 'string') assessment.showCorrectAnswersPolicy = showCorrectAnswersPolicy
    if (typeof releaseScorePolicy === 'string') assessment.releaseScorePolicy = releaseScorePolicy

    if (Array.isArray(questions)) {
        assessment.questions = questions
    }

    let touched = false
    for (const q of assessment.questions || []) {
        if (!q || q.type !== 'mcq') continue
        const idx = q.correctOptionIndex
        if (!Number.isInteger(idx)) continue
        if (Array.isArray(q.options) && idx >= 0 && idx < q.options.length) {
            q.correctOptionId = q.options[idx]._id
            touched = true
        }
        q.correctOptionIndex = undefined
    }

    await assessment.save()
    res.json(assessment)
})

const deleteAssessment = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const assessment = await Assessment.findById(assessmentId)
    if (!assessment) return res.status(404).json({ message: 'Not found' })

    if (String(assessment.createdBy) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    await AssessmentAttempt.deleteMany({ assessment: assessment._id })
    await assessment.deleteOne()
    res.json({ ok: true })
})

const listAssessmentsForCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const items = await Assessment.find({ course: courseId }).sort({ createdAt: -1 })
    res.json(items)
})

const listMyAssessments = asyncHandler(async (req, res) => {
    const items = await Assessment.find({ createdBy: req.user.id })
        .sort({ createdAt: -1 })
        .populate('course', 'title')
    res.json(items)
})

const listAssessmentsForLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params
    const items = await Assessment.find({ lesson: lessonId }).sort({ createdAt: -1 })
    res.json(items)
})

const listManualGradingQueue = asyncHandler(async (req, res) => {
    const submitted = await AssessmentAttempt.find({ status: 'submitted' })
        .sort({ createdAt: 1 })
        .populate('assessment', 'title type course unit lesson createdBy')
        .populate('student', 'name email')

    const graded = await AssessmentAttempt.find({ status: 'graded' })
        .sort({ gradedAt: -1, createdAt: -1 })
        .limit(50)
        .populate('assessment', 'title type course unit lesson createdBy')
        .populate('student', 'name email')

    // Combine them, putting submitted first
    const items = [...submitted, ...graded]
    res.json(items)
})

const gradeAttemptManual = asyncHandler(async (req, res) => {
    const { attemptId } = req.params
    const { manualScore, feedback } = req.body || {}

    const attempt = await AssessmentAttempt.findById(attemptId)
    if (!attempt) return res.status(404).json({ message: 'Not found' })

    const assessment = await Assessment.findById(attempt.assessment)
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })

    const ms = Number(manualScore)
    if (!Number.isFinite(ms) || ms < 0) return res.status(400).json({ message: 'manualScore must be a non-negative number' })

    attempt.manualGradedScore = ms
    attempt.score = Number(attempt.autoGradedScore || 0) + ms
    attempt.status = 'graded'
    attempt.gradedAt = new Date()
    attempt.gradedBy = req.user.id
    attempt.feedback = typeof feedback === 'string' ? feedback : undefined

    await attempt.save()

    res.json({
        attemptId: attempt._id.toString(),
        status: attempt.status,
        score: attempt.score,
        maxScore: attempt.maxScore,
        manualGradedScore: attempt.manualGradedScore
    })
})

const getAssessment = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const assessment = await Assessment.findById(assessmentId)
    if (!assessment) return res.status(404).json({ message: 'Not found' })

    if (req.user.role === 'student') {
        const allowed = await canAccessAssessmentAsStudent(assessment, req.user.id)
        if (!allowed) return res.status(403).json({ message: 'Forbidden' })
        return res.json(sanitizeAssessmentForStudent(assessment))
    }

    return res.json(assessment)
})

const staffAssessmentReport = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const assessment = await Assessment.findById(assessmentId)
    if (!assessment) return res.status(404).json({ message: 'Not found' })

    const courseId = await resolveCourseIdFromAssessment(assessment)
    if (!courseId) return res.status(400).json({ message: 'Assessment is not linked to a course' })

    const course = await Course.findById(courseId).populate('students', 'name email').select('title teacher students')
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role === 'teacher' && String(course.teacher) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const attempts = await AssessmentAttempt.find({ assessment: assessment._id })
        .sort({ createdAt: -1 })
        .populate('student', 'name email')
        .select('student status score maxScore startedAt submittedAt gradedAt createdAt')

    const bestByStudent = new Map()
    for (const a of attempts) {
        const sid = a.student && a.student._id ? String(a.student._id) : String(a.student)
        const prev = bestByStudent.get(sid)
        bestByStudent.set(sid, pickBetterAttempt(prev, a))
    }

    const rows = (course.students || []).map((s) => {
        const sid = String(s._id)
        const a = bestByStudent.get(sid)
        const status = normalizeAttemptStatus(a)
        return {
            studentId: sid,
            name: s.name,
            email: s.email,
            status,
            score: status === 'graded' ? a.score : status === 'submitted' ? a.score : null,
            maxScore: a && typeof a.maxScore !== 'undefined' ? a.maxScore : null,
            startedAt: a && a.startedAt ? a.startedAt : null,
            submittedAt: a && a.submittedAt ? a.submittedAt : null,
            gradedAt: a && a.gradedAt ? a.gradedAt : null
        }
    })

    const summary = rows.reduce(
        (acc, r) => {
            acc.total += 1
            acc[r.status] = (acc[r.status] || 0) + 1
            return acc
        }, { total: 0, not_attempted: 0, in_progress: 0, submitted: 0, graded: 0 }
    )

    res.json({
        assessment: {
            _id: assessment._id,
            title: assessment.title,
            type: assessment.type,
            startAt: assessment.startAt,
            endAt: assessment.endAt,
            durationMinutes: assessment.durationMinutes
        },
        course: { _id: course._id, title: course.title },
        summary,
        rows
    })
})

const startAttempt = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const assessment = await Assessment.findById(assessmentId)
    if (!assessment) return res.status(404).json({ message: 'Not found' })

    const allowed = await canAccessAssessmentAsStudent(assessment, req.user.id)
    if (!allowed) return res.status(403).json({ message: 'Forbidden' })

    const w = nowInWindow(assessment)
    if (!w.ok) return res.status(400).json({ message: w.message })

    const existing = await AssessmentAttempt.findOne({ assessment: assessment._id, student: req.user.id, status: 'in_progress' })
        .sort({ createdAt: -1 })
    if (existing) {
        return res.status(200).json({
            attemptId: existing._id.toString(),
            assessment: sanitizeAssessmentForStudent(assessment),
            startedAt: existing.startedAt,
            durationMinutes: assessment.durationMinutes || null
        })
    }

    if (typeof assessment.attemptLimit === 'number') {
        const count = await AssessmentAttempt.countDocuments({ assessment: assessment._id, student: req.user.id })
        if (count >= assessment.attemptLimit) return res.status(400).json({ message: 'Attempt limit reached' })
    }

    const attempt = await AssessmentAttempt.create({
        assessment: assessment._id,
        student: req.user.id,
        startedAt: new Date(),
        status: 'in_progress',
        answers: []
    })

    res.status(201).json({
        attemptId: attempt._id.toString(),
        assessment: sanitizeAssessmentForStudent(assessment),
        startedAt: attempt.startedAt,
        durationMinutes: assessment.durationMinutes || null
    })
})

const myAssessmentGrades = asyncHandler(async (req, res) => {
    const attempts = await AssessmentAttempt.find({ student: req.user.id })
        .sort({ createdAt: -1 })
        .populate('assessment', 'title type endAt releaseScorePolicy')
        .select('assessment status score maxScore submittedAt gradedAt')

    const bestByAssessment = new Map()
    for (const a of attempts) {
        if (!a.assessment || !a.assessment._id) continue
        const aid = String(a.assessment._id)
        const prev = bestByAssessment.get(aid)
        bestByAssessment.set(aid, pickBetterAttempt(prev, a))
    }

    const rows = Array.from(bestByAssessment.values()).map((a) => {
        const assessment = a.assessment
        const showScore = canShowScore(assessment, a)
        return {
            _id: a._id,
            assessment: {
                _id: assessment._id,
                title: assessment.title,
                type: assessment.type
            },
            status: a.status,
            score: showScore ? a.score : null,
            maxScore: typeof a.maxScore !== 'undefined' ? a.maxScore : null,
            submittedAt: a.submittedAt,
            gradedAt: a.gradedAt
        }
    })

    res.json(rows)
})

const submitAttempt = asyncHandler(async (req, res) => {
    const { attemptId } = req.params
    const { answers } = req.body

    const attempt = await AssessmentAttempt.findById(attemptId)
    if (!attempt) return res.status(404).json({ message: 'Not found' })
    if (attempt.student.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const assessment = await Assessment.findById(attempt.assessment)
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })

    if (attempt.status !== 'in_progress') return res.status(400).json({ message: 'Attempt already submitted' })

    // simple time enforcement
    if (assessment.durationMinutes) {
        const deadline = new Date(attempt.startedAt.getTime() + Number(assessment.durationMinutes) * 60 * 1000)
        if (new Date() > deadline) {
            // still allow submission but mark as submitted
        }
    }

    attempt.answers = Array.isArray(answers) ? answers : []
    attempt.submittedAt = new Date()

    const { maxScore, autoGradedScore, needsManual } = computeScores(assessment, attempt.answers)
    attempt.maxScore = maxScore
    attempt.autoGradedScore = autoGradedScore

    if (needsManual) {
        attempt.status = 'submitted'
        attempt.manualGradedScore = 0
        attempt.score = autoGradedScore
    } else {
        attempt.status = 'graded'
        attempt.manualGradedScore = 0
        attempt.score = autoGradedScore
        attempt.gradedAt = new Date()
        attempt.gradedBy = req.user.id
    }

    await attempt.save()

    const payload = {
        attemptId: attempt._id.toString(),
        status: attempt.status,
        maxScore: attempt.maxScore
    }
    if (attempt.status === 'graded') payload.score = attempt.score
    res.json(payload)
})

const myAttempts = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const items = await AssessmentAttempt.find({ assessment: assessmentId, student: req.user.id }).sort({ createdAt: -1 })
    res.json(items)
})

const getMyAttemptResult = asyncHandler(async (req, res) => {
    const { attemptId } = req.params

    const attempt = await AssessmentAttempt.findById(attemptId)
    if (!attempt) return res.status(404).json({ message: 'Not found' })
    if (attempt.student.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const assessment = await Assessment.findById(attempt.assessment)
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })

    const showScore = canShowScore(assessment, attempt)
    const showAnswers = canShowCorrectAnswers(assessment, attempt)

    const payload = {
        attemptId: attempt._id.toString(),
        status: attempt.status,
        submittedAt: attempt.submittedAt,
        gradedAt: attempt.gradedAt,
        feedback: attempt.feedback,
        maxScore: attempt.maxScore,
        answers: attempt.answers
    }

    if (showScore) payload.score = attempt.score

    payload.assessment = showAnswers ? assessmentWithCorrectAnswers(assessment) : sanitizeAssessmentForStudent(assessment)
    res.json(payload)
})

module.exports = {
    createAssessment,
    updateAssessment,
    deleteAssessment,
    listMyAssessments,
    listAssessmentsForCourse,
    listAssessmentsForLesson,
    getAssessment,
    staffAssessmentReport,
    startAttempt,
    submitAttempt,
    myAttempts,
    myAssessmentGrades,
    getMyAttemptResult,
    listManualGradingQueue,
    gradeAttemptManual
}
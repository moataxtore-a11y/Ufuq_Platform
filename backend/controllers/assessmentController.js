const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

async function resolveCourseIdFromAssessment(assessment) {
    if (assessment.courseId) return assessment.courseId
    if (assessment.lessonId) {
        const lesson = await prisma.lesson.findUnique({ where: { id: assessment.lessonId }, select: { unit: { select: { courseId: true } } } })
        return lesson?.unit?.courseId || null
    }
    if (assessment.unitId) {
        const unit = await prisma.unit.findUnique({ where: { id: assessment.unitId }, select: { courseId: true } })
        return unit?.courseId || null
    }
    return null
}

async function canAccessAssessmentAsStudent(assessmentId, userId) {
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId }, select: { courseId: true, lessonId: true, unitId: true } })
    if (!assessment) return false
    const courseId = await resolveCourseIdFromAssessment(assessment)
    if (!courseId) return false
    const enrollment = await prisma.courseEnrollment.findFirst({ where: { courseId, studentId: userId }, select: { id: true } })
    return !!enrollment
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
    const obj = { ...assessment }
    if (Array.isArray(obj.questions)) {
        obj.questions = obj.questions.map((q) => {
            const out = {
                _id: q._id || q.id,
                id: q.id,
                type: q.type,
                prompt: q.prompt,
                imageUrl: q.imageUrl,
                points: q.points,
                required: q.required
            }
            if (q.type === 'mcq') {
                out.options = (q.options || []).map((o) => ({ _id: o._id || o.id, id: o.id, text: o.text }))
            }
            return out
        })
    }
    return obj
}

function assessmentWithCorrectAnswers(assessment) {
    return { ...assessment }
}

function computeScores(assessment, answers) {
    const answerByQ = new Map()
    for (const a of answers || []) {
        if (a && (a.questionId || a._id || a.id)) answerByQ.set(String(a.questionId || a._id || a.id), a)
    }

    let maxScore = 0
    let autoGradedScore = 0
    let needsManual = false

    for (const q of assessment.questions || []) {
        const points = Number(q.points || 0)
        maxScore += points
        const qId = String(q._id || q.id)
        const a = answerByQ.get(qId)
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
        type, title, description, courseId, unitId, lessonId,
        durationMinutes, startAt, endAt, attemptLimit,
        showCorrectAnswersPolicy, releaseScorePolicy, questions
    } = req.body || {}

    if (!type || !title) return res.status(400).json({ message: 'type and title are required' })

    const normalizedQuestions = Array.isArray(questions) ? questions : []

    const assessment = await prisma.assessment.create({
        data: {
            type,
            title,
            description: description || '',
            courseId: courseId || null,
            unitId: unitId || null,
            lessonId: lessonId || null,
            durationMinutes: typeof durationMinutes === 'number' ? durationMinutes : null,
            startAt: startAt ? new Date(startAt) : null,
            endAt: endAt ? new Date(endAt) : null,
            attemptLimit: typeof attemptLimit === 'number' ? attemptLimit : null,
            showCorrectAnswersPolicy: showCorrectAnswersPolicy || 'after_submit',
            releaseScorePolicy: releaseScorePolicy || 'immediate',
            questions: normalizedQuestions,
            createdById: req.user.id
        }
    })

    // Map correctOptionIndex to correctOptionId
    let touched = false
    const questionsData = assessment.questions ? [...assessment.questions] : []
    for (const q of questionsData) {
        if (!q || q.type !== 'mcq') continue
        const idx = q.correctOptionIndex
        if (!Number.isInteger(idx)) continue
        if (Array.isArray(q.options) && idx >= 0 && idx < q.options.length) {
            q.correctOptionId = q.options[idx]._id || q.options[idx].id
            touched = true
        }
        delete q.correctOptionIndex
    }
    if (touched) {
        await prisma.assessment.update({ where: { id: assessment.id }, data: { questions: questionsData } })
    }

    res.status(201).json(assessment)
})

const updateAssessment = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const {
        type, title, description, durationMinutes, startAt, endAt,
        attemptLimit, showCorrectAnswersPolicy, releaseScorePolicy, questions
    } = req.body || {}

    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
    if (!assessment) return res.status(404).json({ message: 'Not found' })

    const courseId = await resolveCourseIdFromAssessment(assessment)
    if (!courseId) return res.status(400).json({ message: 'Assessment is not linked to a course' })
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { teacherId: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (req.user.role === 'teacher' && String(course.teacherId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' })
    }
    if (req.user.role === 'team' && String(assessment.createdById) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const data = {}
    if (typeof type === 'string') data.type = type
    if (typeof title === 'string') data.title = title
    if (typeof description === 'string') data.description = description
    if (typeof durationMinutes === 'number') data.durationMinutes = durationMinutes
    if (startAt === null) data.startAt = null
    if (endAt === null) data.endAt = null
    if (typeof startAt === 'string' && startAt) data.startAt = new Date(startAt)
    if (typeof endAt === 'string' && endAt) data.endAt = new Date(endAt)
    if (typeof attemptLimit === 'number') data.attemptLimit = attemptLimit
    if (typeof showCorrectAnswersPolicy === 'string') data.showCorrectAnswersPolicy = showCorrectAnswersPolicy
    if (typeof releaseScorePolicy === 'string') data.releaseScorePolicy = releaseScorePolicy

    if (Array.isArray(questions)) {
        const qs = [...questions]
        for (const q of qs) {
            if (!q || q.type !== 'mcq') continue
            const idx = q.correctOptionIndex
            if (!Number.isInteger(idx)) continue
            if (Array.isArray(q.options) && idx >= 0 && idx < q.options.length) {
                q.correctOptionId = q.options[idx]._id || q.options[idx].id
            }
            delete q.correctOptionIndex
        }
        data.questions = qs
    }

    const updated = await prisma.assessment.update({ where: { id: assessmentId }, data })
    res.json(updated)
})

const deleteAssessment = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId }, select: { id: true, createdById: true } })
    if (!assessment) return res.status(404).json({ message: 'Not found' })
    if (String(assessment.createdById) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' })
    }
    await prisma.assessmentAttempt.deleteMany({ where: { assessmentId } })
    await prisma.assessment.delete({ where: { id: assessmentId } })
    res.json({ ok: true })
})

const listAssessmentsForCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const items = await prisma.assessment.findMany({ where: { courseId }, orderBy: { createdAt: 'desc' } })
    res.json(items)
})

const listMyAssessments = asyncHandler(async (req, res) => {
    const items = await prisma.assessment.findMany({
        where: { createdById: req.user.id },
        orderBy: { createdAt: 'desc' }
    })
    res.json(items)
})

const listAssessmentsForLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params
    const items = await prisma.assessment.findMany({ where: { lessonId }, orderBy: { createdAt: 'desc' } })
    res.json(items)
})

const listManualGradingQueue = asyncHandler(async (req, res) => {
    const submitted = await prisma.assessmentAttempt.findMany({
        where: { status: 'submitted' },
        orderBy: { createdAt: 'asc' },
        include: {
            assessment: { select: { id: true, title: true, type: true, courseId: true, unitId: true, lessonId: true, createdById: true } },
            student: { select: { id: true, name: true, email: true } }
        }
    })

    const graded = await prisma.assessmentAttempt.findMany({
        where: { status: 'graded' },
        orderBy: [{ gradedAt: 'desc' }, { createdAt: 'desc' }],
        take: 50,
        include: {
            assessment: { select: { id: true, title: true, type: true, courseId: true, unitId: true, lessonId: true, createdById: true } },
            student: { select: { id: true, name: true, email: true } }
        }
    })

    res.json([...submitted, ...graded])
})

const gradeAttemptManual = asyncHandler(async (req, res) => {
    const { attemptId } = req.params
    const { manualScore, feedback } = req.body || {}

    const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt) return res.status(404).json({ message: 'Not found' })

    const ms = Number(manualScore)
    if (!Number.isFinite(ms) || ms < 0) return res.status(400).json({ message: 'manualScore must be a non-negative number' })

    const updated = await prisma.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
            manualGradedScore: ms,
            score: Number(attempt.autoGradedScore || 0) + ms,
            status: 'graded',
            gradedAt: new Date(),
            gradedBy: req.user.id,
            feedback: typeof feedback === 'string' ? feedback : null
        }
    })

    res.json({
        attemptId: updated.id,
        status: updated.status,
        score: updated.score,
        maxScore: updated.maxScore,
        manualGradedScore: updated.manualGradedScore
    })
})

const getAssessment = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
    if (!assessment) return res.status(404).json({ message: 'Not found' })

    if (req.user.role === 'student') {
        const allowed = await canAccessAssessmentAsStudent(assessmentId, req.user.id)
        if (!allowed) return res.status(403).json({ message: 'Forbidden' })
        return res.json(sanitizeAssessmentForStudent(assessment))
    }

    return res.json(assessment)
})

const staffAssessmentReport = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
    if (!assessment) return res.status(404).json({ message: 'Not found' })

    const courseId = await resolveCourseIdFromAssessment(assessment)
    if (!courseId) return res.status(400).json({ message: 'Assessment is not linked to a course' })

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { teacher: { select: { id: true } }, enrollments: { include: { student: { select: { id: true, name: true, email: true } } } } }
    })
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role === 'teacher' && String(course.teacherId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const attempts = await prisma.assessmentAttempt.findMany({
        where: { assessmentId },
        orderBy: { createdAt: 'desc' },
        include: { student: { select: { id: true, name: true, email: true } } }
    })

    const bestByStudent = new Map()
    for (const a of attempts) {
        const sid = a.student ? String(a.student.id) : String(a.studentId)
        const prev = bestByStudent.get(sid)
        bestByStudent.set(sid, pickBetterAttempt(prev, a))
    }

    const rows = (course.enrollments || []).map((enrollment) => {
        const sid = String(enrollment.student.id)
        const a = bestByStudent.get(sid)
        const status = normalizeAttemptStatus(a)
        return {
            studentId: sid,
            name: enrollment.student.name,
            email: enrollment.student.email,
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
            _id: assessment.id,
            id: assessment.id,
            title: assessment.title,
            type: assessment.type,
            startAt: assessment.startAt,
            endAt: assessment.endAt,
            durationMinutes: assessment.durationMinutes
        },
        course: { _id: course.id, id: course.id, title: course.title },
        summary,
        rows
    })
})

const startAttempt = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
    if (!assessment) return res.status(404).json({ message: 'Not found' })

    const allowed = await canAccessAssessmentAsStudent(assessmentId, req.user.id)
    if (!allowed) return res.status(403).json({ message: 'Forbidden' })

    const w = nowInWindow(assessment)
    if (!w.ok) return res.status(400).json({ message: w.message })

    const existing = await prisma.assessmentAttempt.findFirst({
        where: { assessmentId, studentId: req.user.id, status: 'in_progress' },
        orderBy: { createdAt: 'desc' }
    })
    if (existing) {
        return res.status(200).json({
            attemptId: existing.id,
            assessment: sanitizeAssessmentForStudent(assessment),
            startedAt: existing.startedAt,
            durationMinutes: assessment.durationMinutes || null
        })
    }

    if (typeof assessment.attemptLimit === 'number') {
        const count = await prisma.assessmentAttempt.count({
            where: { assessmentId, studentId: req.user.id }
        })
        if (count >= assessment.attemptLimit) return res.status(400).json({ message: 'Attempt limit reached' })
    }

    const attempt = await prisma.assessmentAttempt.create({
        data: {
            assessmentId,
            studentId: req.user.id,
            startedAt: new Date(),
            status: 'in_progress',
            answers: []
        }
    })

    res.status(201).json({
        attemptId: attempt.id,
        assessment: sanitizeAssessmentForStudent(assessment),
        startedAt: attempt.startedAt,
        durationMinutes: assessment.durationMinutes || null
    })
})

const myAssessmentGrades = asyncHandler(async (req, res) => {
    const attempts = await prisma.assessmentAttempt.findMany({
        where: { studentId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: { assessment: { select: { id: true, title: true, type: true, endAt: true, releaseScorePolicy: true } } }
    })

    const bestByAssessment = new Map()
    for (const a of attempts) {
        if (!a.assessment || !a.assessment.id) continue
        const aid = String(a.assessment.id)
        const prev = bestByAssessment.get(aid)
        bestByAssessment.set(aid, pickBetterAttempt(prev, a))
    }

    const rows = Array.from(bestByAssessment.values()).map((a) => {
        const asm = a.assessment
        const showScore = canShowScore(asm, a)
        return {
            _id: a.id,
            id: a.id,
            assessment: { _id: asm.id, id: asm.id, title: asm.title, type: asm.type },
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

    const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt) return res.status(404).json({ message: 'Not found' })
    if (attempt.studentId !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const assessment = await prisma.assessment.findUnique({ where: { id: attempt.assessmentId } })
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })
    if (attempt.status !== 'in_progress') return res.status(400).json({ message: 'Attempt already submitted' })

    const ans = Array.isArray(answers) ? answers : []
    const { maxScore, autoGradedScore, needsManual } = computeScores(assessment, ans)

    const data = {
        answers: ans,
        submittedAt: new Date(),
        maxScore,
        autoGradedScore
    }

    if (needsManual) {
        data.status = 'submitted'
        data.manualGradedScore = 0
        data.score = autoGradedScore
    } else {
        data.status = 'graded'
        data.manualGradedScore = 0
        data.score = autoGradedScore
        data.gradedAt = new Date()
        data.gradedBy = req.user.id
    }

    const updated = await prisma.assessmentAttempt.update({ where: { id: attemptId }, data })

    const payload = { attemptId: updated.id, status: updated.status, maxScore: updated.maxScore }
    if (updated.status === 'graded') payload.score = updated.score
    res.json(payload)
})

const myAttempts = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params
    const items = await prisma.assessmentAttempt.findMany({
        where: { assessmentId, studentId: req.user.id },
        orderBy: { createdAt: 'desc' }
    })
    res.json(items)
})

const getMyAttemptResult = asyncHandler(async (req, res) => {
    const { attemptId } = req.params

    const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt) return res.status(404).json({ message: 'Not found' })
    if (attempt.studentId !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const assessment = await prisma.assessment.findUnique({ where: { id: attempt.assessmentId } })
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })

    const showScore = canShowScore(assessment, attempt)
    const showAnswers = canShowCorrectAnswers(assessment, attempt)

    const payload = {
        attemptId: attempt.id,
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
    createAssessment, updateAssessment, deleteAssessment,
    listMyAssessments, listAssessmentsForCourse, listAssessmentsForLesson,
    getAssessment, staffAssessmentReport, startAttempt, submitAttempt,
    myAttempts, myAssessmentGrades, getMyAttemptResult,
    listManualGradingQueue, gradeAttemptManual
}

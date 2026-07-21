const { prisma } = require('../config/prisma')
const { asyncHandler } = require('../utils/asyncHandler')

const createAssignment = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const { title, description, dueAt } = req.body || {}
    if (!title) return res.status(400).json({ message: 'title is required' })

    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, teacherId: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (course.teacherId !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const assignment = await prisma.assignment.create({
        data: {
            courseId,
            title,
            description: description || '',
            dueAt: dueAt ? new Date(dueAt) : undefined,
            createdBy: req.user.id
        }
    })
    res.status(201).json(assignment)
})

const submitAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params
    const { contentUrl } = req.body || {}
    if (!contentUrl) return res.status(400).json({ message: 'contentUrl is required' })

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, select: { id: true, courseId: true } })
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })

    const enrollment = await prisma.courseEnrollment.findFirst({
        where: { courseId: assignment.courseId, studentId: req.user.id },
        select: { id: true }
    })
    if (!enrollment) return res.status(403).json({ message: 'Forbidden' })

    const existing = await prisma.submission.findFirst({
        where: { assignmentId, studentId: req.user.id },
        select: { id: true }
    })
    if (existing) return res.status(409).json({ message: 'Already submitted' })

    const submission = await prisma.submission.create({
        data: { assignmentId, studentId: req.user.id, contentUrl }
    })

    res.status(201).json(submission)
})

const listAssignmentsForCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, teacherId: true }
    })
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role === 'teacher') {
        if (course.teacherId !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    } else if (req.user.role === 'student') {
        const enrollment = await prisma.courseEnrollment.findFirst({ where: { courseId, studentId: req.user.id }, select: { id: true } })
        if (!enrollment) return res.status(403).json({ message: 'Forbidden' })
    } else {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const assignments = await prisma.assignment.findMany({ where: { courseId }, orderBy: { createdAt: 'desc' } })
    res.json(assignments)
})

const getAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, select: { id: true, courseId: true } })
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })

    const course = await prisma.course.findUnique({ where: { id: assignment.courseId }, select: { id: true, teacherId: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role === 'teacher') {
        if (course.teacherId !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    } else if (req.user.role === 'student') {
        const enrollment = await prisma.courseEnrollment.findFirst({ where: { courseId: assignment.courseId, studentId: req.user.id }, select: { id: true } })
        if (!enrollment) return res.status(403).json({ message: 'Forbidden' })
    } else {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const fullAssignment = await prisma.assignment.findUnique({ where: { id: assignmentId } })
    res.json(fullAssignment)
})

const listSubmissionsForCorrection = asyncHandler(async (req, res) => {
    const submissions = await prisma.submission.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            assignment: true,
            student: { select: { id: true, name: true, email: true } },
            grade: true
        }
    })

    const result = submissions.map((s) => ({
        ...s,
        score: s.grade ? s.grade.score : null,
        feedback: s.grade ? s.grade.feedback : null,
        graded: !!s.grade
    }))

    res.json(result)
})

const listMySubmissions = asyncHandler(async (req, res) => {
    const submissions = await prisma.submission.findMany({
        where: { studentId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: { assignment: true }
    })
    res.json(submissions)
})

const gradeSubmission = asyncHandler(async (req, res) => {
    const { submissionId } = req.params
    const { score, feedback } = req.body || {}
    if (typeof score !== 'number') return res.status(400).json({ message: 'score must be a number' })

    const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: { assignment: { select: { courseId: true } } }
    })
    if (!submission) return res.status(404).json({ message: 'Submission not found' })

    const course = await prisma.course.findUnique({ where: { id: submission.assignment.courseId }, select: { id: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const grade = await prisma.grade.upsert({
        where: { submissionId },
        update: { score, feedback: feedback || '', correctedBy: req.user.id },
        create: {
            submissionId,
            assignmentId: submission.assignmentId,
            courseId: submission.assignment.courseId,
            studentId: submission.studentId,
            correctedBy: req.user.id,
            score,
            feedback: feedback || ''
        }
    })

    res.json(grade)
})

const myGrades = asyncHandler(async (req, res) => {
    const grades = await prisma.grade.findMany({
        where: { studentId: req.user.id },
        include: { assignment: true }
    })
    res.json(grades)
})

const courseGrades = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, teacherId: true } })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (course.teacherId !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const grades = await prisma.grade.findMany({
        where: { courseId },
        include: { student: true, assignment: true }
    })
    res.json(grades)
})

module.exports = {
    createAssignment, listAssignmentsForCourse, getAssignment,
    submitAssignment, listSubmissionsForCorrection, listMySubmissions,
    gradeSubmission, myGrades, courseGrades
}

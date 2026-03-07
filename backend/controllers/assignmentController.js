const { Assignment } = require('../models/Assignment')
const { Course } = require('../models/Course')
const { Submission } = require('../models/Submission')
const { Grade } = require('../models/Grade')
const { asyncHandler } = require('../utils/asyncHandler')

function courseAllowsStudent(course, studentId) {
    return course.students.some((s) => s.toString() === studentId)
}

const createAssignment = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const { title, description, dueAt } = req.body || {}
    if (!title) return res.status(400).json({ message: 'title is required' })

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const assignment = await Assignment.create({
        course: course._id,
        title,
        description: description || '',
        dueAt: dueAt ? new Date(dueAt) : undefined
    })
    res.status(201).json(assignment)
})

const submitAssignment = asyncHandler(async(req, res) => {
    const { assignmentId } = req.params
    const { contentUrl } = req.body || {}
    if (!contentUrl) return res.status(400).json({ message: 'contentUrl is required' })

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })

    const course = await Course.findById(assignment.course)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const enrolled = courseAllowsStudent(course, req.user.id)
    if (!enrolled) return res.status(403).json({ message: 'Forbidden' })

    const existing = await Submission.findOne({ assignment: assignment._id, student: req.user.id }).select('_id')
    if (existing) {
        return res.status(409).json({ message: 'Already submitted' })
    }

    const submission = await Submission.create({
        assignment: assignment._id,
        student: req.user.id,
        contentUrl
    })

    res.status(201).json(submission)
})

const listAssignmentsForCourse = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role === 'teacher') {
        if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    } else if (req.user.role === 'student') {
        if (!courseAllowsStudent(course, req.user.id)) return res.status(403).json({ message: 'Forbidden' })
    } else {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const assignments = await Assignment.find({ course: courseId }).sort({ createdAt: -1 })
    res.json(assignments)
})

const getAssignment = asyncHandler(async(req, res) => {
    const { assignmentId } = req.params
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })

    const course = await Course.findById(assignment.course)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    if (req.user.role === 'teacher') {
        if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    } else if (req.user.role === 'student') {
        if (!courseAllowsStudent(course, req.user.id)) return res.status(403).json({ message: 'Forbidden' })
    } else {
        return res.status(403).json({ message: 'Forbidden' })
    }

    res.json(assignment)
})

const listSubmissionsForCorrection = asyncHandler(async(req, res) => {
    const submissions = await Submission.find({})
        .sort({ createdAt: -1 })
        .populate('assignment')
        .populate('student', 'name email')

    // Attach grade info to each submission
    const subIds = submissions.map((s) => s._id)
    const grades = await Grade.find({ submission: { $in: subIds } })
    const gradeMap = {}
    grades.forEach((g) => { gradeMap[String(g.submission)] = g })

    const result = submissions.map((s) => {
        const plain = s.toObject()
        const grade = gradeMap[String(s._id)]
        plain.score = grade ? grade.score : null
        plain.feedback = grade ? grade.feedback : null
        plain.graded = !!grade
        return plain
    })

    res.json(result)
})


const listMySubmissions = asyncHandler(async(req, res) => {
    const submissions = await Submission.find({ student: req.user.id }).sort({ createdAt: -1 }).populate('assignment')
    res.json(submissions)
})

const gradeSubmission = asyncHandler(async(req, res) => {
    const { submissionId } = req.params
    const { score, feedback } = req.body || {}
    if (typeof score !== 'number') return res.status(400).json({ message: 'score must be a number' })

    const submission = await Submission.findById(submissionId)
    if (!submission) return res.status(404).json({ message: 'Submission not found' })

    const assignment = await Assignment.findById(submission.assignment)
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })

    const course = await Course.findById(assignment.course)
    if (!course) return res.status(404).json({ message: 'Course not found' })

    const grade = await Grade.findOneAndUpdate({ submission: submission._id }, {
        submission: submission._id,
        assignment: assignment._id,
        course: course._id,
        student: submission.student,
        correctedBy: req.user.id,
        score,
        feedback: feedback || ''
    }, { upsert: true, new: true })

    res.json(grade)
})

const myGrades = asyncHandler(async(req, res) => {
    const grades = await Grade.find({ student: req.user.id }).populate('assignment')
    res.json(grades)
})

const courseGrades = asyncHandler(async(req, res) => {
    const { courseId } = req.params
    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const grades = await Grade.find({ course: courseId }).populate('student').populate('assignment')
    res.json(grades)
})

module.exports = {
    createAssignment,
    listAssignmentsForCourse,
    getAssignment,
    submitAssignment,
    listSubmissionsForCorrection,
    listMySubmissions,
    gradeSubmission,
    myGrades,
    courseGrades
}
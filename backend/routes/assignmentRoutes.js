const express = require('express')
const {
    createAssignment,
    listAssignmentsForCourse,
    getAssignment,
    submitAssignment,
    listSubmissionsForCorrection,
    listMySubmissions,
    gradeSubmission,
    myGrades,
    courseGrades
} = require('../controllers/assignmentController')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')

const router = express.Router()

router.use(auth, requirePasswordChanged)

router.post('/course/:courseId', requireRole('teacher'), createAssignment)
router.get('/course/:courseId', requireRole('teacher', 'student'), listAssignmentsForCourse)
router.get('/:assignmentId', requireRole('teacher', 'student'), getAssignment)
router.post('/:assignmentId/submit', requireRole('student'), submitAssignment)
router.get('/submissions/mine', requireRole('student'), listMySubmissions)

router.get('/submissions/queue', requireRole('team', 'teacher'), listSubmissionsForCorrection)
router.post('/submissions/:submissionId/grade', requireRole('team', 'teacher'), gradeSubmission)

router.get('/grades/mine', requireRole('student'), myGrades)
router.get('/course/:courseId/grades', requireRole('teacher'), courseGrades)

module.exports = { assignmentRoutes: router }
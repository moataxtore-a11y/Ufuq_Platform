const express = require('express')
const {
  createAssignment,
  submitAssignment,
  listSubmissionsForCorrection,
  gradeSubmission,
  myGrades,
  courseGrades
} = require('../controllers/assignmentController')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')

const router = express.Router()

router.use(auth, requirePasswordChanged)

router.post('/course/:courseId', requireRole('teacher'), createAssignment)
router.post('/:assignmentId/submit', requireRole('student'), submitAssignment)

router.get('/submissions/queue', requireRole('team'), listSubmissionsForCorrection)
router.post('/submissions/:submissionId/grade', requireRole('team'), gradeSubmission)

router.get('/grades/mine', requireRole('student'), myGrades)
router.get('/course/:courseId/grades', requireRole('teacher'), courseGrades)

module.exports = { assignmentRoutes: router }

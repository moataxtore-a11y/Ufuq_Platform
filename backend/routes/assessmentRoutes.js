const express = require('express')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const {
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
} = require('../controllers/assessmentController')

const router = express.Router()

router.use(auth, requirePasswordChanged)

// creator (team/teacher)
router.post('/', requireRole('teacher', 'team'), createAssessment)

// creator listing (teacher/team)
router.get('/mine', requireRole('teacher', 'team'), listMyAssessments)

// listing
router.get('/course/:courseId', requireRole('teacher', 'team', 'student'), listAssessmentsForCourse)
router.get('/lesson/:lessonId', requireRole('teacher', 'team', 'student'), listAssessmentsForLesson)

// manual grading (teacher/team)
router.get('/grading/queue', requireRole('teacher', 'team'), listManualGradingQueue)
router.post('/grading/attempts/:attemptId', requireRole('teacher', 'team'), gradeAttemptManual)

// attempts (student)
router.post('/:assessmentId/attempts/start', requireRole('student'), startAttempt)
router.post('/attempts/:attemptId/submit', requireRole('student'), submitAttempt)
router.get('/:assessmentId/attempts/mine', requireRole('student'), myAttempts)
router.get('/attempts/:attemptId/result', requireRole('student'), getMyAttemptResult)

// grades (student)
router.get('/grades/mine', requireRole('student'), myAssessmentGrades)

// reporting (staff)
router.get('/:assessmentId/report', requireRole('teacher', 'team', 'admin'), staffAssessmentReport)

// read
router.get('/:assessmentId', requireRole('teacher', 'team', 'student'), getAssessment)

// update (teacher/team)
router.patch('/:assessmentId', requireRole('teacher', 'team'), updateAssessment)

// delete (teacher/team)
router.delete('/:assessmentId', requireRole('teacher', 'team'), deleteAssessment)

module.exports = { assessmentRoutes: router }
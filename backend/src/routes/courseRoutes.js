const express = require('express')
const { createCourse, myCourses, addUnit, addLesson, enrollStudent } = require('../controllers/courseController')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')

const router = express.Router()

router.use(auth, requirePasswordChanged)

router.get('/mine', myCourses)
router.post('/', requireRole('teacher'), createCourse)
router.post('/:courseId/units', requireRole('teacher'), addUnit)
router.post('/units/:unitId/lessons', requireRole('teacher'), addLesson)
router.post('/:courseId/enroll', requireRole('teacher'), enrollStudent)

module.exports = { courseRoutes: router }

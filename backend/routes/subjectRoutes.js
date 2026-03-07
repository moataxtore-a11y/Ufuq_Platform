const express = require('express')
const { listSubjects, listSubjectCourses } = require('../controllers/subjectController')

const router = express.Router()

router.get('/', listSubjects)
router.get('/:subject/courses', listSubjectCourses)

module.exports = { subjectRoutes: router }

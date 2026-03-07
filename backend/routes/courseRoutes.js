const express = require('express')
const {
    listPublicCourses,
    listPublicCoursesForTeacher,
    getPublicCourseOutline,
    createCourse,
    myCourses,
    getCourse,
    getCourseStats,
    updateCourse,
    updateCourseThumbnail,
    pinCourse,
    unpinCourse,
    listUnits,
    listLessonsForUnit,
    listStudents,
    listMyCourseStudents,
    addUnit,
    addLesson,
    deleteUnit,
    deleteCourse,
    updateLesson,
    deleteLesson,
    selfEnrollFreeCourse,
    enrollStudent,
    removeStudent
} = require('../controllers/courseController')
const { auth, optionalAuth, requireRole, requirePasswordChanged, requireTeamPermission } = require('../middleware/auth')

const router = express.Router()

router.get('/', listPublicCourses)
router.get('/teacher/:teacherId', listPublicCoursesForTeacher)
router.get('/:courseId/outline', optionalAuth, getPublicCourseOutline)

router.use(auth, requirePasswordChanged)

router.get('/mine', myCourses)
router.get('/my/students', requireRole('teacher', 'team'), listMyCourseStudents)
router.post('/:courseId/self-enroll', requireRole('student'), selfEnrollFreeCourse)
router.get('/:courseId', getCourse)
router.get('/:courseId/stats', getCourseStats)
router.patch('/:courseId', requireRole('teacher', 'team'), requireTeamPermission('courses'), updateCourse)
router.patch('/:courseId/pin', requireRole('teacher', 'team'), requireTeamPermission('courses'), pinCourse)
router.patch('/:courseId/unpin', requireRole('teacher', 'team'), requireTeamPermission('courses'), unpinCourse)
router.patch('/:courseId/thumbnail', requireRole('teacher', 'team'), requireTeamPermission('courses'), updateCourseThumbnail)
router.delete('/:courseId', requireRole('teacher', 'team'), requireTeamPermission('courses'), deleteCourse)
router.get('/:courseId/units', listUnits)
router.get('/units/:unitId/lessons', listLessonsForUnit)
router.get('/:courseId/students', requireRole('teacher', 'team'), requireTeamPermission('students'), listStudents)
router.post('/', requireRole('teacher', 'team'), requireTeamPermission('courses'), createCourse)
router.post('/:courseId/units', requireRole('teacher', 'team'), requireTeamPermission('courses'), addUnit)
router.post('/units/:unitId/lessons', requireRole('teacher', 'team'), requireTeamPermission('courses'), addLesson)
router.delete('/units/:unitId', requireRole('teacher', 'team'), requireTeamPermission('courses'), deleteUnit)
router.patch('/lessons/:lessonId', requireRole('teacher', 'team'), requireTeamPermission('courses'), updateLesson)
router.delete('/lessons/:lessonId', requireRole('teacher', 'team'), requireTeamPermission('courses'), deleteLesson)
router.post('/:courseId/enroll', requireRole('teacher', 'team'), enrollStudent)
router.delete('/:courseId/students/:studentId', requireRole('teacher', 'team'), removeStudent)

module.exports = { courseRoutes: router }
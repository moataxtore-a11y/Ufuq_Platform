const express = require('express')
const { listUsers, createUser, updateUser, deleteUser, stats, getUserProfile, getUserByEmail, suspendUser, activateUser, getUserStats } = require('../controllers/adminController')
const { listCourses, pinCourse, unpinCourse, hideCourseFromStudents, unhideCourseFromStudents, deleteCourseAsAdmin } = require('../controllers/adminCourseController')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')

const router = express.Router()

router.use(auth, requireRole('admin'), requirePasswordChanged)

router.get('/stats', stats)

router.get('/users', listUsers)
router.get('/users/by-email', getUserByEmail)
router.get('/users/:userId/profile', getUserProfile)
router.post('/users', createUser)
router.patch('/users/:userId', updateUser)
router.patch('/users/:userId/suspend', suspendUser)
router.patch('/users/:userId/activate', activateUser)
router.delete('/users/:userId', deleteUser)

router.get('/courses', listCourses)
router.patch('/courses/:courseId/pin', pinCourse)
router.patch('/courses/:courseId/unpin', unpinCourse)
router.patch('/courses/:courseId/hide', hideCourseFromStudents)
router.patch('/courses/:courseId/unhide', unhideCourseFromStudents)
router.delete('/courses/:courseId', deleteCourseAsAdmin)

router.get('/users/:userId/stats', getUserStats)

module.exports = { adminRoutes: router }
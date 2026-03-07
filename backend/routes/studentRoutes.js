const express = require('express')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const {
    listStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    suspendStudent,
    activateStudent,
    getStudentProfile,
    getStudentStats
} = require('../controllers/studentController')

const router = express.Router()

router.use(auth, requirePasswordChanged)
router.use(requireRole('admin', 'teacher', 'team'))

router.get('/', listStudents)
router.post('/', createStudent)
router.get('/:studentUserId/profile', getStudentProfile)
router.get('/:studentUserId/stats', getStudentStats)
router.patch('/:studentUserId', updateStudent)
router.patch('/:studentUserId/suspend', suspendStudent)
router.patch('/:studentUserId/activate', activateStudent)
router.delete('/:studentUserId', deleteStudent)

module.exports = { studentRoutes: router }
const express = require('express')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const { listPendingStudents, approveUser, rejectUser } = require('../controllers/approvalController')

const router = express.Router()

router.use(auth, requirePasswordChanged, requireRole('admin', 'team', 'teacher'))

router.get('/pending-students', listPendingStudents)
router.patch('/users/:userId/approve', approveUser)
router.patch('/users/:userId/reject', rejectUser)

module.exports = { approvalRoutes: router }
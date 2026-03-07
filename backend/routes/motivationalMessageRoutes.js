const express = require('express')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const {
    getActiveForStudent,
    upsertMessage,
    deleteMessage,
    dismissForMe,
    getActiveForManager
} = require('../controllers/motivationalMessageController')

const router = express.Router()

router.use(auth, requirePasswordChanged)

// Student consumption
router.get('/me', requireRole('student'), getActiveForStudent)
router.post('/me/dismiss', requireRole('student'), dismissForMe)

// Management (admin/teacher/team)
router.get('/', requireRole('admin', 'teacher', 'team'), getActiveForManager)
router.put('/', requireRole('admin', 'teacher', 'team'), upsertMessage)
router.delete('/', requireRole('admin', 'teacher', 'team'), deleteMessage)

module.exports = { motivationalMessageRoutes: router }

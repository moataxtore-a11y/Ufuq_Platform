const express = require('express')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const { markLessonOpened, markLessonCompleted, reportVideoWatch } = require('../controllers/progressController')

const router = express.Router()

router.use(auth, requirePasswordChanged)
router.use(requireRole('student'))

router.post('/lesson/open', markLessonOpened)
router.post('/lesson/complete', markLessonCompleted)
router.post('/video', reportVideoWatch)

module.exports = { progressRoutes: router }

const express = require('express')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const { getBadges } = require('../controllers/notificationController')

const router = express.Router()

router.use(auth, requirePasswordChanged, requireRole('admin', 'teacher', 'team'))

router.get('/badges', getBadges)

module.exports = { notificationRoutes: router }

const express = require('express')
const { auth, requirePasswordChanged, requireRole } = require('../middleware/auth')
const { getMyProfile, updateMyProfile, getMyStats } = require('../controllers/userController')

const router = express.Router()

router.use(auth, requirePasswordChanged)

router.get('/me', getMyProfile)
router.get('/me/stats', requireRole('student'), getMyStats)
router.patch('/me', updateMyProfile)

module.exports = { userRoutes: router }
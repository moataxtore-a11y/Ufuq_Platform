const express = require('express')
const { login, me, changePassword } = require('../controllers/authController')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.post('/login', login)
router.get('/me', auth, me)
router.post('/change-password', auth, changePassword)

module.exports = { authRoutes: router }

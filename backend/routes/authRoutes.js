const express = require('express')
const {
    login,
    me,
    changePassword,
    registerStudent,
    forgotPassword,
    resetPasswordWithCode,
    requestEmailChange,
    confirmEmailChange
} = require('../controllers/authController')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.post('/login', login)
router.post('/register', registerStudent)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPasswordWithCode)
router.get('/me', auth, me)
router.post('/change-password', auth, changePassword)
router.post('/request-email-change', auth, requestEmailChange)
router.post('/confirm-email-change', auth, confirmEmailChange)

module.exports = { authRoutes: router }
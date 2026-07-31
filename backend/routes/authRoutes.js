const express = require('express')
const rateLimit = require('express-rate-limit')
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

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Try again later.' }
})

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many registration attempts. Try again later.' }
})

const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many reset attempts. Try again later.' }
})

router.post('/login', loginLimiter, login)
router.post('/register', registerLimiter, registerStudent)
router.post('/forgot-password', passwordResetLimiter, forgotPassword)
router.post('/reset-password', passwordResetLimiter, resetPasswordWithCode)
router.get('/me', auth, me)
router.post('/change-password', auth, changePassword)
router.post('/request-email-change', auth, requestEmailChange)
router.post('/confirm-email-change', auth, confirmEmailChange)

module.exports = { authRoutes: router }

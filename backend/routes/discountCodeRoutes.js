const express = require('express')

const {
    generateDiscountCodes,
    listMyDiscountCodes,
    validateDiscountCode,
    redeemDiscountCode
} = require('../controllers/discountCodeController')

const { auth, requireRole, requirePasswordChanged, requireTeamPermission } = require('../middleware/auth')

const router = express.Router()

router.use(auth, requirePasswordChanged)

router.post('/generate', requireRole('teacher', 'team'), requireTeamPermission('courses'), generateDiscountCodes)
router.get('/mine', requireRole('teacher', 'team'), requireTeamPermission('courses'), listMyDiscountCodes)
router.post('/redeem/validate', requireRole('student'), validateDiscountCode)
router.post('/redeem/redeem', requireRole('student'), redeemDiscountCode)

module.exports = { discountCodeRoutes: router }

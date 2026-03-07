const express = require('express')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const {
    getWallet,
    createTopup,
    confirmTopup,
    grantWallet,
    listGrantTeachers,
    payForCourse
} = require('../controllers/walletController')

const router = express.Router()

router.use(auth, requirePasswordChanged)

router.get('/', requireRole('student'), getWallet)
router.post('/topups', requireRole('student'), createTopup)
router.post('/pay-course', requireRole('student'), payForCourse)

router.post('/grants', requireRole('teacher', 'team'), grantWallet)
router.get('/grant-teachers', requireRole('team'), listGrantTeachers)

router.post('/topups/:txId/confirm', requireRole('admin'), confirmTopup)

module.exports = { walletRoutes: router }
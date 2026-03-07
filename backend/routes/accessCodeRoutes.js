const express = require('express')

const {
    generateCourseAccessCodes,
    listMyCourseAccessCodes,
    validateCourseAccessCode,
    chooseCourseForAccessCode
} = require('../controllers/accessCodeController')

const { auth, requireRole, requirePasswordChanged, requireTeamPermission } = require('../middleware/auth')

const router = express.Router()

router.use(auth, requirePasswordChanged)

router.post('/generate', requireRole('teacher', 'team'), requireTeamPermission('courses'), generateCourseAccessCodes)
router.get('/mine', requireRole('teacher', 'team'), requireTeamPermission('courses'), listMyCourseAccessCodes)
router.post('/redeem/validate', requireRole('student'), validateCourseAccessCode)
router.post('/redeem/choose', requireRole('student'), chooseCourseForAccessCode)

module.exports = { accessCodeRoutes: router }
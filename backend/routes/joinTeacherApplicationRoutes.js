const express = require('express')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const {
    submitJoinTeacherApplication,
    listJoinTeacherApplications,
    getJoinTeacherApplicationById,
    assignJoinTeacherApplicationTeam,
    deleteJoinTeacherApplication
} = require('../controllers/joinTeacherApplicationController')

const router = express.Router()

router.post('/applications', submitJoinTeacherApplication)

router.use(auth, requirePasswordChanged, requireRole('admin', 'team'))

router.get('/applications', listJoinTeacherApplications)
router.get('/applications/:applicationId', getJoinTeacherApplicationById)
router.patch('/applications/:applicationId/assign-team', requireRole('admin'), assignJoinTeacherApplicationTeam)
router.delete('/applications/:applicationId', requireRole('admin'), deleteJoinTeacherApplication)

module.exports = { joinTeacherApplicationRoutes: router }
const express = require('express')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const { listPublicTeachers, getPublicTeacherById, listMyTeam, createMyTeamMember, updateMyTeamMember, ensureMyTeamId } = require('../controllers/teacherController')

const router = express.Router()

router.get('/', listPublicTeachers)
router.get('/:teacherId', getPublicTeacherById)

router.use(auth, requirePasswordChanged, requireRole('teacher'))

router.get('/me/team', listMyTeam)
router.post('/me/team', createMyTeamMember)
router.patch('/me/team/:memberId', updateMyTeamMember)
router.post('/me/team-id', ensureMyTeamId)

module.exports = { teacherRoutes: router }
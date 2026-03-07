const express = require('express')
const { listUsers, createUser } = require('../controllers/adminController')
const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')

const router = express.Router()

router.use(auth, requireRole('admin'), requirePasswordChanged)

router.get('/users', listUsers)
router.post('/users', createUser)

module.exports = { adminRoutes: router }

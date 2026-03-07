const bcrypt = require('bcrypt')
const { User, USER_ROLES } = require('../models/User')
const { asyncHandler } = require('../utils/asyncHandler')

const listUsers = asyncHandler(async (req, res) => {
  const { role } = req.query
  const filter = {}
  if (role) filter.role = role
  const users = await User.find(filter).select('name email role mustChangePassword createdAt')
  res.json(users)
})

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body || {}
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, role are required' })
  }
  if (!USER_ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' })

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() })
  if (existing) return res.status(409).json({ message: 'Email already exists' })

  const hashed = await bcrypt.hash(password, 12)
  const user = await User.create({
    name,
    email: String(email).toLowerCase().trim(),
    password: hashed,
    role,
    mustChangePassword: true
  })

  res.status(201).json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt
  })
})

module.exports = { listUsers, createUser }

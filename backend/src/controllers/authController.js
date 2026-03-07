const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models/User')
const { asyncHandler } = require('../utils/asyncHandler')

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  })
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

  const user = await User.findOne({ email: String(email).toLowerCase().trim() })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

  const token = signToken(user._id.toString())
  res.json({
    token,
    role: user.role,
    email: user.email,
    name: user.name,
    mustChangePassword: user.mustChangePassword
  })
})

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('name email role mustChangePassword createdAt')
  if (!user) return res.status(404).json({ message: 'Not found' })
  res.json(user)
})

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' })
  }

  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: 'Not found' })

  const ok = await bcrypt.compare(currentPassword, user.password)
  if (!ok) return res.status(401).json({ message: 'Invalid current password' })

  const hashed = await bcrypt.hash(newPassword, 12)
  user.password = hashed
  user.mustChangePassword = false
  await user.save()

  const token = signToken(user._id.toString())
  res.json({
    token,
    role: user.role,
    email: user.email,
    name: user.name,
    mustChangePassword: user.mustChangePassword
  })
})

module.exports = { login, me, changePassword }

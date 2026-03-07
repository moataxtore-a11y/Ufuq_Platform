const jwt = require('jsonwebtoken')
const { User } = require('../models/User')

async function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = header.slice('Bearer '.length)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.sub)
    if (!user) return res.status(401).json({ message: 'Unauthorized' })

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      mustChangePassword: user.mustChangePassword
    }
    return next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
    return next()
  }
}

function requirePasswordChanged(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
  if (req.user.mustChangePassword) {
    return res.status(403).json({ message: 'Password change required' })
  }
  return next()
}

module.exports = { auth, requireRole, requirePasswordChanged }

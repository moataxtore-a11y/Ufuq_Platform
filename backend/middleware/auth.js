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

        if (user.isSuspended) {
            return res.status(403).json({ message: 'Account suspended' })
        }

        const rawTeamPerms = Array.isArray(user.teamPermissions) ? user.teamPermissions : []
        const teamPermissions = user.role === 'team' && rawTeamPerms.length === 0 ? ['courses', 'students', 'grading'] : rawTeamPerms

        req.user = {
            id: user._id.toString(),
            role: user.role,
            email: user.email,
            teamId: user.teamId,
            teamPermissions,
            studentId: user.studentId,
            mustChangePassword: user.mustChangePassword
        }
        return next()
    } catch {
        return res.status(401).json({ message: 'Unauthorized' })
    }
}

async function optionalAuth(req, res, next) {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
        return next()
    }

    const token = header.slice('Bearer '.length)
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.sub)
        if (!user) return next()

        if (user.isSuspended) return next()

        const rawTeamPerms = Array.isArray(user.teamPermissions) ? user.teamPermissions : []
        const teamPermissions = user.role === 'team' && rawTeamPerms.length === 0 ? ['courses', 'students', 'grading'] : rawTeamPerms

        req.user = {
            id: user._id.toString(),
            role: user.role,
            email: user.email,
            teamId: user.teamId,
            teamPermissions,
            studentId: user.studentId,
            mustChangePassword: user.mustChangePassword
        }
        return next()
    } catch {
        return next()
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

function requireTeamPermission(permission) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
        if (req.user.role !== 'team') return next()

        const perms = Array.isArray(req.user.teamPermissions) ? req.user.teamPermissions : []
        if (!perms.includes(permission)) return res.status(403).json({ message: 'Forbidden' })
        return next()
    }
}

module.exports = { auth, optionalAuth, requireRole, requirePasswordChanged, requireTeamPermission }
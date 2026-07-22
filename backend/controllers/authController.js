const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { prisma } = require('../config/prisma')
const { supabase } = require('../config/supabase')
const { asyncHandler } = require('../utils/asyncHandler')
const { generateOtp, hashOtp } = require('../utils/otp')
const { sendEmail } = require('../services/emailService')

function escapeRegex(str) {
    return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function generateUniqueStudentId() {
    const year = String(new Date().getFullYear())
    for (let i = 0; i < 50; i++) {
        const rand5 = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
        const code = `${year}${rand5}`
        const exists = await prisma.user.findFirst({ where: { studentId: code }, select: { id: true } })
        if (!exists) return code
    }
    throw new Error('Failed to generate unique studentId')
}

function signToken(userId) {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    })
}

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body || {}
    const normalizedEmail = String(email || '').toLowerCase().trim()
    if (!normalizedEmail) return res.status(400).json({ message: 'Email is required' })

    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (!user) return res.status(200).json({ ok: true })

    const code = generateOtp(6)
    const pwReset = { codeHash: hashOtp(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) }

    await prisma.user.update({
        where: { id: user.id },
        data: { passwordReset: pwReset }
    })

    await sendEmail({
        to: normalizedEmail,
        subject: 'Password reset code',
        text: `Your password reset code is: ${code}. It expires in 10 minutes.`
    })

    res.status(200).json({ ok: true })
})

const resetPasswordWithCode = asyncHandler(async (req, res) => {
    const { email, code, newPassword } = req.body || {}
    const normalizedEmail = String(email || '').toLowerCase().trim()
    const otp = String(code || '').trim()

    if (!normalizedEmail || !otp || !newPassword) {
        return res.status(400).json({ message: 'Email, code and newPassword are required' })
    }
    if (String(newPassword).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (!user) return res.status(400).json({ message: 'Invalid code' })

    const pwReset = user.passwordReset || {}
    const expiresAt = pwReset.expiresAt ? new Date(pwReset.expiresAt) : null
    if (!pwReset.codeHash || !expiresAt || expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: 'Invalid code' })
    }

    const incomingHash = hashOtp(otp)
    if (incomingHash !== pwReset.codeHash) {
        return res.status(400).json({ message: 'Invalid code' })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: await bcrypt.hash(String(newPassword), 12),
            mustChangePassword: false,
            passwordReset: { codeHash: '', expiresAt: null }
        }
    })

    res.status(200).json({ ok: true })
})

const requestEmailChange = asyncHandler(async (req, res) => {
    const { newEmail } = req.body || {}
    const normalizedEmail = String(newEmail || '').toLowerCase().trim()
    if (!normalizedEmail) return res.status(400).json({ message: 'newEmail is required' })

    const existing = await prisma.user.findFirst({ where: { email: normalizedEmail }, select: { id: true } })
    if (existing) return res.status(409).json({ message: 'Email already exists' })

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ message: 'Not found' })

    const code = generateOtp(6)
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailChange: {
                pendingEmail: normalizedEmail,
                codeHash: hashOtp(code),
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }
        }
    })

    await sendEmail({
        to: normalizedEmail,
        subject: 'Confirm your email',
        text: `Your email confirmation code is: ${code}. It expires in 10 minutes.`
    })

    res.status(200).json({ ok: true })
})

const confirmEmailChange = asyncHandler(async (req, res) => {
    const { code } = req.body || {}
    const otp = String(code || '').trim()
    if (!otp) return res.status(400).json({ message: 'code is required' })

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ message: 'Not found' })

    const emailCh = user.emailChange || {}
    const expiresAt = emailCh.expiresAt ? new Date(emailCh.expiresAt) : null
    if (!emailCh.pendingEmail || !emailCh.codeHash || !expiresAt || expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: 'Invalid code' })
    }

    const incomingHash = hashOtp(otp)
    if (incomingHash !== emailCh.codeHash) {
        return res.status(400).json({ message: 'Invalid code' })
    }

    const newEmail = emailCh.pendingEmail
    const existing = await prisma.user.findFirst({ where: { email: newEmail }, select: { id: true } })
    if (existing) return res.status(409).json({ message: 'Email already exists' })

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            email: newEmail,
            emailChange: { pendingEmail: '', codeHash: '', expiresAt: null }
        }
    })

    const token = signToken(updated.id)
    res.status(200).json({
        token,
        role: updated.role,
        email: updated.email,
        name: updated.name,
        teamId: updated.teamId,
        teamPermissions: Array.isArray(updated.teamPermissions) ? updated.teamPermissions : [],
        studentId: updated.studentId,
        mustChangePassword: updated.mustChangePassword,
        status: updated.status || 'approved'
    })
})

const login = asyncHandler(async (req, res) => {
    const { email, password, identifier, phone } = req.body || {}
    const rawIdentifier = (identifier !== undefined && identifier !== null) ? identifier : ((email !== undefined && email !== null) ? email : phone)
    const normalizedIdentifier = String(rawIdentifier || '').trim()
    if (!normalizedIdentifier || !password) return res.status(400).json({ message: 'Email and password are required' })

    const looksLikeEmail = normalizedIdentifier.includes('@')

    let user = null
    if (looksLikeEmail) {
        const emailCandidate = normalizedIdentifier.toLowerCase().trim()
        user = await prisma.user.findFirst({ where: { email: emailCandidate } })
    } else {
        const digitsOnly = normalizedIdentifier.replace(/\D/g, '')
        const coreDigits = digitsOnly.startsWith('20') ? digitsOnly.slice(2) : (digitsOnly.startsWith('2') ? digitsOnly.slice(1) : digitsOnly)
        const coreNoLeadingZero = coreDigits.startsWith('0') ? coreDigits.slice(1) : coreDigits
        const coreWithLeadingZero = coreDigits.startsWith('0') ? coreDigits : `0${coreDigits}`

        const phoneCandidates = [
            normalizedIdentifier, digitsOnly, coreDigits, coreNoLeadingZero, coreWithLeadingZero,
            `20${coreNoLeadingZero}`, `+20${coreNoLeadingZero}`, `20${coreWithLeadingZero}`, `+20${coreWithLeadingZero}`
        ].filter(Boolean)

        for (const p of phoneCandidates) {
            const { data: found } = await supabase
                .from('User')
                .select('*')
                .or(`profile->>studentPhone.eq.${p},profile->>phone.eq.${p}`)
                .limit(1)
                .maybeSingle()
            if (found) { user = found; break }
        }
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    if (user.isSuspended) {
        return res.status(403).json({ message: 'Account suspended' })
    }

    if (user.status && user.status !== 'approved') {
        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Account pending approval' })
        }
        return res.status(403).json({
            message: 'Account rejected',
            rejectionReason: typeof user.rejectionReason === 'string' ? user.rejectionReason : ''
        })
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    const token = signToken(user.id)
    res.json({
        token,
        role: user.role,
        email: user.email,
        name: user.name,
        teamId: user.teamId,
        teamPermissions: Array.isArray(user.teamPermissions) ? user.teamPermissions : [],
        studentId: user.studentId,
        mustChangePassword: user.mustChangePassword,
        status: user.status || 'approved'
    })
})

const registerStudent = asyncHandler(async (req, res) => {
    const {
        name, firstName, secondName, thirdName, lastName, email, password,
        studentPhone, parentPhone, schoolName, birthDate, section, gradeYear, governorate, nationalId
    } = req.body || {}

    const fullNameFromParts = [firstName, secondName, thirdName, lastName].filter(Boolean).map((x) => String(x).trim()).filter(Boolean).join(' ')
    const finalName = String(fullNameFromParts || name || '').trim()

    if (!finalName || !email || !password) {
        return res.status(400).json({ message: 'name, email, password are required' })
    }
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const normalizedEmail = String(email).toLowerCase().trim()
    const existing = await prisma.user.findFirst({ where: { email: normalizedEmail } })
    if (existing) return res.status(409).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 12)
    const studentId = await generateUniqueStudentId()

    let parsedBirthDate = undefined
    if (birthDate) {
        const d = new Date(birthDate)
        if (!isNaN(d.getTime())) parsedBirthDate = d
    }

    const user = await prisma.user.create({
        data: {
            name: finalName,
            email: normalizedEmail,
            password: hashed,
            role: 'student',
            studentId,
            status: 'pending',
            mustChangePassword: false,
            profile: {
                studentPhone: studentPhone ? String(studentPhone).trim() : '',
                parentPhone: parentPhone ? String(parentPhone).trim() : '',
                schoolName: schoolName ? String(schoolName).trim() : '',
                birthDate: parsedBirthDate,
                section: section ? String(section).trim() : '',
                gradeYear: gradeYear ? String(gradeYear).trim() : '',
                governorate: governorate ? String(governorate).trim() : '',
                nationalId: nationalId ? String(nationalId).trim() : ''
            }
        }
    })

    res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
    })
})

const me = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true, teamId: true, teamPermissions: true, studentId: true, mustChangePassword: true, createdAt: true }
    })
    if (!user) return res.status(404).json({ message: 'Not found' })
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        teamPermissions: Array.isArray(user.teamPermissions) ? user.teamPermissions : [],
        studentId: user.studentId,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt
    })
})

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {}
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ message: 'Not found' })

    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid current password' })

    const hashed = await bcrypt.hash(newPassword, 12)
    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, mustChangePassword: false }
    })

    const token = signToken(updated.id)
    res.json({
        token,
        role: updated.role,
        email: updated.email,
        name: updated.name,
        teamId: updated.teamId,
        teamPermissions: Array.isArray(updated.teamPermissions) ? updated.teamPermissions : [],
        studentId: updated.studentId,
        mustChangePassword: updated.mustChangePassword,
        status: updated.status || 'approved'
    })
})

module.exports = {
    login, me, changePassword, registerStudent,
    forgotPassword, resetPasswordWithCode,
    requestEmailChange, confirmEmailChange
}

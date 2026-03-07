const { JoinTeacherApplication } = require('../models/JoinTeacherApplication')
const { asyncHandler } = require('../utils/asyncHandler')

const submitJoinTeacherApplication = asyncHandler(async(req, res) => {
    const {
        firstName,
        secondName,
        thirdName,
        lastName,
        phone,
        email,
        nationalId,
        governorate,
        jobTitle,
        subject,
        expectedSalary,
        notes,
        cvUrl,
        photoUrl
    } = req.body || {}

    if (!firstName || !secondName || !thirdName || !lastName) {
        return res.status(400).json({ message: 'Full name is required' })
    }
    if (!phone || !email || !nationalId) {
        return res.status(400).json({ message: 'Phone, email, and National ID are required' })
    }

    const doc = await JoinTeacherApplication.create({
        firstName: String(firstName).trim(),
        secondName: String(secondName).trim(),
        thirdName: String(thirdName).trim(),
        lastName: String(lastName).trim(),
        phone: String(phone).trim(),
        email: String(email).toLowerCase().trim(),
        nationalId: String(nationalId).trim(),
        governorate: typeof governorate === 'string' ? governorate.trim() : '',
        jobTitle: typeof jobTitle === 'string' ? jobTitle.trim() : '',
        subject: typeof subject === 'string' ? subject.trim() : '',
        expectedSalary: typeof expectedSalary === 'string' ? expectedSalary.trim() : '',
        notes: typeof notes === 'string' ? notes : '',
        cvUrl: typeof cvUrl === 'string' ? cvUrl : '',
        photoUrl: typeof photoUrl === 'string' ? photoUrl : ''
    })

    res.status(201).json({
        id: doc._id.toString(),
        createdAt: doc.createdAt
    })
})

const listJoinTeacherApplications = asyncHandler(async(req, res) => {
    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''

    const filter = {}
    if (role === 'admin') {
        // admin sees all
    } else {
        if (!teamId) return res.json([])
        filter.assignedTeamId = teamId
    }

    const items = await JoinTeacherApplication.find(filter).sort({ createdAt: -1 })
    res.json(items)
})

const getJoinTeacherApplicationById = asyncHandler(async(req, res) => {
    const { applicationId } = req.params

    const role = req.user && req.user.role ? String(req.user.role) : ''
    const teamId = req.user && req.user.teamId ? String(req.user.teamId) : ''

    const doc = await JoinTeacherApplication.findById(applicationId)
    if (!doc) return res.status(404).json({ message: 'Application not found' })

    if (role !== 'admin') {
        if (!teamId || String(doc.assignedTeamId || '') !== teamId) {
            return res.status(403).json({ message: 'Forbidden' })
        }
    }

    res.json(doc)
})

const assignJoinTeacherApplicationTeam = asyncHandler(async(req, res) => {
    const { applicationId } = req.params
    const { teamId } = req.body || {}

    const doc = await JoinTeacherApplication.findById(applicationId)
    if (!doc) return res.status(404).json({ message: 'Application not found' })

    if (typeof teamId !== 'string' || !teamId.trim()) {
        doc.assignedTeamId = undefined
        doc.assignedBy = req.user ? req.user.id : undefined
        doc.assignedAt = new Date()
    } else {
        doc.assignedTeamId = teamId.trim()
        doc.assignedBy = req.user ? req.user.id : undefined
        doc.assignedAt = new Date()
    }

    await doc.save()
    res.json({ id: doc._id.toString(), assignedTeamId: doc.assignedTeamId || null })
})

const deleteJoinTeacherApplication = asyncHandler(async(req, res) => {
    const { applicationId } = req.params
    const doc = await JoinTeacherApplication.findById(applicationId).select('_id')
    if (!doc) return res.status(404).json({ message: 'Application not found' })
    await JoinTeacherApplication.deleteOne({ _id: doc._id })
    res.json({ message: 'Deleted', id: doc._id.toString() })
})

module.exports = { submitJoinTeacherApplication, listJoinTeacherApplications, getJoinTeacherApplicationById, assignJoinTeacherApplicationTeam, deleteJoinTeacherApplication }
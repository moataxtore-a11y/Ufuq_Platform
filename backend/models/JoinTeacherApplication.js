const mongoose = require('mongoose')

const joinTeacherApplicationSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    secondName: { type: String, required: true, trim: true },
    thirdName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    nationalId: { type: String, required: true, trim: true },
    governorate: { type: String, default: '', trim: true },
    jobTitle: { type: String, default: '', trim: true },
    subject: { type: String, default: '', trim: true },
    expectedSalary: { type: String, default: '', trim: true },
    notes: { type: String, default: '' },
    cvUrl: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    assignedTeamId: { type: String, index: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date }
}, { timestamps: { createdAt: true, updatedAt: true } })

const JoinTeacherApplication = mongoose.model('JoinTeacherApplication', joinTeacherApplicationSchema)

module.exports = { JoinTeacherApplication }

const mongoose = require('mongoose')

const USER_ROLES = ['admin', 'teacher', 'team', 'student']
const ACCOUNT_STATUS = ['pending', 'approved', 'rejected']

const userProfileSchema = new mongoose.Schema({
    avatarUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    studentPhone: { type: String, default: '' },
    parentPhone: { type: String, default: '' },
    schoolName: { type: String, default: '' },
    birthDate: { type: Date },
    section: { type: String, default: '' },
    gradeYear: { type: String, default: '' },
    governorate: { type: String, default: '' },
    nationalId: { type: String, default: '' },
    teachingSubject: { type: String, default: '' },
    teachingSection: { type: String, default: '' },
    teachingSections: { type: [String], default: undefined },
    teachingGradeYear: { type: String, default: '' },
    address: { type: String, default: '' },
    bio: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    subject: { type: String, default: '' },
    expectedSalary: { type: String, default: '' },
    cvUrl: { type: String, default: '' },
    photoUrl: { type: String, default: '' }
}, { _id: false })

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    teamId: { type: String },
    teamTask: { type: String, default: '' },
    teamPermissions: { type: [String], default: undefined },
    studentId: { type: String, unique: true, sparse: true, index: true },
    profile: { type: userProfileSchema, default: () => ({}) },
    isSuspended: { type: Boolean, default: false },
    suspendedAt: { type: Date },
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    suspendedReason: { type: String, default: '' },
    emailChange: {
        pendingEmail: { type: String, default: '' },
        codeHash: { type: String, default: '' },
        expiresAt: { type: Date }
    },
    passwordReset: {
        codeHash: { type: String, default: '' },
        expiresAt: { type: Date }
    },
    mustChangePassword: { type: Boolean, default: false },
    status: { type: String, enum: ACCOUNT_STATUS, default: 'approved' },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String }
}, { timestamps: { createdAt: true, updatedAt: true } })

userSchema.index({ teamId: 1 }, {
    unique: true,
    partialFilterExpression: { role: 'teacher', teamId: { $type: 'string' } }
})

const User = mongoose.model('User', userSchema)

module.exports = { User, USER_ROLES, ACCOUNT_STATUS }
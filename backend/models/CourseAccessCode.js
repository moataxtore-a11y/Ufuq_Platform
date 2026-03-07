const mongoose = require('mongoose')

const redemptionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    redeemedAt: { type: Date, default: Date.now }
}, { _id: false })

const courseAccessCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, index: true },
    allowedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true }],
    chosenCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teamId: { type: String, default: '' },
    maxRedemptions: { type: Number, default: 1 },
    redemptions: { type: [redemptionSchema], default: [] },
    expiresAt: { type: Date }
}, { timestamps: true })

courseAccessCodeSchema.index({ allowedCourses: 1, createdAt: -1 })
courseAccessCodeSchema.index({ chosenCourse: 1, createdAt: -1 })
courseAccessCodeSchema.index({ teamId: 1, createdAt: -1 })
courseAccessCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $type: 'date' } } })

const CourseAccessCode = mongoose.model('CourseAccessCode', courseAccessCodeSchema)

module.exports = { CourseAccessCode }
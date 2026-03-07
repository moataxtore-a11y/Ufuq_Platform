const mongoose = require('mongoose')

const redemptionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    redeemedAt: { type: Date, default: Date.now }
}, { _id: false })

const courseDiscountCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, index: true },
    allowedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true }],
    discountPercent: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teamId: { type: String, default: '' },
    maxRedemptions: { type: Number, default: 1 },
    redemptions: { type: [redemptionSchema], default: [] }
}, { timestamps: true })

courseDiscountCodeSchema.index({ allowedCourses: 1, createdAt: -1 })
courseDiscountCodeSchema.index({ teamId: 1, createdAt: -1 })

const CourseDiscountCode = mongoose.model('CourseDiscountCode', courseDiscountCodeSchema)

module.exports = { CourseDiscountCode }

const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    isHiddenFromStudents: { type: Boolean, default: false },
    pinnedAt: { type: Date, default: null },
    isIndividual: { type: Boolean, default: false },
    courseType: { type: String, enum: ['monthly', 'individual'], default: 'monthly' },
    isFree: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    section: { type: String, default: '' },
    gradeYear: { type: String, default: '' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }]
}, { timestamps: true })

const Course = mongoose.model('Course', courseSchema)

module.exports = { Course }
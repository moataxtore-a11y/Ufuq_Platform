const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }]
  },
  { timestamps: true }
)

const Course = mongoose.model('Course', courseSchema)

module.exports = { Course }

const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueAt: { type: Date }
  },
  { timestamps: true }
)

const Assignment = mongoose.model('Assignment', assignmentSchema)

module.exports = { Assignment }

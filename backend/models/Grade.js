const mongoose = require('mongoose')

const gradeSchema = new mongoose.Schema(
  {
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true, unique: true, index: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, min: 0, max: 100, required: true },
    feedback: { type: String, default: '' }
  },
  { timestamps: true }
)

const Grade = mongoose.model('Grade', gradeSchema)

module.exports = { Grade }

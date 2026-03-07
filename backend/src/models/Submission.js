const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentUrl: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true })

const Submission = mongoose.model('Submission', submissionSchema)

module.exports = { Submission }

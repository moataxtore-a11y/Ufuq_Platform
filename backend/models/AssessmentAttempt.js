const mongoose = require('mongoose')

const ATTEMPT_STATUS = ['in_progress', 'submitted', 'graded']

const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOptionId: { type: mongoose.Schema.Types.ObjectId },
    booleanAnswer: { type: Boolean },
    textAnswer: { type: String },
    fileUrl: { type: String }
}, { _id: false })

const assessmentAttemptSchema = new mongoose.Schema({
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    startedAt: { type: Date, required: true },
    submittedAt: { type: Date },

    status: { type: String, enum: ATTEMPT_STATUS, default: 'in_progress', index: true },

    answers: { type: [answerSchema], default: [] },

    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },

    autoGradedScore: { type: Number, default: 0 },
    manualGradedScore: { type: Number, default: 0 },

    gradedAt: { type: Date },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    feedback: { type: String }
}, { timestamps: true })

assessmentAttemptSchema.index({ assessment: 1, student: 1, createdAt: -1 })

const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema)

module.exports = { AssessmentAttempt, ATTEMPT_STATUS }
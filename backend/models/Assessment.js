const mongoose = require('mongoose')

const ASSESSMENT_TYPES = ['quiz', 'exam', 'homework']
const QUESTION_TYPES = ['mcq', 'true_false', 'short_answer', 'essay', 'file_upload']
const SHOW_ANSWERS_POLICIES = ['never', 'after_submit', 'after_end', 'after_graded']
const RELEASE_SCORE_POLICIES = ['immediate', 'after_end', 'after_graded']

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true }
}, { _id: true })

const questionSchema = new mongoose.Schema({
    type: { type: String, enum: QUESTION_TYPES, required: true },
    prompt: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    options: { type: [optionSchema], default: undefined },
    correctOptionIndex: { type: Number },
    correctOptionId: { type: mongoose.Schema.Types.ObjectId },
    correctBoolean: { type: Boolean },
    correctText: { type: String },
    points: { type: Number, default: 1 },
    required: { type: Boolean, default: true }
}, { _id: true })

const assessmentSchema = new mongoose.Schema({
    type: { type: String, enum: ASSESSMENT_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', index: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', index: true },

    durationMinutes: { type: Number },
    startAt: { type: Date },
    endAt: { type: Date },
    attemptLimit: { type: Number },

    showCorrectAnswersPolicy: { type: String, enum: SHOW_ANSWERS_POLICIES, default: 'never' },
    releaseScorePolicy: { type: String, enum: RELEASE_SCORE_POLICIES, default: 'immediate' },

    questions: { type: [questionSchema], default: [] },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true })

const Assessment = mongoose.model('Assessment', assessmentSchema)

module.exports = {
    Assessment,
    ASSESSMENT_TYPES,
    QUESTION_TYPES,
    SHOW_ANSWERS_POLICIES,
    RELEASE_SCORE_POLICIES
}
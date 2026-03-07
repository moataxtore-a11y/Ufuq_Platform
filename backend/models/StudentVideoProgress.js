const mongoose = require('mongoose')

const studentVideoProgressSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },

    videoUrl: { type: String, required: true },

    totalSecondsWatched: { type: Number, default: 0 },
    lastPositionSeconds: { type: Number, default: 0 },
    lastDurationSeconds: { type: Number, default: 0 }
}, { timestamps: true })

studentVideoProgressSchema.index({ student: 1, course: 1, lesson: 1, videoUrl: 1 }, { unique: true })

const StudentVideoProgress = mongoose.model('StudentVideoProgress', studentVideoProgressSchema)

module.exports = { StudentVideoProgress }

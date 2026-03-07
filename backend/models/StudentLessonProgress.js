const mongoose = require('mongoose')

const studentLessonProgressSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },

    openedAt: { type: Date },
    completedAt: { type: Date }
}, { timestamps: true })

studentLessonProgressSchema.index({ student: 1, course: 1, lesson: 1 }, { unique: true })

const StudentLessonProgress = mongoose.model('StudentLessonProgress', studentLessonProgressSchema)

module.exports = { StudentLessonProgress }

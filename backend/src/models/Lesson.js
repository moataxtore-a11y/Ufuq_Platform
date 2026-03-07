const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema(
  {
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
)

const Lesson = mongoose.model('Lesson', lessonSchema)

module.exports = { Lesson }

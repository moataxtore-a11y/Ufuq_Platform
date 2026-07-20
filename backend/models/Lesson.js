const mongoose = require('mongoose')

const attachmentItemSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },   // Cloudinary public_id for secure video URL generation
    storageRef: { type: String, default: '' },
    durationSec: { type: Number, default: null }
}, { _id: false })

const lessonSectionSchema = new mongoose.Schema({
    key: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    videos: { type: [attachmentItemSchema], default: [] },
    pdfs: { type: [attachmentItemSchema], default: [] },
    images: { type: [attachmentItemSchema], default: [] },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' }
}, { _id: false })

const lessonSchema = new mongoose.Schema({
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    kind: { type: String, enum: ['lesson', 'exam'], default: 'lesson', index: true },
    title: { type: String, required: true, trim: true },
    isFree: { type: Boolean, default: false },
    coverImageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    videoPublicId: { type: String, default: '' },   // Cloudinary public_id for the main video
    pdfUrl: { type: String, default: '' },
    imageUrls: { type: [String], default: [] },
    contentSections: { type: [lessonSectionSchema], default: [] },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    gateAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    gateNextLessons: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
}, { timestamps: true })

const Lesson = mongoose.model('Lesson', lessonSchema)

module.exports = { Lesson }
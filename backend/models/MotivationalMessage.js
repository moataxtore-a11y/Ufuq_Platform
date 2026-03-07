const mongoose = require('mongoose')

const motivationalMessageSchema = new mongoose.Schema(
    {
        title: { type: String, default: '' },
        body: { type: String, default: '' },
        ctaLabel: { type: String, default: '' },
        ctaUrl: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: { createdAt: true, updatedAt: true } }
)

// Single active document pattern (we'll keep one record, newest wins)
motivationalMessageSchema.index({ isActive: 1 })

const MotivationalMessage = mongoose.model('MotivationalMessage', motivationalMessageSchema)

module.exports = { MotivationalMessage }

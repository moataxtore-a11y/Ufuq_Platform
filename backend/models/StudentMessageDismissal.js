const mongoose = require('mongoose')

const studentMessageDismissalSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'MotivationalMessage', required: true, index: true },
        dismissedAt: { type: Date, default: () => new Date() }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)

studentMessageDismissalSchema.index({ userId: 1, messageId: 1 }, { unique: true })

const StudentMessageDismissal = mongoose.model('StudentMessageDismissal', studentMessageDismissalSchema)

module.exports = { StudentMessageDismissal }

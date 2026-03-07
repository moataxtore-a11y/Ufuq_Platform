const mongoose = require('mongoose')

const WALLET_TX_TYPES = ['topup', 'purchase', 'refund', 'adjustment']
const WALLET_TX_STATUS = ['pending', 'confirmed', 'failed']

const walletTransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: WALLET_TX_TYPES, required: true, index: true },
    status: { type: String, enum: WALLET_TX_STATUS, required: true, index: true },
    amount: { type: Number, required: true },
    reference: { type: String, default: '' },
    scopeTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    note: { type: String, default: '' },
    confirmedAt: { type: Date },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

walletTransactionSchema.index({ user: 1, createdAt: -1 })
walletTransactionSchema.index({ user: 1, scopeTeacher: 1, status: 1, createdAt: -1 })

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema)

module.exports = { WalletTransaction, WALLET_TX_TYPES, WALLET_TX_STATUS }
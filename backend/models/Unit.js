const mongoose = require('mongoose')

const unitSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 }
}, { timestamps: true })

const Unit = mongoose.model('Unit', unitSchema)

module.exports = { Unit }
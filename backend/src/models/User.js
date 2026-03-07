const mongoose = require('mongoose')

const USER_ROLES = ['admin', 'teacher', 'team', 'student']

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    mustChangePassword: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
)

const User = mongoose.model('User', userSchema)

module.exports = { User, USER_ROLES }

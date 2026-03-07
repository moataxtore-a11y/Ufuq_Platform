const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path')

require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
})

async function main() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/education_platform'
  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@school.local').toLowerCase().trim()
  const newPassword = process.env.DEFAULT_ADMIN_TEMP_PASSWORD || 'ChangeMe123!'

  await mongoose.connect(MONGO_URI)

  const userSchema = new mongoose.Schema(
    {
      name: String,
      email: String,
      password: String,
      role: String,
      mustChangePassword: Boolean
    },
    { timestamps: true }
  )

  const User = mongoose.models.User || mongoose.model('User', userSchema)

  const user = await User.findOne({ email })
  if (!user) {
    throw new Error(`No user found with email ${email}`)
  }

  user.password = await bcrypt.hash(newPassword, 12)
  user.mustChangePassword = true
  await user.save()

  // eslint-disable-next-line no-console
  console.log(`Reset password for ${email}`)
  // eslint-disable-next-line no-console
  console.log(`Temporary password: ${newPassword}`)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  try {
    await mongoose.disconnect()
  } catch (_) {
    // ignore
  }
  process.exit(1)
})

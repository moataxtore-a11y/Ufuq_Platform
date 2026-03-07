const bcrypt = require('bcrypt')
const { User } = require('../models/User')

async function ensureDefaultAdmin() {
  const admin = await User.findOne({ role: 'admin' })
  if (admin) return { created: false }

  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@school.local'
  const tempPassword = process.env.DEFAULT_ADMIN_TEMP_PASSWORD || 'ChangeMe123!'

  const hashed = await bcrypt.hash(tempPassword, 12)
  await User.create({
    name: 'Default Admin',
    email: String(email).toLowerCase().trim(),
    password: hashed,
    role: 'admin',
    mustChangePassword: true
  })

  // eslint-disable-next-line no-console
  console.log(`Default admin created: ${email}`)
  // eslint-disable-next-line no-console
  console.log('Temporary password is set via DEFAULT_ADMIN_TEMP_PASSWORD in backend/.env')

  return { created: true, email }
}

module.exports = { ensureDefaultAdmin }

const bcrypt = require('bcrypt')
const { prisma } = require('../config/prisma')

async function ensureDefaultAdmin() {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true } })
    if (admin) return { created: false }

    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@school.local'
    const tempPassword = process.env.DEFAULT_ADMIN_TEMP_PASSWORD || 'ChangeMe123!'

    const hashed = await bcrypt.hash(tempPassword, 12)
    await prisma.user.create({
        data: {
            name: 'Default Admin',
            email: String(email).toLowerCase().trim(),
            password: hashed,
            role: 'admin',
            mustChangePassword: true
        }
    })

    // eslint-disable-next-line no-console
    console.log(`Default admin created: ${email}`)
    // eslint-disable-next-line no-console
    console.log('Temporary password is set via DEFAULT_ADMIN_TEMP_PASSWORD in backend/.env')

    return { created: true, email }
}

module.exports = { ensureDefaultAdmin }

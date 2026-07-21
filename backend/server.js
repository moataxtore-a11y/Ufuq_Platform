const path = require('path')
const fs = require('fs')

const envPath = path.join(__dirname, '.env')
const envExamplePath = path.join(__dirname, '.env.example')

require('dotenv').config({
    path: fs.existsSync(envPath) ? envPath : envExamplePath
})

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Please set it in .env for Supabase connection.')
}

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev_secret_change_me'
    console.warn('JWT_SECRET not set. Using default dev_secret_change_me (change for production)')
}

const { prisma } = require('./config/prisma')
const { createApp } = require('./app')
const { ensureDefaultAdmin } = require('./bootstrap/adminBootstrap')

async function start() {
    await ensureDefaultAdmin(prisma)

    const app = createApp(prisma)
    const port = process.env.PORT || 5000

    const server = app.listen(port, () => {
        console.log(`API running on http://localhost:${port}`)
    })

    server.requestTimeout = 0
    server.headersTimeout = 65 * 1000
    server.keepAliveTimeout = 65 * 1000
}

start().catch((err) => {
    console.error(err)
    process.exit(1)
})

const path = require('path')
const fs = require('fs')

const envPath = path.join(__dirname, '.env')
const envExamplePath = path.join(__dirname, '.env.example')

require('dotenv').config({
    path: fs.existsSync(envPath) ? envPath : envExamplePath
})

if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/education_platform'
        // eslint-disable-next-line no-console
    console.warn('MONGO_URI not set. Using default mongodb://127.0.0.1:27017/education_platform')
}

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev_secret_change_me'
        // eslint-disable-next-line no-console
    console.warn('JWT_SECRET not set. Using default dev_secret_change_me (change for production)')
}

const { connectDB } = require('./config/db')
const { createApp } = require('./app')
const { ensureDefaultAdmin } = require('./bootstrap/adminBootstrap')

async function start() {
    await connectDB(process.env.MONGO_URI)
    await ensureDefaultAdmin()

    const app = createApp()
    const port = process.env.PORT || 5000

    const server = app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`API running on http://localhost:${port}`)
    })

    server.requestTimeout = 0
    server.headersTimeout = 65 * 1000
    server.keepAliveTimeout = 65 * 1000
}

start().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
})
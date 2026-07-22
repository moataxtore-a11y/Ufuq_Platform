const { createApp } = require('../backend/app')
const { prisma } = require('../backend/config/prisma')

let app

if (!app) {
    app = createApp(prisma)
}

module.exports = app

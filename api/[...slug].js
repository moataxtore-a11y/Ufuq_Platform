try {
    require('dotenv').config()
} catch (e) {}

const { createApp } = require('../backend/app')
const app = createApp()

module.exports = app

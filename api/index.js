try {
    require('dotenv').config()
} catch (e) {}

let app
try {
    const mod = require('../backend/app')
    app = mod.createApp ? mod.createApp() : mod
} catch (err) {
    const express = require('express')
    app = express()
    app.get('*', (req, res) => {
        res.status(500).json({ error: 'Failed to load app', message: err.message, stack: err.stack })
    })
}

module.exports = app

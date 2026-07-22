try {
    require('dotenv').config()
} catch (e) {}

let handler
try {
    const { createApp } = require('../backend/app')
    const app = createApp()
    handler = app
} catch (err) {
    const express = require('express')
    handler = express()
    handler.all('*', (req, res) => {
        res.status(500).json({ error: err.message })
    })
}

module.exports = handler

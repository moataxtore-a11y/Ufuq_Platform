try {
    require('dotenv').config()
} catch (e) {}

let handler
try {
    const { createApp } = require('../backend/app')
    const app = createApp()
    handler = (req, res) => app(req, res)
} catch (err) {
    handler = (req, res) => {
        res.status(500).json({ error: err.message })
    }
}

module.exports = handler

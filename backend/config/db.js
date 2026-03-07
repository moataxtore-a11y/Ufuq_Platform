const mongoose = require('mongoose')

async function connectDB(mongoUri) {
    mongoose.set('strictQuery', true)
    await mongoose.connect(mongoUri)

    const db = mongoose.connection.db
    if (db) {
        try {
            const indexes = await db.collection('users').indexes()
            const bad = indexes.find((idx) => idx?.name === 'teamId_1' && idx?.unique)
            if (bad) {
                await db.collection('users').dropIndex('teamId_1')
            }
        } catch {
            // ignore
        }
    }

    return mongoose.connection
}

module.exports = { connectDB }
require('dotenv').config()

const { connectDB } = require('./config/db')
const { createApp } = require('./app')
const { ensureDefaultAdmin } = require('./bootstrap/adminBootstrap')

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required')
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required')
  }

  await connectDB(process.env.MONGO_URI)
  await ensureDefaultAdmin()

  const app = createApp()
  const port = process.env.PORT || 5000

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${port}`)
  })
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

const nodemailer = require('nodemailer')

function getTransport() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: { user, pass }
  })
}

async function sendEmail({ to, subject, text }) {
  const transport = getTransport()
  if (!transport) {
    // eslint-disable-next-line no-console
    console.warn('[emailService] SMTP not configured. Email suppressed.', { to, subject, text })
    return
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER
  await transport.sendMail({ from, to, subject, text })
}

module.exports = { sendEmail }

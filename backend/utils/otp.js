const crypto = require('crypto')

function generateOtp(length = 6) {
  const max = Math.pow(10, length) - 1
  const n = crypto.randomInt(0, max + 1)
  return String(n).padStart(length, '0')
}

function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

module.exports = { generateOtp, hashOtp }

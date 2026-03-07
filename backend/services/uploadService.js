const crypto = require('crypto')
const path = require('path')

const { uploadImageBuffer } = require('./cloudinaryService')
const { uploadPdfBuffer } = require('./supabaseService')
const { uploadVideoBuffer } = require('./bunnyStreamService')

function safeExt(originalname) {
  const ext = path.extname(originalname || '')
  if (!ext) return ''
  if (ext.length > 12) return ''
  return ext
}

function makeKey(originalname) {
  const ext = safeExt(originalname)
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`
}

async function uploadAny({ file }) {
  const mimetype = String(file?.mimetype || '')
  const originalname = file?.originalname || 'file'
  const filename = makeKey(originalname)

  if (mimetype.startsWith('image/')) {
    const result = await uploadImageBuffer({ buffer: file.buffer, filename })
    return {
      url: result?.secure_url || result?.url || '',
      filename: result?.public_id || filename
    }
  }

  if (mimetype === 'application/pdf') {
    const key = `pdf/${filename}`
    const url = await uploadPdfBuffer({ buffer: file.buffer, contentType: mimetype, path: key })
    return { url, filename: key }
  }

  if (mimetype.startsWith('video/')) {
    const up = await uploadVideoBuffer({ buffer: file.buffer, title: originalname })
    return { url: up.embedUrl, filename: up.guid }
  }

  const err = new Error('Unsupported file type')
  err.status = 400
  throw err
}

module.exports = { uploadAny }

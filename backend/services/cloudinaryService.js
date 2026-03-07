const { v2: cloudinary } = require('cloudinary')
const { Readable } = require('stream')

let configured = false

function ensureConfigured() {
  if (configured) return
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
  })
  configured = true
}

function uploadImageBuffer({ buffer, filename }) {
  ensureConfigured()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        filename_override: filename,
        use_filename: true,
        unique_filename: true
      },
      (err, result) => {
        if (err) return reject(err)
        return resolve(result)
      }
    )

    Readable.from(buffer).pipe(stream)
  })
}

function uploadRawBuffer({ buffer, filename }) {
  ensureConfigured()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        filename_override: filename,
        use_filename: true,
        unique_filename: true
      },
      (err, result) => {
        if (err) return reject(err)
        return resolve(result)
      }
    )

    Readable.from(buffer).pipe(stream)
  })
}

module.exports = { uploadImageBuffer, uploadRawBuffer }

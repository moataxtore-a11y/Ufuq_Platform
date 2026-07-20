require('dotenv').config()
const { uploadVideoBuffer } = require('./services/cloudinaryVideoService.js')

async function test() {
    try {
        const buf = Buffer.alloc(10 * 1024 * 1024, 'a') // 10MB dummy buffer
        console.log('uploading...')
        const result = await uploadVideoBuffer({ buffer: buf, filename: 'dummy123' })
        console.log('Success:', result.public_id)
    } catch (e) {
        console.error('Error:', e)
    }
}
test()

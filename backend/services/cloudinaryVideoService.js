/**
 * Cloudinary Video Service
 * Handles video upload, signed URL generation, and deletion.
 * Replaces Bunny.net video streaming.
 */

const { v2: cloudinary } = require('cloudinary')
const { Readable } = require('stream')
const crypto = require('crypto')

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

/**
 * Upload a video buffer directly to Cloudinary.
 * Videos are organized in /courses/{courseId}/lessons/ folder.
 * Cloudinary will auto-generate HLS streaming format.
 */
async function uploadVideoBuffer({ buffer, filename, courseId, lessonId }) {
    ensureConfigured()

    const folder = courseId && lessonId
        ? `courses/${courseId}/lessons/${lessonId}`
        : courseId
            ? `courses/${courseId}/lessons`
            : 'videos'

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_chunked_stream(
            {
                resource_type: 'video',
                folder,
                public_id: filename,
                use_filename: false,
                unique_filename: true,
                chunk_size: 20000000, // 20 MB chunks
                timeout: 600000, // 10 minutes timeout
                // Eager transformations: generate HLS for adaptive streaming
                eager: [
                    { streaming_profile: 'hd', format: 'm3u8' }
                ],
                eager_async: true,
                // Auto quality & compression
                quality: 'auto',
                // Store original for fallback
                invalidate: true
            },
            (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            }
        )

        Readable.from(buffer).pipe(stream)
    })
}

/**
 * Generate a signed, time-limited URL for secure video delivery.
 * Prevents unauthorized access and direct hotlinking.
 *
 * @param {string} publicId - Cloudinary public_id of the video
 * @param {number} expiresInSeconds - How long the URL is valid (default: 2 hours)
 * @returns {{ url: string, expiresAt: number }}
 */
function generateSignedVideoUrl(publicId, expiresInSeconds = 7200) {
    ensureConfigured()

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds

    // Generate a signed URL with expiration
    const url = cloudinary.url(publicId, {
        resource_type: 'video',
        sign_url: true,
        auth_token: {
            key: process.env.CLOUD_SECRET,
            duration: expiresInSeconds
        },
        secure: true,
        // Deliver as HLS if available, fallback to original
        format: 'm3u8',
        streaming_profile: 'hd'
    })

    return { url, expiresAt }
}

/**
 * Generate a signed playback URL using timestamp-based signing.
 * This is the recommended approach for Cloudinary signed URLs.
 */
function generateSecureVideoUrl(publicId, expiresInSeconds = 7200) {
    ensureConfigured()

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds

    // Use Cloudinary's built-in signed URL generation
    const url = cloudinary.url(publicId, {
        resource_type: 'video',
        sign_url: true,
        expires_at: expiresAt,
        secure: true,
        // Try HLS first for smooth streaming
        format: 'm3u8'
    })

    // Also generate fallback mp4 URL
    const fallbackUrl = cloudinary.url(publicId, {
        resource_type: 'video',
        sign_url: true,
        expires_at: expiresAt,
        secure: true,
        quality: 'auto',
        fetch_format: 'auto'
    })

    return { url, fallbackUrl, expiresAt }
}

/**
 * Delete a video from Cloudinary.
 */
async function deleteVideo(publicId) {
    ensureConfigured()
    return cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
}

/**
 * Get video metadata from Cloudinary (duration, dimensions, etc.)
 */
async function getVideoInfo(publicId) {
    ensureConfigured()
    return cloudinary.api.resource(publicId, { resource_type: 'video' })
}

module.exports = {
    uploadVideoBuffer,
    generateSignedVideoUrl,
    generateSecureVideoUrl,
    deleteVideo,
    getVideoInfo,
    ensureConfigured
}

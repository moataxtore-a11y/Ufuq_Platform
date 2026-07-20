const express = require('express')
const multer = require('multer')
const crypto = require('crypto')
const path = require('path')
const { uploadImageBuffer, uploadRawBuffer } = require('../services/cloudinaryService')
const { generateSecureVideoUrl } = require('../services/cloudinaryVideoService')

const { auth, requireRole, requirePasswordChanged } = require('../middleware/auth')
const { attachCourse, canAccessCourse } = require('../middleware/courseAccess')
const { uploadAny } = require('../services/uploadService')
const { cloudinaryImagePresign, supabasePdfPresign, supabaseSignedDownloadUrl } = require('../services/uploadPresignService')
const { getServiceClient, resolveBucketName } = require('../services/supabaseService')

const router = express.Router()

router.use(auth, requirePasswordChanged)

const memory = multer.memoryStorage()

const upload = multer({
    storage: memory,
    limits: {
        fileSize: 1024 * 1024 * 1024
    }
})

const avatarUpload = multer({
    storage: memory,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const ok = String(file.mimetype || '').startsWith('image/')
        cb(ok ? null : new Error('Only image files are allowed'), ok)
    }
})

router.post('/avatar', avatarUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'file is required' })
    try {
        const up = await uploadAny({ file: req.file })
        return res.status(201).json({
            url: up.url,
            filename: up.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        })
    } catch (e) {
        const status = e && e.status ? e.status : 500
        const message = e && e.message ? e.message : 'Upload failed'
        return res.status(status).json({ message })
    }
})

router.post('/presign', requireRole('teacher', 'team'), async (req, res) => {
    try {
        const body = req && req.body ? req.body : {}
        const mimetype = String(body.mimetype || '')
        const originalname = String(body.originalname || 'file')

        if (mimetype.startsWith('image/')) {
            const presign = cloudinaryImagePresign({ originalname })
            return res.status(200).json(presign)
        }

        if (mimetype === 'application/pdf') {
            const bucket = await resolveBucketName(process.env.SUPABASE_BUCKET || 'pdfs')
            const supabase = getServiceClient()
            const presign = await supabasePdfPresign({ supabase, bucket, originalname })
            return res.status(200).json(presign)
        }

        return res.status(400).json({ message: 'Unsupported file type' })
    } catch (e) {
        const status = e && e.status ? e.status : 500
        const message = e && e.message ? e.message : 'Presign failed'
        return res.status(status).json({ message })
    }
})

router.get('/signed', async (req, res) => {
    try {
        if (req.user && req.user.role === 'student') {
            const courseId = req.query && req.query.courseId ? String(req.query.courseId) : ''
            if (!courseId) {
                return res.status(400).json({ message: 'courseId is required' })
            }

            req.params.courseId = courseId
            let allowed = false
            await new Promise((resolve, reject) => {
                attachCourse(req, res, (err) => (err ? reject(err) : resolve()))
            })
            await new Promise((resolve, reject) => {
                canAccessCourse(req, res, (err) => {
                    if (err) return reject(err)
                    if (res.headersSent) return resolve()
                    allowed = true
                    return resolve()
                })
            })
            if (!allowed) return
        }

        const bucketDefault = await resolveBucketName(process.env.SUPABASE_BUCKET || 'pdfs')
        const url = req.query && req.query.url ? String(req.query.url) : ''
        const pathQ = req.query && req.query.path ? String(req.query.path) : ''
        const bucketQ = req.query && req.query.bucket ? String(req.query.bucket) : ''

        let bucket = bucketQ || bucketDefault
        let objectPath = pathQ

        if (!objectPath && url) {
            const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/i)
            if (m) {
                bucket = m[1]
                objectPath = m[2]
            }
        }

        bucket = await resolveBucketName(bucket)

        if (!objectPath) {
            return res.status(400).json({ message: 'url or path is required' })
        }

        const supabase = getServiceClient()
        const signedUrl = await supabaseSignedDownloadUrl({ supabase, bucket, path: objectPath })
        return res.status(200).json({ url: signedUrl })
    } catch (e) {
        const status = e && e.status ? e.status : 500
        const message = e && e.message ? e.message : 'Signed url failed'
        return res.status(status).json({ message })
    }
})

/**
 * GET /api/uploads/video-url
 * Returns a signed, time-limited Cloudinary URL for secure video playback.
 * Authentication required. Students must additionally have course access.
 *
 * Query params:
 *   publicId  - Cloudinary public_id of the video (required)
 *   courseId  - The course the video belongs to (required for students)
 */
router.get('/video-url', async (req, res) => {
    try {
        const publicId = req.query && req.query.publicId ? String(req.query.publicId) : ''
        if (!publicId) {
            return res.status(400).json({ message: 'publicId is required' })
        }

        if (req.user && req.user.role === 'student') {
            const courseId = req.query && req.query.courseId ? String(req.query.courseId) : ''
            if (!courseId) {
                return res.status(400).json({ message: 'courseId is required for students' })
            }

            req.params.courseId = courseId
            let allowed = false
            await new Promise((resolve, reject) => {
                attachCourse(req, res, (err) => (err ? reject(err) : resolve()))
            })
            await new Promise((resolve, reject) => {
                canAccessCourse(req, res, (err) => {
                    if (err) return reject(err)
                    if (res.headersSent) return resolve()
                    allowed = true
                    return resolve()
                })
            })
            if (!allowed) return
        }

        // URL valid for 2 hours
        const { url, fallbackUrl, expiresAt } = generateSecureVideoUrl(publicId, 7200)

        return res.status(200).json({ url, fallbackUrl, expiresAt, publicId })
    } catch (e) {
        const status = e && e.status ? e.status : 500
        const message = e && e.message ? e.message : 'Failed to generate video URL'
        return res.status(status).json({ message })
    }
})

// Student assignment file upload
const assignmentUpload = multer({
    storage: memory,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
})

router.post('/assignment', assignmentUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'file is required' })
    try {
        const mimetype = String(req.file.mimetype || '')
        const ext = req.file.originalname ? require('path').extname(req.file.originalname) : ''
        const filename = `${Date.now()}-${require('crypto').randomBytes(8).toString('hex')}${ext.length <= 12 ? ext : ''}`

        let url = ''
        if (mimetype.startsWith('image/')) {
            const result = await uploadImageBuffer({ buffer: req.file.buffer, filename })
            url = (result && (result.secure_url || result.url)) ? (result.secure_url || result.url) : ''
        } else {
            const result = await uploadRawBuffer({ buffer: req.file.buffer, filename })
            url = (result && (result.secure_url || result.url)) ? (result.secure_url || result.url) : ''
        }

        return res.status(201).json({
            url,
            filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        })
    } catch (e) {
        const status = e && e.status ? e.status : 500
        const message = e && e.message ? e.message : 'Upload failed'
        return res.status(status).json({ message })
    }
})

// Student presign for images/PDFs
router.post('/presign/assignment', async (req, res) => {
    try {
        const body = req && req.body ? req.body : {}
        const mimetype = String(body.mimetype || '')
        const originalname = String(body.originalname || 'file')

        if (mimetype.startsWith('image/')) {
            const presign = cloudinaryImagePresign({ originalname })
            return res.status(200).json(presign)
        }

        if (mimetype === 'application/pdf') {
            const bucket = await resolveBucketName(process.env.SUPABASE_BUCKET || 'pdfs')
            const supabase = getServiceClient()
            const presign = await supabasePdfPresign({ supabase, bucket, originalname })
            return res.status(200).json(presign)
        }

        return res.status(400).json({ message: 'Unsupported file type for presign, use /uploads/assignment instead' })
    } catch (e) {
        const status = e && e.status ? e.status : 500
        const message = e && e.message ? e.message : 'Presign failed'
        return res.status(status).json({ message })
    }
})

router.use(requireRole('teacher', 'team'))

/**
 * POST /api/uploads
 * Main upload endpoint for teachers.
 * Accepts optional courseId and lessonId in body to organize videos in Cloudinary subfolders.
 */
router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'file is required' })
    try {
        const courseId = req.body && req.body.courseId ? String(req.body.courseId) : ''
        const lessonId = req.body && req.body.lessonId ? String(req.body.lessonId) : ''
        const up = await uploadAny({ file: req.file, courseId, lessonId })
        return res.status(201).json({
            url: up.url,
            publicId: up.publicId || '',
            durationSec: up.durationSec || null,
            filename: up.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        })
    } catch (e) {
        const status = e && e.status ? e.status : 500
        const message = e && e.message ? e.message : 'Upload failed'
        return res.status(status).json({ message })
    }
})

module.exports = { uploadRoutes: router }
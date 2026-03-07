const crypto = require('crypto')

function makeKey(originalname) {
    const safe = String(originalname || 'file')
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .slice(0, 120)
    const rand = crypto.randomBytes(8).toString('hex')
    const ts = Date.now()
    return `${ts}-${rand}-${safe}`
}

function cloudinaryImagePresign({ originalname }) {
    const cloudName = process.env.CLOUD_NAME
    const apiKey = process.env.CLOUD_KEY
    const apiSecret = process.env.CLOUD_SECRET
    if (!cloudName || !apiKey || !apiSecret) {
        const e = new Error('Cloudinary config missing')
        e.status = 500
        throw e
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const folder = 'uploads'
    const public_id = makeKey(originalname)

    const toSign = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(toSign).digest('hex')

    return {
        provider: 'cloudinary',
        method: 'POST',
        url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        fields: {
            api_key: apiKey,
            timestamp,
            signature,
            folder,
            public_id
        },
        expected: {
            filename: public_id
        }
    }
}

async function supabasePdfPresign({ supabase, bucket, originalname }) {
    const key = `pdf/${makeKey(originalname)}`

    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(key)
    if (error) throw error

    const signedUrl = data && data.signedUrl ? data.signedUrl : ''
    if (!signedUrl) {
        const e = new Error('Failed to create signed upload url')
        e.status = 500
        throw e
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key)
    const publicUrl = pub && pub.publicUrl ? pub.publicUrl : ''

    return {
        provider: 'supabase',
        method: 'PUT',
        url: signedUrl,
        headers: {
            'Content-Type': 'application/pdf'
        },
        expected: {
            url: publicUrl,
            filename: key
        }
    }
}

async function supabaseSignedDownloadUrl({ supabase, bucket, path, expiresIn = 60 * 10 }) {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
    if (error) throw error
    const signedUrl = data && data.signedUrl ? data.signedUrl : ''
    if (!signedUrl) {
        const e = new Error('Failed to create signed download url')
        e.status = 500
        throw e
    }
    return signedUrl
}

module.exports = {
    cloudinaryImagePresign,
    supabasePdfPresign,
    supabaseSignedDownloadUrl
}
const { createClient } = require('@supabase/supabase-js')

let client = null
let serviceClient = null
let cachedBuckets = null

function getClient() {
    if (client) return client
    client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    return client
}

function getServiceClient() {
    if (serviceClient) return serviceClient
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
    serviceClient = createClient(process.env.SUPABASE_URL, key)
    return serviceClient
}

async function listBucketsSafe(supabase) {
    if (cachedBuckets) return cachedBuckets
    try {
        const { data, error } = await supabase.storage.listBuckets()
        if (error) throw error
        cachedBuckets = Array.isArray(data) ? data : []
        return cachedBuckets
    } catch {
        cachedBuckets = []
        return cachedBuckets
    }
}

async function resolveBucketName(preferred) {
    const supabase = getServiceClient()
    const pref = String(preferred || '').trim()
    const buckets = await listBucketsSafe(supabase)
    const names = new Set(buckets.map((b) => String(b && b.name ? b.name : '').trim()).filter(Boolean))

    if (pref && names.has(pref)) return pref
    if (!names.size) return pref || 'pdfs'

    const fallbacks = ['pdfs', 'uploads', 'public', 'files']
    for (const fb of fallbacks) {
        if (names.has(fb)) return fb
    }

    // If there is exactly one bucket, use it.
    if (names.size === 1) return Array.from(names)[0]

    // Otherwise, just return preferred (may error later, but avoids picking random).
    return pref || Array.from(names)[0]
}

async function uploadPdfBuffer({ buffer, contentType, path }) {
    const supabase = getServiceClient()
    const bucket = await resolveBucketName(process.env.SUPABASE_BUCKET || 'pdfs')

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
        contentType: contentType || 'application/pdf',
        upsert: false
    })
    if (error) {
        const msg = String(error.message || error)
        if (/bucket/i.test(msg) && /not found/i.test(msg)) {
            const e = new Error(`Supabase bucket not found: ${bucket}`)
            e.status = 500
            throw e
        }
        throw error
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data && data.publicUrl ? data.publicUrl : ''
}

module.exports = { uploadPdfBuffer, getClient, getServiceClient, resolveBucketName }
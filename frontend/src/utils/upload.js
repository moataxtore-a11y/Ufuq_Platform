import { api } from './api.js'

function getTotal(evt) {
    return evt && typeof evt.total === 'number' ? evt.total : 0
}

function getLoaded(evt) {
    return evt && typeof evt.loaded === 'number' ? evt.loaded : 0
}

async function compressImage(file, { maxSide = 1280, quality = 0.82 } = {}) {
    try {
        if (!file || !file.type || !String(file.type).startsWith('image/')) return file
        if (typeof window === 'undefined' || typeof document === 'undefined') return file

        const bitmap = await createImageBitmap(file)
        const w = bitmap.width || 0
        const h = bitmap.height || 0
        if (!w || !h) return file

        const scale = Math.min(1, maxSide / Math.max(w, h))
        if (scale >= 1) return file

        const tw = Math.max(1, Math.round(w * scale))
        const th = Math.max(1, Math.round(h * scale))

        const canvas = document.createElement('canvas')
        canvas.width = tw
        canvas.height = th

        const ctx = canvas.getContext('2d')
        if (!ctx) return file
        ctx.drawImage(bitmap, 0, 0, tw, th)

        const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', quality)
        )
        if (!blob) return file

        const name = String(file.name || 'image')
            .replace(/\.(png|jpg|jpeg|webp|gif|bmp|tiff)$/i, '')
            .trim() || 'image'

        return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
    } catch {
        return file
    }
}

export async function uploadFile(file, endpoint = '/uploads', options = {}) {
    const finalFile = await compressImage(file, {
        maxSide: typeof options.maxSide === 'number' ? options.maxSide : 1280,
        quality: typeof options.quality === 'number' ? options.quality : 0.82
    })

    const mimetype = finalFile && finalFile.type ? finalFile.type : ''
    const presignEndpoint = typeof options.presignEndpoint === 'string' ? options.presignEndpoint : '/uploads/presign'
    const skipPresign = options.skipPresign === true

    // Direct-to-cloud for images and PDFs (faster for large files)
    if (!skipPresign && mimetype && (mimetype.startsWith('image/') || mimetype === 'application/pdf')) {
        try {
            const presignRes = await api.post(presignEndpoint, {
                mimetype,
                originalname: finalFile && finalFile.name ? finalFile.name : 'file'
            })
            const presign = presignRes.data

            if (presign && presign.provider === 'cloudinary') {
                const form = new FormData()
                const fields = presign.fields || {}
                Object.keys(fields).forEach((k) => form.append(k, String(fields[k])))
                form.append('file', finalFile)

                const cloudRes = await fetch(presign.url, {
                    method: 'POST',
                    body: form
                })
                const out = await cloudRes.json()
                if (!cloudRes.ok) {
                    throw new Error(out && out.error && out.error.message ? out.error.message : 'Cloudinary upload failed')
                }
                return {
                    url: out.secure_url || out.url || '',
                    filename: (presign.expected && presign.expected.filename) || out.public_id || '',
                    originalname: finalFile && finalFile.name ? finalFile.name : '',
                    mimetype,
                    size: finalFile && typeof finalFile.size === 'number' ? finalFile.size : 0
                }
            }

            if (presign && presign.provider === 'supabase') {
                const putUrl = presign.url
                const headers = presign.headers || {}

                const res = await api.put(putUrl, finalFile, {
                    headers,
                    timeout: typeof options.timeout === 'number' ? options.timeout : 0,
                    onUploadProgress: typeof options.onProgress === 'function' ?
                        (evt) => {
                            const total = getTotal(evt)
                            const loaded = getLoaded(evt)
                            options.onProgress({ total, loaded })
                        } : undefined
                })

                // supabase signed upload url may not return data; rely on expected url from presign
                const expected = presign.expected || {}
                return {
                    url: expected.url || '',
                    filename: expected.filename || '',
                    originalname: finalFile && finalFile.name ? finalFile.name : '',
                    mimetype,
                    size: finalFile && typeof finalFile.size === 'number' ? finalFile.size : 0
                }
            }
        } catch {
            // Fall back to proxy route below
        }
    }

    const form = new FormData()
    form.append('file', finalFile)
    const res = await api.post(endpoint, form, {
        timeout: typeof options.timeout === 'number' ? options.timeout : 0,
        onUploadProgress: typeof options.onProgress === 'function' ? options.onProgress : undefined
    })
    return res.data
}
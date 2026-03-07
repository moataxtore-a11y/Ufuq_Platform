const https = require('https')

const agent = new https.Agent({ keepAlive: true })

function requestJson({ method, hostname, path, headers, body, timeoutMs }) {
    return new Promise((resolve, reject) => {
        const req = https.request({
                method,
                hostname,
                path,
                headers,
                agent
            },
            (res) => {
                let raw = ''
                res.on('data', (d) => {
                    raw += d.toString('utf-8')
                })
                res.on('end', () => {
                    const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 300
                    if (!ok) return reject(new Error(raw || `HTTP ${res.statusCode}`))
                    try {
                        resolve(raw ? JSON.parse(raw) : {})
                    } catch (e) {
                        reject(e)
                    }
                })
            }
        )
        req.on('error', reject)
        req.setTimeout(typeof timeoutMs === 'number' ? timeoutMs : 5 * 60 * 1000, () => {
            req.destroy(new Error('Request timeout'))
        })
        if (body) req.write(body)
        req.end()
    })
}

function requestRaw({ method, hostname, path, headers, body, timeoutMs }) {
    return new Promise((resolve, reject) => {
        const req = https.request({
                method,
                hostname,
                path,
                headers,
                agent
            },
            (res) => {
                res.on('data', () => {})
                res.on('end', () => {
                    const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 300
                    if (!ok) return reject(new Error(`HTTP ${res.statusCode}`))
                    resolve(true)
                })
            }
        )
        req.on('error', reject)
        req.setTimeout(typeof timeoutMs === 'number' ? timeoutMs : 30 * 60 * 1000, () => {
            req.destroy(new Error('Request timeout'))
        })
        if (body) req.write(body)
        req.end()
    })
}

async function uploadVideoBuffer({ buffer, title }) {
    const libraryId = process.env.BUNNY_LIBRARY_ID
    const apiKey = process.env.BUNNY_API_KEY
    if (!libraryId || !apiKey) throw new Error('Bunny config missing')

    const created = await requestJson({
        method: 'POST',
        hostname: 'video.bunnycdn.com',
        path: `/library/${libraryId}/videos`,
        headers: {
            AccessKey: apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title || 'Video' }),
        timeoutMs: 2 * 60 * 1000
    })

    const guid = created && created.guid ? created.guid : null
    if (!guid) throw new Error('Failed to create Bunny video')

    await requestRaw({
        method: 'PUT',
        hostname: 'video.bunnycdn.com',
        path: `/library/${libraryId}/videos/${guid}`,
        headers: {
            AccessKey: apiKey,
            'Content-Type': 'application/octet-stream',
            'Content-Length': Buffer.byteLength(buffer)
        },
        body: buffer,
        timeoutMs: 60 * 60 * 1000
    })

    const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}`
    return { guid, embedUrl }
}

module.exports = { uploadVideoBuffer }
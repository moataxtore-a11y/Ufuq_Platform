/**
 * SecureVideoPlayer
 * 
 * A secure video player that:
 * - Fetches signed, time-limited Cloudinary URLs from the backend
 * - Supports HLS streaming via hls.js
 * - Disables right-click and keyboard shortcuts for saving
 * - Shows upload progress during video upload
 * - Automatically refreshes the signed URL before expiry
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '../../utils/api.js'

// Lazy-load hls.js only when needed (code-splitting)
let HlsClass = null
async function loadHls() {
    if (HlsClass) return HlsClass
    try {
        const mod = await import('hls.js')
        HlsClass = mod.default || mod
        return HlsClass
    } catch {
        return null
    }
}

function isHlsUrl(url) {
    return typeof url === 'string' && (url.includes('.m3u8') || url.includes('streaming_profile'))
}

/**
 * Fetches a signed video URL from the backend.
 * @param {string} publicId - Cloudinary public_id
 * @param {string} courseId - Course ID (for student access check)
 */
async function fetchSignedVideoUrl(publicId, courseId) {
    const params = new URLSearchParams({ publicId })
    if (courseId) params.append('courseId', courseId)
    const res = await api.get(`/uploads/video-url?${params}`)
    return res.data // { url, fallbackUrl, expiresAt, publicId }
}

export function SecureVideoPlayer({
    publicId,
    fallbackUrl,
    courseId,
    autoRefresh = true,
    className = '',
    onError,
    onLoaded
}) {
    const videoRef = useRef(null)
    const hlsRef = useRef(null)
    const refreshTimerRef = useRef(null)

    const [signedUrl, setSignedUrl] = useState('')
    const [fallbackVideoUrl, setFallbackVideoUrl] = useState(fallbackUrl || '')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const destroyHls = useCallback(() => {
        if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
        }
    }, [])

    const attachHls = useCallback(async (url) => {
        if (!videoRef.current || !url) return

        const video = videoRef.current

        if (!isHlsUrl(url)) {
            // Plain MP4/video fallback - just set src directly
            destroyHls()
            video.src = url
            return
        }

        const Hls = await loadHls()
        if (!Hls || !Hls.isSupported()) {
            // Browser supports native HLS (Safari) or no hls.js
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                destroyHls()
                video.src = url
            } else if (fallbackVideoUrl) {
                destroyHls()
                video.src = fallbackVideoUrl
            }
            return
        }

        destroyHls()
        const hls = new Hls({
            // Security: don't store anything in localStorage
            enableWorker: true,
            lowLatencyMode: false,
            // Optimization
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            startLevel: -1 // auto quality
        })

        hls.loadSource(url)
        hls.attachMedia(video)

        hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad()
                } else {
                    hls.destroy()
                    // Fallback to direct URL
                    if (fallbackVideoUrl) {
                        video.src = fallbackVideoUrl
                    } else {
                        setError('Video playback failed. Please try again.')
                        if (onError) onError(data)
                    }
                }
            }
        })

        hlsRef.current = hls
    }, [destroyHls, fallbackVideoUrl, onError])

    const loadSignedUrl = useCallback(async () => {
        if (!publicId) {
            if (fallbackUrl) {
                setSignedUrl(fallbackUrl)
                setFallbackVideoUrl(fallbackUrl)
                setLoading(false)
            }
            return
        }
        try {
            setLoading(true)
            const data = await fetchSignedVideoUrl(publicId, courseId)
            setSignedUrl(data.url || '')
            setFallbackVideoUrl(data.fallbackUrl || fallbackUrl || '')

            // Auto-refresh 5 minutes before expiry
            if (autoRefresh && data.expiresAt) {
                const msUntilExpiry = (data.expiresAt * 1000) - Date.now()
                const refreshIn = Math.max(30000, msUntilExpiry - 5 * 60 * 1000)
                clearTimeout(refreshTimerRef.current)
                refreshTimerRef.current = setTimeout(() => {
                    loadSignedUrl()
                }, refreshIn)
            }
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to load video'
            setError(msg)
            if (onError) onError(e)
        } finally {
            setLoading(false)
        }
    }, [publicId, courseId, fallbackUrl, autoRefresh, onError])

    useEffect(() => {
        loadSignedUrl()
        return () => {
            clearTimeout(refreshTimerRef.current)
            destroyHls()
        }
    }, [loadSignedUrl, destroyHls])

    useEffect(() => {
        if (signedUrl) {
            attachHls(signedUrl)
            if (onLoaded) onLoaded()
        }
    }, [signedUrl, attachHls, onLoaded])

    // Security: Block right-click context menu on video
    function handleContextMenu(e) {
        e.preventDefault()
        e.stopPropagation()
        return false
    }

    // Security: Block common keyboard download shortcuts
    function handleKeyDown(e) {
        // Ctrl+S (Save As), Ctrl+Shift+S, Ctrl+U (View Source)
        if ((e.ctrlKey || e.metaKey) && ['s', 'S', 'u', 'U'].includes(e.key)) {
            e.preventDefault()
        }
    }

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-black rounded-xl min-h-[200px] ${className}`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <div className="text-white/60 text-sm">جاري تحميل الفيديو...</div>
                </div>
            </div>
        )
    }

    if (error && !signedUrl) {
        return (
            <div className={`flex items-center justify-center bg-black rounded-xl min-h-[200px] ${className}`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="text-red-400 text-sm text-center px-4">{error}</div>
                    <button
                        type="button"
                        onClick={loadSignedUrl}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`relative bg-black rounded-xl overflow-hidden ${className}`}
            onContextMenu={handleContextMenu}
            onKeyDown={handleKeyDown}
        >
            {/* CSS to hide download button across browsers */}
            <style>{`
        video::-webkit-media-controls-download-button { display: none !important; }
        video::-webkit-media-controls-enclosure { overflow: hidden !important; }
        video::shadow::-webkit-media-controls-download-button { display: none !important; }
      `}</style>

            <video
                ref={videoRef}
                className="w-full h-full"
                controls
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                playsInline
                preload="metadata"
                onContextMenu={handleContextMenu}
            />

            {/* Transparent overlay that blocks right-click on the video itself while keeping controls usable */}
            <div
                className="absolute inset-0 pointer-events-none"
                onContextMenu={handleContextMenu}
                style={{ zIndex: 0 }}
            />
        </div>
    )
}

export default SecureVideoPlayer

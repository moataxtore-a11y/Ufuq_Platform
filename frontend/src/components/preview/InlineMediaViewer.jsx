import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../ui/Button.jsx'
import fileIcon from '../../cvg/file.svg'
import vidIcon from '../../cvg/vid.svg'
import imgIcon from '../../cvg/img.svg'
import { api } from '../../utils/api.js'
import { X } from 'lucide-react'

function isYoutubeUrl(u) {
  if (!u) return false
  const s = String(u)
  return s.includes('youtube.com') || s.includes('youtu.be')
}

function getYoutubeEmbedUrl(u) {
  try {
    const url = new URL(String(u))
    let id = ''
    if (url.hostname.includes('youtu.be')) {
      id = url.pathname.replace('/', '').trim()
    } else {
      id = url.searchParams.get('v') || ''
    }
    if (!id) return ''
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
  } catch {
    return ''
  }
}

export default function InlineMediaViewer({ media, onClose, isRtl, courseId, lessonId }) {
  const ref = useRef(null)
  const mediaWrapRef = useRef(null)
  const videoRef = useRef(null)
  const lastTickRef = useRef(0)
  const [pdfTapToFullscreenArmed, setPdfTapToFullscreenArmed] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)

  if (!media?.url) return null

  const title = media?.title || (isRtl ? 'عرض' : 'Viewer')
  const url = String(media.url)

  const actualKind = (() => {
    if (media?.kind === 'video' && isYoutubeUrl(url)) return 'youtube'
    return media?.kind
  })()

  const embedUrl = actualKind === 'youtube' ? getYoutubeEmbedUrl(url) : ''

  useEffect(() => {
    setPdfTapToFullscreenArmed(actualKind === 'pdf')
  }, [actualKind, url])

  useEffect(() => {
    const cid = String(courseId || '')
    const lid = String(lessonId || '')
    if (!cid || !lid) return
    api.post('/progress/lesson/open', { courseId: cid, lessonId: lid }).catch(() => { })
  }, [courseId, lessonId])

  async function markLessonComplete() {
    const cid = String(courseId || '')
    const lid = String(lessonId || '')
    if (!cid || !lid) return
    try {
      setMarkingComplete(true)
      await api.post('/progress/lesson/complete', { courseId: cid, lessonId: lid })
    } catch {
      // ignore
    } finally {
      setMarkingComplete(false)
    }
  }

  useEffect(() => {
    if (actualKind !== 'video') return
    const cid = String(courseId || '')
    const lid = String(lessonId || '')
    if (!cid || !lid) return
    const video = videoRef.current
    if (!video) return

    let timer = null

    function tick() {
      try {
        if (!video || video.paused || video.ended) return
        const now = Date.now()
        const last = lastTickRef.current || now
        const delta = Math.max(0, Math.min(15, (now - last) / 1000))
        lastTickRef.current = now
        if (delta < 1) return
        api.post('/progress/video', {
          courseId: cid,
          lessonId: lid,
          videoUrl: url,
          deltaSeconds: delta,
          positionSeconds: video.currentTime,
          durationSeconds: video.duration
        }).catch(() => { })
      } catch {
        // ignore
      }
    }

    function onPlay() {
      lastTickRef.current = Date.now()
      if (timer) return
      timer = setInterval(tick, 10000)
    }
    function stop() {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      lastTickRef.current = Date.now()
    }
    function onPause() {
      tick()
      stop()
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onPause)

    return () => {
      tick()
      stop()
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onPause)
    }
  }, [actualKind, courseId, lessonId, url])

  useEffect(() => {
    function update() {
      try {
        setIsSmallScreen(window.matchMedia('(max-width: 768px)').matches)
      } catch {
        setIsSmallScreen(false)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    function onFsChange() {
      if (actualKind !== 'pdf') return
      setPdfTapToFullscreenArmed(!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
    }
  }, [actualKind])

  function requestWrapFullscreen() {
    try {
      const el = mediaWrapRef.current
      if (!el) return
      if (document.fullscreenElement) return
      if (typeof el.requestFullscreen === 'function') {
        el.requestFullscreen().catch(() => { })
      }
    } catch {
      // ignore
    }
  }

  const kindIcon = useMemo(() => {
    if (actualKind === 'youtube' || actualKind === 'video') return vidIcon
    if (actualKind === 'pdf') return fileIcon
    if (actualKind === 'image') return imgIcon
    return null
  }, [actualKind])

  return (
    <div ref={ref} className="bg-transparent mx-auto w-full max-w-5xl">
      <div className="relative pt-24 sm:pt-28">
        <div className="top-3 left-1/2 z-10 absolute w-auto max-w-[92%] sm:max-w-[720px] -translate-x-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-950/90 rounded-[999px] translate-y-[7px]" />
            <div className="relative bg-[#19c3b0] shadow-[0_14px_26px_rgba(2,24,20,0.22)] p-[7px] rounded-[999px]">
              <div
                dir={isRtl ? 'rtl' : 'ltr'}
                className={
                  'inline-flex items-center gap-2 sm:gap-3 rounded-[999px] ' +
                  'bg-emerald-700 px-4 sm:px-6 py-2.5 sm:py-3.5 ' +
                  'shadow-[inset_0_0_0_3px_rgba(255,255,255,0.06)]'
                }
              >
                {kindIcon ? (
                  <div className="flex justify-center items-center bg-emerald-900 shadow-[0_7px_0_rgba(0,0,0,0.12)] border border-[#19c3b0]/50 rounded-full w-11 sm:w-13 h-11 sm:h-13 shrink-0">
                    <img src={kindIcon} alt="" className="w-5 sm:w-6.5 h-5 sm:h-6.5" draggable={false} />
                  </div>
                ) : null}

                <div className={'min-w-0 flex-1 max-w-[78vw] sm:max-w-[560px] ' + (isRtl ? 'text-right' : 'text-left')}>
                  <div
                    className="py-[1px] font-extrabold text-[#EAB308] text-[17px] sm:text-[20px] leading-[2.5]"
                    style={{ textShadow: '0 3px 0 rgba(0,0,0,0.28), 2px 3px 0 rgba(0,0,0,0.22)' }}
                  >
                    <span className="block break-words line-clamp-2">{title}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="top-3 right-3 z-10 absolute flex justify-center items-center bg-black/50 hover:bg-black/75 shadow-md backdrop-blur-sm rounded-full w-9 h-9 text-white transition-colors"
          aria-label={isRtl ? 'إغلاق' : 'Close'}
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div ref={mediaWrapRef} className="bg-black rounded-2xl aspect-video overflow-hidden">
          {actualKind === 'youtube' && embedUrl ? (
            <iframe
              title={title}
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : actualKind === 'video' ? (
            <video ref={videoRef} src={url} controls playsInline preload="metadata" className="w-full h-full" />
          ) : actualKind === 'image' ? (
            <img
              src={url}
              alt={title}
              className="bg-black w-full h-full object-contain cursor-zoom-in"
              onClick={requestWrapFullscreen}
            />
          ) : actualKind === 'pdf' ? (
            <div className="relative w-full h-full">
              <iframe
                title={title}
                src={url}
                className="bg-white w-full h-full"
                onDoubleClick={requestWrapFullscreen}
              />
              {isSmallScreen && pdfTapToFullscreenArmed ? (
                <button
                  type="button"
                  className="absolute inset-0 bg-transparent w-full h-full cursor-zoom-in"
                  onClick={() => {
                    requestWrapFullscreen()
                    setPdfTapToFullscreenArmed(false)
                  }}
                  aria-label={isRtl ? 'ملء الشاشة' : 'Fullscreen'}
                />
              ) : null}
            </div>
          ) : (
            <div className="flex justify-center items-center w-full h-full text-white text-sm">
              {isRtl ? 'لا يمكن عرض هذا النوع داخل الصفحة.' : 'Cannot preview this file type inline.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

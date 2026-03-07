import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../ui/Button.jsx'
import { Modal } from '../ui/Modal.jsx'

export default function MediaViewerModal({ open, onOpenChange, kind, url, title, isRtl }) {
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [size, setSize] = useState('md')

  const canZoom = kind === 'image' || kind === 'pdf'

  useEffect(() => {
    if (open) {
      setZoom(1)
      setSize('md')
    }
  }, [open])

  const contentClassName = useMemo(() => {
    if (size === 'sm') return 'w-[min(860px,95vw)]'
    if (size === 'lg') return 'w-[min(1400px,98vw)]'
    return 'w-[min(1100px,96vw)]'
  }, [size])

  function clampZoom(next) {
    const v = Number(next)
    if (!Number.isFinite(v)) return 1
    return Math.min(3, Math.max(0.5, v))
  }

  function requestFullscreen() {
    const el = containerRef.current
    if (!el) return
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen?.()
      } else {
        el.requestFullscreen?.()
      }
    } catch {
      // ignore
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title || (isRtl ? 'عرض' : 'Viewer')} contentClassName={contentClassName}>
      <div ref={containerRef} className="grid gap-3">
        <div className={'flex flex-wrap items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-end')}>
          <Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={() => setSize('sm')} disabled={size === 'sm'}>
            {isRtl ? 'صغير' : 'Small'}
          </Button>
          <Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={() => setSize('md')} disabled={size === 'md'}>
            {isRtl ? 'متوسط' : 'Medium'}
          </Button>
          <Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={() => setSize('lg')} disabled={size === 'lg'}>
            {isRtl ? 'كبير' : 'Large'}
          </Button>

          {canZoom ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="h-9 px-3 text-xs"
                onClick={() => setZoom((z) => clampZoom(z - 0.25))}
                disabled={zoom <= 0.5}
              >
                {isRtl ? 'تصغير' : 'Zoom -'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 px-3 text-xs"
                onClick={() => setZoom((z) => clampZoom(z + 0.25))}
                disabled={zoom >= 3}
              >
                {isRtl ? 'تكبير' : 'Zoom +'}
              </Button>
            </>
          ) : null}

          <Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={requestFullscreen}>
            {isRtl ? 'ملء الشاشة' : 'Fullscreen'}
          </Button>

          {url ? (
            <Button type="button" variant="secondary" className="h-9 px-3 text-xs" asChild>
              <a href={url} target="_blank" rel="noreferrer">
                {isRtl ? 'تحميل' : 'Download'}
              </a>
            </Button>
          ) : null}
        </div>

        <div className="rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-[#1a1a1a] overflow-hidden">
          {kind === 'video' ? (
            <div className="bg-black">
              <video src={url || ''} controls className="w-full max-h-[70vh]" />
            </div>
          ) : kind === 'image' ? (
            <div className="max-h-[70vh] overflow-auto bg-black/5 dark:bg-black/20">
              <div className="w-full flex justify-center p-4">
                <img
                  src={url || ''}
                  alt={title || ''}
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          ) : kind === 'pdf' ? (
            <div className="max-h-[70vh] overflow-auto bg-black/5 dark:bg-black/20">
              <div className="w-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                <iframe title={title || 'PDF'} src={url || ''} className="w-full h-[70vh]" />
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-slate-700 dark:text-slate-200">
              {isRtl ? 'لا يمكن عرض هذا الملف داخل المنصة.' : 'This file type cannot be previewed in-app.'}
            </div>
          )}
        </div>

        <div className={'flex ' + (isRtl ? 'justify-start' : 'justify-end')}>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {isRtl ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

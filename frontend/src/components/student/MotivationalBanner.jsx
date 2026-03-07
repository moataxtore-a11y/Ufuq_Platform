import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function MotivationalBanner() {
  const { isRtl } = useLanguage()
  const [state, setState] = useState({ status: 'loading', message: null })

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        const res = await api.get('/motivational-message/me')
        if (!alive) return
        setState({ status: 'success', message: res.data?.message || null })
      } catch {
        if (!alive) return
        setState({ status: 'error', message: null })
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  function dismiss() {
    setState((s) => ({ ...s, message: null }))
  }

  const msg = state.message
  if (!msg) return null

  const hasCta = Boolean(String(msg.ctaUrl || '').trim())
  const ctaLabel = String(msg.ctaLabel || '').trim() || (isRtl ? 'اعرف المزيد' : 'Learn more')

  return (
    <div className="w-full">
      <div className="relative bg-white/70 dark:bg-white/[0.06] shadow-[0_10px_26px_rgba(15,23,42,0.08)] dark:shadow-none backdrop-blur px-3 py-3 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,206,125,0.22),transparent_60%)]" />

        <div className="relative flex sm:flex-row flex-col items-start sm:items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex justify-center items-center bg-white/70 hover:bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-xl w-9 h-9 text-slate-700 dark:text-slate-200 transition shrink-0"
            aria-label={isRtl ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>

          <div className={"min-w-0 flex-1 " + (isRtl ? 'text-right' : 'text-left')}>
            {msg.title ? (
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base break-words">
                {msg.title}
              </div>
            ) : null}
            {msg.body ? (
              <div className="mt-1 text-slate-700 dark:text-slate-200 text-sm break-words leading-6 whitespace-pre-line">
                {msg.body}
              </div>
            ) : null}
          
            {hasCta ? (
              <div className={"mt-3 flex sm:mt-0 " + (isRtl ? 'justify-start sm:justify-end' : 'justify-end')}>
                <a
                  href={msg.ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex justify-center items-center bg-[rgb(244,206,125)] shadow-sm hover:brightness-95 px-4 py-2 rounded-xl font-extrabold text-slate-900 text-xs transition"
                >
                  {ctaLabel}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

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
      <div
        className="relative overflow-hidden rounded-2xl border border-black/5 bg-white/80 px-4 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none sm:px-6"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,148,132,0.14),transparent_34%),radial-gradient(circle_at_85%_50%,rgba(6,148,132,0.12),transparent_34%)]" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className={"min-w-0 flex-1 " + (isRtl ? 'text-right' : 'text-left')}>
            {msg.title ? (
              <div className="break-words text-base font-extrabold text-slate-900 dark:text-slate-100 sm:text-lg">
                {msg.title}
              </div>
            ) : null}
            {msg.body ? (
              <div className="mt-1 max-w-4xl whitespace-pre-line break-words text-sm leading-6 text-slate-600 dark:text-slate-200">
                {msg.body}
              </div>
            ) : null}
          </div>

          <div className={"flex shrink-0 items-center gap-2 " + (isRtl ? 'justify-start sm:flex-row-reverse' : 'justify-end')}>
            {hasCta ? (
              <a
                href={msg.ctaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-brand-600"
              >
                {ctaLabel}
              </a>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white/75 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
              aria-label={isRtl ? 'إغلاق' : 'Close'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

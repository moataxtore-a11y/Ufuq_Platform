import { cn } from '../../utils/cn.js'
import Button from '../ui/Button.jsx'

export default function CourseCard({ course, isRtl, badge, ctaLabel, onOpen, footerText, meta, onSubscribe, hideSubscribe }) {
  function formatDate(value) {
    if (!value) return '—'
    const ts = new Date(value)
    if (Number.isNaN(ts.getTime())) return '—'
    try {
      return ts.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return ts.toDateString()
    }
  }

  function resolveCourseDate(kind) {
    if (!course) return null
    if (kind === 'updated') {
      return (
        course?.updatedAt ||
        course?.updated_at ||
        course?.updated ||
        course?.modifiedAt ||
        course?.modified_at ||
        null
      )
    }
    return (
      course?.createdAt ||
      course?.created_at ||
      course?.created ||
      course?.createdOn ||
      course?.created_on ||
      null
    )
  }

  function getCourseHours() {
    const raw =
      typeof course?.totalHours === 'number' ? course.totalHours :
        typeof course?.hours === 'number' ? course.hours :
          typeof course?.durationHours === 'number' ? course.durationHours :
            typeof course?.duration === 'number' ? course.duration :
              null

    if (raw === null) return null
    const n = Number(raw)
    if (!Number.isFinite(n) || n <= 0) return null
    return n
  }

  function DateIcon({ kind }) {
    if (kind === 'updated') {
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12a9 9 0 1 1-3.02-6.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }

    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 5h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  function HoursIcon() {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  function getPriceMeta() {
    if (Boolean(course?.isFree)) return { kind: 'free' }

    const raw = typeof meta === 'number' ? meta : course?.price
    if (raw === undefined || raw === null) return null

    if (typeof raw === 'number') {
      const p = Number(raw)
      if (!Number.isFinite(p) || p <= 0) return { kind: 'free' }
      return { kind: 'paid', amount: p }
    }

    const s = String(raw).trim()
    if (!s) return null
    const lower = s.toLowerCase()
    if (lower === 'free' || s === 'مجاني') return { kind: 'free' }

    const match = s.match(/(\d+(?:\.\d+)?)/)
    if (match) {
      const p = Number(match[1])
      if (Number.isFinite(p) && p > 0) return { kind: 'paid', amount: p }
    }

    return null
  }

  const priceMeta = getPriceMeta()

  const courseHours = getCourseHours()

  const discountPercent = typeof course?.discountPercent === 'number' ? course.discountPercent : Number(course?.discountPercent || 0)
  const hasDiscount = priceMeta?.kind === 'paid' && Number.isFinite(discountPercent) && discountPercent > 0
  const discountedAmount = hasDiscount ? Math.round((priceMeta.amount * (1 - Math.min(100, Math.max(0, discountPercent)) / 100)) * 100) / 100 : null
  const isPinned = Boolean(course?.pinnedAt || course?.isPinned || course?.pinned)

  const showBadge = Boolean(badge) && !['كورس', 'Course'].includes(String(badge).trim())

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.()
        }
      }}
      className={cn(
        'group rounded-[1.25rem] overflow-hidden text-left transition-all duration-300 ease-out',
        'bg-white/80 dark:bg-white/[0.04] backdrop-blur-glass shadow-glass-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-slate-200/50 dark:border-white/10 relative',
        'hover:-translate-y-2 hover:shadow-glow-brand hover:border-brand/40'
      )}
    >
      <div className="relative">
        {course?.thumbnailUrl ? (
          <div className="relative bg-white/20 dark:bg-white/[0.02]">
            <div className="w-full aspect-[16/10]">
              <img src={course.thumbnailUrl} alt={course?.title || 'Course'} className="w-full h-full object-cover" />
            </div>

            {isPinned ? (
              <div
                className={
                  'pointer-events-none absolute top-0 z-10 h-28 w-28 ' +
                  (isRtl ? 'left-0' : 'right-0')
                }
              >
                <div
                  className={
                    'absolute top-3 w-[160px] bg-[#E11D48] text-white font-extrabold text-[12px] sm:text-sm py-2 shadow-lg tracking-wide text-center ' +
                    (isRtl ? '-left-12 -rotate-45' : '-right-12 rotate-45')
                  }
                >
                  {isRtl ? 'كورس مثبت' : 'Pinned'}
                </div>
              </div>
            ) : null}

            <div className="z-0 absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,148,132,0.12),transparent_55%)] pointer-events-none" />
          </div>
        ) : null}

        <div className={cn('z-10 relative gap-4 grid p-5', isRtl ? 'text-right' : 'text-left')}>
          {!course?.thumbnailUrl && isPinned ? (
            <div className={isRtl ? 'flex justify-start' : 'flex justify-end'}>
              <div className="bg-[#E11D48] shadow px-3 py-1 rounded-full font-extrabold text-[11px] text-white">
                {isRtl ? 'كورس مثبت' : 'Pinned course'}
              </div>
            </div>
          ) : null}
          {showBadge ? (
            <div className={isRtl ? 'flex justify-start' : 'flex justify-end'}>
              <div className="bg-[rgb(244,206,125)] shadow px-3 py-1 rounded-full font-extrabold text-[11px] text-slate-900">
                {badge}
              </div>
            </div>
          ) : null}
          <div className="gap-2 grid">
            <div className="font-extrabold text-slate-800 dark:text-slate-100 text-lg text-center leading-snug">
              {course?.title || (isRtl ? 'بدون عنوان' : 'Untitled')}
            </div>
            <div className="bg-emerald-500/70 mx-auto w-24 h-px" />
          </div>

          <div className="text-slate-600 dark:text-slate-300 text-sm text-center leading-6 whitespace-pre-line">
            {course?.description || (isRtl ? 'لا يوجد وصف' : 'No description')}
          </div>

          <div className={'flex flex-wrap items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-end')}>
            {priceMeta?.kind === 'paid' && typeof onSubscribe === 'function' && !hideSubscribe ? (
              <Button
                className="bg-[rgb(20,184,166)] hover:bg-[rgb(13,148,136)] px-6 rounded-full h-10 text-white"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSubscribe?.()
                }}
              >
                {isRtl ? 'اشترك الآن!' : 'Subscribe now!'}
              </Button>
            ) : null}

            <Button
              variant="outline"
              className="hover:bg-[rgba(20,184,166,0.08)] px-5 border-[rgba(20,184,166,0.45)] dark:border-[rgba(20,184,166,0.55)] rounded-full h-10 text-[rgb(20,184,166)] dark:text-[rgb(94,234,212)]"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onOpen?.()
              }}
            >
              {ctaLabel || (isRtl ? 'الدخول للكورس' : 'Enter course')}
            </Button>
          </div>
        </div>
      </div>

      {footerText ? (
        <div className="z-10 relative px-4 py-3 border-slate-200/50 dark:border-white/10 border-t text-slate-600 dark:text-slate-300 text-xs">
          {footerText}
        </div>
      ) : null}

      <div className={cn('z-10 relative px-4 py-3 border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs', footerText ? '' : 'border-t')}>
        <div className={'flex items-center justify-between gap-3 ' + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
          <div className={'grid gap-2 ' + (isRtl ? 'text-right' : 'text-left')}>
            <div className="gap-1 grid">
              <div className={'flex items-center gap-2 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                <span className="text-slate-500 dark:text-slate-400">
                  <DateIcon kind="created" />
                </span>
                <span className="font-semibold">{formatDate(resolveCourseDate('created'))}</span>
              </div>
              <div className={'flex items-center gap-2 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                <span className="text-slate-500 dark:text-slate-400">
                  <DateIcon kind="updated" />
                </span>
                <span className="font-semibold">{formatDate(resolveCourseDate('updated'))}</span>
              </div>
            </div>

            {courseHours !== null ? (
              <div className={'flex items-center gap-2 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                <span className="text-slate-500 dark:text-slate-400">
                  <HoursIcon />
                </span>
                <span className="font-semibold">{courseHours} {isRtl ? 'ساعة' : 'hours'}</span>
              </div>
            ) : null}
          </div>

          <div className="flex justify-center shrink-0">
            {priceMeta?.kind === 'free' ? (
              <span className={'inline-flex items-center rounded-full px-4 py-2 text-xs font-extrabold text-white shadow-sm app-gradient-155 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                {isRtl ? 'كورس مجاني!' : 'Free Course'}
              </span>
            ) : priceMeta?.kind === 'paid' ? (
              hasDiscount && discountedAmount !== null ? (
                <div className={'grid gap-1 justify-items-center'}>
                  <div className={'flex items-center justify-center gap-2 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                    <span className="inline-flex items-center bg-red-600 px-2.5 py-1 rounded-full font-extrabold text-[11px] text-white">
                      خصم {Math.round(discountPercent)}%
                    </span>
                    <span className="font-extrabold text-[12px] text-red-600">{isRtl ? 'عرض محدود الوقت' : 'Limited time offer'}</span>
                  </div>
                  <div className="font-extrabold text-[20px] text-slate-900 dark:text-slate-100 leading-tight">
                    {discountedAmount.toFixed(2)} <span className="text-[13px] text-slate-700 dark:text-slate-200">{isRtl ? 'جنيهًا' : 'EGP'}</span>
                  </div>
                  <div className="text-[13px] text-slate-500 dark:text-slate-400 line-through">
                    {priceMeta.amount.toFixed(2)} {isRtl ? 'جنيهًا' : 'EGP'}
                  </div>
                </div>
              ) : (
                <span className={'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold shadow-sm bg-[rgba(20,184,166,0.16)] text-slate-900 dark:text-slate-100 border border-[rgba(20,184,166,0.35)] ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                  <span className="bg-[rgb(20,184,166)] px-3 py-0.5 rounded-full text-white">{priceMeta.amount.toFixed(2)}</span>
                  <span className="text-slate-700 dark:text-slate-200">{isRtl ? 'جنيهًا' : 'EGP'}</span>
                </span>
              )
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

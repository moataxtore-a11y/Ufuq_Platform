export default function CoursePageHeader({
  dir = 'rtl',
  title,
  description,
  thumbnailUrl,
  teacherName,
  price,
  isFree,
  discountPercent = 0,
  status,
  createdAt,
  updatedAt
}) {
  const isRtl = dir === 'rtl'
  const paid = !isFree && Number(price || 0) > 0
  const dp = typeof discountPercent === 'number' ? discountPercent : Number(discountPercent || 0)
  const hasDiscount = paid && Number.isFinite(dp) && dp > 0
  const discountedAmount = hasDiscount ? Math.round((Number(price || 0) * (1 - Math.min(100, Math.max(0, dp)) / 100)) * 100) / 100 : null

  function formatDay(value) {
    if (!value) return ''
    try {
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return ''
      return d.toLocaleDateString(isRtl ? 'ar-EG' : undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return ''
    }
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

  const createdLabel = formatDay(createdAt)
  const updatedLabel = formatDay(updatedAt)

  return (
    <div dir={dir} className="relative bg-white/80 dark:bg-black/30 shadow-glass-md backdrop-blur-glass border border-slate-200/50 dark:border-white/10 rounded-[1.25rem] sm:rounded-3xl w-full min-h-[260px] sm:min-h-[300px] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(164, 168, 167, 0.2),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(6,148,132,0.12),transparent_55%)]" />

      <div className="relative px-3 sm:px-4 lg:px-6 py-5 sm:py-6">
        <div className={'grid gap-4 sm:gap-6 items-start ' + (isRtl ? 'text-right' : 'text-left') + ' lg:grid-cols-[460px_1fr]'}>
          <div className="bg-white/60 dark:bg-white/5 shadow-glass-sm backdrop-blur-sm border border-slate-200/50 dark:border-white/10 rounded-[18px] overflow-hidden">
            <div className="relative">
              <div className="aspect-[16/10]">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={title || 'Course'} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex justify-center items-center w-full h-full text-slate-600 dark:text-slate-300 text-xs">Image</div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex justify-center">
                <div className="bg-emerald-500/70 w-24 h-px" />
              </div>

              <div className="flex flex-col gap-2 mt-3">
                <div className="font-extrabold text-slate-900 dark:text-white text-lg text-center">
                  {title || (isRtl ? 'الكورس' : 'Course')}
                </div>
                {teacherName ? (
                  <div className="text-slate-600 dark:text-slate-300 text-sm text-center">
                    {isRtl ? 'المدرس: ' : 'Teacher: '}<span className="font-semibold">{teacherName}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="min-w-0">
                <div className="font-extrabold text-slate-900 dark:text-white text-2xl sm:text-3xl leading-snug">
                  {title || (isRtl ? 'الكورس' : 'Course')}
                </div>
                {description ? (
                  <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm leading-7 whitespace-pre-line">
                    {description}
                  </div>
                ) : null}

                <div className="mt-4">
                  <div className={'flex flex-wrap items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-start')}>
                    {status ? (
                      <div className="font-extrabold text-[12px] text-slate-900 dark:text-white">
                        {status === 'locked' ? (isRtl ? 'مقفول لحين الاشتراك' : 'Locked') : ''}
                      </div>
                    ) : null}

                    {createdLabel ? (
                      <div className={'flex items-start gap-2 ' + (isRtl ? 'flex-row text-right' : 'flex-row-reverse text-left')}>
                        <span className="text-slate-500 dark:text-slate-400">
                          <DateIcon kind="created" />
                        </span>
                        <div className="leading-tight">
                          <div className="inline-flex bg-[rgba(20,184,166,0.16)] dark:bg-[rgba(20,184,166,0.22)] px-3 py-1 border border-[rgba(20,184,166,0.28)] dark:border-[rgba(20,184,166,0.35)] rounded-full font-semibold text-[13px] text-slate-900 dark:text-slate-100">
                            {createdLabel}
                          </div>
                          <div className="font-semibold text-[12px] text-slate-600 dark:text-slate-300">{isRtl ? 'تاريخ الإنشاء' : 'Created'}</div>
                        </div>
                      </div>
                    ) : null}

                    {updatedLabel ? (
                      <div className={'flex items-start gap-2 ' + (isRtl ? 'flex-row text-right' : 'flex-row-reverse text-left')}>
                        <span className="text-slate-500 dark:text-slate-400">
                          <DateIcon kind="updated" />
                        </span>
                        <div className="leading-tight">
                          <div className="inline-flex bg-[rgba(20,184,166,0.16)] dark:bg-[rgba(20,184,166,0.22)] px-3 py-1 border border-[rgba(20,184,166,0.28)] dark:border-[rgba(20,184,166,0.35)] rounded-full font-semibold text-[13px] text-slate-900 dark:text-slate-100">
                            {updatedLabel}
                          </div>
                          <div className="font-semibold text-[12px] text-slate-600 dark:text-slate-300">{isRtl ? 'آخر تحديث' : 'Updated'}</div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-2">
                    {hasDiscount ? (
                      <div className={'flex flex-wrap items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-start')}>
                        <div className="inline-flex justify-center items-center bg-red-600 shadow px-3 py-1 rounded-full font-extrabold text-[11px] text-white">
                          {isRtl ? `خصم %${Math.round(dp)}` : `${Math.round(dp)}% OFF`}
                        </div>
                        <div className="font-extrabold text-[12px] text-slate-900 dark:text-white">
                          {isRtl ? 'عرض محدود الوقت' : 'Limited time'}
                        </div>
                      </div>
                    ) : null}

                    {paid ? (
                      <div className={'mt-2 flex flex-col ' + (isRtl ? 'items-start text-right' : 'items-start text-left')}>
                        <div className={'flex items-baseline gap-2 ' + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-2xl">
                            {(hasDiscount && discountedAmount !== null ? discountedAmount : Number(price || 0)).toFixed(2)}
                          </div>
                          <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                            {isRtl ? 'جنيهًا' : 'EGP'}
                          </div>
                        </div>

                        {hasDiscount && discountedAmount !== null ? (
                          <div className={'mt-1 font-bold text-slate-600 dark:text-slate-300 text-sm line-through ' + (isRtl ? 'text-right' : 'text-left')}>
                            {Number(price || 0).toFixed(2)} {isRtl ? 'جنيهًا' : 'EGP'}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="inline-flex items-center shadow-sm px-3 py-1 rounded-full font-extrabold text-[11px] text-white app-gradient-155">
                        {isRtl ? 'كورس مجاني!' : 'Free Course'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

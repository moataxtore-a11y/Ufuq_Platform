import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import Spinner from '../ui/Spinner.jsx'
import labelSvg from '../../cvg/LABLE.svg'

export default function SubjectsSection() {
  const { isRtl, t } = useLanguage()
  const navigate = useNavigate()

  const [state, setState] = useState({ status: 'loading', byYear: {}, error: '' })
  const [expandedYears, setExpandedYears] = useState({})

  const years = useMemo(() => {
    return [
      { key: '1_secondary', label: t('landing.gradeYears.1_secondary') },
      { key: '2_secondary', label: t('landing.gradeYears.2_secondary') },
      { key: '3_secondary', label: t('landing.gradeYears.3_secondary') }
    ]
  }, [t])

  useEffect(() => {
    let alive = true

    async function load() {
      if (!alive) return
      setState({ status: 'loading', byYear: {}, error: '' })
      try {
        const byYearEntries = await Promise.all(
          years.map(async(y) => {
            const params = { gradeYear: y.key }
            const res = await api.get('/subjects', { params })
            const items = Array.isArray(res.data) ? res.data : []
            return [y.key, items]
          })
        )

        const byYear = Object.fromEntries(byYearEntries)
        if (alive) setState({ status: 'success', byYear, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || t('landing.subjects.failedToLoad')
        if (alive) setState({ status: 'error', byYear: {}, error: msg })
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [isRtl, years])

  function toggleExpand(yearKey) {
    setExpandedYears((prev) => ({ ...prev, [yearKey]: !prev?.[yearKey] }))
  }

  return (
    <section id="subjects" className="mt-8 scroll-mt-[68px] sm:scroll-mt-[72px] md:scroll-mt-[76px]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative px-3 sm:px-5 lg:px-6 py-10">
        <div className="text-center">
          <h2 className="font-extrabold text-slate-900 dark:text-white text-4xl sm:text-5xl md:text-6xl tracking-tight">
            {isRtl ? 'المواد' : 'Available'}{' '}
            <span className="text-slate-900 dark:text-white">{isRtl ? 'المتاحة' : 'Subjects'}</span>
          </h2>

          <div className="flex justify-center mt-3">
            <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
              <path d="M20 20 C 160 0, 360 0, 500 20" stroke="#069484" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex justify-center mt-6">
            <div />
          </div>
        </div>

        <div className="z-0 relative mt-8">
          {state.status === 'loading' ? (
            <div className="flex justify-center items-center bg-white/75 dark:bg-[#171717] p-8 border border-black/5 dark:border-white/10 rounded-3xl">
              <Spinner />
            </div>
          ) : null}

          {state.status === 'error' ? (
            <div className="bg-white/75 dark:bg-[#171717] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
              {state.error}
            </div>
          ) : null}

          {state.status === 'success' && Object.values(state.byYear || {}).every((arr) => !Array.isArray(arr) || arr.length === 0) ? (
            <div className="bg-white/75 dark:bg-[#171717] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
              {t('landing.subjects.emptyAll')}
            </div>
          ) : null}

          {state.status === 'success' ? (
            <div className="gap-6 grid lg:grid-cols-3">
              {years.map((y) => {
                const items = Array.isArray(state.byYear?.[y.key]) ? state.byYear[y.key] : []
                const expanded = Boolean(expandedYears?.[y.key])
                const visible = expanded ? items : items.slice(0, 3)

                return (
                  <div key={y.key} className="gap-3 grid">
                    <div className="flex justify-center">
                      <div className="inline-flex relative justify-center items-center px-6 py-2 font-extrabold text-slate-900 dark:text-slate-100 text-2xl">
                        <img
                          src={labelSvg}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        />
                        <span className="relative">{y.label}</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#171717] shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] border border-black/5 dark:border-white/10 rounded-3xl overflow-hidden transition-all">
                      <div className="p-6">
                        {visible.length === 0 ? (
                          <div className="text-slate-600 dark:text-slate-300 text-sm">
                            {t('landing.subjects.empty')}
                          </div>
                        ) : (
                          <div className="gap-3 grid">
                            {visible.map((s) => (
                              <button
                                key={`${y.key}-${s?.subject}`}
                                type="button"
                                onClick={() => {
                                  const subj = s?.subject || ''
                                  if (!subj) return
                                  const qs = new URLSearchParams()
                                  qs.set('gradeYear', y.key)
                                  const q = qs.toString()
                                  navigate(`/subjects/${encodeURIComponent(subj)}?${q}`)
                                }}
                                className={
                                  'w-full font-semibold text-lg sm:text-xl text-center ' +
                                  'text-slate-800 dark:text-slate-100 hover:text-brand ' +
                                  'transition-colors ' +
                                  (isRtl ? 'text-center' : 'text-center')
                                }
                              >
                                <div>{s?.subject || ''}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {items.length > 3 ? (
                        <div className="px-6 pb-6">
                          <button
                            type="button"
                            onClick={() => toggleExpand(y.key)}
                            className="bg-brand hover:bg-brand-600 active:bg-brand-700 px-5 py-2 rounded-xl font-semibold text-white text-sm transition"
                          >
                            {expanded ? t('landing.subjects.showLess') : t('landing.subjects.showMore')}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

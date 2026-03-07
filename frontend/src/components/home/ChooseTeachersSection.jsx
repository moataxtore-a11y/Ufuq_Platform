import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api.js'
import Spinner from '../ui/Spinner.jsx'
import TeacherCard from '../teachers/TeacherCard.jsx'
import Select from '../ui/Select.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import noSvg from '../../cvg/NO.svg'

export default function ChooseTeachersSection() {
  const { isRtl, t } = useLanguage()
  const navigate = useNavigate()

  const [section, setSection] = useState('')
  const [gradeYear, setGradeYear] = useState('')
  const [state, setState] = useState({ status: 'loading', items: [], error: '' })

  const sectionOptions = useMemo(() => {
    return [
      { value: '', label: t('landing.chooseTeachers.filters.allSections') },
      { value: 'science', label: t('landing.chooseTeachers.filters.section_science') },
      { value: 'math', label: t('landing.chooseTeachers.filters.section_math') },
      { value: 'literature', label: t('landing.chooseTeachers.filters.section_literature') }
    ]
  }, [t])

  const gradeYearOptions = useMemo(() => {
    return [
      { value: '', label: t('landing.chooseTeachers.filters.allYears') },
      { value: '1_secondary', label: t('landing.gradeYears.1_secondary') },
      { value: '2_secondary', label: t('landing.gradeYears.2_secondary') },
      { value: '3_secondary', label: t('landing.gradeYears.3_secondary') }
    ]
  }, [t])

  useEffect(() => {
    let alive = true

    async function load() {
      if (!alive) return
      setState({ status: 'loading', items: [], error: '' })
      try {
        const params = { limit: 200 }
        const res = await api.get('/teachers', { params })
        const items = Array.isArray(res.data) ? res.data : []
        if (alive) setState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || t('landing.chooseTeachers.failedToLoad')
        if (alive) setState({ status: 'error', items: [], error: msg })
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [t])

  function safeNorm(v) {
    return String(v ?? '').trim().toLowerCase()
  }

  const filteredTeachers = useMemo(() => {
    const list = Array.isArray(state.items) ? state.items : []

    const byFilters = list.filter((tt) => {
      const ttSections = Array.isArray(tt?.teachingSections) && tt.teachingSections.length
        ? tt.teachingSections
        : (tt?.teachingSection || tt?.section ? [tt?.teachingSection || tt?.section] : [])
      const ttGradeYear = safeNorm(tt?.teachingGradeYear || tt?.gradeYear)
      const okSection = section
        ? ttSections.some((s) => safeNorm(s) === safeNorm(section))
        : true
      const okGradeYear = gradeYear ? ttGradeYear === safeNorm(gradeYear) : true
      return okSection && okGradeYear
    })

    return byFilters.slice(0, 12)
  }, [gradeYear, section, state.items])

  return (
    <section id="choose-teachers" className="mt-8 scroll-mt-24">
      <div
        className="relative"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="-top-24 -left-24 absolute bg-brand/20 blur-3xl rounded-full w-72 h-72" />
          <div className="-right-24 -bottom-24 absolute bg-accent/15 blur-3xl rounded-full w-72 h-72" />
        </div>

        <div className="relative px-3 sm:px-5 lg:px-6 py-10">
          <div className="text-center">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-4xl sm:text-5xl md:text-6xl tracking-tight">
              {t('landing.chooseTeachers.titlePrefix')}{' '}
              <span className="text-brand">{t('landing.chooseTeachers.titleBrand')}</span>
            </h2>

            <div className="flex justify-center mt-3">
              <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
                <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(212,175,55,0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex justify-center mt-6">
              <div className="z-30 relative bg-white/75 dark:bg-white/[0.06] backdrop-blur p-4 border border-black/5 dark:border-white/10 rounded-2xl w-full max-w-xl">
                <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{t('landing.chooseTeachers.filters.sectionLabel')}</label>
                    <Select value={section} onChange={(v) => setSection(v)} options={sectionOptions} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{t('landing.chooseTeachers.filters.gradeYearLabel')}</label>
                    <Select value={gradeYear} onChange={(v) => setGradeYear(v)} options={gradeYearOptions} />
                  </div>
                </div>
              </div>
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

            {state.status === 'success' && filteredTeachers.length === 0 ? (
              <div className="bg-white/75 dark:bg-[#171717] p-5 border border-black/5 dark:border-white/10 rounded-3xl">
                <div className="flex flex-col justify-center items-center gap-3 text-center">
                  <img src={noSvg} alt="" aria-hidden="true" className="w-12 h-12 object-contain" />
                  <div className="font-semibold text-base" style={{ color: '#F74343' }}>
                    {isRtl ? 'مفيش مدرسين حالياََ' : 'No teachers right now'}
                  </div>
                </div>
              </div>
            ) : null}

            {state.status === 'success' && filteredTeachers.length > 0 ? (
              <div className="justify-items-center gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTeachers.map((tt) => (
                  <button
                    key={tt?.id || tt?.name}
                    type="button"
                    className="w-full"
                    onClick={() => {
                      if (tt?.id) navigate(`/teachers/${tt.id}`)
                    }}
                  >
                    <TeacherCard teacher={tt} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

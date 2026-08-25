import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api.js'
import { Skeleton } from '../ui/Skeleton.jsx'
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
    if (typeof v === 'object' && v !== null) {
      if ('target' in v) v = v.target?.value
      else if ('value' in v) v = v.value
    }
    return String(v ?? '').trim().toLowerCase()
  }

  function listify(value) {
    if (Array.isArray(value)) return value
    if (value === null || value === undefined || value === '') return []
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
    return [value]
  }

  function matchesAll(value) {
    const v = safeNorm(value)
    return !v ||
      v === 'all' ||
      v === 'all_years' ||
      v === 'all-years' ||
      v === 'all years' ||
      v === 'all_year' ||
      v === 'all_grades' ||
      v === 'all-grades' ||
      v === 'all grades' ||
      v === 'كل السنوات' ||
      v === 'كل السنين' ||
      v === 'كل الصفوف'
  }

  const filteredTeachers = useMemo(() => {
    const list = Array.isArray(state.items) ? state.items : []

    const selSec = safeNorm(section)
    const selGrade = safeNorm(gradeYear)

    const byFilters = list.filter((tt) => {
      const profile = tt?.profile && typeof tt.profile === 'object' ? tt.profile : {}

      const ttSectionsRaw = tt?.teachingSections || profile?.teachingSections || tt?.teachingSection || profile?.teachingSection || tt?.section || profile?.section || []
      const ttSections = listify(ttSectionsRaw)

      const ttGradeYearsRaw = tt?.teachingGradeYears || profile?.teachingGradeYears || tt?.teachingGradeYear || profile?.teachingGradeYear || tt?.gradeYear || profile?.gradeYear || []
      const ttGradeYears = listify(ttGradeYearsRaw)

      const okSection = !selSec || ttSections.some((s) => {
        const normS = safeNorm(s)
        return matchesAll(s) || normS === selSec || (selSec === 'science' && normS.includes('sci')) || (selSec === 'math' && normS.includes('math')) || (selSec === 'literature' && (normS.includes('lit') || normS.includes('أدب')))
      })

      const okGradeYear = !selGrade || ttGradeYears.length === 0 || ttGradeYears.some((year) => {
        const ttGradeYear = safeNorm(year)
        return matchesAll(year) ||
          ttGradeYear === selGrade ||
          (selGrade === '1_secondary' && (ttGradeYear.includes('1') || ttGradeYear.includes('first'))) ||
          (selGrade === '2_secondary' && (ttGradeYear.includes('2') || ttGradeYear.includes('second'))) ||
          (selGrade === '3_secondary' && (ttGradeYear.includes('3') || ttGradeYear.includes('third')))
      })

      return okSection && okGradeYear
    })

    return byFilters.slice(0, 12)
  }, [gradeYear, section, state.items])

  return (
    <section id="choose-teachers" className="relative z-20 mt-8 lg:-mt-4 scroll-mt-[68px] sm:scroll-mt-[72px] md:scroll-mt-[76px]">
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
                <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex justify-center mt-6">
              <div className="z-30 relative bg-white/75 dark:bg-white/[0.06] backdrop-blur p-4 border border-black/5 dark:border-white/10 rounded-2xl w-full max-w-xl">
                <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{t('landing.chooseTeachers.filters.sectionLabel')}</label>
                    <Select value={section} onChange={(e) => setSection(typeof e === 'object' && e !== null && 'target' in e ? e.target.value : (e ?? ''))} options={sectionOptions} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{t('landing.chooseTeachers.filters.gradeYearLabel')}</label>
                    <Select value={gradeYear} onChange={(e) => setGradeYear(typeof e === 'object' && e !== null && 'target' in e ? e.target.value : (e ?? ''))} options={gradeYearOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="z-0 relative mt-8">
            {state.status === 'loading' ? (
              <div className="justify-items-center gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 space-y-4 transition-colors">
                    <div className="flex justify-center">
                      <Skeleton className="w-24 h-24 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-2/3 mx-auto rounded-lg" />
                    <Skeleton className="h-4 w-1/2 mx-auto rounded-md" />
                    <div className="flex justify-center gap-2 pt-2">
                      <Skeleton className="w-16 h-6 rounded-full" />
                      <Skeleton className="w-16 h-6 rounded-full" />
                    </div>
                  </div>
                ))}
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
                  <div className="font-semibold text-rose-600 dark:text-rose-400 text-base">
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

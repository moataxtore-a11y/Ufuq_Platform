import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SiteLayout from '../../components/layout/SiteLayout.jsx'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import Select from '../../components/ui/Select.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import CourseCard from '../../components/courses/CourseCard.jsx'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SubjectCoursesPage() {
  const { subject: subjectParam } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isRtl } = useLanguage()
  const { auth } = useAuth()

  const subject = useMemo(() => decodeURIComponent(subjectParam || '').trim(), [subjectParam])

  const [section, setSection] = useState(searchParams.get('section') || '')
  const [gradeYear, setGradeYear] = useState(searchParams.get('gradeYear') || '')

  const [state, setState] = useState({ status: 'loading', items: [], error: '' })
  const [mineIds, setMineIds] = useState(new Set())
  const [courseMetaById, setCourseMetaById] = useState({})

  function courseIsFree(c) {
    return Boolean(c?.isFree) || Number(c?.price || 0) <= 0
  }

  const sectionOptions = useMemo(() => {
    return [
      { value: '', label: isRtl ? 'كل الشعب' : 'All sections' },
      { value: 'science', label: isRtl ? 'علمي علوم' : 'Science (Biology)' },
      { value: 'math', label: isRtl ? 'علمي رياضة' : 'Science (Math)' },
      { value: 'literature', label: isRtl ? 'أدبي' : 'Literature' }
    ]
  }, [isRtl])

  const gradeYearOptions = useMemo(() => {
    return [
      { value: '', label: isRtl ? 'كل السنوات' : 'All years' },
      { value: '1_secondary', label: isRtl ? 'الصف الأول الثانوي' : '1st Secondary' },
      { value: '2_secondary', label: isRtl ? 'الصف الثاني الثانوي' : '2nd Secondary' },
      { value: '3_secondary', label: isRtl ? 'الصف الثالث الثانوي' : '3rd Secondary' }
    ]
  }, [isRtl])

  useEffect(() => {
    setSection(searchParams.get('section') || '')
    setGradeYear(searchParams.get('gradeYear') || '')
  }, [searchParams])

  useEffect(() => {
    let alive = true

    async function load() {
      if (!alive) return
      setState({ status: 'loading', items: [], error: '' })
      try {
        const res = await api.get(`/subjects/${encodeURIComponent(subject)}/courses`)
        const items = Array.isArray(res.data) ? res.data : []
        if (alive) setState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || (isRtl ? 'فشل تحميل الكورسات' : 'Failed to load courses')
        if (alive) setState({ status: 'error', items: [], error: msg })
      }
    }

    if (subject) load()
    return () => {
      alive = false
    }
  }, [isRtl, subject])

  function safeNorm(v) {
    return String(v ?? '').trim().toLowerCase()
  }

  const filteredItems = useMemo(() => {
    const items = Array.isArray(state.items) ? state.items : []
    if (!section && !gradeYear) return items
    return items.filter((c) => {
      const cSection = safeNorm(c?.section || c?.studentSection || c?.track)
      const cGradeYear = safeNorm(c?.gradeYear || c?.grade || c?.year)

      const okSection = section ? cSection === safeNorm(section) : true
      const okGradeYear = gradeYear ? cGradeYear === safeNorm(gradeYear) : true
      return okSection && okGradeYear
    })
  }, [gradeYear, section, state.items])

  useEffect(() => {
    let alive = true

    async function loadCourseMeta(ids) {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await api.get(`/courses/${encodeURIComponent(id)}`)
            const data = res?.data || {}
            return {
              id,
              createdAt: data?.createdAt || data?.created_at || null,
              updatedAt: data?.updatedAt || data?.updated_at || null
            }
          } catch {
            return null
          }
        })
      )

      if (!alive) return
      setCourseMetaById((prev) => {
        const next = { ...prev }
        for (const r of results) {
          if (!r?.id) continue
          next[String(r.id)] = { createdAt: r.createdAt, updatedAt: r.updatedAt }
        }
        return next
      })
    }

    if (state.status !== 'success') return () => {
      alive = false
    }

    const items = Array.isArray(state.items) ? state.items : []
    const missing = []
    for (const c of items) {
      const id = String(c?.id || c?._id || '')
      if (!id) continue
      if (courseMetaById[id]) continue
      const hasAnyDate = Boolean(c?.createdAt || c?.created_at || c?.updatedAt || c?.updated_at)
      if (!hasAnyDate) missing.push(id)
    }

    if (missing.length) loadCourseMeta(missing)

    return () => {
      alive = false
    }
  }, [courseMetaById, state.items, state.status])

  useEffect(() => {
    let alive = true

    async function loadMine() {
      if (!auth?.token) {
        if (alive) setMineIds(new Set())
        return
      }
      try {
        const mineRes = await api.get('/courses/mine')
        const mine = Array.isArray(mineRes?.data) ? mineRes.data : []
        const s = new Set(mine.map((c) => String(c?._id || c?.id)))
        if (alive) setMineIds(s)
      } catch {
        if (alive) setMineIds(new Set())
      }
    }

    loadMine()
    return () => {
      alive = false
    }
  }, [auth?.token])

  function enterCourseHref(courseId) {
    const cid = String(courseId || '')
    if (!cid) return '/'
    if (auth?.role === 'teacher') return `/teacher/courses/${cid}`
    if (auth?.role === 'team') return `/team/courses/${cid}`
    if (auth?.role === 'student') return `/student/courses/${cid}`
    return '/'
  }

  function applyFilters(nextSection, nextGradeYear) {
    const qs = new URLSearchParams()
    if (nextSection) qs.set('section', nextSection)
    if (nextGradeYear) qs.set('gradeYear', nextGradeYear)
    setSearchParams(qs, { replace: true })
  }

  return (
    <SiteLayout>
      <div className="gap-6 grid" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="relative pt-2">
          <div className={"absolute top-0 " + (isRtl ? 'left-0' : 'right-0')}>
            <Button variant="secondary" onClick={() => navigate('/')}>{isRtl ? 'العودة' : 'Back'}</Button>
          </div>

          <div className="text-center">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-4xl sm:text-5xl md:text-6xl tracking-tight">
              <span className="text-brand">{subject || (isRtl ? 'المادة' : 'Subject')}</span>
            </h2>

            <div className="flex justify-center mt-3">
              <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
                <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(212,175,55,0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="z-20 relative bg-white/75 dark:bg-white/[0.06] backdrop-blur p-4 border border-black/5 dark:border-white/10 rounded-2xl w-full">
          <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الشعبة' : 'Section'}</label>
              <Select
                value={section}
                onChange={(v) => {
                  setSection(v)
                  applyFilters(v, gradeYear)
                }}
                options={sectionOptions}
              />
            </div>
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'السنة الدراسية' : 'Grade year'}</label>
              <Select
                value={gradeYear}
                onChange={(v) => {
                  setGradeYear(v)
                  applyFilters(section, v)
                }}
                options={gradeYearOptions}
              />
            </div>
          </div>
        </div>

        {state.status === 'loading' ? (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Spinner />
            {isRtl ? 'جاري تحميل الكورسات...' : 'Loading courses...'}
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="text-slate-700 dark:text-slate-200 text-sm">{state.error}</div>
        ) : null}

        {state.status === 'success' && filteredItems.length === 0 ? (
          <div className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'لا يوجد كورسات.' : 'No courses.'}</div>
        ) : null}

        {state.status === 'success' && filteredItems.length > 0 ? (
          <div className="z-0 relative items-start gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((c) => {
              const cid = String(c?.id || c?._id || '')
              const meta = cid ? courseMetaById[cid] : null
              const course = meta ? { ...c, ...meta } : c
              const courseId = String(course?.id || course?._id || '')
              const isInMine = courseId ? mineIds.has(courseId) : false
              return (
                <CourseCard
                  key={c?.id || c?._id || c?.title}
                  course={course}
                  isRtl={isRtl}
                  badge={subject}
                  ctaLabel={isInMine ? (isRtl ? 'الدخول للكورس' : 'Enter course') : (isRtl ? 'عرض' : 'Preview')}
                  onOpen={() => {
                    if (!courseId) return
                    if (isInMine) {
                      navigate(enterCourseHref(courseId))
                      return
                    }
                    if (auth?.token && courseIsFree(course)) {
                      navigate(enterCourseHref(courseId))
                      return
                    }
                    navigate(`/courses/${courseId}/preview`)
                  }}
                />
              )
            })}
          </div>
        ) : null}
      </div>
    </SiteLayout>
  )
}

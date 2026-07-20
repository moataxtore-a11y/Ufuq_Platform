import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api.js'
import Button from '../ui/Button.jsx'
import CourseCard from '../courses/CourseCard.jsx'
import SectionWrapper from '../ui/SectionWrapper.jsx'
import Spinner from '../ui/Spinner.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { Inbox } from 'lucide-react'

export default function FeaturedTeachersCoursesSection() {
  const { isRtl, t } = useLanguage()
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [coursesState, setCoursesState] = useState({ status: 'loading', items: [], error: '' })
  const [mineIds, setMineIds] = useState(new Set())
  const [visibleLimit, setVisibleLimit] = useState(3)

  const userRole = auth?.role || auth?.user?.role
  const isAdmin = userRole === 'admin'
  const shouldFetchMine = Boolean(auth?.token) && !isAdmin && ['teacher', 'team', 'student'].includes(userRole)

  const titleNode = useMemo(() => {
    return (
      <>
        {t('landing.featured.titlePrefix')}{' '}
        <span className="text-brand">{t('landing.featured.titleBrand')}</span>
      </>
    )
  }, [t])

  useEffect(() => {
    let alive = true

    async function loadCourses() {
      if (!alive) return
      setCoursesState({ status: 'loading', items: [], error: '' })
      try {
        const [res, mineRes] = await Promise.all([
          api.get('/courses?limit=48'),
          shouldFetchMine ? api.get('/courses/mine').catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
        ])
        const items = Array.isArray(res.data) ? res.data : []
        const mine = Array.isArray(mineRes?.data) ? mineRes.data : []
        const s = new Set(mine.map((c) => String(c?._id || c?.id)))
        if (alive) setMineIds(s)
        if (alive) setCoursesState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || t('landing.featured.loadCoursesFailed')
        if (alive) setCoursesState({ status: 'error', items: [], error: msg })
      }
    }

    loadCourses()

    return () => {
      alive = false
    }
  }, [auth?.token, isAdmin, t])

  const courses = useMemo(() => (Array.isArray(coursesState.items) ? coursesState.items : []), [coursesState.items])

  const suggestedCourses = useMemo(() => {
    const sorted = [...courses].sort((a, b) => {
      const pa = a?.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
      const pb = b?.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
      if (pa !== pb) return pb - pa
      const ta = new Date(a?.createdAt || 0).getTime()
      const tb = new Date(b?.createdAt || 0).getTime()
      return tb - ta
    })
    const limit = Number.isFinite(Number(visibleLimit)) ? Math.max(3, Number(visibleLimit)) : 3
    return sorted.slice(0, limit)
  }, [courses, visibleLimit])

  const suggestedHasMore = useMemo(() => {
    return courses.length > suggestedCourses.length
  }, [courses.length, suggestedCourses.length])

  const isLoading = coursesState.status === 'loading'
  const error = coursesState.error

  function courseIsFree(c) {
    return Boolean(c?.isFree) || Number(c?.price || 0) <= 0
  }

  function enterCourseHref(courseId) {
    const cid = String(courseId || '')
    if (!cid) return '/'
    if (auth?.role === 'teacher') return `/teacher/courses/${cid}`
    if (auth?.role === 'team') return `/team/courses/${cid}`
    if (auth?.role === 'student') return `/student/courses/${cid}`
    return '/'
  }

  return (
    <SectionWrapper
      id="featured"
      title={titleNode}
      centerHeader
      titleClassName="text-center font-extrabold text-slate-900 dark:text-white text-4xl sm:text-5xl md:text-6xl tracking-tight"
      titleDecoration={
        <div className="flex justify-center">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="#069484" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      }
      subtitle={
        isRtl
          ? 'ريحنا دماغك وجمعنا لك كورسات على مزاجك، مختارة بحب وعناية كأننا بنعمل شوبينج لأحسن شوية كورسات تساعدك وتنميك! 🌟'
          : "We've picked some courses for you, carefully chosen to help you grow."
      }
      subtitleClassName="mt-2 text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-7"
      action={
        !auth?.token ? (
          <Button asChild variant="secondary" size="sm">
            <Link to="/login">{t('landing.featured.login')}</Link>
          </Button>
        ) : null
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center bg-white dark:bg-[#1a1a1a] p-8 border border-black/5 dark:border-white/10 rounded-3xl">
          <Spinner />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div>
          {suggestedCourses.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-10 text-center">
              <div className="flex justify-center items-center bg-[#F43F5E]/10 border border-[#F43F5E]/25 rounded-3xl w-16 h-16">
                <Inbox className="w-8 h-8 text-[#F43F5E]" />
              </div>
              <div className="mt-4 font-extrabold text-[#F43F5E] text-xl">
                {isRtl ? 'مفيش محتوى حالياً' : 'No content yet'}
              </div>
              <div className="mt-2 text-[#F43F5E]/85 text-sm leading-7">
                {isRtl ? 'سيتم اضافه كورسات قريباََ' : 'Courses will be added soon'}
              </div>
            </div>
          ) : (
            <div className="items-start gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
              {suggestedCourses.map((course) => (
              <div key={course?.id || course?.title}>
                {(() => {
                  const cid = String(course?.id || '')
                  const isMine = auth?.token && mineIds?.has(cid)
                  return (
                <CourseCard
                  course={course}
                  isRtl={isRtl}
                  ctaLabel={isMine ? (isRtl ? 'الدخول للكورس' : 'Enter course') : t('landing.featured.quickPreview')}
                  hideSubscribe={Boolean(isMine) || courseIsFree(course)}
                  onSubscribe={isMine || courseIsFree(course) ? undefined : () => navigate(`/student/checkout/${course?.id}`, { state: { course } })}
                  onOpen={() => {
                    if (!course?.id) return
                    if (isMine) {
                      navigate(enterCourseHref(course.id))
                      return
                    }
                    if (auth?.token && courseIsFree(course)) {
                      navigate(enterCourseHref(course.id))
                      return
                    }
                    navigate(`/courses/${course.id}/preview`)
                  }}
                />
                  )
                })()}
                {!auth?.token ? (
                  <div className="mt-3">
                    <Button asChild className="w-full">
                      <Link to="/login">{t('landing.featured.loginToView')}</Link>
                    </Button>
                  </div>
                ) : null}
              </div>
              ))}
            </div>
          )}

          {auth?.token ? (
            suggestedHasMore ? (
              <div className="flex justify-center mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setVisibleLimit((n) => (Number.isFinite(Number(n)) ? Number(n) + 9 : 12))}
                >
                  {isRtl ? 'عرض المزيد من الكورسات' : t('landing.featured.viewMore')}
                </Button>
              </div>
            ) : visibleLimit > 3 ? (
              <div className="flex justify-center mt-6">
                <Button variant="secondary" onClick={() => setVisibleLimit(3)}>
                  {isRtl ? 'عرض أقل' : 'Show less'}
                </Button>
              </div>
            ) : null
          ) : null}
        </div>
      ) : null}
    </SectionWrapper>
  )
}

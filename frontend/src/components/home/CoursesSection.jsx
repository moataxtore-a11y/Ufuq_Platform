import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../utils/api.js'
import Button from '../ui/Button.jsx'
import SectionWrapper from '../ui/SectionWrapper.jsx'
import Spinner from '../ui/Spinner.jsx'
import CourseCard from '../courses/CourseCard.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

function getCoursePath(role, courseId) {
  if (role === 'admin') return `/admin/courses/${courseId}`
  if (role === 'teacher') return `/teacher/courses/${courseId}`
  if (role === 'team') return `/team/courses/${courseId}`
  if (role === 'student') return `/student/courses/${courseId}`
  return `/login`
}

export default function CoursesSection() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { t, isRtl } = useLanguage()

  const [state, setState] = useState({ status: 'idle', items: [], error: '' })

  useEffect(() => {
    let alive = true

    async function run() {
      if (alive) setState({ status: 'loading', items: [], error: '' })
      try {
        const endpoint = auth?.user?.role === 'admin' ? '/courses' : '/courses/mine'
        const res = await api.get(endpoint)
        const items = Array.isArray(res.data) ? res.data : []
        if (alive) setState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || t('landing.courses.error_failed')
        if (alive) setState({ status: 'error', items: [], error: msg })
      }
    }

    run()
    return () => {
      alive = false
    }
  }, [auth?.token])

  const role = auth?.user?.role

  const subtitle = useMemo(() => {
    if (!auth?.token) return t('landing.courses.subtitle_signed_out')
    if (role === 'admin') return t('landing.courses.subtitle_admin', { defaultValue: isRtl ? 'إدارة الكورسات' : 'Manage Courses' })
    if (role === 'teacher') return t('landing.courses.subtitle_teacher')
    if (role === 'team') return t('landing.courses.subtitle_team')
    if (role === 'student') return t('landing.courses.subtitle_student')
    return t('landing.courses.title')
  }, [auth?.token, role, t])

  return (
    <SectionWrapper
      id="courses"
      centerHeader
      title={isRtl ? 'الكورسات المتاحة' : 'Available Courses'}
      titleClassName="text-center font-extrabold text-slate-900 dark:text-white text-4xl sm:text-5xl md:text-6xl tracking-tight"
      subtitle={subtitle}
      action={
        !auth?.token ? (
          <Button asChild variant="secondary" size="sm">
            <Link to="/login">{t('landing.courses.login')}</Link>
          </Button>
        ) : null
      }
    >
      {state.status === 'loading' ? (
        <div className="flex justify-center items-center bg-white dark:bg-[#1a1a1a] p-8 border border-black/5 dark:border-white/10 rounded-3xl">
          <Spinner />
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
          {state.error}
        </div>
      ) : null}

      {state.status !== 'loading' && auth?.token && state.status === 'success' && state.items.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
          {t('landing.courses.empty')}
        </div>
      ) : null}

      {state.status === 'success' && state.items.length > 0 ? (
        <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
          {state.items.map((course) => {
            const courseId = course?._id || course?.id
            return (
              <CourseCard
                key={courseId}
                course={course}
                badge={
                  role === 'admin'
                    ? (isRtl ? 'أدمن' : 'Admin')
                    : role === 'teacher'
                      ? t('landing.courses.badge_teacher')
                    : role === 'student'
                      ? t('landing.courses.badge_student')
                      : role === 'team'
                        ? t('landing.courses.badge_team')
                        : undefined
                }
                ctaLabel={t('landing.courses.cta_open')}
                onOpen={() => {
                  if (!courseId) return
                  navigate(getCoursePath(role, courseId))
                }}
              />
            )
          })}
        </div>
      ) : null}

      {!auth?.token ? (
        <div className="gap-4 grid md:grid-cols-2">
          <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
            {t('landing.courses.note_1')}
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
            {t('landing.courses.note_2')}
          </div>
        </div>
      ) : null}
    </SectionWrapper>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../utils/api.js'
import Spinner from '../../components/ui/Spinner.jsx'
import CourseCard from '../../components/courses/CourseCard.jsx'
import SiteLayout from '../../components/layout/SiteLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import xIcon from '../../cvg/X.svg'
import defaultProfileAvatar from '../../cvg/profile.svg'

export default function TeacherPublicPage() {
  const { teacherId } = useParams()
  const navigate = useNavigate()
  const { isRtl, t } = useLanguage()
  const { auth } = useAuth()

  const [teacherState, setTeacherState] = useState({ status: 'loading', item: null, error: '' })
  const [coursesState, setCoursesState] = useState({ status: 'loading', items: [], error: '' })
  const [mineIds, setMineIds] = useState(new Set())

  function courseIsFree(c) {
    return Boolean(c?.isFree) || Number(c?.price || 0) <= 0
  }

  useEffect(() => {
    let alive = true

    async function loadTeacher() {
      if (!alive) return
      setTeacherState({ status: 'loading', item: null, error: '' })
      try {
        const res = await api.get(`/teachers/${teacherId}`)
        if (alive) setTeacherState({ status: 'success', item: res.data, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Failed to load teacher'
        if (alive) setTeacherState({ status: 'error', item: null, error: msg })
      }
    }

    async function loadCourses() {
      if (!alive) return
      setCoursesState({ status: 'loading', items: [], error: '' })
      try {
        const res = await api.get(`/courses/teacher/${teacherId}`, { params: { limit: 50 } })
        const items = Array.isArray(res.data) ? res.data : []
        if (alive) setCoursesState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Failed to load courses'
        if (alive) setCoursesState({ status: 'error', items: [], error: msg })
      }
    }

    async function loadMine() {
      if (!alive) return
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

    loadTeacher()
    loadCourses()
    loadMine()
    return () => {
      alive = false
    }
  }, [teacherId, auth?.token])

  function enterCourseHref(courseId) {
    const cid = String(courseId || '')
    if (!cid) return '/'
    if (auth?.role === 'teacher') return `/teacher/courses/${cid}`
    if (auth?.role === 'team') return `/team/courses/${cid}`
    if (auth?.role === 'student') return `/student/courses/${cid}`
    return '/'
  }

  const teacherName = teacherState.item?.name || (isRtl ? 'المدرس' : 'Teacher')
  const teacherUpdatedAt = teacherState.item?.updatedAt ? new Date(teacherState.item.updatedAt).getTime() : 0
  const teacherAvatarRaw = teacherState.item?.avatarUrl || ''
  const teacherAvatar = teacherAvatarRaw && teacherUpdatedAt ? `${teacherAvatarRaw}${teacherAvatarRaw.includes('?') ? '&' : '?'}v=${teacherUpdatedAt}` : teacherAvatarRaw

  const header = useMemo(() => {
    if (teacherState.status === 'loading') {
      return (
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Spinner />
          {isRtl ? 'جاري تحميل بيانات المدرس...' : 'Loading teacher...'}
        </div>
      )
    }

    if (teacherState.status === 'error') {
      return <div className="text-slate-700 dark:text-slate-200 text-sm">{teacherState.error}</div>
    }

    if (teacherState.status === 'success') {
      return (
        <div className="gap-3 grid">
          <div className={
            'flex items-start justify-between gap-3 ' + (isRtl ? 'flex-row-reverse' : 'flex-row')
          }
          >
            <div />
            <Button variant="secondary" onClick={() => navigate('/')}>{isRtl ? 'العودة' : 'Back'}</Button>
          </div>

          <div className="text-center">
            <div className="flex justify-center">
              <div className="relative bg-[rgb(247,244,236)] dark:bg-[#202020] border border-black/5 dark:border-white/10 rounded-[16px] w-64 h-64 overflow-hidden">
                {teacherAvatar ? (
                  <img src={teacherAvatar} alt={teacherName} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.26),transparent_55%)]" />
                    <img src={defaultProfileAvatar} alt={teacherName} className="relative z-10 w-full h-full object-cover opacity-80" />
                  </>
                )}
              </div>
            </div>

            <h2 className="mt-3 font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
              {teacherName}
            </h2>

            <div className="flex justify-center mt-2">
              <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
                <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(212,175,55,0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            {teacherState.item?.bio ? (
              <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm leading-7">
                {teacherState.item.bio}
              </div>
            ) : null}
          </div>
        </div>
      )
    }

    return (
      <div className="gap-2 grid">
        <div className="flex justify-between items-center gap-3">
          <div className="font-extrabold text-slate-900 dark:text-white text-2xl sm:text-3xl">{teacherName}</div>
          <Button variant="secondary" onClick={() => navigate('/')}>{isRtl ? 'العودة' : 'Back'}</Button>
        </div>
        {teacherState.item?.bio ? <div className="text-slate-600 dark:text-slate-300 text-sm">{teacherState.item.bio}</div> : null}
      </div>
    )
  }, [isRtl, navigate, teacherName, teacherState.error, teacherState.item?.bio, teacherState.status])

  return (
    <SiteLayout>
      <div className="gap-5 grid" dir={isRtl ? 'rtl' : 'ltr'}>
        {header}

        {coursesState.status === 'loading' ? (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Spinner />
            {isRtl ? 'جاري تحميل الكورسات...' : 'Loading courses...'}
          </div>
        ) : null}

        {coursesState.status === 'error' ? (
          <div className="text-slate-700 dark:text-slate-200 text-sm">{coursesState.error}</div>
        ) : null}

        {coursesState.status === 'success' && coursesState.items.length === 0 ? (
          <div className="py-10">
            <div className={'flex items-center justify-center gap-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
              <img src={xIcon} alt="" className="w-9 h-9 shrink-0" />
              <div className="font-medium text-[18px] text-center" style={{ color: '#E11D48' }}>
                {isRtl ? 'سيتم اضافة المحتوى قريبًا' : 'Content will be added soon'}
              </div>
            </div>
          </div>
        ) : null}

        {coursesState.status === 'success' && coursesState.items.length > 0 ? (
          <div className="gap-8 grid">
            {coursesState.items.filter((c) => !(c?.courseType === 'individual' || c?.isIndividual)).length ? (
              <div>
                <div className={"font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white " + (isRtl ? 'text-right' : 'text-left')}>
                  {isRtl ? 'اشتراك شهري للمدرس' : 'Monthly subscription courses'}
                  <div className={"mt-2 flex " + (isRtl ? 'justify-end' : 'justify-start')}>
                    <div className="bg-amber-300/60 dark:bg-amber-200/60 w-28 h-px" />
                  </div>
                </div>

                <div className="items-start gap-4 grid sm:grid-cols-2 lg:grid-cols-3 mt-5">
                  {coursesState.items
                    .filter((c) => !(c?.courseType === 'individual' || c?.isIndividual))
                    .map((c) => (
                      <CourseCard
                        key={c?.id || c?.title}
                        course={c}
                        isRtl={isRtl}
                        badge={(Boolean(c?.isFree) || Number(c?.price || 0) <= 0) ? (isRtl ? 'الكورس مجاني!' : 'Free') : (isRtl ? 'مدفوع' : 'Paid')}
                        ctaLabel={mineIds.has(String(c?.id)) ? (isRtl ? 'الدخول للكورس' : 'Enter course') : (isRtl ? 'عرض المحاضرات' : 'Preview lectures')}
                        onOpen={() => {
                          if (mineIds.has(String(c?.id))) {
                            navigate(enterCourseHref(c.id))
                            return
                          }
                          if (auth?.token && courseIsFree(c)) {
                            navigate(enterCourseHref(c.id))
                            return
                          }
                          navigate(`/courses/${c.id}/preview`)
                        }}
                      />
                    ))}
                </div>
              </div>
            ) : null}

            {coursesState.items.filter((c) => c?.courseType === 'individual' || c?.isIndividual).length ? (
              <div>
                <div className={"font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white " + (isRtl ? 'text-right' : 'text-left')}>
                  {isRtl ? (
                    <>
                      كورسات منفردة <span className="text-brand">للمدرس</span>
                    </>
                  ) : (
                    <>
                      Individual <span className="text-brand">Teacher</span> Courses
                    </>
                  )}
                  <div className={"mt-2 flex " + (isRtl ? 'justify-end' : 'justify-start')}>
                    <div className="bg-amber-300/80 dark:bg-amber-200/80 w-28 h-px" />
                  </div>
                </div>

                <div className="items-start gap-4 grid sm:grid-cols-2 lg:grid-cols-3 mt-5">
                  {coursesState.items
                    .filter((c) => c?.courseType === 'individual' || c?.isIndividual)
                    .map((c) => (
                      <CourseCard
                        key={c?.id || c?.title}
                        course={c}
                        isRtl={isRtl}
                        badge={isRtl ? 'كورس منفرد' : 'Individual'}
                        ctaLabel={mineIds.has(String(c?.id)) ? (isRtl ? 'الدخول للكورس' : 'Enter course') : (isRtl ? 'عرض المحاضرات' : 'Preview lectures')}
                        onOpen={() => {
                          if (mineIds.has(String(c?.id))) {
                            navigate(enterCourseHref(c.id))
                            return
                          }
                          if (auth?.token && courseIsFree(c)) {
                            navigate(enterCourseHref(c.id))
                            return
                          }
                          navigate(`/courses/${c.id}/preview`)
                        }}
                      />
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!auth?.token ? (
          <div className="text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? (
              <>
                لديك حساب؟ <Link to="/login" className="text-brand underline">سجل الدخول</Link>
              </>
            ) : (
              <>
                Have an account? <Link to="/login" className="text-brand underline">Login</Link>
              </>
            )}
          </div>
        ) : null}
      </div>
    </SiteLayout>
  )
}

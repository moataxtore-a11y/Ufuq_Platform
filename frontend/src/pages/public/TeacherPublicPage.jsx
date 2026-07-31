import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../utils/api.js'
import Spinner from '../../components/ui/Spinner.jsx'
import CourseCard from '../../components/courses/CourseCard.jsx'
import SiteLayout from '../../components/layout/SiteLayout.jsx'
import { TeacherPortraitCard } from '../../components/teachers/TeacherCard.jsx'
import Button from '../../components/ui/Button.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import xIcon from '../../cvg/X.svg'

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
        <div className="gap-4 sm:gap-6 grid w-full">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl truncate">
              {teacherName}
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/')} className="shrink-0">
              {isRtl ? 'العودة' : 'Back'}
            </Button>
          </div>

          <div className="mx-auto w-full max-w-[480px] text-center px-2">
            <TeacherPortraitCard
              teacher={teacherState.item}
              className="w-full max-w-full sm:max-w-[460px] min-h-[340px] sm:min-h-[440px]"
            />
            {teacherState.item?.bio ? (
              <div className="mx-auto mt-4 sm:mt-5 max-w-2xl text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-6 sm:leading-7 px-2">
                {teacherState.item.bio}
              </div>
            ) : null}
          </div>
        </div>
      )
    }

    return (
      <div className="gap-3 grid w-full">
        <div className="flex justify-between items-center gap-3 w-full">
          <div className="font-extrabold text-slate-900 dark:text-white text-xl sm:text-3xl truncate">{teacherName}</div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/')} className="shrink-0">{isRtl ? 'العودة' : 'Back'}</Button>
        </div>
        {teacherState.item?.bio ? <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">{teacherState.item.bio}</div> : null}
      </div>
    )
  }, [isRtl, navigate, teacherName, teacherState.error, teacherState.item, teacherState.item?.bio, teacherState.status])

  return (
    <SiteLayout>
      <div className="mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full max-w-7xl gap-6 sm:gap-8 grid" dir={isRtl ? 'rtl' : 'ltr'}>
        {header}

        {coursesState.status === 'loading' ? (
          <div className="flex justify-center items-center gap-2 py-8 text-slate-700 dark:text-slate-200">
            <Spinner />
            {isRtl ? 'جاري تحميل الكورسات...' : 'Loading courses...'}
          </div>
        ) : null}

        {coursesState.status === 'error' ? (
          <div className="bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-800/40 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center">
            {coursesState.error}
          </div>
        ) : null}

        {coursesState.status === 'success' && coursesState.items.length === 0 ? (
          <div className="py-12 bg-white/50 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-3xl">
            <div className={'flex flex-col sm:flex-row items-center justify-center gap-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
              <img src={xIcon} alt="" className="w-10 h-10 shrink-0" />
              <div className="font-semibold text-lg sm:text-xl text-center text-rose-600 dark:text-rose-400">
                {isRtl ? 'سيتم إضافة المحتوى قريبًا' : 'Content will be added soon'}
              </div>
            </div>
          </div>
        ) : null}

        {coursesState.status === 'success' && coursesState.items.length > 0 ? (
          <div className="gap-8 sm:gap-10 grid w-full">
            {coursesState.items.filter((c) => !(c?.courseType === 'individual' || c?.isIndividual)).length ? (
              <div className="w-full">
                <div className={"font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white " + (isRtl ? 'text-right' : 'text-left')}>
                  {isRtl ? 'اشتراك شهري للمدرس' : 'Monthly subscription courses'}
                  <div className={"mt-2 flex " + (isRtl ? 'justify-end' : 'justify-start')}>
                    <div className="bg-brand w-24 sm:w-32 h-1 rounded-full opacity-70" />
                  </div>
                </div>

                <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-6 w-full items-stretch">
                  {coursesState.items
                    .filter((c) => !(c?.courseType === 'individual' || c?.isIndividual))
                    .map((c) => (
                      <div key={c?.id || c?.title} className="w-full flex">
                        <CourseCard
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
                      </div>
                    ))}
                </div>
              </div>
            ) : null}

            {coursesState.items.filter((c) => c?.courseType === 'individual' || c?.isIndividual).length ? (
              <div className="w-full">
                <div className={"font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white " + (isRtl ? 'text-right' : 'text-left')}>
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
                    <div className="bg-brand w-24 sm:w-32 h-1 rounded-full opacity-70" />
                  </div>
                </div>

                <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-6 w-full items-stretch">
                  {coursesState.items
                    .filter((c) => c?.courseType === 'individual' || c?.isIndividual)
                    .map((c) => (
                      <div key={c?.id || c?.title} className="w-full flex">
                        <CourseCard
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
                      </div>
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

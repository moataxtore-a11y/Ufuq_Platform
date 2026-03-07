import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { api } from '../../utils/api.js'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import CourseCard from '../../components/courses/CourseCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import defaultProfileAvatar from '../../cvg/profile.svg'

export default function StudentLandingPage() {
  const navigate = useNavigate()
  const { isRtl } = useLanguage()
  const { auth } = useAuth()

  const [suggestedLimit, setSuggestedLimit] = useState(3)

  const [myCoursesState, setMyCoursesState] = useState({ status: 'loading', items: [], error: '' })
  const [publicCoursesState, setPublicCoursesState] = useState({ status: 'loading', items: [], error: '' })
  const [teachersState, setTeachersState] = useState({ status: 'loading', items: [], error: '' })

  useEffect(() => {
    let alive = true

    async function loadMyCourses() {
      if (!alive) return
      setMyCoursesState({ status: 'loading', items: [], error: '' })
      try {
        const res = await api.get('/courses/mine')
        const items = Array.isArray(res.data) ? res.data : []
        if (alive) setMyCoursesState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || (isRtl ? 'فشل تحميل الكورسات' : 'Failed to load courses')
        if (alive) setMyCoursesState({ status: 'error', items: [], error: msg })
      }
    }

    async function loadPublicCourses() {
      if (!alive) return
      setPublicCoursesState({ status: 'loading', items: [], error: '' })
      try {
        const res = await api.get('/courses?limit=48')
        const items = Array.isArray(res.data) ? res.data : []
        if (alive) setPublicCoursesState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || (isRtl ? 'فشل تحميل الكورسات' : 'Failed to load courses')
        if (alive) setPublicCoursesState({ status: 'error', items: [], error: msg })
      }
    }

    async function loadTeachers() {
      if (!alive) return
      setTeachersState({ status: 'loading', items: [], error: '' })
      try {
        const res = await api.get('/teachers?limit=12')
        const items = Array.isArray(res.data) ? res.data : []
        if (alive) setTeachersState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || (isRtl ? 'فشل تحميل المدرسين' : 'Failed to load teachers')
        if (alive) setTeachersState({ status: 'error', items: [], error: msg })
      }
    }

    loadMyCourses()
    loadPublicCourses()
    loadTeachers()
    return () => {
      alive = false
    }
  }, [isRtl])

  const myCourses = useMemo(() => {
    const list = Array.isArray(myCoursesState.items) ? myCoursesState.items : []
    return list
  }, [myCoursesState.items])

  const teacherIdsFromMyCourses = useMemo(() => {
    const out = new Set()
    for (const c of myCourses) {
      const tid = c?.teacher?._id || c?.teacher
      if (tid) out.add(String(tid))
    }
    return Array.from(out)
  }, [myCourses])

  const myTeachers = useMemo(() => {
    const list = Array.isArray(teachersState.items) ? teachersState.items : []
    const idSet = new Set(teacherIdsFromMyCourses)
    return list.filter((t) => idSet.has(String(t?.id)))
  }, [teacherIdsFromMyCourses, teachersState.items])

  const myCourseIdSet = useMemo(() => {
    const s = new Set()
    for (const c of myCourses || []) s.add(String(c?._id || c?.id))
    return s
  }, [myCourses])

  const suggestedCourses = useMemo(() => {
    const list = Array.isArray(publicCoursesState.items) ? publicCoursesState.items : []
    const sorted = [...list].sort((a, b) => {
      const ta = new Date(a?.createdAt || 0).getTime()
      const tb = new Date(b?.createdAt || 0).getTime()
      return tb - ta
    })
    const limit = Number.isFinite(Number(suggestedLimit)) ? Math.max(3, Number(suggestedLimit)) : 3
    return sorted.slice(0, limit)
  }, [publicCoursesState.items, myCourseIdSet, suggestedLimit])

  const suggestedHasMore = useMemo(() => {
    const list = Array.isArray(publicCoursesState.items) ? publicCoursesState.items : []
    return list.length > suggestedCourses.length
  }, [publicCoursesState.items, suggestedCourses.length])

  const suggestedMine = useMemo(() => {
    return (suggestedCourses || []).filter((c) => myCourseIdSet.has(String(c?._id || c?.id)))
  }, [suggestedCourses, myCourseIdSet])

  const suggestedNotMine = useMemo(() => {
    return (suggestedCourses || []).filter((c) => !myCourseIdSet.has(String(c?._id || c?.id)))
  }, [suggestedCourses, myCourseIdSet])

  const previewTeachers = useMemo(() => {
    const list = Array.isArray(teachersState.items) ? teachersState.items : []
    return list
  }, [teachersState.items])

  function coursePriceLabel(c) {
    const price = Number(c?.price || 0)
    if (!Number.isFinite(price) || price <= 0) return isRtl ? 'مجاني' : 'Free'
    return isRtl ? `السعر: ${price}` : `Price: ${price}`
  }

  function courseIsFree(c) {
    return Boolean(c?.isFree) || Number(c?.price || 0) <= 0
  }

  return (
    <div>
      <div className={'flex items-center justify-center gap-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
        <div className={(isRtl ? 'text-right' : 'text-left') + ' flex flex-col items-center'}>
          <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
            <span className="bg-emerald-500 rounded-full w-1.5 h-1.5" />
            {isRtl ? 'مساحة الطالب' : 'Student workspace'}
          </div>
          <div className="mt-3 text-center">
            <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl sm:text-5xl leading-[1.1]">
              {isRtl ? (
                <>
                  <span className="font-perfect text-[rgb(212_175_55/var(--tw-text-opacity,1))]">كورساتك</span>
                </>
              ) : (
                <>
                  <span className="font-perfect text-[rgb(212_175_55/var(--tw-text-opacity,1))]">Your Courses</span>
                </>
              )}
            </h1>
            <svg
              className="mx-auto mt-2 w-full max-w-[520px] h-4"
              viewBox="0 0 520 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 20 C 130 6, 390 6, 510 20"
                stroke="#E0B300"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm text-center">
            {isRtl ? 'هتلاقي كل كورساتك هنا و كل كورسات مدرسينك و كل المدرسين المتاحين على المنصة💛' : 'You will find all your courses here, all your teachers courses, and all the teachers available on the platform.💛'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-xl">{isRtl ? 'الكورسات اللي أنت مشترك فيها' : 'My enrolled courses'}</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
            {/* {isRtl ? 'الكورسات اللي أنت مشترك فيها.' : "Courses you're enrolled in."} */}
          </p>
        </div>

        {myCoursesState.status === 'loading' ? (
          <div className="flex justify-center items-center bg-white dark:bg-[#1a1a1a] p-8 border border-black/5 dark:border-white/10 rounded-3xl">
            <Spinner />
          </div>
        ) : null}

        {myCoursesState.status === 'error' ? (
          <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
            {myCoursesState.error}
          </div>
        ) : null}

        {myCoursesState.status === 'success' && myCourses.length === 0 ? (
          <div className="flex flex-col justify-center items-center px-6 py-10 min-h-[240px] text-center">
            <div className="flex justify-center items-center bg-[#F43F5E]/10 rounded-2xl w-16 h-16 text-[#F43F5E]">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="mt-4 font-extrabold text-[#F43F5E] text-2xl">{isRtl ? 'لا توجد كورسات بعد..' : 'No courses yet'}</div>
            <div className="mt-1 text-[#F43F5E]/80 text-base">{isRtl ? 'سيتم اضافه كورسات قريباََ' : 'Courses will be added soon'}</div>
          </div>
        ) : null}

        {myCoursesState.status === 'success' && myCourses.length > 0 ? (
          <div className="items-start gap-4 grid md:grid-cols-3">
            {myCourses.map((c) => (
              <CourseCard
                key={c?._id || c?.id}
                course={c}
                isRtl={isRtl}
                ctaLabel={isRtl ? 'الدخول للكورس' : 'Enter course'}
                hideSubscribe
                meta={coursePriceLabel(c)}
                onOpen={() => navigate(`/student/courses/${c?._id || c?.id}`)}
                onSubscribe={() => navigate(`/student/checkout/${c?._id || c?.id}`, { state: { course: c } })}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-10">
        <div className="text-center">
          <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
            {isRtl ? 'كورسات مقترحة' : 'Suggested courses'}
          </h2>
          <div className="flex justify-center mt-2">
            <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
              <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(212,175,55,0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-2 text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-7">
            {isRtl
              ? 'ريحنا دماغك وجمعنا لك كورسات على مزاجك، مختارة بحب وعناية كأننا بنعمل شوبينج لأحسن شوية كورسات تساعدك وتنميك! 🌟'
              : "We've picked some courses for you, carefully chosen to help you grow."}
          </p>
        </div>

        {publicCoursesState.status === 'loading' ? (
          <div className="flex justify-center items-center bg-white dark:bg-[#1a1a1a] mt-4 p-8 border border-black/5 dark:border-white/10 rounded-3xl">
            <Spinner />
          </div>
        ) : null}

        {publicCoursesState.status === 'error' ? (
          <div className="bg-white dark:bg-[#1a1a1a] mt-4 p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
            {publicCoursesState.error}
          </div>
        ) : null}

        {publicCoursesState.status === 'success' && suggestedCourses.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1a1a] mt-4 p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
            {isRtl ? 'لا يوجد كورسات مقترحة حالياً.' : 'No suggested courses right now.'}
          </div>
        ) : null}

        {publicCoursesState.status === 'success' && suggestedCourses.length > 0 ? (
          <div className="mt-4">
            <div className="items-start gap-4 grid md:grid-cols-3">
              {suggestedCourses.map((c) => {
                const cid = c?.id || c?._id
                const isMine = suggestedMine.some((x) => String(x?.id || x?._id) === String(cid))
                const free = courseIsFree(c)
                return (
                  <CourseCard
                    key={c?.id || c?._id || c?.title}
                    course={c}
                    isRtl={isRtl}
                    badge={isRtl ? 'كورس' : 'Course'}
                    ctaLabel={isMine || free ? (isRtl ? 'دخول الكورس' : 'Enter course') : (isRtl ? 'الدخول للكورس' : 'Subscribe')}
                    hideSubscribe={Boolean(isMine) || free}
                    meta={coursePriceLabel(c)}
                    footerText={isMine || free ? (isRtl ? 'افتح الكورس' : 'Open course') : (isRtl ? 'افتح صفحة المعاينة' : 'Open preview page')}
                    onOpen={() => {
                      if (isMine || free) {
                        navigate(`/student/courses/${cid}`)
                        return
                      }
                      navigate(`/courses/${cid}/preview`)
                    }}
                    onSubscribe={() => {
                      if (free) {
                        navigate(`/student/courses/${cid}`)
                        return
                      }
                      navigate(`/student/checkout/${cid}`, { state: { course: c } })
                    }}
                  />
                )
              })}
            </div>

            {suggestedHasMore ? (
              <div className="flex justify-center mt-5">
                <Button
                  variant="secondary"
                  onClick={() => setSuggestedLimit((n) => (Number.isFinite(Number(n)) ? Number(n) + 9 : 12))}
                >
                  {isRtl ? 'عرض المزيد من الكورسات' : 'View more courses'}
                </Button>
              </div>
            ) : suggestedLimit > 3 ? (
              <div className="flex justify-center mt-5">
                <Button variant="secondary" onClick={() => setSuggestedLimit(3)}>
                  {isRtl ? 'عرض أقل' : 'Show less'}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-10">
        <div className="text-center">
          <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
            {isRtl ? 'المدرسين' : 'Teachers'}
          </h2>
          <div className="flex justify-center mt-2">
            <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
              <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(212,175,55,0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'اضغط على مدرس لعرض كورساته.' : 'Click a teacher to view their courses.'}
          </p>
        </div>

        {teachersState.status === 'loading' ? (
          <div className="flex justify-center items-center bg-white dark:bg-[#1a1a1a] mt-4 p-8 border border-black/5 dark:border-white/10 rounded-3xl">
            <Spinner />
          </div>
        ) : null}

        {teachersState.status === 'error' ? (
          <div className="bg-white dark:bg-[#1a1a1a] mt-4 p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
            {teachersState.error}
          </div>
        ) : null}

        {teachersState.status === 'success' && previewTeachers.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1a1a] mt-4 p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
            {isRtl ? 'لا يوجد مدرسين بعد.' : 'No teachers yet.'}
          </div>
        ) : null}

        {teachersState.status === 'success' && previewTeachers.length > 0 ? (
          <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {previewTeachers.map((t) => (
              <button
                key={t?.id}
                type="button"
                onClick={() => navigate(`/student/teachers/${t?.id}`)}
                className="group bg-[rgb(247,244,236)] hover:bg-[rgb(243,238,227)] dark:bg-[#1a1a1a] dark:hover:bg-[#202020] shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.10)] p-4 sm:p-5 border border-black/5 dark:border-white/10 rounded-[22px] sm:rounded-[28px] transition-all hover:-translate-y-0.5 duration-200"
              >
                <div className="gap-3 sm:gap-4 grid" dir={isRtl ? 'rtl' : 'ltr'}>
                  <div className="flex justify-center items-center bg-white/70 dark:bg-white/[0.06] border border-black/5 dark:border-white/10 rounded-2xl sm:rounded-3xl w-full aspect-square overflow-hidden">
                    {t?.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={t?.name || 'Teacher'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative flex justify-center items-center w-full h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.26),transparent_55%)]" />
                        <img src={defaultProfileAvatar} alt={t?.name || 'Teacher'} className="relative z-10 w-full h-full object-cover opacity-80" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="font-extrabold text-slate-900 dark:text-white text-xl sm:text-2xl truncate">{t?.name}</div>
                    <div className="mt-1 sm:mt-2 font-semibold text-slate-700 dark:text-white/90 text-base sm:text-lg truncate">
                      {t?.teachingSubject || t?.title || (isRtl ? 'أستاذ على المنصة' : 'Teacher on the platform')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

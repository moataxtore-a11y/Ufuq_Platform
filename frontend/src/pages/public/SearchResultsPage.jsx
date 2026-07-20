import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SiteLayout from '../../components/layout/SiteLayout.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { api } from '../../utils/api.js'
import Spinner from '../../components/ui/Spinner.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import CourseCard from '../../components/courses/CourseCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import TeacherCard from '../../components/teachers/TeacherCard.jsx'

export default function SearchResultsPage() {
  const navigate = useNavigate()
  const { isRtl } = useLanguage()
  const { auth } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const q = useMemo(() => String(searchParams.get('q') || '').trim(), [searchParams])

  const [queryDraft, setQueryDraft] = useState(q)
  const [state, setState] = useState({ status: 'idle', items: [], error: '' })
  const [teachersState, setTeachersState] = useState({ status: 'idle', items: [], error: '' })
  const [subjectsState, setSubjectsState] = useState({ status: 'idle', items: [], error: '' })
  const [mineIds, setMineIds] = useState(() => new Set())

  useEffect(() => {
    setQueryDraft(q)
  }, [q])

  useEffect(() => {
    let alive = true

    async function load() {
      const keyword = String(q || '').trim()
      if (!keyword) {
        if (alive) setState({ status: 'idle', items: [], error: '' })
        return
      }

      try {
        if (!alive) return
        setState({ status: 'loading', items: [], error: '' })
        const res = await api.get('/courses', { params: { q: keyword, limit: 24 } })
        const items = Array.isArray(res?.data) ? res.data : []
        if (!alive) return
        setState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || (isRtl ? 'فشل البحث' : 'Search failed')
        if (!alive) return
        setState({ status: 'error', items: [], error: msg })
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [isRtl, q])

  useEffect(() => {
    let alive = true

    function includesQ(value, keyword) {
      return String(value || '').toLowerCase().includes(String(keyword || '').toLowerCase())
    }

    async function loadTeachersAndSubjects() {
      const keyword = String(q || '').trim()
      if (!keyword) {
        if (alive) {
          setTeachersState({ status: 'idle', items: [], error: '' })
          setSubjectsState({ status: 'idle', items: [], error: '' })
        }
        return
      }

      if (alive) {
        setTeachersState({ status: 'loading', items: [], error: '' })
        setSubjectsState({ status: 'loading', items: [], error: '' })
      }

      try {
        const [teachersRes, subjectsRes] = await Promise.all([
          api.get('/teachers', { params: { limit: 60 } }),
          api.get('/subjects')
        ])

        const teachersRaw = Array.isArray(teachersRes?.data) ? teachersRes.data : []
        const filteredTeachers = teachersRaw
          .filter((t) => includesQ(t?.name, keyword) || includesQ(t?.teachingSubject, keyword) || includesQ(t?.bio, keyword))
          .slice(0, 12)

        const subjectsRaw = Array.isArray(subjectsRes?.data) ? subjectsRes.data : []
        const filteredSubjects = subjectsRaw
          .filter((s) => includesQ(s?.subject, keyword))
          .slice(0, 12)

        if (!alive) return
        setTeachersState({ status: 'success', items: filteredTeachers, error: '' })
        setSubjectsState({ status: 'success', items: filteredSubjects, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || (isRtl ? 'فشل البحث' : 'Search failed')
        if (!alive) return
        setTeachersState({ status: 'error', items: [], error: msg })
        setSubjectsState({ status: 'error', items: [], error: msg })
      }
    }

    loadTeachersAndSubjects()
    return () => {
      alive = false
    }
  }, [isRtl, q])

  const staticLinks = useMemo(() => {
    const base = [
      { key: 'login', labelAr: 'سجل دخولك', labelEn: 'Login', href: '/login' },
      { key: 'register', labelAr: 'اعمل حساب جديد', labelEn: 'Create account', href: '/register' },
      { key: 'join_teachers', labelAr: 'انضم للمدرسين', labelEn: 'Join teachers', href: '/join-teachers' },
      { key: 'subjects', labelAr: 'المواد', labelEn: 'Subjects', href: '/#subjects' }
    ]

    const keyword = String(q || '').trim().toLowerCase()
    if (!keyword) return []
    return base.filter((it) => {
      const label = (isRtl ? it.labelAr : it.labelEn) || ''
      return String(label).toLowerCase().includes(keyword)
    })
  }, [isRtl, q])

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

  function courseIsFree(c) {
    return Boolean(c?.isFree) || Number(c?.price || 0) <= 0
  }

  function enterCourseHref(courseId) {
    const cid = String(courseId || '')
    if (!cid) return '/'
    if (auth?.role === 'teacher') return `/teacher/courses/${cid}`
    if (auth?.role === 'team') return `/team/courses/${cid}`
    if (auth?.role === 'student') return `/student/courses/${cid}`
    if (auth?.role === 'admin') return `/courses/${cid}/preview`
    return `/courses/${cid}/preview`
  }

  function coursePriceLabel(c) {
    const price = Number(c?.price || 0)
    if (!Number.isFinite(price) || price <= 0 || Boolean(c?.isFree)) return isRtl ? 'الكورس مجاني!' : 'Free'
    return isRtl ? `السعر: ${price}` : `Price: ${price}`
  }

  function submit(nextQ) {
    const keyword = String(nextQ || '').trim()
    setSearchParams(keyword ? { q: keyword } : {}, { replace: true })
  }

  return (
    <SiteLayout>
      <div className="relative" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="-top-28 -left-28 absolute bg-brand/20 blur-3xl rounded-full w-80 h-80" />
          <div className="-right-28 -bottom-28 absolute bg-brand/10 blur-3xl rounded-full w-80 h-80" />
        </div>

        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 max-w-7xl">
          <div className="gap-5 grid">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <div className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl">
                {isRtl ? 'نتائج البحث' : 'Search results'}
              </div>
              <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
                {q ? (isRtl ? `الكلمة: ${q}` : `Keyword: ${q}`) : (isRtl ? 'اكتب كلمة للبحث.' : 'Type a keyword to search.')}
              </div>
            </div>

            <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur px-4 sm:px-5 py-4 border border-black/5 dark:border-white/10 rounded-3xl">
              <form
                className={"flex gap-2 items-stretch " + (isRtl ? 'flex-row' : 'flex-row-reverse')}
                onSubmit={(e) => {
                  e.preventDefault()
                  submit(queryDraft)
                }}
              >
                <Input
                  value={queryDraft}
                  onChange={(e) => setQueryDraft(e.target.value)}
                  placeholder={isRtl ? 'ابحث عن كورس أو مدرس أو مادة...' : 'Search courses, teachers, subjects...'}
                  className="border-transparent hover:border-black/10 !focus-visible:border-transparent dark:hover:border-white/10 rounded-2xl outline-none focus-visible:outline-none focus:outline-none !focus-visible:ring-0 !focus-visible:ring-offset-0 h-12"
                />
                <Button type="submit" className="bg-brand hover:brightness-95 px-7 rounded-2xl h-12 text-white">
                  {isRtl ? 'بحث' : 'Search'}
                </Button>
              </form>

              {state.status === 'loading' ? (
                <div className={"flex items-center gap-2 mt-4 " + (isRtl ? 'justify-start' : 'justify-end') + " text-slate-700 dark:text-slate-200"}>
                  <Spinner />
                  {isRtl ? 'جاري البحث...' : 'Searching...'}
                </div>
              ) : null}

              {state.status === 'error' ? (
                <div className="mt-4 text-rose-700 dark:text-rose-300 text-sm">{state.error}</div>
              ) : null}
            </div>

            <div className="bg-white/60 dark:bg-[#121212]/70 backdrop-blur px-4 sm:px-5 py-5 border border-black/5 dark:border-white/10 rounded-3xl">
              <div className="gap-8 grid">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-lg">
                    {isRtl ? 'الكورسات' : 'Courses'}
                  </div>
                  <div className="mt-3">
                    {state.status === 'success' && state.items.length === 0 ? (
                      <div className="text-slate-700 dark:text-slate-200 text-sm">
                        {isRtl ? 'لا توجد كورسات مطابقة.' : 'No matching courses.'}
                      </div>
                    ) : null}

                    {state.status === 'success' && state.items.length > 0 ? (
                      <div className="columns-1 sm:columns-2 lg:columns-3 [column-gap:16px]">
                        {state.items.map((c) => (
                          <div key={c?.id || c?._id || c?.title} className="mb-4 break-inside-avoid">
                            <CourseCard
                              course={c}
                              isRtl={isRtl}
                              badge={(() => {
                                const cid = String(c?.id || c?._id || '')
                                const isMine = mineIds.has(cid)
                                const free = courseIsFree(c)
                                return isMine || free ? (isRtl ? 'كورس' : 'Course') : (isRtl ? 'مقفول' : 'Locked')
                              })()}
                              ctaLabel={(() => {
                                const cid = String(c?.id || c?._id || '')
                                const isMine = mineIds.has(cid)
                                const free = courseIsFree(c)
                                return isMine || free ? (isRtl ? 'دخول الكورس' : 'Enter course') : (isRtl ? 'معاينة' : 'Preview')
                              })()}
                              hideSubscribe={(() => {
                                const cid = String(c?.id || c?._id || '')
                                const isMine = mineIds.has(cid)
                                const free = courseIsFree(c)
                                return Boolean(isMine) || free || auth?.role !== 'student'
                              })()}
                              meta={coursePriceLabel(c)}
                              onSubscribe={
                                auth?.role === 'student'
                                  ? () => {
                                      const cid = c?.id || c?._id
                                      if (!cid) return
                                      navigate(`/student/checkout/${cid}`, { state: { course: c } })
                                    }
                                  : undefined
                              }
                              onOpen={() => {
                                const cid = c?.id || c?._id
                                if (!cid) return
                                const isMine = mineIds.has(String(cid))
                                const free = courseIsFree(c)
                                if (auth?.token && (isMine || free)) {
                                  navigate(enterCourseHref(cid))
                                  return
                                }
                                navigate(`/courses/${cid}/preview`)
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-lg">
                    {isRtl ? 'المدرسين' : 'Teachers'}
                  </div>
                  <div className="mt-3">
                    {teachersState.status === 'success' && teachersState.items.length === 0 ? (
                      <div className="text-slate-700 dark:text-slate-200 text-sm">
                        {isRtl ? 'لا توجد نتائج للمدرسين.' : 'No matching teachers.'}
                      </div>
                    ) : null}

                    {teachersState.status === 'success' && teachersState.items.length > 0 ? (
                      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
                        {teachersState.items.map((tt) => (
                          <button
                            key={tt?.id || tt?._id || tt?.name}
                            type="button"
                            className="w-full"
                            onClick={() => {
                              const tid = tt?.id || tt?._id
                              if (tid) navigate(`/teachers/${tid}`)
                            }}
                          >
                            <TeacherCard teacher={tt} />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-lg">
                    {isRtl ? 'المواد' : 'Subjects'}
                  </div>
                  <div className="mt-3">
                    {subjectsState.status === 'success' && subjectsState.items.length === 0 ? (
                      <div className="text-slate-700 dark:text-slate-200 text-sm">
                        {isRtl ? 'لا توجد مواد مطابقة.' : 'No matching subjects.'}
                      </div>
                    ) : null}

                    {subjectsState.status === 'success' && subjectsState.items.length > 0 ? (
                      <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-3">
                        {subjectsState.items.map((s) => (
                          <button
                            key={s?.subject}
                            type="button"
                            onClick={() => {
                              const subj = s?.subject || ''
                              if (!subj) return
                              navigate(`/subjects/${encodeURIComponent(subj)}`)
                            }}
                            className="bg-white/70 hover:bg-white/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.08] px-4 py-4 border border-black/5 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white transition"
                          >
                            <div className="font-extrabold text-base">{s?.subject || ''}</div>
                            <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
                              {(typeof s?.teacherCount === 'number' ? s.teacherCount : 0) + (isRtl ? ' مدرس' : ' teachers')}
                              {' · '}
                              {(typeof s?.courseCount === 'number' ? s.courseCount : 0) + (isRtl ? ' كورس' : ' courses')}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-lg">
                    {isRtl ? 'روابط سريعة' : 'Quick links'}
                  </div>
                  <div className="mt-3">
                    {staticLinks.length === 0 ? (
                      <div className="text-slate-700 dark:text-slate-200 text-sm">
                        {isRtl ? 'لا توجد روابط مطابقة.' : 'No matching links.'}
                      </div>
                    ) : (
                      <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-4">
                        {staticLinks.map((it) => (
                          <button
                            key={it.key}
                            type="button"
                            onClick={() => navigate(it.href)}
                            className="bg-brand/10 hover:bg-brand/20 dark:bg-[#202020] dark:hover:bg-white/[0.08] px-4 py-4 border border-brand/20 dark:border-white/10 rounded-2xl font-semibold text-slate-900 dark:text-slate-100 transition"
                          >
                            {isRtl ? it.labelAr : it.labelEn}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

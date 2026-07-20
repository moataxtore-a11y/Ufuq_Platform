import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle, Inbox, LayoutDashboard, ListChecks, Users } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { GlassCard } from '../../components/ui/Glass.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import CourseCard from '../../components/courses/CourseCard.jsx'
import { api } from '../../utils/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

function ActionCard({ title, desc, Icon, to }) {
  const { isRtl } = useLanguage()

  return (
    <Link
      to={to}
      className={
        'group bg-white dark:bg-[#1a1a1a] shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] dark:shadow-none p-5 border border-black/5 dark:border-white/10 rounded-3xl transition-all hover:-translate-y-0.5 duration-200 ' +
        (isRtl ? 'text-right' : 'text-left')
      }
    >
      <div className={'flex items-start gap-3 ' + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
        <div className="flex justify-center items-center bg-[rgb(247,244,236)] dark:bg-[#202020] border border-black/5 dark:border-white/10 rounded-2xl w-11 h-11 text-slate-700 dark:text-slate-200">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{title}</div>
          <div className="mt-1 text-slate-600 dark:text-slate-300 text-xs leading-5">{desc}</div>
        </div>
      </div>
    </Link>
  )
}

export default function TeamLandingPage() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { isRtl, t } = useLanguage()

  const [coursesState, setCoursesState] = useState({ status: 'loading', items: [], error: '' })

  useEffect(() => {
    let alive = true

    async function loadCourses() {
      if (!alive) return
      setCoursesState({ status: 'loading', items: [], error: '' })
      try {
        const res = await api.get('/courses/mine')
        const items = Array.isArray(res.data) ? res.data : []
        if (alive) setCoursesState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || (isRtl ? 'فشل تحميل الكورسات' : 'Failed to load courses')
        if (alive) setCoursesState({ status: 'error', items: [], error: msg })
      }
    }

    loadCourses()
    return () => {
      alive = false
    }
  }, [isRtl])

  const previewCourses = useMemo(() => {
    const list = Array.isArray(coursesState.items) ? coursesState.items : []
    return list.slice(0, 6)
  }, [coursesState.items])

  return (
    <div>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
            <span className="bg-emerald-500 rounded-full w-1.5 h-1.5" />
            {isRtl ? 'مساحة الفريق' : 'Team workspace'}
            <span className="text-slate-500 dark:text-slate-400">{auth?.teamId || '-'}</span>
          </div>
          <div className="mt-3 text-center">
            <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl sm:text-5xl leading-[1.1]">
              <span className="font-perfect text-slate-900 dark:text-white">{isRtl ? 'الرئيسية' : 'Home'}</span>
            </h1>
            <svg className="mx-auto mt-2 w-full max-w-[520px] h-4" viewBox="0 0 520 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M10 20 C 130 6, 390 6, 510 20" stroke="#069484" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'ابدأ بالكورسات أولًا، وبعدها باقي أدوات الإدارة منظمة بالأسفل.' : 'Start with courses first, then find the rest of your tools organized below.'}
          </p>
        </div>

        <div className={"flex flex-wrap items-center justify-center gap-2 " + (isRtl ? 'flex-row-reverse' : '')}>
          <Button asChild variant="secondary" size="sm" className="justify-center w-full sm:w-auto">
            <Link to="/team/courses">
              <BookOpen className="w-4 h-4" />
              {isRtl ? 'عرض كل الكورسات' : 'View all courses'}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {coursesState.status === 'loading' ? (
          <div className="flex justify-center items-center bg-white dark:bg-[#1a1a1a] p-8 border border-black/5 dark:border-white/10 rounded-3xl">
            <Spinner />
          </div>
        ) : null}

        {coursesState.status === 'error' ? (
          <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
            {coursesState.error}
          </div>
        ) : null}

        {coursesState.status === 'success' && previewCourses.length === 0 ? (
          <div className="flex flex-col justify-center items-center px-6 py-10 min-h-[240px] text-center">
            <div className="flex justify-center items-center bg-[#F43F5E]/10 rounded-2xl w-16 h-16 text-[#F43F5E]">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="mt-4 font-extrabold text-[#F43F5E] text-2xl">{isRtl ? 'لا توجد كورسات بعد..' : 'No courses yet'}</div>
            <div className="mt-1 text-[#F43F5E]/80 text-base">{isRtl ? 'سيتم اضافه كورسات قريباََ' : 'Courses will be added soon'}</div>
          </div>
        ) : null}

        {coursesState.status === 'success' && previewCourses.length > 0 ? (
          <div className="app-grid-cards mt-4">
            {previewCourses.map((c) => (
              <div key={c?._id || c?.id} className="min-w-0">
                <CourseCard
                  course={c}
                  isRtl={isRtl}
                  ctaLabel={isRtl ? 'الدخول للكورس' : 'Enter course'}
                  footerText={isRtl ? 'إدارة محتوى الكورس' : 'Open course workspace'}
                  onOpen={() => navigate(`/team/courses/${c?._id || c?.id}`)}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

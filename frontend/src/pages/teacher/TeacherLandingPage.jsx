import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardCheck, Inbox, LayoutDashboard, ListChecks, Users } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
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
        'group block w-full bg-white dark:bg-[#1a1a1a] shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] dark:shadow-none p-4 border border-black/5 dark:border-white/10 rounded-3xl transition-all hover:-translate-y-0.5 duration-200 ' +
        (isRtl ? 'text-right' : 'text-left')
      }
    >
      <div className={'flex items-center justify-end gap-2 w-full ' + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
        <div className="flex justify-center items-center bg-[rgb(247,244,236)] dark:bg-[#202020] border border-black/5 dark:border-white/10 rounded-2xl w-10 h-10 text-slate-700 dark:text-slate-200 shrink-0">
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

export default function TeacherLandingPage() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { isRtl } = useLanguage()

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
      <div className={'flex flex-col items-center justify-center gap-3 text-center'}>
        <div className={isRtl ? 'text-center' : 'text-center'}>
          <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
            <span className="bg-emerald-500 rounded-full w-1.5 h-1.5" />
            {isRtl ? 'مساحة المدرس' : 'Teacher workspace'}
            <span className="text-slate-500 dark:text-slate-400">{auth?.email || '-'}</span>
          </div>
          <div className="mt-3 text-center">
            <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl sm:text-5xl leading-[1.1]">
              <span className="font-perfect text-slate-900 dark:text-white">{isRtl ? 'الرئيسية' : 'Home'}</span>
            </h1>
            <svg
              className="mx-auto mt-2 w-full max-w-[520px] h-4"
              viewBox="0 0 520 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10 20 C 130 6, 390 6, 510 20" stroke="#069484" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'ابدأ بالكورسات أولًا، وبعدها باقي أدوات التدريس منظمة بالأسفل.' : 'Start with courses first, then find the rest of your teaching tools organized below.'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className={isRtl ? 'text-center' : 'text-center'}>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-xl">{isRtl ? 'كورساتي' : 'My courses'}</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'الكورسات اللي أنت أنشأتها.' : 'Courses you created.'}
          </p>
          <div className="flex justify-center mt-4">
            <Button asChild>
              <Link to="/teacher/courses">
                {isRtl ? 'إضافة كورس' : 'Add course'}
              </Link>
            </Button>
          </div>
        </div>

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
            <div className="mt-1 text-[#F43F5E]/80 text-base">{isRtl ? 'اضف كورساتك' : 'Add your courses'}</div>
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
                  onOpen={() => navigate(`/teacher/courses/${c?._id || c?.id}`)}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-10">
        <div className="text-center" dir={isRtl ? 'rtl' : 'ltr'}>
          <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl sm:text-4xl tracking-tight">
            {isRtl ? 'أدوات المدرس' : 'Teacher tools'}
          </h2>

          <div className="flex justify-center mt-3">
            <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
              <path d="M20 20 C 160 0, 360 0, 500 20" stroke="#069484" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'كل الأدوات المهمة في مكان واحد.' : 'Everything you need, organized in one place.'}
          </p>
        </div>

        <div className="gap-3 grid md:grid-cols-2 mt-6">
          <ActionCard
            title={isRtl ? 'فريقي' : 'My Team'}
            desc={isRtl ? 'إدارة مساحة فريقك.' : 'Manage your team workspace.'}
            Icon={Users}
            to="/teacher/team"
          />
          <ActionCard
            title={isRtl ? 'الطلاب' : 'Students'}
            desc={isRtl ? 'عرض وإدارة الطلاب.' : 'View and manage students.'}
            Icon={Users}
            to="/teacher/students"
          />
          <ActionCard
            title={isRtl ? 'الاختبارات' : 'Assessments'}
            desc={isRtl ? 'إدارة الاختبارات والنتائج.' : 'Manage assessments and results.'}
            Icon={ListChecks}
            to="/teacher/assessments"
          />
          <ActionCard
            title={isRtl ? 'التصحيح اليدوي' : 'Manual grading'}
            desc={isRtl ? 'تصحيح المحاولات يدويًا.' : 'Grade attempts manually.'}
            Icon={ClipboardCheck}
            to="/teacher/assessments/grading"
          />
          <ActionCard
            title={isRtl ? 'الدرجات' : 'Grades'}
            desc={isRtl ? 'متابعة الدرجات والتقارير.' : 'Review grades and reports.'}
            Icon={LayoutDashboard}
            to="/teacher/grades"
          />
        </div>
      </div>
    </div>
  )
}

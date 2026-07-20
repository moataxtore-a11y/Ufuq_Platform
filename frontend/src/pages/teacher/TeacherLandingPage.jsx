import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardCheck, GraduationCap, Inbox, KeyRound, LayoutDashboard, ListChecks, LogOut, MessageSquareQuote, Plus, Users } from 'lucide-react'
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
      <div className={'flex items-center gap-3 w-full ' + (isRtl ? 'flex-row' : 'flex-row')}>
        <div className="flex justify-center items-center bg-[rgb(247,244,236)] dark:bg-[#202020] border border-black/5 dark:border-white/10 rounded-2xl w-11 h-11 text-slate-700 dark:text-slate-200 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{title}</div>
          <div className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs leading-5">{desc}</div>
        </div>
      </div>
    </Link>
  )
}

function StatCard({ label, value, Icon }) {
  const { isRtl } = useLanguage()
  return (
    <div className={"flex items-center gap-3 bg-white dark:bg-[#1a1a1a] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none px-5 py-4 border border-black/5 dark:border-white/10 rounded-2xl " + (isRtl ? 'flex-row' : 'flex-row')}>
      <div className="flex justify-center items-center bg-brand/10 rounded-xl w-10 h-10 text-brand shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-bold text-slate-900 dark:text-white text-xl leading-none">{value}</div>
        <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">{label}</div>
      </div>
    </div>
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
    return list.slice(0, 4)
  }, [coursesState.items])

  const courseCount = Array.isArray(coursesState.items) ? coursesState.items.length : 0

  return (
    <div>
      <div className="flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
          <span className="bg-emerald-500 rounded-full w-1.5 h-1.5" />
          {isRtl ? 'مساحة المدرس' : 'Teacher workspace'}
        </div>

        <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl sm:text-4xl leading-[1.1]">
          <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
        </h1>

        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm text-center max-w-md">
          {isRtl ? 'أهلاً بك في مساحة التدريس — كل أدواتك في مكان واحد.' : 'Welcome to your teaching workspace — all your tools in one place.'}
        </p>
      </div>

      <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 mt-8">
        <StatCard
          label={isRtl ? 'عدد الكورسات' : 'Courses'}
          value={courseCount}
          Icon={BookOpen}
        />
        <StatCard
          label={isRtl ? 'الاختبارات' : 'Assessments'}
          value="-"
          Icon={ListChecks}
        />
        <StatCard
          label={isRtl ? 'الطلاب' : 'Students'}
          value="-"
          Icon={Users}
        />
        <StatCard
          label={isRtl ? 'الدرجات' : 'Grades'}
          value="-"
          Icon={GraduationCap}
        />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{isRtl ? 'كورساتي' : 'My Courses'}</h2>
            <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
              {isRtl ? 'آخر كورساتك.' : 'Your latest courses.'}
            </p>
          </div>
          <div className={"flex items-center gap-2 " + (isRtl ? 'flex-row-reverse' : '')}>
            <Button asChild size="sm" variant="secondary">
              <Link to="/teacher/courses">
                <BookOpen className="w-4 h-4" />
                {isRtl ? 'كل الكورسات' : 'All courses'}
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/teacher/courses">
                <Plus className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {coursesState.status === 'loading' ? (
          <div className="flex justify-center items-center bg-white dark:bg-[#1a1a1a] p-8 mt-4 border border-black/5 dark:border-white/10 rounded-3xl">
            <Spinner />
          </div>
        ) : null}

        {coursesState.status === 'error' ? (
          <div className="bg-white dark:bg-[#1a1a1a] p-5 mt-4 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
            {coursesState.error}
          </div>
        ) : null}

        {coursesState.status === 'success' && previewCourses.length === 0 ? (
          <div className="flex flex-col justify-center items-center px-6 py-10 mt-4 min-h-[200px] text-center bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 rounded-3xl">
            <div className="flex justify-center items-center bg-brand/10 rounded-2xl w-16 h-16 text-brand">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="mt-4 font-bold text-slate-900 dark:text-white text-xl">{isRtl ? 'لا توجد كورسات بعد' : 'No courses yet'}</div>
            <div className="mt-1 text-slate-500 dark:text-slate-400 text-sm">{isRtl ? 'أنشئ أول كورس ليك.' : 'Create your first course.'}</div>
            <Button asChild className="mt-5">
              <Link to="/teacher/courses">
                <Plus className="w-4 h-4" />
                {isRtl ? 'إضافة كورس' : 'Add course'}
              </Link>
            </Button>
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
                  footerText={isRtl ? 'إدارة المحتوى' : 'Manage content'}
                  onOpen={() => navigate(`/teacher/courses/${c?._id || c?.id}`)}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{isRtl ? 'أدوات سريعة' : 'Quick Tools'}</h2>
        </div>

        <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 mt-4">
          <ActionCard title={isRtl ? 'الطلاب' : 'Students'} desc={isRtl ? 'عرض وإدارة الطلاب' : 'View and manage students'} Icon={Users} to="/teacher/students" />
          <ActionCard title={isRtl ? 'الاختبارات' : 'Assessments'} desc={isRtl ? 'إدارة الاختبارات والنتائج' : 'Manage assessments and results'} Icon={ListChecks} to="/teacher/assessments" />
          <ActionCard title={isRtl ? 'التصحيح اليدوي' : 'Manual Grading'} desc={isRtl ? 'تصحيح المحاولات يدويًا' : 'Grade attempts manually'} Icon={ClipboardCheck} to="/teacher/assessments/grading" />
          <ActionCard title={isRtl ? 'الدرجات' : 'Grades'} desc={isRtl ? 'متابعة الدرجات والتقارير' : 'Review grades and reports'} Icon={LayoutDashboard} to="/teacher/grades" />
          <ActionCard title={isRtl ? 'أكواد التسجيل' : 'Access Codes'} desc={isRtl ? 'إدارة أكواد الدخول' : 'Manage access codes'} Icon={KeyRound} to="/teacher/access-codes" />
          <ActionCard title={isRtl ? 'رسالة للطلاب' : 'Student Message'} desc={isRtl ? 'رسالة تحفيزية للطلاب' : 'Motivational message for students'} Icon={MessageSquareQuote} to="/teacher/motivational-message" />
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <LogOut className="w-4 h-4" />
          {isRtl ? 'العودة للموقع' : 'Back to site'}
        </Button>
      </div>
    </div>
  )
}

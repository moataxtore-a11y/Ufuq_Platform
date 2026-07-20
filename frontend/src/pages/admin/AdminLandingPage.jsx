import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  CheckCircle, 
  LayoutDashboard, 
  Users, 
  UserRound,
  GraduationCap, 
  ClipboardList, 
  BookOpen, 
  FileText, 
  Send, 
  Award,
  UserCheck,
  Briefcase
} from 'lucide-react'
import Spinner from '../../components/ui/Spinner.jsx'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { motion } from 'framer-motion'

const colors = {
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/10 dark:border-blue-500/20',
    bar: 'bg-blue-500'
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/10 dark:border-purple-500/20',
    bar: 'bg-purple-500'
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/10 dark:border-amber-500/20',
    bar: 'bg-amber-500'
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/10 dark:border-indigo-500/20',
    bar: 'bg-indigo-500'
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/10 dark:border-emerald-500/20',
    bar: 'bg-emerald-500'
  },
  teal: {
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/10 dark:border-teal-500/20',
    bar: 'bg-teal-500'
  },
  sky: {
    bg: 'bg-sky-500/10 dark:bg-sky-500/15',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/10 dark:border-sky-500/20',
    bar: 'bg-sky-500'
  },
  violet: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/10 dark:border-violet-500/20',
    bar: 'bg-violet-500'
  }
}

function ActionCard({ title, desc, Icon, to, index, isFeatured }) {
  const { isRtl } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={isFeatured ? 'col-span-1 md:col-span-2 lg:col-span-2' : 'col-span-1'}
    >
      <Link
        to={to}
        className={
          'group flex items-center gap-5 bg-white dark:bg-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#202020] p-6 border border-slate-100 dark:border-white/5 hover:border-brand/35 dark:hover:border-brand/35 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-none ' +
          (isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left')
        }
      >
        <div className="flex justify-center items-center bg-slate-50 dark:bg-white/5 group-hover:bg-brand/10 border border-slate-100 dark:border-white/10 group-hover:border-brand/20 rounded-2xl w-16 h-16 text-slate-500 dark:text-slate-400 group-hover:text-brand dark:group-hover:text-brand transition-all duration-300 shrink-0">
          <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand dark:group-hover:text-white text-lg sm:text-xl transition-colors">{title}</div>
          <div className="mt-1 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function AdminLandingPage() {
  const { isRtl, t } = useLanguage()
  const { notify } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const roleCounts = useMemo(() => {
    const byRole = Array.isArray(data?.usersByRole) ? data.usersByRole : []
    const map = {}
    for (const r of byRole) {
      const key = String(r?.role || '').toLowerCase()
      if (!key) continue
      map[key] = Number(r?.count) || 0
    }
    return {
      teacher: map.teacher || 0,
      team: map.team || 0,
      student: map.student || 0
    }
  }, [data?.usersByRole])

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        setLoading(true)
        const res = await api.get('/admin/stats')
        if (alive) setData(res.data)
      } catch (e) {
        notify({ title: t('adminOverviewPage.failedToLoad'), description: e?.response?.data?.message || t('common.error'), variant: 'destructive' })
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [notify, t])

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 mb-4 px-4 py-1.5 border border-slate-200 dark:border-white/10 rounded-full font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide"
        >
          <span className="bg-emerald-500 shadow-[0_0_10px_#10b981] rounded-full w-2 h-2 animate-pulse" />
          {isRtl ? 'مساحة الأدمن' : 'Admin workspace'}
        </motion.div>
        
        <div className="relative">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-black text-slate-900 dark:text-white text-4xl sm:text-5xl md:text-6xl tracking-tight"
          >
            {isRtl ? 'إدارة المنصة' : 'Platform management'}
          </motion.h1>
          <div className="flex justify-center mt-4">
            <svg width="400" height="20" viewBox="0 0 400 20" className="opacity-60 max-w-full" aria-hidden="true">
              <path d="M10 15 Q 200 0, 390 15" stroke="#069484" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 font-medium text-slate-600 dark:text-slate-400 text-lg"
        >
          {isRtl ? 'اختر القسم الذي تريد إدارته من الأدوات بالأسفل.' : 'Pick what you want to manage from the tools below.'}
        </motion.p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="w-12 h-12 text-brand" />
            <span className="font-bold text-slate-400 animate-pulse">{t('adminOverviewPage.loading')}</span>
          </div>
        </div>
      ) : data ? (
        <div className="gap-6 grid mb-12">
          {/* Main Stats Grid */}
          <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <Stat title={isRtl ? 'المستخدمين' : 'Users'} value={data.users} icon={Users} delay={0} isRtl={isRtl} color="blue" />
            <Stat title={isRtl ? 'الكورسات' : 'Courses'} value={data.courses} icon={BookOpen} delay={0.1} isRtl={isRtl} color="purple" />
            <Stat title={isRtl ? 'الواجبات' : 'Assignments'} value={data.assignments} icon={FileText} delay={0.2} isRtl={isRtl} color="amber" />
            <Stat title={isRtl ? 'التسليمات' : 'Submissions'} value={data.submissions} icon={Send} delay={0.3} isRtl={isRtl} color="indigo" />
            <Stat title={isRtl ? 'الدرجات' : 'Grades'} value={data.grades} icon={Award} delay={0.4} isRtl={isRtl} color="emerald" />
          </div>

          {/* Sub Stats Grid */}
          <div className="gap-4 grid md:grid-cols-3">
            <Stat title={isRtl ? 'مدرس' : 'Teacher'} value={roleCounts.teacher} icon={GraduationCap} delay={0.5} isRtl={isRtl} size="large" color="teal" />
            <Stat title={isRtl ? 'تيم' : 'Team'} value={roleCounts.team} icon={UserCheck} delay={0.6} isRtl={isRtl} size="large" color="sky" />
            <Stat title={isRtl ? 'طالب' : 'Student'} value={roleCounts.student} icon={UserRound} delay={0.7} isRtl={isRtl} size="large" color="violet" />
          </div>
        </div>
      ) : null}

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ActionCard
          index={0}
          title={isRtl ? 'نظرة عامة' : 'Overview'}
          desc={isRtl ? 'إحصائيات سريعة عن المنصة.' : 'Quick stats snapshot for the platform.'}
          Icon={LayoutDashboard}
          to="/admin/overview"
          isFeatured={true}
        />
        <ActionCard
          index={1}
          title={isRtl ? 'المستخدمين' : 'Users'}
          desc={isRtl ? 'إنشاء وتعديل وحذف المستخدمين.' : 'Create, edit, and manage users.'}
          Icon={Users}
          to="/admin/users"
          isFeatured={false}
        />
        <ActionCard
          index={2}
          title={isRtl ? 'الموافقات' : 'Approvals'}
          desc={isRtl ? 'مراجعة الطلبات والموافقات.' : 'Review and manage approvals.'}
          Icon={CheckCircle}
          to="/admin/approvals"
          isFeatured={false}
        />
        <ActionCard
          index={3}
          title={isRtl ? 'طلبات التقديم' : 'Applications'}
          desc={isRtl ? 'طلبات الانضمام لفريق العمل.' : 'Join our team applications.'}
          Icon={Briefcase}
          to="/admin/applications"
          isFeatured={false}
        />
        <ActionCard
          index={4}
          title={isRtl ? 'الملف الشخصي' : 'Profile'}
          desc={isRtl ? 'تعديل بيانات الحساب والأمان.' : 'Update account and security settings.'}
          Icon={UserRound}
          to="/admin/profile"
          isFeatured={false}
        />
      </div>
    </div>
  )
}

function Stat({ title, value, icon: Icon, delay, isRtl, size = 'normal', color = 'blue' }) {
  const c = colors[color] || colors.blue
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      className={`bg-white dark:bg-[#1a1a1a] border border-slate-100 dark:border-white/5 rounded-3xl p-5 hover:border-brand/30 dark:hover:border-brand/30 transition-all duration-300 group shadow-sm hover:shadow-md dark:shadow-none relative overflow-hidden ${size === 'large' ? 'md:p-7' : ''}`}
    >
      <div className={`flex items-start justify-between mb-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex flex-col ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
          <span className="mb-1 font-medium text-slate-500 dark:text-slate-400 text-sm">{title}</span>
          <span className={`text-slate-900 dark:text-white font-black tabular-nums tracking-tight ${size === 'large' ? 'text-4xl' : 'text-3xl'}`}>
            {value ?? 0}
          </span>
        </div>
        <div className={`p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 ${c.bg} ${c.border}`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
      <div className="relative bg-slate-100 dark:bg-white/5 rounded-full w-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, delay: delay + 0.3 }}
          className={`top-0 left-0 absolute h-full rounded-full ${c.bar}`}
        />
      </div>
    </motion.div>
  )
}


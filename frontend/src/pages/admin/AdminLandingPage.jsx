import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, LayoutDashboard, Users, GraduationCap, ClipboardList } from 'lucide-react'
import Spinner from '../../components/ui/Spinner.jsx'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
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
  }, [notify])

  return (
    <div>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
          <span className="bg-emerald-500 rounded-full w-1.5 h-1.5" />
          {isRtl ? 'مساحة الأدمن' : 'Admin workspace'}
        </div>
        <div className="mt-2">
          <h1 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
            {isRtl ? 'إدارة المنصة' : 'Platform management'}
          </h1>
          <div className="flex justify-center mt-2">
            <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
              <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(212,175,55,0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
          {isRtl ? 'اختر القسم الذي تريد إدارته من الأدوات بالأسفل.' : 'Pick what you want to manage from the tools below.'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 mt-6 text-slate-700 dark:text-slate-200">
          <Spinner />
          {t('adminOverviewPage.loading')}
        </div>
      ) : data ? (
        <div className="gap-3 grid mt-6">
          <div className="gap-3 grid md:grid-cols-5">
            <Stat title={t('adminOverviewPage.cards.users')} value={data.users} isRtl={isRtl} />
            <Stat title={t('adminOverviewPage.cards.courses')} value={data.courses} isRtl={isRtl} />
            <Stat title={t('adminOverviewPage.cards.assignments')} value={data.assignments} isRtl={isRtl} />
            <Stat title={t('adminOverviewPage.cards.submissions')} value={data.submissions} isRtl={isRtl} />
            <Stat title={t('adminOverviewPage.cards.grades')} value={data.grades} isRtl={isRtl} />
          </div>

          <div className="gap-3 grid md:grid-cols-3">
            <Stat title={t('roles.teacher')} value={roleCounts.teacher} isRtl={isRtl} />
            <Stat title={t('roles.team')} value={roleCounts.team} isRtl={isRtl} />
            <Stat title={t('roles.student')} value={roleCounts.student} isRtl={isRtl} />
          </div>
        </div>
      ) : null}

      <div className="gap-4 grid md:grid-cols-2 mt-8">
        <ActionCard
          title={isRtl ? 'نظرة عامة' : 'Overview'}
          desc={isRtl ? 'إحصائيات سريعة عن المنصة.' : 'Quick stats snapshot for the platform.'}
          Icon={LayoutDashboard}
          to="/admin/overview"
        />
        <ActionCard
          title={isRtl ? 'المستخدمين' : 'Users'}
          desc={isRtl ? 'إنشاء وتعديل وحذف المستخدمين.' : 'Create, edit, and manage users.'}
          Icon={Users}
          to="/admin/users"
        />
        <ActionCard
          title={isRtl ? 'الموافقات' : 'Approvals'}
          desc={isRtl ? 'مراجعة الطلبات والموافقات.' : 'Review and manage approvals.'}
          Icon={CheckCircle}
          to="/admin/approvals"
        />
        <ActionCard
          title={isRtl ? 'طلبات التقديم' : 'Applications'}
          desc={isRtl ? 'طلبات الانضمام لفريق العمل.' : 'Join our team applications.'}
          Icon={ClipboardList}
          to="/admin/applications"
        />
        <ActionCard
          title={isRtl ? 'الملف الشخصي' : 'Profile'}
          desc={isRtl ? 'تعديل بيانات الحساب والأمان.' : 'Update account and security settings.'}
          Icon={GraduationCap}
          to="/admin/profile"
        />
      </div>
    </div>
  )
}

function Stat({ title, value, isRtl }) {
  return (
    <div className="bg-white dark:bg-white/[0.06] shadow-md p-4 border border-slate-300/70 dark:border-white/15 rounded-2xl">
      <div className={'flex items-start justify-between gap-3 ' + (isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
        <div className="gap-1 grid">
          <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{title}</div>
          <div className="font-semibold tabular-nums text-slate-900 dark:text-white text-2xl tracking-tight">{value ?? 0}</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-200/10 border border-amber-200 dark:border-amber-200/30 rounded-xl w-9 h-9" />
      </div>
      <div className="bg-slate-100 dark:bg-white/10 mt-3 rounded-full w-full h-1.5 overflow-hidden">
        <div className="bg-amber-300 dark:bg-amber-200 rounded-full w-1/3 h-full" />
      </div>
    </div>
  )
}

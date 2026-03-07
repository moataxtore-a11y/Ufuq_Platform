import { useEffect, useState } from 'react'
import { api } from '../../utils/api.js'
import Spinner from '../../components/ui/Spinner.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function AdminOverviewPage() {
  const { notify } = useToast()
  const { t, isRtl } = useLanguage()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await api.get('/admin/stats')
        if (mounted) setData(res.data)
      } catch (e) {
        notify({ title: t('adminOverviewPage.failedToLoad'), description: e?.response?.data?.message || t('common.error'), variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [notify])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700">
        <Spinner />
        {t('adminOverviewPage.loading')}
      </div>
    )
  }

  if (!data) return <div className="text-slate-700">{t('adminOverviewPage.noStats')}</div>

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="gap-4 grid">
      <div className={isRtl ? 'text-right' : 'text-left'}>
        <div className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight">{t('adminOverviewPage.title')}</div>
        <div className="text-slate-700 dark:text-slate-200 text-sm">{t('adminOverviewPage.subtitle')}</div>
      </div>

      <div className="gap-3 grid md:grid-cols-5">
        <Stat title={t('adminOverviewPage.cards.users')} value={data.users} isRtl={isRtl} />
        <Stat title={t('adminOverviewPage.cards.courses')} value={data.courses} isRtl={isRtl} />
        <Stat title={t('adminOverviewPage.cards.assignments')} value={data.assignments} isRtl={isRtl} />
        <Stat title={t('adminOverviewPage.cards.submissions')} value={data.submissions} isRtl={isRtl} />
        <Stat title={t('adminOverviewPage.cards.grades')} value={data.grades} isRtl={isRtl} />
      </div>

      <div className="bg-white dark:bg-white/[0.06] shadow-md border border-slate-300/70 dark:border-white/15 rounded-2xl overflow-hidden">
        <div className={
          'flex items-center justify-between gap-3 px-5 py-4 ' + (isRtl ? 'flex-row-reverse text-right' : 'text-left')
        }
        >
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('adminOverviewPage.usersByRole.title')}</div>
            <div className="mt-1 text-slate-700 dark:text-slate-200 text-xs">{t('adminOverviewPage.usersByRole.subtitle')}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-200/10 border border-amber-200 dark:border-amber-200/30 rounded-xl w-9 h-9" />
        </div>
        <div className="bg-slate-200/70 dark:bg-white/10 h-px" />
        <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-4 p-5">
          {(data.usersByRole || []).map((r) => (
            <div
              key={r.role}
              className={
                'rounded-2xl border border-slate-300/60 bg-white p-4 shadow-sm transition ' +
                'hover:-translate-y-0.5 hover:border-amber-200 hover:bg-white hover:shadow-sm ' +
                'dark:border-white/15 dark:bg-white/[0.06] dark:hover:bg-white/[0.08]'
              }
            >
              <div className="font-semibold text-slate-600 dark:text-slate-300 text-xs">{t(`roles.${r.role}`)}</div>
              <div className="flex justify-between items-end gap-3 mt-2">
                <div className="font-semibold tabular-nums text-slate-900 dark:text-white text-2xl tracking-tight">{r.count}</div>
                <span className="inline-flex items-center bg-amber-50 dark:bg-amber-200/10 px-2.5 py-1 border border-amber-200 dark:border-amber-200/30 rounded-full font-semibold text-amber-900 dark:text-amber-200 text-xs">
                  {t('adminOverviewPage.usersByRole.active')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value, isRtl }) {
  return (
    <div className="bg-white dark:bg-white/[0.06] shadow-md p-4 border border-slate-300/70 dark:border-white/15 rounded-2xl">
      <div className={
        'flex items-start justify-between gap-3 ' + (isRtl ? 'flex-row-reverse text-right' : 'text-left')
      }
      >
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

import { useLanguage } from '../../context/LanguageContext.jsx'

export default function StatsSection() {
  const { t } = useLanguage()

  const stats = [
    { label: t('landing.stats.labels.courses'), value: '120+' },
    { label: t('landing.stats.labels.lessons'), value: '2,400+' },
    { label: t('landing.stats.labels.active'), value: '18k+' },
    { label: t('landing.stats.labels.rating'), value: '4.8/5' }
  ]

  return (
    <section id="stats" className="mt-8 py-2 scroll-mt-24">
      <div className="bg-[rgb(243,246,244)] dark:bg-[#1d1d1d] rounded-3xl overflow-hidden">
        <div className="px-5 sm:px-6 py-6 sm:py-7">
          <div className="gap-2 grid text-center">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{t('landing.stats.title')}</h2>
            <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300 text-sm">
              {t('landing.stats.subtitle')}
            </p>
          </div>

          <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-4 mt-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/85 dark:bg-[#171717] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-center"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-100 text-2xl tracking-tight">{s.value}</div>
                <div className="mt-1 text-slate-600 dark:text-slate-300 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

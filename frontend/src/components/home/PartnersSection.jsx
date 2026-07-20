import { useLanguage } from '../../context/LanguageContext.jsx'

export default function PartnersSection() {
  const { t } = useLanguage()

  const logos = [
    t('landing.partners.logos.l1'),
    t('landing.partners.logos.l2'),
    t('landing.partners.logos.l3'),
    t('landing.partners.logos.l4'),
    t('landing.partners.logos.l5'),
    t('landing.partners.logos.l6')
  ]

  return (
    <section className="mt-10 py-2">
      <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm text-center">{t('landing.partners.title')}</div>
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mt-5">
        {logos.map((x) => (
          <div
            key={x}
            className="flex justify-center items-center bg-white dark:bg-[#1a1a1a] shadow-[0_4px_12px_rgba(15,23,42,0.04)] border border-black/5 dark:border-white/10 rounded-2xl h-14 font-semibold text-slate-600 dark:text-slate-300 text-sm"
          >
            {x}
          </div>
        ))}
      </div>
    </section>
  )
}

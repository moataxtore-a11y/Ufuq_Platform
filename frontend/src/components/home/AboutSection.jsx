import { CheckCircle2, Phone, Sparkles } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function AboutSection() {
  const { isRtl, t } = useLanguage()

  const points = [
    { title: t('landing.about.points.p1.title'), desc: t('landing.about.points.p1.desc'), Icon: CheckCircle2 },
    { title: t('landing.about.points.p2.title'), desc: t('landing.about.points.p2.desc'), Icon: Sparkles },
    { title: t('landing.about.points.p3.title'), desc: t('landing.about.points.p3.desc'), Icon: CheckCircle2 },
    { title: t('landing.about.contact'), desc: t('landing.about.trusted'), Icon: Phone }
  ]

  return (
    <section id="about" className="mt-8 py-2 scroll-mt-[68px] sm:scroll-mt-[72px] md:scroll-mt-[76px]">
      <div className="py-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
            <span className="bg-brand rounded-full w-1.5 h-1.5" />
            {t('landing.about.label')}
          </div>
          <h2 className="mt-5 font-extrabold text-slate-900 dark:text-white text-4xl sm:text-5xl md:text-6xl tracking-tight">
            {t('landing.about.title')}
          </h2>
          <p className="mx-auto mt-2 max-w-3xl text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-7">
            {t('landing.about.description')}
          </p>
        </div>

        <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4 mt-8">
          {points.map(({ title, desc, Icon }) => (
            <div
              key={title}
              className="bg-white dark:bg-[#171717] shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] p-7 border border-black/5 dark:border-white/10 rounded-3xl transition-all hover:-translate-y-0.5 duration-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex justify-center items-center bg-[rgb(247,244,236)] dark:bg-[#202020] rounded-2xl w-14 h-14 text-slate-700 dark:text-slate-200">
                  <Icon className="w-7 h-7" />
                </div>

                <div className="mt-5 font-semibold text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-7">
                  {title}
                </div>
                <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm leading-7">
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

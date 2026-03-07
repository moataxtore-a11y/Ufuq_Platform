import { Flame, BarChart3, PencilRuler, Globe2 } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function ServicesSection() {
  const { isRtl, t } = useLanguage()

  const items = [
    { title: t('landing.services.items.i1.title', { defaultValue: isRtl ? 'هنتحم' : 'We motivate' }), desc: t('landing.services.items.i1.desc', { defaultValue: isRtl ? 'انت اللي تحدد سرعتك ومسارك' : 'You set your speed and path.' }), Icon: Flame },
    { title: t('landing.services.items.i2.title', { defaultValue: isRtl ? 'هنتابع' : 'We track' }), desc: t('landing.services.items.i2.desc', { defaultValue: isRtl ? 'تقارير توضح مستواك بالتفصيل' : 'Detailed reports that clarify your level.' }), Icon: BarChart3 },
    { title: t('landing.services.items.i3.title', { defaultValue: isRtl ? 'هنتدرب' : 'We train' }), desc: t('landing.services.items.i3.desc', { defaultValue: isRtl ? 'تمارين عملية بعد كل درس' : 'Practical exercises after every lesson.' }), Icon: PencilRuler },
    { title: t('landing.services.items.i4.title', { defaultValue: isRtl ? 'هتوصل' : 'You will achieve success' }), desc: t('landing.services.items.i4.desc', { defaultValue: isRtl ? 'تعلم من أي مكان وفي أي وقت' : 'Learn from anywhere, anytime.' }), Icon: Globe2 }
  ]

  return (
    <section id="services" className="mt-8 py-2 scroll-mt-24">
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-4xl sm:text-5xl md:text-6xl tracking-tight">
          {isRtl ? (
            <>
              <span className="text-brand">مستني</span> إيه؟
            </>
          ) : (
            <>
              <span className="text-brand">What</span> are you waiting for?
            </>
          )}
        </h2>

        <div className="flex justify-center mt-3">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(250, 192, 0, 0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="gap-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {items.map(({ title, desc, Icon }) => (
          <div
            key={title}
            className="group bg-[#322C18] shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] p-7 border border-black/5 dark:border-white/10 rounded-3xl min-h-[300px] transition-all hover:-translate-y-0.5 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="flex justify-center items-center bg-[#66582f] rounded-2xl w-14 h-14 text-slate-100 group-hover:rotate-3 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-7 h-10" />
              </div>

              <div className="mt-5 font-semibold text-slate-100 text-base sm:text-2xl leading-7">
                {title}
              </div>
              <div className="mt-2 text-slate-100 text-sm sm:text-base leading-7">
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

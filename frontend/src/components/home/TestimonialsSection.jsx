import { useLanguage } from '../../context/LanguageContext.jsx'

function Stars() {
  return (
    <div className="flex items-center gap-1 text-brand" aria-label="Rating">
      <span className="text-sm">★</span>
      <span className="text-sm">★</span>
      <span className="text-sm">★</span>
      <span className="text-sm">★</span>
      <span className="text-sm">★</span>
    </div>
  )
}

function Avatar({ name }) {
  const letter = (name || 'U').slice(0, 1).toUpperCase()
  return (
    <div className="flex justify-center items-center bg-brand/15 rounded-2xl w-10 h-10 text-brand">
      <span className="font-semibold text-sm">{letter}</span>
    </div>
  )
}

export default function TestimonialsSection() {
  const { isRtl, t } = useLanguage()

  const testimonials = [
    t('landing.testimonials.items.t1'),
    t('landing.testimonials.items.t2'),
    t('landing.testimonials.items.t3')
  ]

  return (
    <section id="testimonials" className="mt-8 py-2 scroll-mt-[68px] sm:scroll-mt-[72px] md:scroll-mt-[76px]">
      <div className="mb-4">
        <h2 className={"font-semibold text-slate-800 dark:text-slate-100 text-lg " + (isRtl ? 'text-right' : 'text-left')}>
          {t('landing.testimonials.title')}
        </h2>
        <p className={"mt-1 text-slate-600 dark:text-slate-300 text-sm " + (isRtl ? 'text-right' : 'text-left')}>
          {t('landing.testimonials.subtitle')}
        </p>
      </div>

      <div className="gap-4 grid md:grid-cols-3">
        {testimonials.map((tt, idx) => (
          <figure
            key={(tt && typeof tt === 'object' && tt.name ? tt.name : 't') + '-' + idx}
            className="bg-white dark:bg-[#1a1a1a] shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] p-5 border border-black/5 dark:border-white/10 rounded-3xl transition-all hover:-translate-y-0.5 duration-200"
          >
            <div className="flex justify-between items-center gap-3">
              <Stars />
              <span className="flex justify-center items-center bg-[rgb(247,244,236)] dark:bg-[#202020] rounded-2xl w-8 h-8 text-slate-700 dark:text-slate-200" aria-hidden="true">
                “
              </span>
            </div>

            <blockquote className={"mt-4 text-slate-700 dark:text-slate-200 text-sm leading-6 " + (isRtl ? 'text-right' : 'text-left')}>{tt?.quote || ''}</blockquote>

            <div className={"flex items-center gap-3 mt-5 " + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <Avatar name={tt?.name} />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{tt?.name || ''}</div>
                <div className="text-slate-600 dark:text-slate-300 text-xs">{tt?.role || ''}</div>
              </div>
            </div>
          </figure>
        ))}
      </div>
    </section>
  )
}

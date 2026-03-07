import { useLanguage } from '../../context/LanguageContext.jsx'
import i18n from '../../i18n/i18n.js'

export default function LanguageToggle({ className = '' }) {
  const { lang } = useLanguage()
  const currentLabel = lang === 'ar' ? 'AR' : 'EN'

  return (
    <button
      type="button"
      onClick={() => {
        const next = i18n.language === 'ar' ? 'en' : 'ar'
        i18n.changeLanguage(next)
      }}
      className={
        'inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold transition ' +
        'border-black/10 bg-white/70 text-slate-700 hover:bg-white ' +
        'dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06] ' +
        className
      }
      aria-label="Toggle language"
    >
      {currentLabel}
    </button>
  )
}

import { Languages } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function LanguageToggle({ className = '' }) {
  const { lang, toggleLang } = useLanguage()
  const currentLabel = lang === 'ar' ? 'AR' : 'EN'

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={
        'inline-flex items-center justify-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold tracking-wider transition-all duration-200 ' +
        'border-black/10 bg-white/70 text-slate-700 hover:bg-white hover:shadow-sm hover:border-black/20 ' +
        'dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:border-white/20 ' +
        className
      }
      aria-label="Toggle language"
    >
      <Languages className="w-3.5 h-3.5" />
      {currentLabel}
    </button>
  )
}

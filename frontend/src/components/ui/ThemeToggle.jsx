import { useEffect, useMemo, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

function getInitialTheme() {
  if (typeof document === 'undefined') return 'light'
  try {
    const v = localStorage.getItem('theme')
    if (v === 'dark' || v === 'light') return v
  } catch {
    // ignore
  }
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => getInitialTheme())

  useEffect(() => {
    if (typeof document === 'undefined') return
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const isDark = theme === 'dark'

  const trackCls = useMemo(() => {
    return (
      'relative inline-flex h-9 w-[76px] items-center rounded-full border transition-all duration-200 ease-out select-none ' +
      'shadow-[0_4px_14px_rgba(15,23,42,0.06)] ' +
      (isDark ? 'border-white/10 bg-[#1a1a1a]' : 'border-black/10 bg-white/80')
    )
  }, [isDark])

  const knobCls = useMemo(() => {
    return (
      'absolute top-1/2 left-0 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#FCF9F4] dark:bg-slate-800 shadow-md transition-transform duration-200 ease-out ' +
      (isDark ? 'translate-x-[44px]' : 'translate-x-[4px]')
    )
  }, [isDark])

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      className={`inline-flex items-center justify-center shrink-0 h-9 ${className}`.trim()}
    >
      <span className={trackCls}>
        <span className={isDark ? 'left-2.5 absolute flex items-center justify-center text-slate-400' : 'left-2.5 absolute flex items-center justify-center text-slate-500'}>
          <Sun className="w-3.5 h-3.5" />
        </span>
        <span className={isDark ? 'right-2.5 absolute flex items-center justify-center text-slate-400' : 'right-2.5 absolute flex items-center justify-center text-slate-500'}>
          <Moon className="w-3.5 h-3.5" />
        </span>
        <span className={knobCls}>
          {isDark ? <Moon className="w-3.5 h-3.5 text-amber-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
        </span>
      </span>
    </button>
  )
}

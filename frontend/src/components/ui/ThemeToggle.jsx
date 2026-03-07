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

export default function ThemeToggle({ className }) {
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
      'relative inline-flex h-10 w-[92px] items-center rounded-full border transition-all duration-200 ease-out ' +
      'shadow-[0_8px_18px_rgba(15,23,42,0.06)] ' +
      (isDark ? 'border-white/10 bg-[#1a1a1a]' : 'border-black/10 bg-white/70')
    )
  }, [isDark])

  const knobCls = useMemo(() => {
    return (
      'absolute top-1/2 left-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#FCF9F4] shadow-[0_10px_22px_rgba(15,23,42,0.12)] transition-transform duration-200 ease-out ' +
      (isDark ? 'translate-x-[52px]' : 'translate-x-[6px]')
    )
  }, [isDark])

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      className={className}
    >
      <span className={trackCls}>
        <span className={isDark ? 'left-3 absolute flex items-center justify-center text-slate-300' : 'left-3 absolute flex items-center justify-center text-slate-600'}>
          <Sun className="w-4 h-4" />
        </span>
        <span className={isDark ? 'right-3 absolute flex items-center justify-center text-slate-300' : 'right-3 absolute flex items-center justify-center text-slate-600'}>
          <Moon className="w-4 h-4" />
        </span>
        <span className={knobCls}>
          {isDark ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4 text-slate-800" />}
        </span>
      </span>
    </button>
  )
}

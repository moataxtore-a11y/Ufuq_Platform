import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn.js'

export default function Select({
  value,
  onChange,
  options: optionsProp,
  children,
  disabled = false,
  className = '',
  placeholder = '',
  label,
  error
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const options = optionsProp || parseChildren(children)
  const selected = options.find((o) => String(o.value) === String(value ?? ''))
  const displayLabel = selected?.label || placeholder || ''

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function pick(val) {
    onChange?.({ target: { value: val } })
    setOpen(false)
  }

  return (
    <div className="form-group">
      {label && (
        <label className={cn('form-label', error && 'text-red-500 dark:text-red-400')}>
          {label}
        </label>
      )}
      <div ref={ref} className={cn('relative w-full', disabled && 'opacity-50 pointer-events-none')}>
        <button
          type="button"
          onClick={() => !disabled && setOpen((v) => !v)}
          className={cn(
            'flex items-center justify-between gap-2 w-full h-11 px-4',
            'rounded-xl border text-body-sm font-medium text-left',
            'bg-white dark:bg-white/[0.06]',
            'text-slate-900 dark:text-slate-100',
            'outline-none transition-all duration-150',
            open
              ? 'ring-2 ring-brand/20 border-brand/40 dark:border-brand/35'
              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20',
            error && 'border-red-400 dark:border-red-500/50',
            className
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
        >
          <span className={cn('flex-1 truncate', !displayLabel && 'text-slate-400 dark:text-slate-500')}>
            {displayLabel || placeholder}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-150',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            className={cn(
              'z-50 absolute mt-1.5 w-full max-h-60 overflow-auto',
              'bg-white dark:bg-[#1e1e1e]',
              'border border-slate-200 dark:border-white/10',
              'rounded-xl shadow-elevated',
              'py-1 animate-slide-down'
            )}
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value ?? '')
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => pick(opt.value)}
                  className={cn(
                    'flex items-center px-4 py-2.5 text-body-sm transition-colors cursor-pointer select-none',
                    isSelected
                      ? 'bg-brand/8 dark:bg-brand/15 text-brand dark:text-brand-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                  )}
                >
                  {isSelected && (
                    <span className="me-2 text-brand dark:text-brand-400 text-xs">✓</span>
                  )}
                  <span className={cn('truncate', !isSelected && 'ms-5')}>{opt.label}</span>
                </li>
              )
            })}
            {options.length === 0 && (
              <li className="px-4 py-3 text-slate-400 dark:text-slate-500 text-body-sm text-center">لا يوجد خيارات</li>
            )}
          </ul>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

function parseChildren(children) {
  if (!children) return []
  const arr = Array.isArray(children) ? children.flat() : [children]
  return arr
    .filter((c) => c && c.type === 'option')
    .map((c) => ({
      value: String(c.props?.value ?? ''),
      label: String(c.props?.children ?? c.props?.value ?? '')
    }))
}

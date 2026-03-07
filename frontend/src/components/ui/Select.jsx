import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn.js'

/**
 * CustomSelect – drop-in replacement for <select>.
 *
 * Props:
 *  value       – controlled value
 *  onChange    – called with a synthetic-like event: { target: { value } }
 *  options     – [{ value, label }]  (preferred)
 *  children    – <option> elements (fallback, parsed automatically)
 *  disabled    – boolean
 *  className   – extra classes on the trigger button
 *  placeholder – shown when value is ''
 */
export default function Select({
  value,
  onChange,
  options: optionsProp,
  children,
  disabled = false,
  className = '',
  placeholder = ''
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Parse <option> children into an array if options prop not given
  const options = optionsProp || parseChildren(children)

  const selected = options.find((o) => String(o.value) === String(value ?? ''))
  const displayLabel = selected?.label || placeholder || ''

  // Close on outside click
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
    <div ref={ref} className={cn('relative w-full', disabled && 'opacity-50 pointer-events-none')}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          'flex items-center justify-between w-full h-10 px-3 gap-2',
          'rounded-xl border text-sm font-medium text-left',
          'bg-white dark:bg-white/[0.06]',
          'border-slate-200 dark:border-white/10',
          'text-slate-900 dark:text-slate-100',
          'transition-all outline-none',
          open
            ? 'ring-2 ring-amber-300/50 border-amber-400/60 dark:border-amber-300/50'
            : 'hover:border-slate-300 dark:hover:border-white/20',
          className
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        <span className={cn('truncate flex-1 text-right', !displayLabel && 'text-slate-400 dark:text-slate-500')}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 w-full overflow-auto max-h-60',
            'bg-white dark:bg-[#1e1e1e]',
            'border border-slate-200 dark:border-white/10',
            'rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40',
            'py-1'
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
                  'flex items-center px-3 py-2 text-sm cursor-pointer select-none transition-colors',
                  isSelected
                    ? 'bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                )}
              >
                {isSelected && (
                  <span className="me-2 text-amber-500 dark:text-amber-400 text-xs">✓</span>
                )}
                <span className={cn('truncate', !isSelected && 'ms-5')}>{opt.label}</span>
              </li>
            )
          })}
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500 text-center">لا يوجد خيارات</li>
          )}
        </ul>
      )}
    </div>
  )
}

/** Parse React <option> children into [{ value, label }] */
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

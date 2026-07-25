import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../utils/cn.js'

export default function Button({ className, variant = 'default', size = 'md', asChild = false, loading = false, children, ...props }) {
  const classes = cn(
    'inline-flex justify-center items-center gap-2 rounded-xl font-semibold whitespace-nowrap',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'active:scale-[0.98]',
    variant === 'default' && [
      'bg-brand text-white border border-brand/30',
      'shadow-[0_2px_8px_rgba(6,148,132,0.2)]',
      'hover:bg-brand-600 hover:shadow-[0_4px_16px_rgba(6,148,132,0.3)]',
      'focus-visible:ring-brand/40 focus-visible:ring-offset-[#E0F3E9]',
      'dark:focus-visible:ring-offset-[#121212]',
    ],
    variant === 'secondary' && [
      'bg-white/80 border border-slate-200/60 text-slate-700',
      'backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
      'hover:bg-white hover:border-slate-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
      'dark:bg-white/[0.06] dark:border-white/10 dark:text-slate-200',
      'dark:hover:bg-white/[0.1] dark:hover:border-white/15',
      'focus-visible:ring-slate-300 focus-visible:ring-offset-white',
      'dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-[#121212]',
    ],
    variant === 'destructive' && [
      'bg-red-600 text-white border border-red-600/30',
      'shadow-[0_2px_8px_rgba(220,38,38,0.2)]',
      'hover:bg-red-700 hover:shadow-[0_4px_16px_rgba(220,38,38,0.3)]',
      'focus-visible:ring-red-400 focus-visible:ring-offset-white',
      'dark:focus-visible:ring-offset-[#121212]',
    ],
    variant === 'outline' && [
      'bg-transparent border border-brand/30 text-slate-800',
      'hover:bg-brand/5 hover:border-brand/40',
      'dark:text-slate-200 dark:border-brand/25 dark:hover:bg-brand/10',
      'focus-visible:ring-brand/30 focus-visible:ring-offset-white',
      'dark:focus-visible:ring-offset-[#121212]',
    ],
    variant === 'ghost' && [
      'bg-transparent text-slate-600 border border-transparent',
      'hover:bg-black/[0.04] hover:text-slate-800',
      'dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-slate-100',
      'focus-visible:ring-slate-300',
      'dark:focus-visible:ring-white/20',
    ],
    size === 'xs' && 'h-8 px-3 py-1.5 text-caption rounded-lg',
    size === 'sm' && 'h-9 px-4 py-2 text-body-sm',
    size === 'md' && 'h-11 px-5 py-2.5 text-body-sm',
    size === 'lg' && 'h-12 px-6 py-3 text-body',
    size === 'xl' && 'h-14 px-8 py-3.5 text-body-lg',
    loading && 'relative text-transparent pointer-events-none',
    className
  )

  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="border-2 border-current/25 border-t-current rounded-full w-4 h-4 animate-spin" />
        </span>
      )}
      {children}
    </button>
  )
}

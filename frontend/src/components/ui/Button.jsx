import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../utils/cn.js'

export default function Button({ className, variant = 'default', size = 'md', asChild = false, children, ...props }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(
        'inline-flex justify-center items-center gap-2 disabled:opacity-50 rounded-xl font-semibold text-base leading-relaxed whitespace-nowrap disabled:pointer-events-none',
        'min-h-[48px] sm:min-h-0',
        'transition-all duration-200 ease-out',
        'active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0F3E9]',
        'dark:focus-visible:ring-brand/30 dark:focus-visible:ring-offset-[#121212]',
        variant === 'default' &&
        'bg-brand text-white shadow-[0_10px_24px_rgba(6,148,132,0.18)] hover:bg-brand-600 hover:shadow-[0_14px_34px_rgba(6,148,132,0.26)] border border-brand/30',
        variant === 'secondary' &&
        'border border-slate-200/50 bg-white/70 backdrop-blur-md text-slate-800 shadow-glass-sm hover:bg-white hover:shadow-glass-md dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-100 dark:hover:bg-white/[0.15]',
        variant === 'destructive' &&
        'bg-red-600 text-white shadow-[0_10px_22px_rgba(225,29,72,0.3)] hover:bg-red-700 hover:shadow-[0_14px_30px_rgba(225,29,72,0.4)]',
        variant === 'outline' &&
        'border border-brand/35 bg-transparent text-slate-900 shadow-[0_6px_14px_rgba(15,23,42,0.06)] hover:bg-brand/10 hover:shadow-glow-brand dark:border-brand/30 dark:text-slate-100 dark:hover:bg-brand/10',
        size === 'sm' && 'h-12 sm:h-10 px-4 py-2.5 sm:py-2',
        size === 'md' && 'h-12 sm:h-11 px-5 py-2.5 sm:py-2.5',
        size === 'lg' && 'h-14 sm:h-12 px-7 py-3 sm:py-3',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}

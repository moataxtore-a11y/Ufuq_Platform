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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(217,159,74,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCF9F4]',
        'dark:focus-visible:ring-[rgba(217,159,74,0.35)] dark:focus-visible:ring-offset-[#121212]',
        variant === 'default' &&
          'bg-[rgb(244,206,125)] text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.12)] hover:shadow-[0_14px_30px_rgba(15,23,42,0.16)] hover:bg-[rgb(242,198,109)]',
        variant === 'secondary' &&
          'border border-black/10 bg-white/70 text-slate-800 shadow-[0_8px_18px_rgba(15,23,42,0.06)] hover:bg-white hover:shadow-[0_12px_26px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:bg-white/[0.08]',
        variant === 'destructive' &&
          'bg-red-600 text-white shadow-[0_10px_22px_rgba(15,23,42,0.12)] hover:bg-red-700 hover:shadow-[0_14px_30px_rgba(15,23,42,0.16)]',
        variant === 'outline' &&
          'border border-[rgba(217,159,74,0.55)] bg-transparent text-slate-800 shadow-[0_6px_14px_rgba(15,23,42,0.06)] hover:bg-[rgba(244,206,125,0.25)] hover:shadow-[0_10px_22px_rgba(15,23,42,0.10)] dark:border-[rgba(217,159,74,0.30)] dark:text-slate-100 dark:hover:bg-[rgba(244,206,125,0.10)]',
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

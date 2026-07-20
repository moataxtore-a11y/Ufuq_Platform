import { cn } from '../../utils/cn.js'

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex bg-white px-4 py-3 border border-slate-300 rounded-xl outline-none focus-visible:outline-none w-full min-h-[52px] text-slate-900 placeholder:text-slate-400 text-base leading-relaxed transition-all duration-150',
        'focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
        'dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-slate-400',
        'dark:focus-visible:border-brand/50 dark:focus-visible:ring-brand/30 dark:focus-visible:ring-offset-neutral-950'
      )}
      {...props}
    />
  )
}

import { cn } from '../../utils/cn.js'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white/80 shadow-[0_10px_26px_rgba(15,23,42,0.06)] backdrop-blur-[2px] border border-black/5 rounded-3xl',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]',
        'dark:border-white/10 dark:bg-[#1a1a1a] dark:shadow-none',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('p-4 border-black/5 dark:border-white/10 border-b', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <div className={cn('font-semibold text-slate-900 dark:text-white', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-4', className)} {...props} />
}

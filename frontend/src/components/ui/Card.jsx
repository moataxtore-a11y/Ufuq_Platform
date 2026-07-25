import { cn } from '../../utils/cn.js'

export function Card({ className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm',
        'border border-slate-200/50 dark:border-white/10',
        'rounded-2xl',
        'shadow-card',
        hover && 'card-surface-hover',
        !hover && 'transition-shadow duration-200',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('px-5 py-4 border-slate-100 dark:border-white/[0.06] border-b', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('font-semibold text-h3 text-slate-900 dark:text-white', className)} {...props} />
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-body-sm text-slate-500 dark:text-slate-400 mt-0.5', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('px-5 py-4 border-slate-100 dark:border-white/[0.06] border-t', className)} {...props} />
}

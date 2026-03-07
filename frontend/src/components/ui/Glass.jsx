import { cn } from '../../utils/cn.js'

export function GlassCard({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white/70 dark:bg-white/[0.06] shadow-xl dark:shadow-none backdrop-blur border border-white/70 dark:border-white/10 rounded-[28px]',
        className
      )}
      {...props}
    />
  )
}

export function GlassSection({ className, ...props }) {
  return (
    <section
      className={cn(
        'bg-white/55 dark:bg-white/[0.05] shadow-lg dark:shadow-none backdrop-blur border border-white/60 dark:border-white/10 rounded-[28px]',
        className
      )}
      {...props}
    />
  )
}

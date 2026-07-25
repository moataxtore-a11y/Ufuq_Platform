import { cn } from '../../utils/cn.js'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200/80 dark:bg-white/[0.08] relative overflow-hidden',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/10 before:to-transparent',
        className
      )}
      {...props}
    />
  )
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2.5 w-full', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3.5 rounded-md',
            i === 0 && 'w-full',
            i === 1 && 'w-[85%]',
            i > 1 && 'w-[60%]'
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4 transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4 rounded-lg" />
      <SkeletonText lines={2} />
      <div className="pt-2 flex items-center justify-between">
        <Skeleton className="w-20 h-4 rounded-md" />
        <Skeleton className="w-24 h-9 rounded-xl" />
      </div>
    </div>
  )
}

export function SectionSkeleton({ count = 3, className }) {
  return (
    <div className={cn('w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, className }) {
  return (
    <div
      className={cn(
        'w-full bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 space-y-4 transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn(
                  'h-4 rounded-md',
                  c === 0 ? 'w-1/3' : 'w-1/6'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

import { cn } from '../../utils/cn.js'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200/80 dark:bg-white/[0.08] relative overflow-hidden',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_0.9s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/10 before:to-transparent',
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

export function PageHeaderSkeleton({ className }) {
  return (
    <div className={cn('space-y-3 text-center', className)}>
      <Skeleton className="mx-auto h-7 w-28 rounded-full" />
      <Skeleton className="mx-auto h-10 w-[min(420px,82vw)] rounded-xl" />
      <Skeleton className="mx-auto h-4 w-[min(320px,70vw)] rounded-md" />
    </div>
  )
}

export function CardGridSkeleton({ count = 6, className }) {
  return (
    <div className={cn('app-grid-cards', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-0 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#171717] p-4 shadow-sm">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <div className="flex items-center justify-between gap-3 pt-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, className }) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-white/10 rounded-xl p-4 space-y-3 transition-colors',
        className
      )}
    >
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex min-w-[720px] items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-white/5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn(
                  'h-4 rounded-md',
                  c === 0 ? 'w-1/5' : c === cols - 1 ? 'w-28 h-9 rounded-xl' : 'w-1/6'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

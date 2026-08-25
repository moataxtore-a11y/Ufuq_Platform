import { cn } from '../../utils/cn.js'
import { CardGridSkeleton, PageHeaderSkeleton, Skeleton } from './Skeleton.jsx'

const sizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export default function Spinner({ className, size = 'md' }) {
  const isInlineSpinner = className && (
    className.includes('border-t-white') ||
    className.includes('w-4') ||
    className.includes('w-3')
  )

  if (isInlineSpinner) {
    return (
      <div
        className={cn(
          'border-brand/20 border-t-brand rounded-full animate-spin',
          sizes[size] || sizes.md,
          className
        )}
        aria-label="Loading"
        role="status"
      />
    )
  }

  return (
    <div className="w-full space-y-3 py-2" role="status" aria-label="Loading">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 transition-colors">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-3 w-1/3 rounded-md" />
          </div>
          <Skeleton className="w-16 h-8 rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export function PageSpinner({ text = 'جاري التحميل...', className }) {
  return (
    <div className={cn('w-full space-y-6 py-2', className)} role="status" aria-label={text}>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} />
    </div>
  )
}

export function InlineSpinner({ className }) {
  return (
    <div
      className={cn(
        'border-brand/20 border-t-brand rounded-full animate-spin',
        sizes.sm,
        className
      )}
      aria-label="Loading"
      role="status"
    />
  )
}

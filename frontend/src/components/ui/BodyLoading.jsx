import { Skeleton, SkeletonCard } from './Skeleton.jsx'
import { cn } from '../../utils/cn.js'

export default function BodyLoading({ message = 'جاري التحميل...', className }) {
  return (
    <div
      className={cn(
        'min-h-screen w-full bg-slate-50 dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden transition-opacity duration-300',
        className
      )}
      dir="rtl"
    >
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-brand/15 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand via-accent to-brand w-1/3 animate-[loadingBar_1.5s_infinite_linear]" />
      </div>

      {/* Header Skeleton */}
      <header className="w-full border-b border-black/5 dark:border-white/10 bg-white/75 dark:bg-[#121212]/80 backdrop-blur px-4 sm:px-8 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <Skeleton className="w-28 h-6 rounded-lg" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Skeleton className="w-20 h-4 rounded-md" />
          <Skeleton className="w-20 h-4 rounded-md" />
          <Skeleton className="w-20 h-4 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>
      </header>

      {/* Main Body Skeleton */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 z-10">
        {/* Banner / Hero Skeleton */}
        <div className="bg-white/80 dark:bg-[#171717] border border-black/5 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden space-y-5">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-32 h-4 rounded-md" />
          </div>
          <Skeleton className="h-10 sm:h-12 w-3/4 max-w-xl rounded-2xl" />
          <Skeleton className="h-5 w-1/2 max-w-md rounded-lg" />
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Skeleton className="w-36 h-11 rounded-2xl" />
            <Skeleton className="w-28 h-11 rounded-2xl" />
          </div>
        </div>

        {/* Content Cards Grid Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-7 w-44 rounded-xl" />
            <Skeleton className="h-5 w-20 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </main>

      {/* Centered Loading Badge Float */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md border border-brand/30 dark:border-brand/40 px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
          {message}
        </span>
      </div>
    </div>
  )
}

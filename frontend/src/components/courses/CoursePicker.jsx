import { Check, Image as ImageIcon } from 'lucide-react'
import { cn } from '../../utils/cn.js'

export default function CoursePicker({
  courses = [],
  value,
  onChange,
  label,
  placeholder,
  emptyText,
  isRtl = false
}) {
  const selectedCourse = courses.find((course) => String(course?._id || course?.id) === String(value || ''))

  return (
    <div className="gap-2 grid">
      {label ? (
        <div className="flex items-end justify-between gap-3">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{label}</label>
          {selectedCourse ? (
            <span className="text-slate-400 dark:text-slate-500 text-xs truncate">
              {selectedCourse.title || placeholder}
            </span>
          ) : null}
        </div>
      ) : null}

      {courses.length > 0 ? (
        <div className="gap-3 grid sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const id = course?._id || course?.id
            const isSelected = String(id) === String(value || '')
            const title = course?.title || placeholder

            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange?.(id)}
                className={cn(
                  'group flex min-h-28 items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-all duration-200',
                  'bg-white/80 dark:bg-white/[0.055] hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-glass-sm',
                  isRtl ? 'flex-row text-right' : 'flex-row text-left',
                  isSelected
                    ? 'border-brand/55 ring-2 ring-brand/15 dark:bg-brand/10'
                    : 'border-slate-200 dark:border-white/10'
                )}
                aria-pressed={isSelected}
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <div className="relative flex h-18 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-white/[0.06] my-1">
                  {course?.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={title} className="h-full w-full object-cover object-center" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div className={cn('min-w-0 flex-1', isRtl ? 'text-right' : 'text-left')}>
                  <div className="line-clamp-2 font-bold text-slate-800 dark:text-slate-100 text-sm leading-5">
                    {title}
                  </div>
                  <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
                    {isSelected ? (isRtl ? 'الكورس المختار' : 'Selected course') : (isRtl ? 'اضغط للاختيار' : 'Tap to select')}
                  </div>
                </div>

                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                    isSelected
                      ? 'border-brand bg-brand text-white'
                      : 'border-slate-200 text-slate-300 dark:border-white/10 dark:text-slate-500'
                  )}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : null}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] px-4 py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
          {emptyText || placeholder}
        </div>
      )}
    </div>
  )
}

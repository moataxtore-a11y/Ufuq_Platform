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
                  'group grid min-h-[86px] grid-cols-[52px_1fr_96px] items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all duration-200',
                  'bg-white/80 dark:bg-white/[0.055] hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-glass-sm',
                  isRtl ? 'text-right' : 'text-left',
                  isSelected
                    ? 'border-brand/55 ring-2 ring-brand/15 dark:bg-brand/10'
                    : 'border-slate-200 dark:border-white/10'
                )}
                aria-pressed={isSelected}
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <span
                  className={cn(
                    'col-start-1 flex h-9 w-9 items-center justify-center justify-self-center rounded-full border transition-colors',
                    isSelected
                      ? 'border-brand bg-brand text-white'
                      : 'border-slate-200 text-slate-300 dark:border-white/10 dark:text-slate-500'
                  )}
                >
                  {isSelected ? <Check className="h-5 w-5" /> : null}
                </span>

                <div className="col-start-2 min-w-0 justify-self-center text-center">
                  <div className="line-clamp-1 font-bold text-slate-800 dark:text-slate-100 text-sm leading-5">
                    {title}
                  </div>
                  <div className="mt-1 line-clamp-1 text-slate-500 dark:text-slate-400 text-xs">
                    {isSelected ? (isRtl ? 'الكورس المختار' : 'Selected course') : (isRtl ? 'اضغط للاختيار' : 'Tap to select')}
                  </div>
                </div>

                <div className="relative col-start-3 flex h-16 w-24 items-center justify-center justify-self-end overflow-hidden rounded-xl bg-slate-100 dark:bg-white/[0.06]">
                  {course?.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={title} className="h-full w-full object-cover object-center" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
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

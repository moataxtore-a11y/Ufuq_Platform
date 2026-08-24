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
                  'group overflow-hidden rounded-[28px] border transition-all duration-200',
                  'bg-[#001d18] hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-glass-sm',
                  isSelected
                    ? 'border-brand ring-2 ring-brand/20 shadow-glow-brand'
                    : 'border-slate-200 dark:border-white/10'
                )}
                aria-pressed={isSelected}
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-white/[0.06]">
                  {course?.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={title} className="h-full w-full object-cover object-center" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001d18]/40 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
                  <span
                    className={cn(
                      'absolute top-3 flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
                      isRtl ? 'left-3' : 'right-3',
                      isSelected
                        ? 'border-brand bg-brand text-white shadow-lg'
                        : 'border-white/30 bg-black/25 text-white/50 backdrop-blur-sm'
                    )}
                  >
                    {isSelected ? <Check className="h-5 w-5" /> : null}
                  </span>
                </div>

                <div className="flex min-h-20 items-center justify-center bg-[#001d18] px-4 py-4">
                  <div className="line-clamp-2 text-center text-2xl font-extrabold leading-tight text-white">
                    {title}
                  </div>
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

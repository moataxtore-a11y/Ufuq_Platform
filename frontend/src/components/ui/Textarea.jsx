import { cn } from '../../utils/cn.js'

export default function Textarea({ className, label, hint, error, ...props }) {
  return (
    <div className="form-group">
      {label && (
        <label className={cn('form-label', error && 'text-red-500 dark:text-red-400')}>
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'flex w-full bg-white px-4 py-3 text-body-sm',
          'border border-slate-200 rounded-xl min-h-[120px]',
          'text-slate-900 placeholder:text-slate-400',
          'outline-none transition-all duration-150 resize-y',
          'focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-1 focus-visible:ring-offset-white',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
          'dark:bg-white/[0.06] dark:border-white/10 dark:text-white dark:placeholder:text-slate-500',
          'dark:focus-visible:border-brand/40 dark:focus-visible:ring-brand/15 dark:focus-visible:ring-offset-[#121212]',
          'dark:disabled:bg-white/[0.03]',
          error && 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200 dark:border-red-500/50 dark:focus-visible:ring-red-500/20',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="form-hint">{hint}</p>
      )}
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  )
}

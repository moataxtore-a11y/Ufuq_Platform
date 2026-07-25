import { cn } from '../../utils/cn.js'

export function Table({ className, ...props }) {
  return (
    <div className="app-table-scroll">
      <table className={cn('w-full text-body-sm border-collapse', className)} {...props} />
    </div>
  )
}

export function THead({ className, sticky = true, ...props }) {
  return (
    <thead
      className={cn(
        'text-slate-600 dark:text-slate-300 text-overline uppercase tracking-wider',
        'bg-slate-50/80 dark:bg-white/[0.03]',
        sticky && 'sticky top-0 z-10',
        className
      )}
      {...props}
    />
  )
}

export function TBody({ className, ...props }) {
  return <tbody className={cn('text-slate-800 dark:text-slate-100 divide-y divide-slate-100 dark:divide-white/[0.06]', className)} {...props} />
}

export function TR({ className, hover = true, ...props }) {
  return (
    <tr
      className={cn(
        'border-slate-100 dark:border-white/[0.06] border-b transition-colors duration-100',
        hover && 'hover:bg-slate-50/50 dark:hover:bg-white/[0.02]',
        className
      )}
      {...props}
    />
  )
}

export function TH({ className, ...props }) {
  return (
    <th
      className={cn(
        'px-4 py-3 font-semibold text-center whitespace-nowrap',
        className
      )}
      {...props}
    />
  )
}

export function TD({ className, ...props }) {
  return (
    <td
      className={cn(
        'px-4 py-3.5 align-middle text-center',
        className
      )}
      {...props}
    />
  )
}

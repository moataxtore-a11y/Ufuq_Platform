import { cn } from '../../utils/cn.js'

export function Table({ className, ...props }) {
  return <table className={cn('w-full text-sm', className)} {...props} />
}

export function THead({ className, ...props }) {
  return <thead className={cn('text-slate-800 dark:text-white text-center', className)} {...props} />
}

export function TBody({ className, ...props }) {
  return <tbody className={cn('text-slate-900 dark:text-white', className)} {...props} />
}

export function TR({ className, ...props }) {
  return <tr className={cn('border-black/[0.05] dark:border-white/[0.06] border-b', className)} {...props} />
}

export function TH({ className, ...props }) {
  return <th className={cn('px-3 py-3 font-semibold text-center', className)} {...props} />
}

export function TD({ className, ...props }) {
  return <td className={cn('px-3 py-3 align-middle text-center', className)} {...props} />
}

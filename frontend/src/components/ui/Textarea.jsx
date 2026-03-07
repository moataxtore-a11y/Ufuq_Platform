import { cn } from '../../utils/cn.js'

export default function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex bg-white disabled:opacity-50 px-3 py-2.5 border border-black/5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ring-offset-white w-full min-h-[90px] placeholder:text-slate-400 text-sm leading-relaxed disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}

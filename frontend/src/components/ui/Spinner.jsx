import { cn } from '../../utils/cn.js'

export default function Spinner({ className }) {
  return (
    <div
      className={cn(
        'border-2 border-black/5 border-t-primary rounded-full w-5 h-5 animate-spin',
        className
      )}
      aria-label="Loading"
    />
  )
}

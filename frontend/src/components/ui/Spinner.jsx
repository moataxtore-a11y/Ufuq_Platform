import { cn } from '../../utils/cn.js'
import BodyLoading from './BodyLoading.jsx'

const sizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export default function Spinner({ className, size = 'md' }) {
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

export function PageSpinner({ text = 'جاري التحميل...', className }) {
  return <BodyLoading message={text} className={className} />
}

export function InlineSpinner({ className }) {
  return <Spinner size="sm" className={className} />
}

import { cn } from '../../utils/cn.js'

export default function AnimatedBackdrop({ className }) {
  return <div className={cn('design-backdrop absolute inset-0 overflow-hidden pointer-events-none', className)} aria-hidden="true" />
}

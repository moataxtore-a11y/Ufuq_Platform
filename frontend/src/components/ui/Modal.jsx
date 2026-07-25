import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useId } from 'react'
import { cn } from '../../utils/cn.js'

export function Modal({ open, onOpenChange, title, description, children, contentClassName, bodyClassName, showClose = true, size = 'md' }) {
  const descriptionId = useId()
  const describedBy = description ? descriptionId : undefined
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="z-50 fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          aria-describedby={describedBy}
          className={cn(
            'top-1/2 left-1/2 z-[60] fixed flex flex-col',
            'bg-white dark:bg-[#141414]',
            'border border-slate-200/60 dark:border-white/10',
            'rounded-2xl shadow-elevated',
            'w-[95vw] max-h-[90vh] overflow-hidden',
            '-translate-x-1/2 -translate-y-1/2 animate-scale-in',
            'dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
            size === 'sm' && 'max-w-md',
            size === 'md' && 'max-w-2xl',
            size === 'lg' && 'max-w-4xl',
            size === 'xl' && 'max-w-6xl',
            contentClassName
          )}
        >
          <div className="flex items-center justify-between px-5 py-4 border-slate-100 dark:border-white/[0.06] border-b">
            <Dialog.Title className="font-semibold text-h3 text-slate-900 dark:text-white">{title}</Dialog.Title>
            {showClose ? (
              <Dialog.Close className="btn-icon" aria-label="Close">
                <X className="w-4 h-4" />
              </Dialog.Close>
            ) : (
              <div className="w-9 h-9" />
            )}
          </div>
          {description ? (
            <Dialog.Description id={descriptionId} className="sr-only">
              {description}
            </Dialog.Description>
          ) : null}
          <div className={cn('flex-1 overflow-y-auto', bodyClassName || 'p-5')}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

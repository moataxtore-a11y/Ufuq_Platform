import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useId } from 'react'
import { cn } from '../../utils/cn.js'

export function Modal({ open, onOpenChange, title, description, children, contentClassName, bodyClassName, showClose = true }) {
  const descriptionId = useId()
  const describedBy = description ? descriptionId : undefined
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="z-50 fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          aria-describedby={describedBy}
          className={cn(
            'top-1/2 left-1/2 z-[60] fixed flex flex-col bg-white/95 dark:bg-[#0a0a0a]/90 backdrop-blur-glass shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-white/10 rounded-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden -translate-x-1/2 -translate-y-1/2 animate-scale-in',
            contentClassName
          )}
        >
          <div className="flex justify-between items-center p-4 border-black/5 dark:border-white/10 border-b">
            <Dialog.Title className="font-semibold text-slate-900 dark:text-white text-base">{title}</Dialog.Title>
            {showClose ? (
              <Dialog.Close className="hover:bg-slate-50 dark:hover:bg-white/[0.06] p-2 rounded-xl transition-colors">
                <X className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              </Dialog.Close>
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
          {description ? (
            <Dialog.Description id={descriptionId} className="sr-only">
              {description}
            </Dialog.Description>
          ) : null}
          <div className={cn('flex-1 p-4 overflow-y-auto', bodyClassName)}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

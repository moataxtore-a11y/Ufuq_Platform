import Button from './Button.jsx'
import { Modal } from './Modal.jsx'

export default function ConfirmDialog({ open, onOpenChange, title, description, icon, confirmLabel = 'OK', cancelLabel = 'Cancel', loading = false, variant = 'destructive', onConfirm }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 p-5">
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.06]">
            {icon}
          </div>
        )}
        {description && (
          <p className="text-body text-slate-600 dark:text-slate-300 text-center leading-relaxed max-w-sm">
            {description}
          </p>
        )}
        <div className="flex items-center justify-end gap-3 w-full pt-2">
          <Button type="button" variant="secondary" size="md" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={variant} size="md" onClick={onConfirm} disabled={loading} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

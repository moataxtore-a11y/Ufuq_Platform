import Button from './Button.jsx'
import { Modal } from './Modal.jsx'

export default function ConfirmDialog({ open, onOpenChange, title, description, icon, confirmLabel = 'OK', cancelLabel = 'Cancel', loading = false, onConfirm }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <div className="gap-4 grid">
        {icon ? (
          <div className="flex justify-center">
            {icon}
          </div>
        ) : null}
        {description ? (
          <div className="text-slate-700 dark:text-slate-200 text-sm text-center leading-6">{description}</div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? '...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

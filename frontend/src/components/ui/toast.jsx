import * as React from 'react'
import * as Toast from '@radix-ui/react-toast'
import { CheckCircle2, X, XCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '../../utils/cn.js'
import { motion } from 'framer-motion'

const ToastContext = React.createContext(null)

function safeId() {
  try {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID()
    }
  } catch {
    // ignore
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const variantStyles = {
  default: {
    border: 'border-slate-200 dark:border-white/10',
    icon: CheckCircle2,
    iconClass: 'text-brand',
  },
  success: {
    border: 'border-emerald-200 dark:border-emerald-500/30',
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
  },
  destructive: {
    border: 'border-red-200 dark:border-red-500/30',
    icon: XCircle,
    iconClass: 'text-red-500',
  },
  warning: {
    border: 'border-amber-200 dark:border-amber-500/30',
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
  },
  info: {
    border: 'border-blue-200 dark:border-blue-500/30',
    icon: Info,
    iconClass: 'text-blue-500',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const lastByKeyRef = React.useRef(new Map())

  const notify = React.useCallback((toast) => {
    const key = `${toast?.variant || 'default'}|${toast?.title || ''}|${toast?.description || ''}`
    const now = Date.now()
    const last = lastByKeyRef.current.get(key)
    if (last && now - last < 900) return last.id

    const id = safeId()
    lastByKeyRef.current.set(key, { id, ts: now })
    setToasts((t) => [...t, { id, ...toast }])
    return id
  }, [])

  const dismiss = React.useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ notify, dismiss }}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Viewport className="top-6 left-1/2 z-[120] fixed flex flex-col gap-2.5 outline-none w-[420px] max-w-[92vw] -translate-x-1/2" />
        {toasts.map((t) => {
          const v = variantStyles[t.variant] || variantStyles.default
          const IconComp = v.icon
          return (
            <Toast.Root
              key={t.id}
              duration={t.duration ?? 3500}
              onOpenChange={(open) => {
                if (!open) dismiss(t.id)
              }}
              className={cn(
                'shadow-elevated p-4 rounded-xl toast-animate',
                'bg-white dark:bg-[#1a1a1a]',
                'border',
                v.border,
                'backdrop-blur-sm'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('mt-0.5 shrink-0', v.iconClass)}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.1 }}
                  >
                    {t.iconSrc ? (
                      <img src={t.iconSrc} alt="" aria-hidden="true" className="w-5 h-5" />
                    ) : (
                      <IconComp className="w-5 h-5" />
                    )}
                  </motion.div>
                </div>
                <div className="flex-1 min-w-0">
                  <Toast.Title className="font-semibold text-body-sm text-slate-900 dark:text-white">{t.title}</Toast.Title>
                  {t.description && (
                    <Toast.Description className="mt-1 text-caption text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t.description}
                    </Toast.Description>
                  )}
                </div>
                <Toast.Close className="btn-icon shrink-0" aria-label="Close">
                  <X className="w-3.5 h-3.5" />
                </Toast.Close>
              </div>
            </Toast.Root>
          )
        })}
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

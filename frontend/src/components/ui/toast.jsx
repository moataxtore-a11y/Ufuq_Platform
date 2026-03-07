import * as React from 'react'
import * as Toast from '@radix-ui/react-toast'
import { CheckCircle2, X, XCircle } from 'lucide-react'
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
        <Toast.Viewport className="top-6 left-1/2 z-[120] fixed flex flex-col gap-2 outline-none w-[420px] max-w-[92vw] -translate-x-1/2" />
        {toasts.map((t) => (
          <Toast.Root
            key={t.id}
            duration={t.duration ?? 3500}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id)
            }}
            className={cn(
              'toast-animate shadow-lg p-4 border rounded-xl',
              'bg-white text-slate-900 border-black/5',
              'dark:bg-[#0f0f10] dark:text-slate-100 dark:border-white/10',
              t.variant === 'destructive' && 'border-red-200 dark:border-red-500/30'
            )}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    'mt-0.5 shrink-0',
                    t.variant === 'destructive' ? 'text-rose-600' : 'text-emerald-500'
                  )}
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.1 }}
                  >
                    {t.iconSrc ? (
                      <img src={t.iconSrc} alt="" aria-hidden="true" className="w-5 h-5" />
                    ) : t.variant === 'destructive' ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5px]" />
                    )}
                  </motion.div>
                </div>
                <div>
                  <Toast.Title className="font-semibold text-sm">{t.title}</Toast.Title>
                  {t.description ? (
                    <Toast.Description className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
                      {t.description}
                    </Toast.Description>
                  ) : null}
                </div>
              </div>
              <Toast.Close className="hover:bg-slate-100 dark:hover:bg-white/[0.06] p-1 rounded-md">
                <X className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              </Toast.Close>
            </div>
          </Toast.Root>
        ))}
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

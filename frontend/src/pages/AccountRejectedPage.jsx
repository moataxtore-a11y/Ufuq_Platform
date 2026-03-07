import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import dicleanIcon from '../cvg/diclean.svg'
import { useLanguage } from '../context/LanguageContext.jsx'
import SiteHeader from '../components/layout/SiteHeader.jsx'

export default function AccountRejectedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isRtl } = useLanguage()

  const reasonFromState = location?.state?.reason

  const reason = useMemo(() => {
    const r = typeof reasonFromState === 'string' ? reasonFromState : ''
    if (r.trim()) return r.trim()
    try {
      const saved = sessionStorage.getItem('rejectionReason') || ''
      return String(saved || '').trim()
    } catch {
      return ''
    }
  }, [reasonFromState])

  useEffect(() => {
    try {
      if (reason) sessionStorage.setItem('rejectionReason', reason)
      else sessionStorage.removeItem('rejectionReason')
    } catch {
      // ignore
    }
  }, [reason])

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col bg-[#FCF9F4] dark:bg-[#121212] min-h-screen text-slate-800 dark:text-slate-100">
      <SiteHeader />

      <main className="flex flex-1 justify-center items-center px-4 py-6">
        <div className="w-full max-w-md text-center">
          <img src={dicleanIcon} alt="Rejected" className="mx-auto w-28 h-28" />

          <div className="mt-4 font-extrabold text-slate-900 dark:text-white text-2xl">تم رفض حسابك</div>

          <div className="mt-3 text-slate-800 dark:text-slate-100 text-sm break-words leading-6 whitespace-pre-wrap">
            {reason || (isRtl ? 'لم يتم توضيح سبب الرفض.' : 'No rejection reason provided.')}
          </div>

          <div className="mt-6">
            <Button
              type="button"
              className="w-full"
              variant="secondary"
              onClick={() => navigate('/login', { replace: true })}
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

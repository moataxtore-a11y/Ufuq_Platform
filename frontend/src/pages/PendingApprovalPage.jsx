import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import waitIcon from '../cvg/wait.svg'
import { useLanguage } from '../context/LanguageContext.jsx'
import SiteHeader from '../components/layout/SiteHeader.jsx'

export default function PendingApprovalPage() {
  const navigate = useNavigate()
  const { isRtl } = useLanguage()

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col bg-[#FCF9F4] dark:bg-[#121212] min-h-screen text-slate-800 dark:text-slate-100">
      <SiteHeader />

      <main className="flex flex-1 justify-center items-center px-4 py-6">
        <div className="w-full max-w-md text-center">
          <img src={waitIcon} alt="Waiting" className="mx-auto w-28 h-28" />

          <div className="mt-4 font-extrabold text-slate-900 dark:text-white text-2xl">
            {isRtl ? 'جاري المراجعة' : 'Under review'}
          </div>
          <div className="mt-2 text-slate-700 dark:text-slate-300 text-sm leading-6">
            {isRtl
              ? 'هنراجع بياناتك خلال ساعات وبعدها تقدر تدخل الاكونت'
              : 'We will review your details within a few hours. After that you can access your account.'}
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

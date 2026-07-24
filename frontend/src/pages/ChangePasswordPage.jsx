import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/ui/toast.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import logo from '../cvg/logo (2)_3.webp'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import LanguageToggle from '../components/ui/LanguageToggle.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import SiteFooter from '../components/layout/SiteFooter.jsx'
import SiteHeader from '../components/layout/SiteHeader.jsx'

import { Eye, EyeOff } from 'lucide-react'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { auth, setAuth, logout } = useAuth()
  const { notify } = useToast()
  const { isRtl, t } = useLanguage()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
      const { data } = await api.post('/account/change-password', {
        currentPassword,
        newPassword
      })
      setAuth({ ...auth, ...data })
      if (data.role === 'admin') navigate('/admin', { replace: true })
      else if (data.role === 'teacher') navigate('/teacher', { replace: true })
      else if (data.role === 'team') navigate('/team', { replace: true })
      else navigate('/student', { replace: true })
    } catch (err) {
      if (err?.response?.status === 401) {
        logout()
        navigate('/login', { replace: true })
        return
      }
      const msg = err?.response?.data?.message || 'Change password failed'
      setError(msg)
      notify({ title: 'Password update failed', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <SiteHeader />
      <div className="relative flex-1 mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 w-full max-w-6xl">
        <div className="bg-white dark:bg-[#1a1a1a] shadow-sm dark:shadow-none p-6 border border-black/5 dark:border-white/10 rounded-xl w-full max-w-md">
          <div className="mb-6">
            <div className="flex justify-center items-center gap-3 mb-4">
              <img src={logo} alt="Education Platform" className="w-auto h-16 md:h-[72px]" />
              <ThemeToggle className="hidden sm:inline-flex" />
              <LanguageToggle className="hidden sm:inline-flex" />
            </div>
            <h1 className="font-semibold text-slate-900 dark:text-slate-100 text-xl">{t('auth.changePasswordTitle')}</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">{t('auth.changePasswordSubtitle')}</p>
          </div>

          <form onSubmit={onSubmit} className="gap-3 grid">
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{t('auth.currentPasswordLabel')}</label>
              <div className="relative">
                <Input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowCurrent((p) => !p)} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{t('auth.newPasswordLabel')}</label>
              <div className="relative">
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowNew((p) => !p)} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="border-t-white w-4 h-4" />
                  {t('auth.updating')}
                </span>
              ) : (
                t('auth.updatePasswordButton')
              )}
            </Button>

            {error ? <div className="text-red-600 text-sm">{error}</div> : null}
          </form>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

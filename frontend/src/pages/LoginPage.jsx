import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/ui/toast.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CircleX, Lock, Phone } from 'lucide-react'
import AnimatedBackdrop from '../components/ui/AnimatedBackdrop.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import SiteFooter from '../components/layout/SiteFooter.jsx'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import noAccessIcon from '../cvg/No access.svg'
import loginImage from '../img/تسجيل.webp'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const { notify } = useToast()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [openSuspended, setOpenSuspended] = useState(false)
  const [suspendedMessage, setSuspendedMessage] = useState('')
  const [openLoginError, setOpenLoginError] = useState(false)
  const [loginErrorMessage, setLoginErrorMessage] = useState('')

  const { isRtl, t } = useLanguage()

  const [openForgot, setOpenForgot] = useState(false)
  const [fpStep, setFpStep] = useState('email')
  const [fpEmail, setFpEmail] = useState('')
  const [fpCode, setFpCode] = useState('')
  const [fpNew, setFpNew] = useState('')
  const [fpConfirm, setFpConfirm] = useState('')
  const [fpLoading, setFpLoading] = useState(false)
  const [fpError, setFpError] = useState('')

  async function sendResetCode() {
    setFpError('')
    try {
      setFpLoading(true)
      await api.post('/auth/forgot-password', { email: fpEmail })
      setFpStep('code')
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed'
      setFpError(msg)
    } finally {
      setFpLoading(false)
    }
  }

  async function resetPassword() {
    setFpError('')
    if (!fpNew || fpNew.length < 6) {
      setFpError(isRtl ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters')
      return
    }
    if (fpNew !== fpConfirm) {
      setFpError(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      return
    }
    try {
      setFpLoading(true)
      await api.post('/auth/reset-password', { email: fpEmail, code: fpCode, newPassword: fpNew })
      notify({ title: t('auth.passwordUpdated') })
      setOpenForgot(false)
      setFpStep('email')
      setFpEmail('')
      setFpCode('')
      setFpNew('')
      setFpConfirm('')
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed'
      setFpError(msg)
    } finally {
      setFpLoading(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
      const normalizedIdentifier = String(identifier || '').trim()
      const isEmail = normalizedIdentifier.includes('@')
      const isValidEmail = isEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier)
      const digits = normalizedIdentifier.replace(/\D/g, '')
      const isValidPhone = !isEmail && digits.length >= 8

      if (!normalizedIdentifier || (!isValidEmail && !isValidPhone)) {
        const msg = isRtl
          ? 'من فضلك أدخل بريد إلكتروني صحيح أو رقم موبايل صحيح'
          : 'Please enter a valid email or phone number'
        setError(msg)
        setLoginErrorMessage(msg)
        setOpenLoginError(true)
        return
      }
      const finalIdentifier = normalizedIdentifier.includes('@') ? normalizedIdentifier.toLowerCase() : normalizedIdentifier
      const { data } = await api.post('/auth/login', { identifier: finalIdentifier, password })
      setAuth(data)
      if (data.mustChangePassword) {
        navigate('/change-password', { replace: true })
        return
      }
      if (data.role === 'admin') navigate('/admin', { replace: true })
      else if (data.role === 'teacher') navigate('/teacher', { replace: true })
      else if (data.role === 'team') navigate('/team', { replace: true })
      else navigate('/student/select', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed'
      if (String(msg).toLowerCase().includes('account suspended')) {
        const description = isRtl
          ? 'هذا الحساب تم ايقافه عن العمل تواصل معنا لمعرفة الأسباب المحتملة '
          : 'This account has been suspended. Contact us to learn possible reasons.'
        setError(description)
        setSuspendedMessage(description)
        setOpenSuspended(true)
        return
      }
      if (String(msg).toLowerCase().includes('pending approval')) {
        navigate('/pending-approval', { replace: true })
        return
      }
      if (String(msg).toLowerCase().includes('account rejected')) {
        const reason = err?.response?.data?.rejectionReason || ''
        navigate('/account-rejected', { replace: true, state: { reason } })
        return
      }
      setError(msg)
      setLoginErrorMessage(msg)
      setOpenLoginError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      <AnimatedBackdrop />
      <SiteHeader />

      {/* Modals */}
      <Modal
        open={openSuspended}
        onOpenChange={(v) => {
          setOpenSuspended(v)
          if (!v) setSuspendedMessage('')
        }}
        title={isRtl ? 'تم إيقاف الحساب' : 'Account suspended'}
        description={isRtl ? 'تنبيه' : 'Alert'}
        contentClassName="max-w-lg"
      >
        <div className="flex flex-col items-center text-center">
          <img src={noAccessIcon} alt="" aria-hidden="true" className="w-16 h-16" />
          <div className="mt-4 text-slate-900 dark:text-slate-100 text-base">{suspendedMessage}</div>
          <Button
            type="button"
            className="mt-6 rounded-2xl w-full text-white"
            style={{ background: 'linear-gradient(110deg, #D4AF37, #ffc400ff)' }}
            onClick={() => setOpenSuspended(false)}
          >
            {isRtl ? 'حسناً' : 'OK'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={openLoginError}
        onOpenChange={(v) => {
          setOpenLoginError(v)
          if (!v) setLoginErrorMessage('')
        }}
        title={(() => {
          const raw = t('auth.loginFailed')
          return raw === 'auth.loginFailed' ? (isRtl ? 'فشل تسجيل الدخول' : 'Login failed') : raw
        })()}
        description={isRtl ? 'تنبيه' : 'Alert'}
        contentClassName="max-w-lg"
      >
        <div className={"flex items-start gap-3 " + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
          <div className="shrink-0">
            <div className="flex justify-center items-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-full w-11 h-11">
              <CircleX className="text-red-600 dark:text-red-300" size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className={"min-w-0 " + (isRtl ? 'text-right' : 'text-left')}>
            <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm leading-7">
              {loginErrorMessage || error}
            </div>
          </div>
        </div>
      </Modal>

      {/* ===== Main Split Layout ===== */}
      <div className="relative z-10 flex flex-1">

        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden"
        >
          {/* Subtle glow behind image */}
          <div
            className="absolute rounded-full blur-3xl pointer-events-none opacity-40"
            style={{
              width: '380px',
              height: '380px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <motion.img
            src={loginImage}
            alt="تسجيل الدخول"
            className="relative z-10 object-contain drop-shadow-2xl"
            style={{ maxHeight: '100vh', maxWidth: '100%' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Form Side */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-16 py-14"
        >
          {/* Title */}
          <div className="mb-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {isRtl ? (
                <>
                  تسجيل{' '}
                  <span style={{ color: '#D4AF37' }}>الدخول</span>{' '}
                  <span className="text-slate-900 dark:text-slate-100">:</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#D4AF37' }}>Sign</span>{' '}
                  In
                </>
              )}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              {isRtl
                ? 'ادخل على حسابك بإدخال رقم الهاتف و كلمة المرور المسجل بهم من قبل'
                : 'Enter your phone number and password to access your account'}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {isRtl ? 'لا يوجد لديك حساب؟ ' : "Don't have an account? "}
              <Link
                to="/register"
                className="font-semibold underline underline-offset-4"
                style={{ color: '#D4AF37' }}
              >
                {isRtl ? 'أنشئ حسابك الآن !' : 'Create one now!'}
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-6" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* Phone / Email field */}
            <div className="relative flex items-center">
              <span
                className="absolute pointer-events-none"
                style={{
                  [isRtl ? 'right' : 'left']: '0',
                  color: '#D4AF37',
                  fontSize: '1rem',
                }}
              >
                <Phone size={18} />
              </span>
              <input
                dir={isRtl ? 'rtl' : 'ltr'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isRtl ? 'رقم الهاتف' : 'Phone number or email'}
                autoComplete="username"
                className="w-full h-11 text-sm bg-transparent border-0 border-b-2 outline-none transition-colors duration-200 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                style={{
                  borderBottomColor: '#cbd5e1',
                  paddingLeft: isRtl ? '0' : '1.75rem',
                  paddingRight: isRtl ? '1.75rem' : '0',
                }}
                onFocus={(e) => { e.target.style.borderBottomColor = '#D4AF37' }}
                onBlur={(e) => { e.target.style.borderBottomColor = '#cbd5e1' }}
              />
            </div>

            {/* Password field */}
            <div className="relative flex items-center">
              <span
                className="absolute pointer-events-none"
                style={{
                  [isRtl ? 'right' : 'left']: '0',
                  color: '#D4AF37',
                }}
              >
                <Lock size={18} />
              </span>
              <input
                dir={isRtl ? 'rtl' : 'ltr'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRtl ? 'كلمة السر' : 'Password'}
                type="password"
                autoComplete="current-password"
                className="w-full h-11 text-sm bg-transparent border-0 border-b-2 outline-none transition-colors duration-200 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                style={{
                  borderBottomColor: '#cbd5e1',
                  paddingLeft: isRtl ? '0' : '1.75rem',
                  paddingRight: isRtl ? '1.75rem' : '0',
                }}
                onFocus={(e) => { e.target.style.borderBottomColor = '#D4AF37' }}
                onBlur={(e) => { e.target.style.borderBottomColor = '#cbd5e1' }}
              />
            </div>

            {/* Forgot & code row */}
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 flex-wrap gap-2">
              <span>{isRtl ? 'أو قم بتسجيل الدخول عن طريق الكود' : 'Or login with a code'}</span>
              <button
                type="button"
                className="font-semibold underline underline-offset-4 transition-colors hover:opacity-80"
                style={{ color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => {
                  setOpenForgot(true)
                  setFpError('')
                  setFpStep('email')
                  setFpEmail(String(identifier || '').includes('@') ? identifier : '')
                }}
              >
                {isRtl ? 'هل نسيت كلمة السر؟ اضغط هنا' : 'Forgot password? Click here'}
              </button>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-12 rounded-2xl font-bold text-base text-white shadow-md flex items-center justify-center gap-2 transition-all mt-1"
              style={{
                background: 'linear-gradient(110deg, #D4AF37, #ffc400)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="border-t-white w-4 h-4" />
                  {t('auth.loggingIn')}
                </span>
              ) : (
                isRtl ? 'تسجيل الدخول' : 'Login'
              )}
            </motion.button>
          </form>
        </motion.div>

      </div>

      <SiteFooter />

      {/* Forgot Password Modal */}
      <Modal
        open={openForgot}
        onOpenChange={(v) => {
          setOpenForgot(v)
          if (!v) { setFpStep('email'); setFpError('') }
        }}
        title={isRtl ? 'استرجاع كلمة المرور' : 'Reset Password'}
        contentClassName="max-w-md"
      >
        <div className="flex flex-col gap-4" dir={isRtl ? 'rtl' : 'ltr'}>
          {fpStep === 'email' && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isRtl ? 'أدخل بريدك الإلكتروني لإرسال كود الاسترجاع' : 'Enter your email to receive a reset code'}
              </p>
              <Input
                dir="ltr"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="email@example.com"
                autoComplete="email"
                className="rounded-2xl h-12"
              />
              {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
              <Button
                type="button"
                disabled={fpLoading}
                className="rounded-2xl w-full h-11 text-white"
                style={{ background: 'linear-gradient(110deg, #D4AF37, #ffc400ff)' }}
                onClick={sendResetCode}
              >
                {fpLoading ? <Spinner className="border-t-white w-4 h-4 mx-auto" /> : (isRtl ? 'إرسال' : 'Send')}
              </Button>
            </>
          )}
          {fpStep === 'code' && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isRtl ? 'أدخل الكود المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة' : 'Enter the code sent to your email and your new password'}
              </p>
              <Input dir="ltr" value={fpCode} onChange={(e) => setFpCode(e.target.value)} placeholder={isRtl ? 'الكود' : 'Code'} className="rounded-2xl h-12" />
              <Input dir="ltr" value={fpNew} onChange={(e) => setFpNew(e.target.value)} placeholder={isRtl ? 'كلمة المرور الجديدة' : 'New password'} type="password" className="rounded-2xl h-12" />
              <Input dir="ltr" value={fpConfirm} onChange={(e) => setFpConfirm(e.target.value)} placeholder={isRtl ? 'تأكيد كلمة المرور' : 'Confirm password'} type="password" className="rounded-2xl h-12" />
              {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
              <Button
                type="button"
                disabled={fpLoading}
                className="rounded-2xl w-full h-11 text-white"
                style={{ background: 'linear-gradient(110deg, #D4AF37, #ffc400ff)' }}
                onClick={resetPassword}
              >
                {fpLoading ? <Spinner className="border-t-white w-4 h-4 mx-auto" /> : (isRtl ? 'تأكيد' : 'Confirm')}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

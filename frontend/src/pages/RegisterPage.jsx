import { useMemo, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api.js'
import { useToast } from '../components/ui/toast.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import AnimatedBackdrop from '../components/ui/AnimatedBackdrop.jsx'
import Select from '../components/ui/Select.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import SiteFooter from '../components/layout/SiteFooter.jsx'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import approvIcon from '../cvg/approv.svg'
import { motion } from 'framer-motion'
import {
  ChevronDown, User, Phone, School, Calendar, BookOpen,
  GraduationCap, MapPin, CreditCard, Mail, Lock, CheckCircle
} from 'lucide-react'
import registerImage from '../img/اعمل.webp'

/* ─── tiny underline-input ─────────────────────────────────────── */
function LineInput({ icon: Icon, label, children, ...inputProps }) {
  const { isRtl } = useLanguage()

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
          {label}
        </span>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <span
            className={"absolute pointer-events-none text-brand " + (isRtl ? 'right-0' : 'left-0')}
          >
            <Icon size={16} />
          </span>
        )}
        {children || (
          <input
            {...inputProps}
            dir={isRtl ? 'rtl' : 'ltr'}
            className={
              'w-full h-10 text-sm bg-transparent border-0 border-b-2 outline-none transition-colors duration-200 ' +
              'text-slate-800 dark:text-slate-100 placeholder:text-slate-400 ' +
              'border-slate-300 dark:border-slate-600 focus:border-brand focus:ring-0 ' +
              (isRtl ? (Icon ? 'pr-6 pl-0' : 'px-0') : (Icon ? 'pl-6 pr-0' : 'px-0'))
            }
          />
        )}
      </div>
    </div>
  )
}

/* ─── custom dropdown ───────────────────────────────────────────── */
function LineSelect({ icon: Icon, value, onChange, options, placeholder }) {
  const { isRtl } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // close on outside click
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={
          'w-full h-10 flex items-center rounded-xl border text-sm font-medium transition-all duration-200 outline-none ' +
          'bg-white/90 dark:bg-slate-800/60 shadow-sm ' +
          (open || value ? 'border-brand ring-2 ring-brand/20' : 'border-slate-200 dark:border-slate-600') + ' ' +
          (value ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400') + ' ' +
          (isRtl ? 'pl-7 ' + (Icon ? 'pr-9' : 'pr-3') : 'pr-7 ' + (Icon ? 'pl-9' : 'pl-3'))
        }
      >
        {/* icon */}
        {Icon && (
          <span className={"absolute pointer-events-none text-brand " + (isRtl ? 'right-2.5' : 'left-2.5')}>
            <Icon size={15} />
          </span>
        )}
        {/* label */}
        <span className="flex-1 text-start truncate">{selected ? selected.label : placeholder}</span>
        {/* chevron */}
        <span
          className="absolute transition-transform duration-200 pointer-events-none"
          style={{ [isRtl ? 'left' : 'right']: '10px', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </span>
      </button>

      {/* dropdown list */}
      {open && (
        <div
          className="z-50 absolute bg-white dark:bg-slate-800 shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)] mt-1 border border-slate-200 dark:border-slate-600 rounded-xl w-full max-h-[220px] overflow-hidden overflow-y-auto"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={
                'w-full text-sm text-start px-4 py-2.5 transition-colors duration-150 font-medium border-b last:border-b-0 ' +
                'border-slate-100 dark:border-slate-700 ' +
                (o.value === value
                  ? 'bg-brand/10 text-brand'
                  : 'bg-transparent text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.06]')
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const { isRtl, t } = useLanguage()

  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [thirdName, setThirdName] = useState('')
  const [lastName, setLastName] = useState('')
  const [studentPhone, setStudentPhone] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [section, setSection] = useState('')
  const [gradeYear, setGradeYear] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openApproval, setOpenApproval] = useState(false)

  const egyptGovernorates = [
    { ar: 'القاهرة', en: 'Cairo' }, { ar: 'الجيزة', en: 'Giza' },
    { ar: 'الإسكندرية', en: 'Alexandria' }, { ar: 'الدقهلية', en: 'Dakahlia' },
    { ar: 'البحر الأحمر', en: 'Red Sea' }, { ar: 'البحيرة', en: 'Beheira' },
    { ar: 'الفيوم', en: 'Faiyum' }, { ar: 'الغربية', en: 'Gharbia' },
    { ar: 'الإسماعيلية', en: 'Ismailia' }, { ar: 'المنوفية', en: 'Monufia' },
    { ar: 'المنيا', en: 'Minya' }, { ar: 'القليوبية', en: 'Qalyubia' },
    { ar: 'الوادي الجديد', en: 'New Valley' }, { ar: 'السويس', en: 'Suez' },
    { ar: 'اسوان', en: 'Aswan' }, { ar: 'اسيوط', en: 'Asyut' },
    { ar: 'بني سويف', en: 'Beni Suef' }, { ar: 'بورسعيد', en: 'Port Said' },
    { ar: 'دمياط', en: 'Damietta' }, { ar: 'الشرقية', en: 'Sharqia' },
    { ar: 'جنوب سيناء', en: 'South Sinai' }, { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' },
    { ar: 'مطروح', en: 'Matrouh' }, { ar: 'الأقصر', en: 'Luxor' },
    { ar: 'قنا', en: 'Qena' }, { ar: 'شمال سيناء', en: 'North Sinai' },
    { ar: 'سوهاج', en: 'Sohag' },
  ]

  const sectionOptions = [
    { value: 'science', label: isRtl ? 'علمي علوم' : 'Science (Biology)' },
    { value: 'math', label: isRtl ? 'علمي رياضة' : 'Science (Math)' },
    { value: 'literature', label: isRtl ? 'أدبي' : 'Literature' },
  ]

  const gradeYearOptions = [
    { value: '1_secondary', label: isRtl ? 'الصف الأول الثانوي' : '1st Secondary' },
    { value: '2_secondary', label: isRtl ? 'الصف الثاني الثانوي' : '2nd Secondary' },
    { value: '3_secondary', label: isRtl ? 'الصف الثالث الثانوي' : '3rd Secondary' },
  ]

  const governorateOptions = useMemo(() =>
    egyptGovernorates.map((g) => ({ value: isRtl ? g.ar : g.en, label: isRtl ? g.ar : g.en })),
    [isRtl]
  )

  // ── Validation helpers ──────────────────────────────────────────
  const phoneRegex = /^\d{11}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const nationalIdRegex = /^\d{14}$/

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!firstName || !secondName || !thirdName || !lastName) {
      const msg = isRtl ? 'من فضلك أدخل الاسم بالكامل' : 'Please enter your full name'
      setError(msg); notify({ title: 'Registration failed', description: msg, variant: 'destructive' }); return
    }
    // Phone validation
    if (studentPhone && !phoneRegex.test(studentPhone)) {
      const msg = isRtl ? 'رقم هاتف الطالب يجب أن يكون 11 رقمًا فقط بدون حروف' : 'Student phone must be exactly 11 digits (numbers only)'
      setError(msg); notify({ title: 'Registration failed', description: msg, variant: 'destructive' }); return
    }
    if (parentPhone && !phoneRegex.test(parentPhone)) {
      const msg = isRtl ? 'رقم هاتف ولي الأمر يجب أن يكون 11 رقمًا فقط بدون حروف' : 'Parent phone must be exactly 11 digits (numbers only)'
      setError(msg); notify({ title: 'Registration failed', description: msg, variant: 'destructive' }); return
    }
    // National ID validation
    if (nationalId && !nationalIdRegex.test(nationalId)) {
      const msg = isRtl ? 'الرقم القومي يجب أن يكون 14 رقمًا فقط' : 'National ID must be exactly 14 digits'
      setError(msg); notify({ title: 'Registration failed', description: msg, variant: 'destructive' }); return
    }
    if (!email || !password) {
      const msg = isRtl ? 'البريد الإلكتروني وكلمة السر مطلوبين' : 'Email and password are required'
      setError(msg); notify({ title: 'Registration failed', description: msg, variant: 'destructive' }); return
    }
    // Email format validation
    if (!emailRegex.test(email)) {
      const msg = isRtl ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format'
      setError(msg); notify({ title: 'Registration failed', description: msg, variant: 'destructive' }); return
    }
    if (password !== confirmPassword) {
      const msg = isRtl ? 'كلمتا السر غير متطابقتين' : 'Passwords do not match'
      setError(msg); notify({ title: 'Registration failed', description: msg, variant: 'destructive' }); return
    }
    try {
      setLoading(true)
      await api.post('/auth/register', {
        firstName, secondName, thirdName, lastName,
        studentPhone, parentPhone, schoolName, birthDate,
        section, gradeYear, governorate, nationalId, email, password,
      })
      notify({ title: 'Registered' })
      setOpenApproval(true)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed'
      setError(msg)
      notify({ title: 'Registration failed', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      <AnimatedBackdrop />
      <SiteHeader />

      {/* Approval Modal */}
      <Modal
        open={openApproval}
        onOpenChange={(v) => { setOpenApproval(v); if (!v) navigate('/login', { replace: true }) }}
        title={isRtl ? 'جاري مراجعة بياناتك' : 'Under review'}
        bodyClassName="p-6"
      >
        <div className="justify-items-center gap-4 grid text-center">
          <img src={approvIcon} alt="Under review" className="w-24 h-24" />
          <div className="text-slate-700 dark:text-slate-300 text-sm leading-6">
            {isRtl
              ? 'هنراجع بياناتك خلال ساعات والاكونت هيتفعل'
              : 'We will review your details within a few hours and your account will be activated.'}
          </div>
          <Button type="button" className="w-full" variant="secondary" onClick={() => navigate('/login', { replace: true })}>
            {isRtl ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </Modal>

      {/* ===== Main Split Layout ===== */}
      <div className="z-10 relative flex flex-1 pt-20">

        {/* Image Side — left */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="hidden relative md:flex flex-1 justify-center items-center overflow-hidden"
        >
          <div className="top-1/2 left-1/2 absolute bg-[radial-gradient(circle,rgba(6,148,132,0.30)_0%,transparent_70%)] opacity-40 blur-3xl rounded-full w-[380px] h-[380px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <motion.img
            src={registerImage}
            alt="اعمل حساب"
            className="z-10 relative drop-shadow-2xl object-contain"
            style={{ maxHeight: '100vh', maxWidth: '100%' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Form Side — right */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col justify-start px-8 md:px-14 py-10 w-full md:w-1/2"
        >
          {/* Header */}
          <div className="mb-7" dir={isRtl ? 'rtl' : 'ltr'}>
            <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl">
              {isRtl ? (
                <>
                  إنشاء{' '}
                  <span className="text-brand">حساب جديد</span>
                  {' :'}
                </>
              ) : (
                <><span className="text-brand">Create</span>{' Account'}</>
              )}
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm">
              {isRtl ? 'أدخل بياناتك الصحيحة لإنشاء حسابك' : 'Enter your details to create your account'}
            </p>
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm">
              {isRtl ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
              <Link to="/login" className="font-semibold text-brand underline underline-offset-4">
                {isRtl ? 'سجل دخولك الآن !' : 'Login now!'}
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-5" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* Section label */}
            <p className="pb-1 border-slate-200 dark:border-slate-700 border-b font-bold text-slate-400 text-xs uppercase tracking-widest">
              {isRtl ? 'الاسم الرباعي' : 'Full Name'}
            </p>

            {/* Name row 1 */}
            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={User} placeholder={isRtl ? 'الاسم الأول' : 'First name'}
                value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <LineInput icon={User} placeholder={isRtl ? 'الاسم الثاني' : 'Second name'}
                value={secondName} onChange={(e) => setSecondName(e.target.value)} />
            </div>

            {/* Name row 2 */}
            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={User} placeholder={isRtl ? 'الاسم الثالث' : 'Third name'}
                value={thirdName} onChange={(e) => setThirdName(e.target.value)} />
              <LineInput icon={User} placeholder={isRtl ? 'الاسم الأخير' : 'Last name'}
                value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>

            {/* Section label */}
            <p className="mt-1 pb-1 border-slate-200 dark:border-slate-700 border-b font-bold text-slate-400 text-xs uppercase tracking-widest">
              {isRtl ? 'بيانات التواصل' : 'Contact Info'}
            </p>

            {/* Phones */}
            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={Phone} placeholder={isRtl ? 'رقم الطالب' : 'Student phone'}
                value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} />
              <LineInput icon={Phone} placeholder={isRtl ? 'رقم ولي الأمر' : 'Parent phone'}
                value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
            </div>

            {/* Email */}
            <LineInput icon={Mail} placeholder="Email" type="email" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} />

            {/* Section label */}
            <p className="mt-1 pb-1 border-slate-200 dark:border-slate-700 border-b font-bold text-slate-400 text-xs uppercase tracking-widest">
              {isRtl ? 'البيانات الدراسية' : 'Academic Info'}
            </p>

            {/* School + birth */}
            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={School} placeholder={isRtl ? 'اسم المدرسة' : 'School name'}
                value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              <LineInput icon={Calendar} type="date"
                value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>

            {/* Section + year */}
            <div className="gap-4 grid grid-cols-2">
              <LineSelect icon={BookOpen}
                placeholder={isRtl ? 'الشعبة' : 'Section'}
                value={section} onChange={setSection} options={sectionOptions} />
              <LineSelect icon={GraduationCap}
                placeholder={isRtl ? 'السنة الدراسية' : 'Grade year'}
                value={gradeYear} onChange={setGradeYear} options={gradeYearOptions} />
            </div>

            {/* Governorate + national ID */}
            <div className="gap-4 grid grid-cols-2">
              <LineSelect icon={MapPin}
                placeholder={isRtl ? 'المحافظة' : 'Governorate'}
                value={governorate} onChange={setGovernorate} options={governorateOptions} />
              <LineInput icon={CreditCard} placeholder={isRtl ? 'الرقم القومي' : 'National ID'}
                value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
            </div>

            {/* Section label */}
            <p className="mt-1 pb-1 border-slate-200 dark:border-slate-700 border-b font-bold text-slate-400 text-xs uppercase tracking-widest">
              {isRtl ? 'كلمة المرور' : 'Password'}
            </p>

            {/* Passwords */}
            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={Lock} placeholder={isRtl ? 'كلمة السر' : 'Password'}
                type="password" autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <LineInput icon={CheckCircle} placeholder={isRtl ? 'تأكيد كلمة السر' : 'Confirm password'}
                type="password" autoComplete="new-password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 px-4 py-2 border border-red-200 dark:border-red-900/40 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="flex justify-center items-center gap-2 bg-brand hover:bg-brand-600 disabled:opacity-80 shadow-md mt-1 rounded-2xl w-full h-12 font-bold text-white text-base transition-colors disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="border-t-white w-4 h-4" />
                  {t('auth.creatingAccount')}
                </span>
              ) : (
                isRtl ? 'إنشاء الحساب' : 'Create Account'
              )}
            </motion.button>
          </form>

          {/* bottom spacer */}
          <div className="h-8" />
        </motion.div>
      </div>

      <SiteFooter />
    </div>
  )
}

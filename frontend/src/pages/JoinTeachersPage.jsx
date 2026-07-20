import { useMemo, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api.js'
import { uploadFile } from '../utils/upload.js'
import { useToast } from '../components/ui/toast.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import AnimatedBackdrop from '../components/ui/AnimatedBackdrop.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import SiteFooter from '../components/layout/SiteFooter.jsx'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import approvIcon from '../cvg/approv.svg'
import { motion } from 'framer-motion'
import {
  ChevronDown, User, Phone, Mail, CreditCard, MapPin, Briefcase, BookOpen, Banknote, MessageSquare, UploadCloud, FileText, Image as ImageIcon
} from 'lucide-react'
import joinus from '../img/join us.png'

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

/* ─── underline-textarea ───────────────────────────────────────── */
function LineTextarea({ icon: Icon, label, ...inputProps }) {
  const { isRtl } = useLanguage()

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
          {label}
        </span>
      )}
      <div className="relative flex items-start pt-2">
        {Icon && (
          <span
            className={"absolute pointer-events-none mt-1 text-brand " + (isRtl ? 'right-0' : 'left-0')}
          >
            <Icon size={16} />
          </span>
        )}
        <textarea
          {...inputProps}
          dir={isRtl ? 'rtl' : 'ltr'}
          className={
            'w-full text-sm bg-transparent border-0 border-b-2 outline-none transition-colors duration-200 ' +
            'text-slate-800 dark:text-slate-100 placeholder:text-slate-400 min-h-[80px] resize-y ' +
            'border-slate-300 dark:border-slate-600 focus:border-brand focus:ring-0 ' +
            (isRtl ? (Icon ? 'pr-6 pl-0' : 'px-0') : (Icon ? 'pl-6 pr-0' : 'px-0'))
          }
        />
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
    <div ref={ref} className="relative w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={
          'flex items-center border rounded-xl outline-none w-full h-10 font-medium text-sm transition-all duration-200 ' +
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
                'px-4 py-2.5 w-full font-medium text-sm text-start transition-colors duration-150 border-b last:border-b-0 ' +
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
export default function JoinTeachersPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const { isRtl, t } = useLanguage()

  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [thirdName, setThirdName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [notes, setNotes] = useState('')

  const [cvFile, setCvFile] = useState(null)
  const [cvUrl, setCvUrl] = useState('')
  const [cvUploading, setCvUploading] = useState(false)

  const [photoFile, setPhotoFile] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

  const governorateOptions = useMemo(() => {
    return egyptGovernorates.map((g) => ({ value: isRtl ? g.ar : g.en, label: isRtl ? g.ar : g.en }))
  }, [isRtl])

  const jobOptions = useMemo(() => {
    const jobs = [
      { value: 'teacher', ar: 'معلم', en: 'Teacher' },
      { value: 'teaching_assistant', ar: 'مساعد تدريس', en: 'Teaching Assistant' },
      { value: 'moderator', ar: 'مشرف سنتر', en: 'Moderator' },
      { value: 'accountant', ar: 'محاسب', en: 'Accountant' },
      { value: 'hr_manager', ar: 'مدير موارد بشرية وشؤون عاملين - HR Manager', en: 'HR Manager' },
      { value: 'operations_manager', ar: 'مدير إداري وشؤون عاملين', en: 'Operations Manager' },
      { value: 'customer_service', ar: 'خدمة عملاء', en: 'Customer Service' },
      { value: 'sales_admin', ar: 'مسئول مبيعات - Sales Admin', en: 'Sales Admin' },
      { value: 'graphic_designer', ar: 'Graphic Designer', en: 'Graphic Designer' },
      { value: 'video_editor', ar: 'Video Editor', en: 'Video Editor' },
      { value: 'videographer', ar: 'مصور فيديو - Videographer', en: 'Videographer' },
      { value: 'social_media', ar: 'Social Media Specialist', en: 'Social Media Specialist' },
      { value: 'it_specialist', ar: 'IT Specialist', en: 'IT Specialist' },
      { value: 'book_designer', ar: 'مصمم للكتب والمطبوعات - Book Designer', en: 'Book Designer' },
      { value: 'scriptwriter', ar: 'Scriptwriter', en: 'Scriptwriter' },
      { value: 'creative_strategist', ar: 'Creative Strategist', en: 'Creative Strategist' },
      { value: 'powerpoint_creator', ar: 'PowerPoint Creator', en: 'PowerPoint Creator' },
      { value: 'storekeeper', ar: 'أمين مخزن - Storekeeper', en: 'Storekeeper' }
    ]
    return jobs.map((j) => ({ value: j.value, label: isRtl ? j.ar : j.en }))
  }, [isRtl])

  async function onUploadCv(file) {
    if (!file) return
    setError('')
    setSuccess('')
    try {
      setCvUploading(true)
      const out = await uploadFile(file)
      setCvUrl(out?.url || '')
      notify({ title: isRtl ? 'تم رفع الملف' : 'File uploaded', description: out?.url ? (isRtl ? 'تم رفع الـ CV بنجاح' : 'CV uploaded successfully') : '' })
    } catch (err) {
      const msg = err?.message || 'Upload failed'
      setError(msg)
      notify({ title: isRtl ? 'فشل رفع الملف' : 'Upload failed', description: msg, variant: 'destructive' })
    } finally {
      setCvUploading(false)
    }
  }

  async function onUploadPhoto(file) {
    if (!file) return
    setError('')
    setSuccess('')
    try {
      setPhotoUploading(true)
      const out = await uploadFile(file)
      setPhotoUrl(out?.url || '')
      notify({ title: isRtl ? 'تم رفع الصورة' : 'Image uploaded', description: out?.url ? (isRtl ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully') : '' })
    } catch (err) {
      const msg = err?.message || 'Upload failed'
      setError(msg)
      notify({ title: isRtl ? 'فشل رفع الصورة' : 'Upload failed', description: msg, variant: 'destructive' })
    } finally {
      setPhotoUploading(false)
    }
  }

  // ── Validation helpers ──────────────────────────────────────────
  const phoneRegex = /^\d{11}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const nationalIdRegex = /^\d{14}$/

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!firstName || !secondName || !thirdName || !lastName) {
      const msg = isRtl ? 'من فضلك أدخل الاسم بالكامل' : 'Please enter your full name'
      setError(msg); notify({ title: isRtl ? 'فشل الإرسال' : 'Submit failed', description: msg, variant: 'destructive' }); return
    }
    if (!phone || !email || !nationalId) {
      const msg = isRtl ? 'رقم الهاتف والبريد الإلكتروني والرقم القومي مطلوبين' : 'Phone, email, and National ID are required'
      setError(msg); notify({ title: isRtl ? 'فشل الإرسال' : 'Submit failed', description: msg, variant: 'destructive' }); return
    }
    // Phone validation
    if (!phoneRegex.test(phone)) {
      const msg = isRtl ? 'رقم الهاتف يجب أن يكون 11 رقمًا فقط بدون حروف' : 'Phone must be exactly 11 digits (numbers only)'
      setError(msg); notify({ title: isRtl ? 'فشل الإرسال' : 'Submit failed', description: msg, variant: 'destructive' }); return
    }
    // Email format validation
    if (!emailRegex.test(email)) {
      const msg = isRtl ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format'
      setError(msg); notify({ title: isRtl ? 'فشل الإرسال' : 'Submit failed', description: msg, variant: 'destructive' }); return
    }
    // National ID validation
    if (!nationalIdRegex.test(nationalId)) {
      const msg = isRtl ? 'الرقم القومي يجب أن يكون 14 رقمًا فقط' : 'National ID must be exactly 14 digits'
      setError(msg); notify({ title: isRtl ? 'فشل الإرسال' : 'Submit failed', description: msg, variant: 'destructive' }); return
    }

    try {
      setLoading(true)
      await api.post('/join-teachers/applications', {
        firstName, secondName, thirdName, lastName, phone, email, nationalId,
        governorate, jobTitle, subject, expectedSalary, notes, cvUrl, photoUrl
      })
      const msg = isRtl ? 'تم إرسال بياناتك بنجاح. سيتم التواصل معك قريبًا.' : 'Your details have been submitted. We will contact you soon.'
      setSuccess(msg)
      notify({ title: isRtl ? 'تم الإرسال' : 'Submitted', description: msg })
      setOpenApproval(true)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Submit failed'
      setError(msg)
      notify({ title: isRtl ? 'فشل الإرسال' : 'Submit failed', description: msg, variant: 'destructive' })
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
        onOpenChange={(v) => { setOpenApproval(v); if (!v) navigate('/', { replace: true }) }}
        title={isRtl ? 'جاري مراجعة بياناتك' : 'Under review'}
        bodyClassName="p-6"
      >
        <div className="justify-items-center gap-4 grid text-center">
          <img src={approvIcon} alt="Under review" className="w-24 h-24" />
          <div className="text-slate-700 dark:text-slate-300 text-sm leading-6">
            {isRtl
              ? 'هنراجع بياناتك خلال ساعات و هنتواصل معاك'
              : 'We will review your details within a few hours and we will contact you soon.'}
          </div>
          <Button type="button" className="w-full" variant="secondary" onClick={() => navigate('/', { replace: true })}>
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
          <div
            className="absolute opacity-40 blur-3xl rounded-full pointer-events-none"
            style={{
              width: '380px', height: '380px',
              background: 'radial-gradient(circle, rgba(6,148,132,0.30) 0%, transparent 70%)',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            }}
          />
          <motion.img
            src={joinus}
            alt="Join Us"
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
                  انضم إلى{' '}
                  <span className="text-brand">فريقنا</span>
                </>
              ) : (
                <><span className="text-brand">Join</span>{' our Team'}</>
              )}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
              {isRtl ? 'سجّل بياناتك وسنقوم بالتواصل معك في أقرب وقت' : 'Fill in your details and we will get back to you soon'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-5" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* Section label */}
            <p className="pb-1 border-slate-200 dark:border-slate-700 border-b font-bold text-slate-400 text-xs uppercase tracking-widest">
              {isRtl ? 'الاسم الرباعي' : 'Full Name'}
            </p>

            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={User} placeholder={isRtl ? 'الاسم الأول' : 'First name'}
                value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <LineInput icon={User} placeholder={isRtl ? 'الاسم الثاني' : 'Second name'}
                value={secondName} onChange={(e) => setSecondName(e.target.value)} />
            </div>

            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={User} placeholder={isRtl ? 'الاسم الثالث' : 'Third name'}
                value={thirdName} onChange={(e) => setThirdName(e.target.value)} />
              <LineInput icon={User} placeholder={isRtl ? 'الاسم الأخير' : 'Last name'}
                value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>

            {/* Section label */}
            <p className="mt-1 pb-1 border-slate-200 dark:border-slate-700 border-b font-bold text-slate-400 text-xs uppercase tracking-widest">
              {isRtl ? 'البيانات الشخصية' : 'Personal Info'}
            </p>

            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={Phone} placeholder={isRtl ? 'رقم الهاتف' : 'Phone'}
                value={phone} onChange={(e) => setPhone(e.target.value)} />
              <LineInput icon={Mail} placeholder="Email" type="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={CreditCard} placeholder={isRtl ? 'الرقم القومي' : 'National ID'}
                value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
              <LineSelect icon={MapPin} placeholder={isRtl ? 'المحافظة' : 'Governorate'}
                value={governorate} onChange={setGovernorate} options={governorateOptions} />
            </div>

            {/* Section label */}
            <p className="mt-1 pb-1 border-slate-200 dark:border-slate-700 border-b font-bold text-slate-400 text-xs uppercase tracking-widest">
              {isRtl ? 'بيانات العمل' : 'Work Info'}
            </p>

            <LineSelect icon={Briefcase} placeholder={isRtl ? 'الوظيفة' : 'Job title'}
              value={jobTitle} onChange={setJobTitle} options={jobOptions} />

            <div className="gap-4 grid grid-cols-2">
              <LineInput icon={BookOpen} placeholder={isRtl ? 'المادة (إن وجد)' : 'Subject (if any)'}
                value={subject} onChange={(e) => setSubject(e.target.value)} />
              <LineInput icon={Banknote} placeholder={isRtl ? 'الراتب المتوقع' : 'Expected salary'}
                value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} />
            </div>

            <LineTextarea icon={MessageSquare} placeholder={isRtl ? 'هتضيف ايه لأُفُق ؟' : 'What would you add to Ufuq?'}
              value={notes} onChange={(e) => setNotes(e.target.value)} />

            {/* Section label */}
            <p className="mt-1 pb-1 border-slate-200 dark:border-slate-700 border-b font-bold text-slate-400 text-xs uppercase tracking-widest">
              {isRtl ? 'المرفقات' : 'Attachments'}
            </p>

            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              {/* CV Upload */}
              <div className="flex flex-col gap-2">
                <input
                  id="teacher-cv-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null
                    setCvFile(f)
                    if (f) void onUploadCv(f)
                  }}
                />
                <label
                  htmlFor="teacher-cv-upload"
                  className="flex flex-col justify-center items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl h-24 transition-colors cursor-pointer"
                >
                  <FileText className="mb-1 w-6 h-6 text-slate-400 pointer-events-none" />
                  <span className="font-medium text-slate-600 dark:text-slate-300 text-xs pointer-events-none">
                    {cvUploading ? (isRtl ? 'جاري الرفع...' : 'Uploading...') : (isRtl ? 'رفع الـ CV' : 'Upload CV')}
                  </span>
                </label>
                {(cvFile?.name || cvUrl) && (
                  <div className="px-1 font-medium text-[11px] text-brand truncate">
                    {cvUrl ? (isRtl ? 'تم الرفع بنجاح ✓' : 'Uploaded successfully ✓') : cvFile?.name}
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div className="flex flex-col gap-2">
                <input
                  id="teacher-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null
                    setPhotoFile(f)
                    if (f) void onUploadPhoto(f)
                  }}
                />
                <label
                  htmlFor="teacher-photo-upload"
                  className="flex flex-col justify-center items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl h-24 transition-colors cursor-pointer"
                >
                  <ImageIcon className="mb-1 w-6 h-6 text-slate-400 pointer-events-none" />
                  <span className="font-medium text-slate-600 dark:text-slate-300 text-xs pointer-events-none">
                    {photoUploading ? (isRtl ? 'جاري الرفع...' : 'Uploading...') : (isRtl ? 'رفع صورة شخصية' : 'Upload photo')}
                  </span>
                </label>
                {(photoFile?.name || photoUrl) && (
                  <div className="px-1 font-medium text-[11px] text-brand truncate">
                    {photoUrl ? (isRtl ? 'تم الرفع بنجاح ✓' : 'Uploaded successfully ✓') : photoFile?.name}
                  </div>
                )}
              </div>
            </div>

            {/* Errors / Success */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 mt-2 px-4 py-2 border border-red-200 dark:border-red-900/40 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={
                'flex justify-center items-center gap-2 shadow-md mt-4 rounded-2xl w-full h-12 font-bold text-white text-base transition-all ' +
                'bg-gradient-to-r from-brand to-brand-600 ' +
                (loading ? 'opacity-80 cursor-not-allowed' : 'hover:brightness-110 active:brightness-95')
              }
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="border-t-white w-4 h-4" />
                  {isRtl ? 'جاري الإرسال...' : 'Submitting...'}
                </span>
              ) : (
                isRtl ? 'إرسال طلب الانضمام' : 'Submit Application'
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

import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../utils/api.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Textarea from '../components/ui/Textarea.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import { useToast } from '../components/ui/toast.jsx'
import { uploadFile } from '../utils/upload.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import Select from '../components/ui/Select.jsx'
import defaultProfileAvatar from '../cvg/profile.svg'

export default function ProfilePage() {
  const { notify } = useToast()
  const { setAuth, auth } = useAuth()
  const { t, isRtl } = useLanguage()
  const fileRef = useRef(null)
  const cvFileRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailStep, setEmailStep] = useState('idle')
  const [emailLoading, setEmailLoading] = useState(false)

  const [me, setMe] = useState(null)

  // Common fields
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)

  // Student fields
  const [studentPhone, setStudentPhone] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [section, setSection] = useState('')
  const [gradeYear, setGradeYear] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [nationalId, setNationalId] = useState('')

  // Staff fields
  const [jobTitle, setJobTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [cvUrl, setCvUrl] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [cvUploading, setCvUploading] = useState(false)

  const egyptGovernorates = [
    { ar: 'القاهرة', en: 'Cairo' }, { ar: 'الجيزة', en: 'Giza' }, { ar: 'الإسكندرية', en: 'Alexandria' },
    { ar: 'الدقهلية', en: 'Dakahlia' }, { ar: 'البحر الأحمر', en: 'Red Sea' }, { ar: 'البحيرة', en: 'Beheira' },
    { ar: 'الفيوم', en: 'Faiyum' }, { ar: 'الغربية', en: 'Gharbia' }, { ar: 'الإسماعيلية', en: 'Ismailia' },
    { ar: 'المنوفية', en: 'Monufia' }, { ar: 'المنيا', en: 'Minya' }, { ar: 'القليوبية', en: 'Qalyubia' },
    { ar: 'الوادي الجديد', en: 'New Valley' }, { ar: 'السويس', en: 'Suez' }, { ar: 'اسوان', en: 'Aswan' },
    { ar: 'اسيوط', en: 'Asyut' }, { ar: 'بني سويف', en: 'Beni Suef' }, { ar: 'بورسعيد', en: 'Port Said' },
    { ar: 'دمياط', en: 'Damietta' }, { ar: 'الشرقية', en: 'Sharqia' }, { ar: 'جنوب سيناء', en: 'South Sinai' },
    { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' }, { ar: 'مطروح', en: 'Matrouh' }, { ar: 'الأقصر', en: 'Luxor' },
    { ar: 'قنا', en: 'Qena' }, { ar: 'شمال سيناء', en: 'North Sinai' }, { ar: 'سوهاج', en: 'Sohag' }
  ]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const governorateOptions = useMemo(() =>
    egyptGovernorates.map((g) => ({ value: isRtl ? g.ar : g.en, label: isRtl ? g.ar : g.en }))
    , [isRtl])

  const sectionOptions = [
    { value: 'science', label: isRtl ? 'علمي علوم' : 'Science (Biology)' },
    { value: 'math', label: isRtl ? 'علمي رياضة' : 'Science (Math)' },
    { value: 'literature', label: isRtl ? 'أدبي' : 'Literature' }
  ]
  const gradeYearOptions = [
    { value: '1_secondary', label: isRtl ? 'الصف الأول الثانوي' : '1st Secondary' },
    { value: '2_secondary', label: isRtl ? 'الصف الثاني الثانوي' : '2nd Secondary' },
    { value: '3_secondary', label: isRtl ? 'الصف الثالث الثانوي' : '3rd Secondary' }
  ]

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/users/me')
      setMe(res.data)
      setName(res.data?.name || '')
      const p = res.data?.profile || {}
      setAvatarUrl(p.avatarUrl || '')
      setPhone(p.phone || '')
      setAddress(p.address || '')
      setBio(p.bio || '')
      // Student
      setStudentPhone(p.studentPhone || '')
      setParentPhone(p.parentPhone || '')
      setSchoolName(p.schoolName || '')
      setBirthDate(p.birthDate ? new Date(p.birthDate).toISOString().split('T')[0] : '')
      setSection(p.section || '')
      setGradeYear(p.gradeYear || '')
      setGovernorate(p.governorate || '')
      setNationalId(p.nationalId || '')
      // Staff
      setJobTitle(p.jobTitle || '')
      setSubject(p.subject || '')
      setExpectedSalary(p.expectedSalary || '')
      setCvUrl(p.cvUrl || '')
      setAvatarFile(null)
      setCvFile(null)
    } catch (e) {
      notify({ title: t('profilePage.toast.failedToLoadProfile'), description: e?.response?.data?.message || 'خطأ', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function changeMyPassword(e) {
    e.preventDefault()
    try {
      setPwLoading(true)
      const res = await api.post('/auth/change-password', { currentPassword: pwCurrent, newPassword: pwNew })
      setAuth(res.data)
      setPwCurrent('')
      setPwNew('')
      notify({ title: t('auth.passwordUpdated') })
    } catch (e2) {
      notify({ title: t('profilePage.toast.saveFailed'), description: e2?.response?.data?.message || 'خطأ', variant: 'destructive' })
    } finally {
      setPwLoading(false)
    }
  }

  async function requestEmailCode(e) {
    e.preventDefault()
    try {
      setEmailLoading(true)
      await api.post('/auth/request-email-change', { newEmail })
      setEmailStep('code')
      notify({ title: t('auth.sendCode') })
    } catch (e2) {
      notify({ title: t('profilePage.toast.requestFailed'), description: e2?.response?.data?.message || 'خطأ', variant: 'destructive' })
    } finally {
      setEmailLoading(false)
    }
  }

  async function confirmEmailCode(e) {
    e.preventDefault()
    try {
      setEmailLoading(true)
      const res = await api.post('/auth/confirm-email-change', { code: emailCode })
      setAuth(res.data)
      setNewEmail('')
      setEmailCode('')
      setEmailStep('idle')
      notify({ title: t('auth.confirmEmail') })
      load()
    } catch (e2) {
      notify({ title: t('profilePage.toast.confirmFailed'), description: e2?.response?.data?.message || 'خطأ', variant: 'destructive' })
    } finally {
      setEmailLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const email = useMemo(() => me?.email || '', [me])
  const role = useMemo(() => me?.role || '', [me])
  const teamId = useMemo(() => me?.teamId || '', [me])
  const studentId = useMemo(() => me?.studentId || '', [me])
  const isStudent = role === 'student'
  const isStaff = role === 'teacher' || role === 'team'

  async function uploadCv(file) {
    if (!file) return
    try {
      setCvUploading(true)
      const out = await uploadFile(file)
      setCvUrl(out?.url || '')
      notify({ title: isRtl ? 'تم رفع الـ CV' : 'CV uploaded' })
    } catch (err) {
      notify({ title: isRtl ? 'فشل رفع الملف' : 'Upload failed', description: err?.message, variant: 'destructive' })
    } finally {
      setCvUploading(false)
    }
  }

  // ── Validation helpers ──────────────────────────────────────────
  const phoneRegex = /^\d{11}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const nationalIdRegex = /^\d{14}$/

  async function save(e) {
    e.preventDefault()
    // Phone validation
    if (phone && !phoneRegex.test(phone)) {
      notify({ title: isRtl ? 'خطأ في البيانات' : 'Validation Error', description: isRtl ? 'رقم الهاتف يجب أن يكون 11 رقمًا فقط بدون حروف' : 'Phone must be exactly 11 digits (numbers only)', variant: 'destructive' }); return
    }
    if (isStudent && studentPhone && !phoneRegex.test(studentPhone)) {
      notify({ title: isRtl ? 'خطأ في البيانات' : 'Validation Error', description: isRtl ? 'رقم هاتف الطالب يجب أن يكون 11 رقمًا فقط بدون حروف' : 'Student phone must be exactly 11 digits (numbers only)', variant: 'destructive' }); return
    }
    if (isStudent && parentPhone && !phoneRegex.test(parentPhone)) {
      notify({ title: isRtl ? 'خطأ في البيانات' : 'Validation Error', description: isRtl ? 'رقم هاتف ولي الأمر يجب أن يكون 11 رقمًا فقط بدون حروف' : 'Parent phone must be exactly 11 digits (numbers only)', variant: 'destructive' }); return
    }
    // National ID validation
    if (isStudent && nationalId && !nationalIdRegex.test(nationalId)) {
      notify({ title: isRtl ? 'خطأ في البيانات' : 'Validation Error', description: isRtl ? 'الرقم القومي يجب أن يكون 14 رقمًا فقط' : 'National ID must be exactly 14 digits', variant: 'destructive' }); return
    }
    try {
      setSaving(true)

      let finalAvatarUrl = avatarUrl
      if (avatarFile) {
        const up = await uploadFile(avatarFile, '/uploads/avatar')
        finalAvatarUrl = up.url
      }
      if (!avatarFile && (avatarUrl === '' || avatarUrl === null || avatarUrl === undefined)) {
        finalAvatarUrl = null
      }

      const profilePayload = { avatarUrl: finalAvatarUrl, phone, address, bio }

      if (isStudent) {
        Object.assign(profilePayload, { studentPhone, parentPhone, schoolName, birthDate, section, gradeYear, governorate, nationalId })
      }
      if (isStaff) {
        Object.assign(profilePayload, { jobTitle, subject, expectedSalary, cvUrl, governorate })
      }

      const res = await api.patch('/users/me', { name, profile: profilePayload })
      setMe(res.data)
      setAvatarUrl(res.data?.profile?.avatarUrl || '')
      setAvatarFile(null)
      notify({ title: t('profilePage.toast.profileUpdated') })
    } catch (e2) {
      notify({ title: t('profilePage.toast.saveFailed'), description: e2?.response?.data?.message || 'خطأ', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700">
        <Spinner />
        {t('profilePage.loading')}
      </div>
    )
  }

  return (
    <div className="gap-4 grid" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {t('profilePage.title')}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{t('profilePage.subtitle')}</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profilePage.basicTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="gap-4 grid">
            {/* ── Avatar ── */}
            <div className="gap-2 grid">
              <div className="font-medium text-sm">{t('profilePage.avatarLabel')}</div>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="border border-black/5 dark:border-white/10 rounded-full w-20 h-20 object-cover" />
                ) : (
                  <img src={defaultProfileAvatar} alt="avatar" className="opacity-80 border border-black/5 dark:border-white/10 rounded-full w-20 h-20 object-cover" />
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                  <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={saving}>{t('profilePage.chooseFile')}</Button>
                  <Button type="button" variant="secondary" onClick={() => { setAvatarUrl(''); setAvatarFile(null); if (fileRef.current) fileRef.current.value = '' }} disabled={saving}>{t('profilePage.remove')}</Button>
                  {avatarFile ? <span className="text-slate-600 dark:text-slate-300 text-xs">{avatarFile.name}</span> : null}
                </div>
              </div>
            </div>

            {/* ── Common Fields ── */}
            <div className="gap-3 grid sm:grid-cols-2">
              <div className="gap-1 grid">
                <label className="text-slate-600 dark:text-slate-300 text-sm">{t('profilePage.name')}</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="gap-1 grid">
                <label className="text-slate-600 dark:text-slate-300 text-sm">{t('profilePage.email')}</label>
                <Input value={email} disabled />
              </div>
              <div className="gap-1 grid">
                <label className="text-slate-600 dark:text-slate-300 text-sm">{t('profilePage.role')}</label>
                <Input value={
                  isRtl
                    ? ({ admin: 'مدير', teacher: 'معلم', team: 'فريق', student: 'طالب' }[role] || role)
                    : ({ admin: 'Admin', teacher: 'Teacher', team: 'Team', student: 'Student' }[role] || role)
                } disabled />
              </div>
              {teamId ? (
                <div className="gap-1 grid">
                  <label className="text-slate-600 dark:text-slate-300 text-sm">{t('profilePage.teamId')}</label>
                  <Input value={teamId} disabled />
                </div>
              ) : null}
              {studentId ? (
                <div className="gap-1 grid">
                  <label className="text-slate-600 dark:text-slate-300 text-sm">{t('profilePage.studentId')}</label>
                  <Input value={studentId} disabled />
                </div>
              ) : null}
            </div>

            {/* ── Student Info ── */}
            {isStudent && (
              <div className="gap-3 grid pt-4 border-black/5 dark:border-white/10 border-t">
                <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                  {isRtl ? 'بيانات الطالب' : 'Student Info'}
                </div>
                <div className="gap-3 grid sm:grid-cols-2">
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'رقم هاتف الطالب' : 'Student phone'}</label>
                    <Input dir="ltr" value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'رقم هاتف ولي الأمر' : 'Parent phone'}</label>
                    <Input dir="ltr" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'اسم المدرسة' : 'School name'}</label>
                    <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'تاريخ الميلاد' : 'Birth date'}</label>
                    <Input dir="ltr" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الشعبة' : 'Section'}</label>
                    <Select value={section} onChange={(e) => setSection(e?.target?.value ?? e)} options={sectionOptions} placeholder={isRtl ? 'اختر الشعبة' : 'Choose section'} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'السنة الدراسية' : 'Grade year'}</label>
                    <Select value={gradeYear} onChange={(e) => setGradeYear(e?.target?.value ?? e)} options={gradeYearOptions} placeholder={isRtl ? 'اختر السنة' : 'Choose year'} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'المحافظة' : 'Governorate'}</label>
                    <Select value={governorate} onChange={(e) => setGovernorate(e?.target?.value ?? e)} options={governorateOptions} placeholder={isRtl ? 'اختر المحافظة' : 'Choose governorate'} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الرقم القومي' : 'National ID'}</label>
                    <Input dir="ltr" value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Staff / Teacher Info ── */}
            {isStaff && (
              <div className="gap-3 grid pt-4 border-black/5 dark:border-white/10 border-t">
                <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                  {isRtl ? '💼 بيانات الوظيفة' : '💼 Job Info'}
                </div>
                <div className="gap-3 grid sm:grid-cols-2">
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الوظيفة' : 'Job title'}</label>
                    <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'المادة' : 'Subject'}</label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الراتب المتوقع' : 'Expected salary'}</label>
                    <Input dir="ltr" value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'المحافظة' : 'Governorate'}</label>
                    <Select value={governorate} onChange={(e) => setGovernorate(e?.target?.value ?? e)} options={governorateOptions} placeholder={isRtl ? 'اختر المحافظة' : 'Choose governorate'} />
                  </div>
                  <div className="gap-1 grid sm:col-span-2">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'السيرة الذاتية (CV)' : 'CV (PDF)'}</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <input ref={cvFileRef} type="file" accept="application/pdf" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; setCvFile(f); if (f) void uploadCv(f) }}
                      />
                      <Button type="button" variant="secondary" onClick={() => cvFileRef.current?.click()} disabled={cvUploading}>
                        {cvUploading ? (isRtl ? 'جاري الرفع...' : 'Uploading...') : (isRtl ? 'رفع CV' : 'Upload CV')}
                      </Button>
                      {cvFile && <span className="text-slate-500 text-xs">{cvFile.name}</span>}
                      {cvUrl && !cvFile && (
                        <a href={cvUrl} target="_blank" rel="noreferrer" className="text-brand text-xs underline underline-offset-4">
                          {isRtl ? 'عرض الـ CV الحالي' : 'View current CV'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={load} disabled={saving}>{t('profilePage.reload')}</Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="border-t-white w-4 h-4" />
                    {t('profilePage.saving')}
                  </span>
                ) : t('profilePage.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Change Password ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t('auth.changePasswordTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changeMyPassword} className="gap-3 grid">
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{t('auth.currentPasswordLabel')}</label>
              <Input dir="ltr" type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} />
            </div>
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{t('auth.newPasswordLabel')}</label>
              <Input dir="ltr" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={pwLoading || !pwCurrent || !pwNew}>
                {pwLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="border-t-white w-4 h-4" />
                    {t('profilePage.saving')}
                  </span>
                ) : t('auth.updatePasswordButton')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Change Email (non-students only) ── */}
      {auth?.role !== 'student' ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.emailChangeTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-600 dark:text-slate-300 text-sm">{t('profilePage.currentEmailPrefix')} {auth?.email || ''}</div>
            <form onSubmit={emailStep === 'code' ? confirmEmailCode : requestEmailCode} className="gap-3 grid mt-3">
              <div className="gap-1 grid">
                <label className="text-slate-600 dark:text-slate-300 text-sm">{t('auth.newEmailLabel')}</label>
                <Input dir="ltr" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="name@example.com" />
              </div>
              {emailStep === 'code' ? (
                <div className="gap-1 grid">
                  <label className="text-slate-600 dark:text-slate-300 text-sm">{t('auth.codeLabel')}</label>
                  <Input dir="ltr" value={emailCode} onChange={(e) => setEmailCode(e.target.value)} placeholder="123456" />
                </div>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={emailLoading || !newEmail || (emailStep === 'code' && !emailCode)}>
                  {emailLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="border-t-white w-4 h-4" />
                      {t('profilePage.saving')}
                    </span>
                  ) : emailStep === 'code' ? t('auth.confirmEmail') : t('auth.requestCode')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

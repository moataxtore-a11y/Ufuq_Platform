import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { useNavigate } from 'react-router-dom'
import { uploadFile } from '../../utils/upload.js'
import CourseCard from '../../components/courses/CourseCard.jsx'
import Select from '../../components/ui/Select.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function TeacherCoursesPage() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const { isRtl, t } = useLanguage()

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/courses/mine')
      setCourses(res.data)
    } catch (e) {
      notify({ title: t('coursesManage.failedToLoadCourses'), description: e?.response?.data?.message || t('coursesManage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="gap-4 grid">
      <div className={
        'flex items-start justify-between gap-3 ' + (isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left')
      }
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition shrink-0 ' +
            'bg-amber-300 text-neutral-950 hover:bg-amber-200 active:bg-amber-300/90 ' +
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 ' +
            'dark:bg-amber-200 dark:hover:bg-amber-100 dark:focus-visible:ring-amber-200/40'
          }
        >
          {t('coursesManage.createCourse')}
        </button>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight">{t('coursesManage.title')}</div>
          <div className="text-slate-700 dark:text-slate-200 text-sm">{t('coursesManage.subtitle')}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner />
          {t('coursesManage.loading')}
        </div>
      ) : (
        <div className="gap-6 grid">
          <div className="app-grid-cards">
            {courses.map((c) => (
              <div key={c._id} className="min-w-0">
                <CourseCard
                  course={c}
                  isRtl={isRtl}
                  badge={isRtl ? 'كورس' : 'Course'}
                  ctaLabel={isRtl ? 'الدخول للكورس' : t('coursesManage.openCourse')}
                  footerText={isRtl ? 'إدارة محتوى الكورس' : t('coursesManage.openWorkspace')}
                  onOpen={() => navigate(`/teacher/courses/${c._id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateCourseModal
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          setOpen(false)
          load()
        }}
      />
    </div>
  )
}

function CreateCourseModal({ open, onOpenChange, onCreated }) {
  const { notify } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pinned, setPinned] = useState(false)
  const [price, setPrice] = useState('')
  const [isPaid, setIsPaid] = useState(false)
  const [discountPercent, setDiscountPercent] = useState('')
  const [section, setSection] = useState('')
  const [gradeYear, setGradeYear] = useState('')
  const [courseType, setCourseType] = useState('monthly')
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailName, setThumbnailName] = useState('')
  const [loading, setLoading] = useState(false)

  const { isRtl, t } = useLanguage()

  const sectionOptions = [
    { value: '', label: isRtl ? 'كل الشعب' : 'All sections' },
    { value: 'science', label: isRtl ? 'علمي علوم' : 'Science (Biology)' },
    { value: 'math', label: isRtl ? 'علمي رياضة' : 'Science (Math)' },
    { value: 'literature', label: isRtl ? 'أدبي' : 'Literature' }
  ]

  const gradeYearOptions = [
    { value: '', label: isRtl ? 'كل السنوات' : 'All years' },
    { value: '1_secondary', label: isRtl ? 'الصف الأول الثانوي' : '1st Secondary' },
    { value: '2_secondary', label: isRtl ? 'الصف الثاني الثانوي' : '2nd Secondary' },
    { value: '3_secondary', label: isRtl ? 'الصف الثالث الثانوي' : '3rd Secondary' }
  ]

  useEffect(() => {
    if (open) {
      setThumbnailFile(null)
      setThumbnailName('')
      setPinned(false)
      setPrice('')
      setIsPaid(false)
      setDiscountPercent('')
      setSection('')
      setGradeYear('')
      setCourseType('monthly')
    }
  }, [open])

  const priceNumber = useMemo(() => {
    if (!isPaid) return 0
    const p = price === '' ? NaN : Number(price)
    return Number.isFinite(p) && p >= 0 ? p : NaN
  }, [isPaid, price])

  const discountNumber = useMemo(() => {
    if (!isPaid) return 0
    if (discountPercent === '' || discountPercent === null || discountPercent === undefined) return 0
    const d = Number(discountPercent)
    return Number.isFinite(d) ? d : NaN
  }, [isPaid, discountPercent])

  const discountedPrice = useMemo(() => {
    if (!isPaid) return 0
    if (!Number.isFinite(priceNumber)) return NaN
    if (!Number.isFinite(discountNumber)) return NaN
    const d = Math.min(100, Math.max(0, discountNumber))
    const out = priceNumber * (1 - d / 100)
    return Math.round(out * 100) / 100
  }, [isPaid, priceNumber, discountNumber])

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true)

      let thumbnailUrl = ''
      if (thumbnailFile) {
        const up = await uploadFile(thumbnailFile, '/uploads', { maxSide: 1920 })
        thumbnailUrl = up.url
      }

      const p = isPaid ? (price === '' ? NaN : Number(price)) : 0
      if (!Number.isFinite(p) || p < 0) {
        notify({ title: t('coursesManage.createFailed'), description: t('coursesManage.priceMustBeNonNegative'), variant: 'destructive' })
        setLoading(false)
        return
      }

      const dRaw = isPaid ? (discountPercent === '' ? 0 : Number(discountPercent)) : 0
      if (!Number.isFinite(dRaw) || dRaw < 0 || dRaw > 100) {
        notify({ title: t('coursesManage.createFailed'), description: isRtl ? 'نسبة الخصم لازم تكون بين 0 و 100' : 'Discount percent must be between 0 and 100', variant: 'destructive' })
        setLoading(false)
        return
      }
      const d = p <= 0 ? 0 : dRaw

      await api.post('/courses', { title, description, thumbnailUrl, price: p, discountPercent: d, section, gradeYear, courseType, pinned })

      notify({ title: t('coursesManage.courseCreated') })
      setTitle('')
      setDescription('')
      onCreated()
    } catch (e2) {
      notify({ title: t('coursesManage.createFailed'), description: e2?.response?.data?.message || t('coursesManage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('coursesManage.createCourse')}>
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('coursesManage.formTitle')}</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('coursesManage.formDescription')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="bg-white dark:bg-[#171717] px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300/60 w-full text-slate-900 dark:placeholder:text-slate-500 dark:text-white placeholder:text-slate-400 text-sm"
          />
        </div>
        <div className="gap-2 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('coursesManage.formCourseType')}</label>
          <div className={
            'flex items-center gap-2 bg-white/70 dark:bg-white/[0.04] p-1 border border-black/5 dark:border-white/10 rounded-2xl ' +
            (isRtl ? 'flex-row-reverse' : 'flex-row')
          }
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsPaid(false)}
              className={
                'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ' +
                (!isPaid
                  ? 'bg-[rgba(244,206,125,0.55)] text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 hover:bg-black/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]')
              }
            >
              {t('coursesManage.free')}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsPaid(true)}
              className={
                'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ' +
                (isPaid
                  ? 'bg-[rgba(244,206,125,0.55)] text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 hover:bg-black/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]')
              }
            >
              {t('coursesManage.paid')}
            </button>
          </div>
        </div>

        <div className="gap-2 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'تثبيت الكورس' : 'Pin course'}</label>
          <div
            className={
              'flex items-center gap-2 bg-white/70 dark:bg-white/[0.04] p-1 border border-black/5 dark:border-white/10 rounded-2xl ' +
              (isRtl ? 'flex-row-reverse' : 'flex-row')
            }
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => setPinned(true)}
              className={
                'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ' +
                (pinned
                  ? 'bg-[rgba(244,206,125,0.55)] text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 hover:bg-black/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]')
              }
            >
              {isRtl ? 'مثبّت' : 'Pinned'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setPinned(false)}
              className={
                'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ' +
                (!pinned
                  ? 'bg-[rgba(244,206,125,0.55)] text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 hover:bg-black/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]')
              }
            >
              {isRtl ? 'غير مثبّت' : 'Not pinned'}
            </button>
          </div>
        </div>
        {isPaid ? (
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{t('coursesManage.price')}</label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </div>
        ) : null}

        {isPaid ? (
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'نسبة الخصم %' : 'Discount %'}</label>
            <Input value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="0" />
            {Number.isFinite(priceNumber) ? (
              <div className="mt-1 text-slate-600 dark:text-slate-300 text-xs">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span>{isRtl ? 'قبل الخصم:' : 'Before:'} <span className="font-semibold">{priceNumber.toFixed(2)}</span></span>
                  {Number.isFinite(discountedPrice) ? (
                    <span>{isRtl ? 'بعد الخصم:' : 'After:'} <span className="font-semibold">{discountedPrice.toFixed(2)}</span></span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الشعبة' : 'Section'}</label>
          <Select value={section} onChange={(e) => setSection(e?.target?.value ?? e)} options={sectionOptions} />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'السنة الدراسية' : 'Grade year'}</label>
          <Select value={gradeYear} onChange={(e) => setGradeYear(e?.target?.value ?? e)} options={gradeYearOptions} />
        </div>

        <div className="gap-2 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'نوع الكورس' : 'Course type'}</label>
          <div className={
            'flex items-center gap-2 bg-white/70 dark:bg-white/[0.04] p-1 border border-black/5 dark:border-white/10 rounded-2xl ' +
            (isRtl ? 'flex-row-reverse' : 'flex-row')
          }
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => setCourseType('monthly')}
              className={
                'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ' +
                (courseType === 'monthly'
                  ? 'bg-[rgba(244,206,125,0.55)] text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 hover:bg-black/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]')
              }
            >
              {isRtl ? 'اشتراك شهري للمدرس' : 'Monthly subscription'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setCourseType('individual')}
              className={
                'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ' +
                (courseType === 'individual'
                  ? 'bg-[rgba(244,206,125,0.55)] text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 hover:bg-black/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]')
              }
            >
              {isRtl ? 'كورس منفرد للمدرس' : 'Individual course'}
            </button>
          </div>
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('coursesManage.thumbnail')}</label>
          <input
            id="teacher-course-thumb"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] || null
              setThumbnailFile(f)
              setThumbnailName(f?.name || '')
              if (e.target) e.target.value = ''
            }}
            disabled={loading}
          />
          <div className={
            'flex items-center gap-2 ' +
            (isRtl ? 'flex-row-reverse justify-end' : 'flex-row justify-start')
          }
          >
            <Button
              type="button"
              variant="secondary"
              className="px-3 h-10 text-sm"
              onClick={() => {
                const el = document.getElementById('teacher-course-thumb')
                if (el && typeof el.click === 'function') el.click()
              }}
              disabled={loading}
            >
              {isRtl ? 'اختر صورة' : 'Choose image'}
            </Button>
            <div className="min-w-0 text-slate-600 dark:text-slate-300 text-sm truncate">
              {thumbnailName || (isRtl ? 'لم يتم اختيار ملف' : 'No file chosen')}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('coursesManage.cancel')}
          </Button>
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="border-t-white w-4 h-4" />
                {t('coursesManage.creating')}
              </span>
            ) : (
              t('coursesManage.create')
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

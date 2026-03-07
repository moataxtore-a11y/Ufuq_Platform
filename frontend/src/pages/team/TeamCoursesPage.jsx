import { useEffect, useState } from 'react'
import { api } from '../../utils/api.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { useNavigate } from 'react-router-dom'
import { uploadFile } from '../../utils/upload.js'
import CourseCard from '../../components/courses/CourseCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Select from '../../components/ui/Select.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function TeamCoursesPage() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const { isRtl, t } = useLanguage()

  const canManageCourses = auth?.role !== 'team' || (auth?.teamPermissions || []).includes('courses')

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
      <div
        className={
          'flex items-start justify-between gap-3 ' + (isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left')
        }
      >
        {canManageCourses ? (
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
        ) : null}

        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight">{isRtl ? 'كورسات' : 'Courses'}</div>
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
                  onOpen={() => navigate(`/team/courses/${c._id}`)}
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
        canManageCourses={canManageCourses}
      />
    </div>
  )
}

function CreateCourseModal({ open, onOpenChange, onCreated, canManageCourses }) {
  const { notify } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [isPaid, setIsPaid] = useState(false)
  const [section, setSection] = useState('')
  const [gradeYear, setGradeYear] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState(null)
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

  function getErrMsg(e) {
    const data = e?.response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) return data.message
      if (typeof data.error === 'string' && data.error.trim()) return data.error
    }
    if (typeof e?.message === 'string' && e.message.trim()) return e.message
    if (typeof e?.response?.statusText === 'string' && e.response.statusText.trim()) return e.response.statusText
    return t('coursesManage.requestFailed')
  }

  useEffect(() => {
    if (open) {
      setThumbnailFile(null)
      setPrice('')
      setIsPaid(false)
      setSection('')
      setGradeYear('')
    }
  }, [open])

  async function submit(e) {
    e.preventDefault()
    if (!canManageCourses) return
    if (!String(title || '').trim()) {
      notify({ title: t('coursesManage.createFailed'), description: t('coursesManage.titleRequired'), variant: 'destructive' })
      return
    }
    try {
      setLoading(true)

      const p = isPaid ? (price === '' ? NaN : Number(price)) : 0
      if (!Number.isFinite(p) || p < 0) {
        notify({ title: t('coursesManage.createFailed'), description: t('coursesManage.priceMustBeNonNegative'), variant: 'destructive' })
        setLoading(false)
        return
      }

      let thumbnailUrl = ''
      if (thumbnailFile) {
        const up = await uploadFile(thumbnailFile, '/uploads', { maxSide: 1920 })
        thumbnailUrl = up.url
      }

      await api.post('/courses', { title, description, thumbnailUrl, price: p, section, gradeYear })
      notify({ title: t('coursesManage.courseCreated') })
      setTitle('')
      setDescription('')
      onCreated()
    } catch (e2) {
      notify({ title: t('coursesManage.createFailed'), description: getErrMsg(e2), variant: 'destructive' })
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
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="gap-2 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('coursesManage.formCourseType')}</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
              <input type="radio" name="courseType" checked={!isPaid} onChange={() => setIsPaid(false)} disabled={loading} />
              {t('coursesManage.free')}
            </label>
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
              <input type="radio" name="courseType" checked={isPaid} onChange={() => setIsPaid(true)} disabled={loading} />
              {t('coursesManage.paid')}
            </label>
          </div>
        </div>
        {isPaid ? (
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{t('coursesManage.price')}</label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
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
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('coursesManage.thumbnail')}</label>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />
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

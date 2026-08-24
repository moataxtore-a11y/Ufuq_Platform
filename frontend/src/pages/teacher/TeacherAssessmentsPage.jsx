import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CreateAssessmentModal from '../../components/assessments/CreateAssessmentModal.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { Check, Image as ImageIcon, Layers, Trash2 } from 'lucide-react'

export default function TeacherAssessmentsPage() {
  const { notify } = useToast()
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()

  const lang = typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'ar' : 'en'
  const isRtl = lang === 'ar'
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [coursesError, setCoursesError] = useState('')
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const basePath = useMemo(() => (location.pathname.startsWith('/team') ? '/team' : '/teacher'), [location.pathname])

  function safeT(key, fallback) {
    const v = t(key)
    if (!v || v === key) return fallback
    return v
  }

  const isAllMode = useMemo(() => {
    return location.pathname === `${basePath}/assessments/all`
  }, [basePath, location.pathname])

  const selectedCourse = useMemo(() => courses.find((c) => c._id === courseId) || null, [courses, courseId])

  async function loadCourses() {
    const res = await api.get('/courses/mine')
    setCourses(res.data)
    if (!courseId && res.data?.[0]?._id) setCourseId(res.data[0]._id)
  }

  function typeLabel(t) {
    const v = String(t || '').toLowerCase()
    if (v === 'quiz') return 'الكويز'
    if (v === 'exam') return 'الامتحان'
    if (v === 'homework') return 'الواجب'
    return 'الاختبار'
  }

  function requestDelete(assessment) {
    if (!assessment?._id) return
    setToDelete(assessment)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!toDelete?._id || deleting) return
    setDeleting(true)
    try {
      await api.delete(`/assessments/${toDelete._id}`)
      notify({ title: safeT('assessmentsPage.deleted', 'Deleted') })
      setConfirmOpen(false)
      setToDelete(null)
      await loadAssessments(courseId)
    } catch (e) {
      notify({ title: safeT('assessmentsPage.failedToDelete', 'Failed to delete'), description: e?.response?.data?.message || safeT('assessmentsPage.error', 'Error'), variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  async function loadAssessments(cid) {
    if (isAllMode) {
      const res = await api.get('/assessments/mine')
      setRows(res.data)
      return
    }

    if (!cid) {
      setRows([])
      return
    }
    const res = await api.get(`/assessments/course/${cid}`)
    setRows(res.data)
  }

  async function refresh() {
    try {
      setLoading(true)
      setCoursesError('')
      await loadCourses()
    } catch (e) {
      setCoursesError(e?.response?.data?.message || t('assessmentsPage.error'))
      notify({ title: t('assessmentsPage.failedToLoadCourses'), description: e?.response?.data?.message || t('assessmentsPage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fromUrl = params?.courseId
    if (!fromUrl || isAllMode) return
    if (fromUrl !== courseId) setCourseId(fromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.courseId, isAllMode])

  useEffect(() => {
    loadAssessments(courseId).catch((e) => {
      notify({ title: t('assessmentsPage.failedToLoadAssessments'), description: e?.response?.data?.message || t('assessmentsPage.error'), variant: 'destructive' })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, isAllMode])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700">
        <Spinner />
        {t('assessmentsPage.loading')}
      </div>
    )
  }

  return (
    <div className="gap-4 grid">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-lg">
            {safeT('assessmentsPage.title', 'الاختبارات')}
          </h2>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
            {safeT('assessmentsPage.subtitle', 'إنشاء الاختبارات وتحديد الإجابات الصحيحة للتصحيح التلقائي.')}
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!courseId} size="sm">
          {safeT('assessmentsPage.createAssessment', 'إنشاء اختبار')}
        </Button>
      </div>

      <div className="gap-2 grid">
        <div className="text-slate-600 dark:text-slate-300 text-sm">{t('assessmentsPage.course')}</div>
        <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-3">
          <AssessmentCourseCard
            active={isAllMode}
            title={safeT('assessmentsPage.allAssessments', 'كل الاختبارات')}
            subtitle={safeT('assessmentsPage.allAssessmentsHint', 'عرض كل ما أنشأته من جميع الكورسات.')}
            isRtl={isRtl}
            onClick={() => navigate(`${basePath}/assessments/all`)}
            fallbackIcon={<Layers className="h-12 w-12 text-brand-300" />}
          />

          {courses.map((c) => {
            const active = c._id === courseId
            return (
              <AssessmentCourseCard
                key={c._id}
                active={active && !isAllMode}
                title={c.title}
                thumbnailUrl={c.thumbnailUrl}
                isRtl={isRtl}
                onClick={() => {
                  setCourseId(c._id)
                  navigate(`${basePath}/assessments/course/${c._id}`)
                }}
              />
            )
          })}
        </div>
      </div>

      {!loading && coursesError ? <div className="text-slate-600 dark:text-slate-300 text-sm">{coursesError}</div> : null}

      <div className="rounded-xl overflow-x-auto">
        <Table>
          <THead>
            <TR>
              {isAllMode ? <TH className="text-center">{t('assessmentsPage.tableCourse')}</TH> : null}
              <TH className="text-center">{t('assessmentsPage.tableTitle')}</TH>
              <TH className="text-center">{t('assessmentsPage.tableType')}</TH>
              <TH className="text-center">{t('assessmentsPage.tableDuration')}</TH>
              <TH className="text-center">{t('assessmentsPage.tableWindow')}</TH>
              <TH className="text-right">{safeT('assessmentsPage.tableActions', safeT('assessmentsPage.tableReport', 'إجراءات'))}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((a) => (
              <TR key={a._id}>
                {isAllMode ? <TD className="text-slate-900 dark:text-slate-100 text-center">{a?.course?.title || '-'}</TD> : null}
                <TD className="text-slate-900 dark:text-slate-100 text-center">{a.title}</TD>
                <TD className="text-slate-700 dark:text-slate-200 text-center">{a.type}</TD>
                <TD className="text-slate-700 dark:text-slate-200 text-center">{a.durationMinutes ? `${a.durationMinutes} ${t('assessmentsPage.minutes')}` : '-'}</TD>
                <TD className="text-slate-700 dark:text-slate-200 text-center">
                  {a.startAt ? new Date(a.startAt).toLocaleString() : '-'}
                  {'  →  '}
                  {a.endAt ? new Date(a.endAt).toLocaleString() : '-'}
                </TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`${basePath}/assessments/${a._id}/edit`)}>
                      {safeT('assessmentsPage.edit', 'تعديل')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`${basePath}/assessments/${a._id}/report`)}>
                      {safeT('assessmentsPage.report', 'تقرير')}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => requestDelete(a)}>
                      {safeT('assessmentsPage.delete', 'حذف')}
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(v) => {
          setConfirmOpen(v)
          if (!v && !deleting) setToDelete(null)
        }}
        title={isRtl ? 'تأكيد الحذف' : 'Confirm delete'}
        description={
          isRtl
            ? `هل تريد حذف ${typeLabel(toDelete?.type)} "${toDelete?.title || ''}"؟ لن يمكن استرجاعه.`
            : `Delete "${toDelete?.title || ''}"? This cannot be undone.`
        }
        icon={<Trash2 className="w-10 h-10 text-rose-600" />}
        cancelLabel={isRtl ? 'إلغاء' : 'Cancel'}
        confirmLabel={isRtl ? 'حذف' : 'Delete'}
        loading={deleting}
        onConfirm={confirmDelete}
      />

      <CreateAssessmentModal
        open={open}
        onOpenChange={setOpen}
        courses={courses}
        courseId={courseId}
        onCourseChange={setCourseId}
        course={selectedCourse}
        onCreated={() => {
          setOpen(false)
          loadAssessments(courseId).catch(() => { })
        }}
      />
    </div>
  )
}

function AssessmentCourseCard({ active, title, subtitle, thumbnailUrl, fallbackIcon, onClick, isRtl }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cnAssessmentCard(
        'group overflow-hidden rounded-[28px] border bg-[#001d18] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-glass-sm',
        active ? 'border-brand ring-2 ring-brand/20 shadow-glow-brand' : 'border-slate-200 dark:border-white/10'
      )}
      aria-pressed={active}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-white/[0.06]">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title || 'Course'} className="h-full w-full object-cover object-center" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#18211f] text-slate-400 dark:text-slate-500">
            {fallbackIcon || <ImageIcon className="h-12 w-12" />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#001d18]/45 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
        <span
          className={cnAssessmentCard(
            'absolute top-3 flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
            isRtl ? 'left-3' : 'right-3',
            active ? 'border-brand bg-brand text-white shadow-lg' : 'border-white/30 bg-black/25 text-white/50 backdrop-blur-sm'
          )}
        >
          {active ? <Check className="h-5 w-5" /> : null}
        </span>
      </div>

      <div className="flex min-h-20 flex-col items-center justify-center bg-[#001d18] px-4 py-4">
        <div className="line-clamp-2 text-center text-2xl font-extrabold leading-tight text-white">
          {title || '—'}
        </div>
        {subtitle ? (
          <div className="mt-2 line-clamp-2 text-center text-xs font-semibold leading-5 text-white/65">
            {subtitle}
          </div>
        ) : null}
      </div>
    </button>
  )
}

function cnAssessmentCard(...classes) {
  return classes.filter(Boolean).join(' ')
}

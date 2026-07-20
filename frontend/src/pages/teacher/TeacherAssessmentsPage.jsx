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
import { Trash2 } from 'lucide-react'

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
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {safeT('assessmentsPage.title', 'الاختبارات')}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
          {safeT('assessmentsPage.subtitle', 'إنشاء الاختبارات وتحديد الإجابات الصحيحة للتصحيح التلقائي.')}
        </div>

        <div className="flex justify-center mt-4">
          <Button onClick={() => setOpen(true)} disabled={!courseId}>
            {safeT('assessmentsPage.createAssessment', 'إنشاء اختبار')}
          </Button>
        </div>
      </div>

      <div className="gap-2 grid">
        <div className="text-slate-600 dark:text-slate-300 text-sm">{t('assessmentsPage.course')}</div>
        <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/assessments/all`)}
            className={
              'text-center rounded-2xl border p-4 transition ' +
              (isAllMode
                ? 'border-brand/60 bg-brand/15'
                : 'border-black/5 bg-white hover:border-brand/40 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-brand/40')
            }
          >
            <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{safeT('assessmentsPage.allAssessments', 'كل الاختبارات')}</div>
            <div className="mt-1 text-slate-600 dark:text-slate-300 text-xs">{safeT('assessmentsPage.allAssessmentsHint', 'عرض كل ما أنشأته من جميع الكورسات.')}</div>
          </button>

          {courses.map((c) => {
            const active = c._id === courseId
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => {
                  setCourseId(c._id)
                  navigate(`${basePath}/assessments/course/${c._id}`)
                }}
                className={
                  'text-center rounded-2xl border p-4 transition ' +
                  (active
                    ? 'border-brand/60 bg-brand/15'
                    : 'border-black/5 bg-white hover:border-brand/40 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-brand/40')
                }
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{c.title}</div>
                <div className="mt-1 text-slate-600 dark:text-slate-300 text-xs">{(c.description || '').slice(0, 80) || ' '}</div>
              </button>
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

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import Select from '../../components/ui/Select.jsx'

export default function StudentAssessmentsPage() {
  const { notify } = useToast()
  const navigate = useNavigate()

  const lang = typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'ar' : 'en'
  const isRtl = lang === 'ar'

  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [rows, setRows] = useState([])
  const [gradeRows, setGradeRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [startingId, setStartingId] = useState('')

  async function loadCourses() {
    const res = await api.get('/courses/mine')
    setCourses(res.data)
    if (!courseId && res.data?.[0]?._id) setCourseId(res.data[0]._id)
  }

  async function loadAssessments(cid) {
    if (!cid) {
      setRows([])
      return
    }
    const res = await api.get(`/assessments/course/${cid}`)
    setRows(res.data)
  }

  async function loadGrades() {
    const res = await api.get('/assessments/grades/mine')
    setGradeRows(Array.isArray(res.data) ? res.data : [])
  }

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        setLoading(true)
        await Promise.all([
          loadCourses(),
          loadGrades()
        ])
      } catch (e) {
        notify({ title: isRtl ? 'فشل تحميل الكورسات' : 'Failed to load courses', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    init()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadAssessments(courseId).catch((e) => {
      notify({ title: isRtl ? 'فشل تحميل الاختبارات' : 'Failed to load assessments', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  function onStart(id) {
    if (!id || startingId) return
    setStartingId(id)
    navigate(`/student/assessments/${id}/attempt`)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
        <Spinner />
        {isRtl ? 'جاري التحميل...' : 'Loading...'}
      </div>
    )
  }

  function typeLabel(t) {
    const v = String(t || '').toLowerCase()
    if (!isRtl) return v || '-'
    if (v === 'quiz') return 'كويز'
    if (v === 'exam') return 'امتحان'
    if (v === 'homework') return 'واجب'
    return v || '-'
  }

  const gradeByAssessmentId = new Map(
    (gradeRows || [])
      .filter((r) => r && r.assessment && r.assessment._id)
      .map((r) => [String(r.assessment._id), r])
  )

  function gradeCell(assessmentId) {
    const r = gradeByAssessmentId.get(String(assessmentId || ''))
    if (!r) return <span className="text-slate-500 dark:text-slate-400">-</span>

    const st = String(r.status || '').toLowerCase()
    if (st === 'submitted') {
      return <span className="text-slate-700 dark:text-slate-200">{isRtl ? 'جاري التصحيح' : 'Grading'}</span>
    }
    if (st !== 'graded') return <span className="text-slate-500 dark:text-slate-400">-</span>
    if (typeof r.score !== 'number' || typeof r.maxScore !== 'number' || r.maxScore <= 0) {
      return <span className="text-slate-500 dark:text-slate-400">-</span>
    }

    const ratio = r.score / r.maxScore
    const cls = ratio < 0.5
      ? 'text-rose-600 dark:text-rose-300'
      : ratio < 0.75
        ? 'text-[#EAB308]'
        : 'text-emerald-600 dark:text-emerald-300'

    return <span className={"font-extrabold tabular-nums " + cls}>{r.score}/{r.maxScore}</span>
  }

  return (
    <div className="gap-4 grid" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex justify-center items-center">
          <div className={(isRtl ? 'text-right' : 'text-left') + ' flex flex-col items-center'}>
            <div className="mt-3 text-center">
              <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl sm:text-5xl leading-[1.1]">
                <span className="font-perfect text-[rgb(212_175_55/var(--tw-text-opacity,1))]">{isRtl ? 'الاختبارات' : 'Assessments'}</span>
              </h1>
              <svg className="mx-auto mt-2 w-full max-w-[520px] h-4" viewBox="0 0 520 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10 20 C 130 6, 390 6, 510 20" stroke="#E0B300" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm text-center">
              {isRtl ? 'اختبر نفسك في الكويزات والامتحانات الخاصة بالكورس.' : 'Take quizzes/exams for your course.'}
            </p>
          </div>
        </div>

        <div className="gap-1 grid mt-4">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الكورس' : 'Course'}</label>
          <Select
            value={courseId}
            onChange={(v) => setCourseId(v.target.value)}
            options={(courses || []).map((c) => ({ value: c._id, label: c.title }))}
            placeholder={isRtl ? 'اختر الكورس' : 'Select course'}
            className="w-full"
          />
        </div>

        {rows.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 shadow-sm mt-4 p-6 border border-black/5 dark:border-white/[0.06] rounded-2xl text-slate-700 dark:text-slate-200">
            <div className="font-bold">{isRtl ? 'لا يوجد اختبارات' : 'No assessments'}</div>
            <div className="mt-1 text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'لا يوجد اختبارات لهذا الكورس حتى الآن.' : 'There are no assessments for this course yet.'}</div>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 mt-4 border border-black/5 dark:border-white/[0.06] rounded-2xl overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH className="text-center">{isRtl ? 'العنوان' : 'Title'}</TH>
                  <TH className="text-center">{isRtl ? 'النوع' : 'Type'}</TH>
                  <TH className="text-center">{isRtl ? 'المدة' : 'Duration'}</TH>
                  <TH className="text-center">{isRtl ? 'درجتك' : 'Your score'}</TH>
                  <TH className={isRtl ? 'text-left' : 'text-right'}>{isRtl ? 'إجراء' : 'Action'}</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((a) => (
                  <TR key={a._id}>
                    <TD className="text-slate-900 dark:text-slate-100 text-center">{a.title}</TD>
                    <TD className="text-slate-700 dark:text-slate-200 text-center">{typeLabel(a.type)}</TD>
                    <TD className="text-slate-700 dark:text-slate-200 text-center">{a.durationMinutes ? (isRtl ? `${a.durationMinutes} دقيقة` : `${a.durationMinutes} min`) : '-'}</TD>
                    <TD className="text-slate-700 dark:text-slate-200 text-center">{gradeCell(a._id)}</TD>
                    <TD className={isRtl ? 'text-left' : 'text-right'}>
                      <Button size="sm" onClick={() => onStart(a._id)} disabled={Boolean(startingId)}>
                        {startingId === a._id ? (isRtl ? 'جارٍ البدء...' : 'Starting...') : (isRtl ? 'ابدأ' : 'Start')}
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

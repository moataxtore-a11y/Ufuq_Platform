import { useEffect, useState } from 'react'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import ScorePill from '../../components/ui/ScorePill.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import Select from '../../components/ui/Select.jsx'

export default function TeacherGradesPage() {
  const { notify } = useToast()
  const { isRtl, t } = useLanguage()
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadCourses() {
    const res = await api.get('/courses/mine')
    setCourses(res.data)
    if (!courseId && res.data?.[0]?._id) setCourseId(res.data[0]._id)
  }

  async function loadGrades(cid) {
    if (!cid) {
      setRows([])
      return
    }
    const res = await api.get(`/assignments/course/${cid}/grades`)
    setRows(res.data)
  }

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        setLoading(true)
        await loadCourses()
      } catch (e) {
        notify({ title: t('gradesPage.failedToLoadCourses'), description: e?.response?.data?.message || t('gradesPage.error'), variant: 'destructive' })
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
    loadGrades(courseId).catch((e) => {
      notify({ title: t('gradesPage.failedToLoadGrades'), description: e?.response?.data?.message || t('gradesPage.error'), variant: 'destructive' })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700">
        <Spinner />
        {t('gradesPage.loading')}
      </div>
    )
  }

  return (
    <div className="gap-4 grid">
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {t('gradesPage.title')}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{t('gradesPage.subtitle')}</div>
      </div>

      <div className="gap-1 grid">
        <label className="text-slate-600 dark:text-slate-200 text-sm">{t('gradesPage.course')}</label>
        <Select
          value={courseId}
          onChange={(e) => setCourseId(e?.target?.value ?? e)}
          options={(courses || []).map((c) => ({ value: c._id, label: c.title }))}
          placeholder={isRtl ? 'اختر الكورس' : 'Select course'}
        />
      </div>

      <div className="border border-black/5 rounded-xl overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH>{t('gradesPage.student')}</TH>
              <TH>{t('gradesPage.assignment')}</TH>
              <TH>{t('gradesPage.score')}</TH>
              <TH>{t('gradesPage.feedback')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((g) => (
              <TR key={g._id}>
                <TD>{g.student?.name || t('gradesPage.studentFallback')}</TD>
                <TD>{g.assignment?.title || t('gradesPage.assignmentFallback')}</TD>
                <TD>
                  <ScorePill
                    score={typeof g.score === 'number' ? g.score : null}
                    maxScore={typeof g.maxScore === 'number' ? g.maxScore : typeof g.assignment?.maxScore === 'number' ? g.assignment.maxScore : null}
                  />
                </TD>
                <TD className="text-slate-700">{g.feedback || '-'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  )
}

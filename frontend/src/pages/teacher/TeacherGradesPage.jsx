import { useEffect, useState } from 'react'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import ScorePill from '../../components/ui/ScorePill.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import CoursePicker from '../../components/courses/CoursePicker.jsx'

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
      <div className="gap-4 grid">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 rounded-xl" />
          <Skeleton className="h-4 w-60 rounded-md" />
        </div>
        <div className="gap-3 grid sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 bg-white/80 dark:bg-white/[0.055] border border-slate-200 dark:border-white/10 rounded-2xl p-2.5">
              <Skeleton className="h-16 w-24 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 transition-colors">
              <Skeleton className="w-24 h-4 rounded-md" />
              <Skeleton className="w-32 h-4 rounded-md flex-1" />
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-20 h-4 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="gap-4 grid">
      <div>
        <h2 className="font-bold text-slate-900 dark:text-white text-lg">{t('gradesPage.title')}</h2>
        <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">{t('gradesPage.subtitle')}</p>
      </div>

      <CoursePicker
        courses={courses}
        value={courseId}
        onChange={setCourseId}
        label={t('gradesPage.course')}
        placeholder={isRtl ? 'اختر الكورس' : 'Select course'}
        emptyText={isRtl ? 'لا توجد كورسات لعرض الدرجات.' : 'No courses available for grades.'}
        isRtl={isRtl}
      />

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

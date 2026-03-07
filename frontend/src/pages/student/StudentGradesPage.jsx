import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api.js'
import Spinner from '../../components/ui/Spinner.jsx'
import ScorePill from '../../components/ui/ScorePill.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { ClipboardList, FileText } from 'lucide-react'

function fmt(dt) {
  if (!dt) return '-'
  try { return new Date(dt).toLocaleDateString() } catch { return '-' }
}

function StatCard({ label, value, sub, color = 'amber' }) {
  const colors = {
    amber: 'from-amber-400/20 to-amber-600/10 border-amber-400/20 text-amber-400',
    green: 'from-green-400/20 to-green-600/10 border-green-400/20 text-green-400',
    blue: 'from-blue-400/20 to-blue-600/10  border-blue-400/20  text-blue-400',
    rose: 'from-rose-400/20 to-rose-600/10  border-rose-400/20  text-rose-400',
  }
  const cls = colors[color] || colors.amber
  return (
    <div className={`bg-gradient-to-br ${cls} border rounded-2xl p-4 flex flex-col gap-1`}>
      <div className="text-slate-400 text-xs font-medium">{label}</div>
      <div className={`text-2xl font-bold ${cls.split(' ').find(c => c.startsWith('text-'))}`}>{value}</div>
      {sub && <div className="text-slate-500 text-xs">{sub}</div>}
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        'px-4 py-2 rounded-xl text-sm font-semibold transition-all ' +
        (active
          ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5')
      }
    >
      {children}
    </button>
  )
}

export default function StudentGradesPage() {
  const { notify } = useToast()
  const { t, isRtl } = useLanguage()
  const [assignmentGrades, setAssignmentGrades] = useState([])
  const [assessmentGrades, setAssessmentGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all') // 'all' | 'assignments' | 'assessments'

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const [a1, a2] = await Promise.all([
          api.get('/assignments/grades/mine'),
          api.get('/assessments/grades/mine')
        ])
        if (!mounted) return
        setAssignmentGrades(a1.data || [])
        setAssessmentGrades(a2.data || [])
      } catch (e) {
        notify({ title: isRtl ? 'فشل تحميل الدرجات' : 'Failed to load grades', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stats
  const avgAssignments = useMemo(() => {
    const nums = assignmentGrades.filter(g => typeof g.score === 'number').map(g => g.score)
    if (!nums.length) return null
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
  }, [assignmentGrades])

  const avgAssessments = useMemo(() => {
    const nums = assessmentGrades.filter(g => typeof g.score === 'number').map(g => g.score)
    if (!nums.length) return null
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
  }, [assessmentGrades])

  const totalGraded = assignmentGrades.length + assessmentGrades.length

  // Combined + sorted by date
  const allRows = useMemo(() => {
    const asgn = assignmentGrades.map(g => ({ ...g, _type: 'assignment' }))
    const asmt = assessmentGrades.map(g => ({ ...g, _type: 'assessment' }))
    return [...asgn, ...asmt].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [assignmentGrades, assessmentGrades])

  const displayed = tab === 'all' ? allRows : tab === 'assignments' ? assignmentGrades.map(g => ({ ...g, _type: 'assignment' })) : assessmentGrades.map(g => ({ ...g, _type: 'assessment' }))

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="flex items-center gap-3 text-slate-400">
          <Spinner />
          <span>{isRtl ? 'جاري تحميل الدرجات...' : 'Loading grades...'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="gap-6 grid">

      {/* Header */}
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl tracking-tight">
          {isRtl ? 'درجاتي' : 'My Grades'}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="420" height="24" viewBox="0 0 420 24" className="max-w-full" aria-hidden="true">
            <path d="M20 18 C 130 0, 290 0, 400 18" stroke="rgba(212,175,55,0.85)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
          {isRtl ? 'كل درجاتك في مكان واحد' : 'All your grades in one place'}
        </p>
      </div>

      {/* Stats */}
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
        <StatCard
          label={isRtl ? 'إجمالي الدرجات' : 'Total Grades'}
          value={totalGraded}
          color="amber"
        />
        <StatCard
          label={isRtl ? 'واجبات مصححة' : 'Graded Assignments'}
          value={assignmentGrades.length}
          color="blue"
        />
        <StatCard
          label={isRtl ? 'متوسط الواجبات' : 'Avg. Assignments'}
          value={avgAssignments != null ? `${avgAssignments}` : '-'}
          sub={isRtl ? 'درجة' : 'pts'}
          color="green"
        />
        <StatCard
          label={isRtl ? 'متوسط الاختبارات' : 'Avg. Assessments'}
          value={avgAssessments != null ? `${avgAssessments}` : '-'}
          sub={isRtl ? 'درجة' : 'pts'}
          color="rose"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl w-fit">
        <TabBtn active={tab === 'all'} onClick={() => setTab('all')}>
          {isRtl ? `الكل (${allRows.length})` : `All (${allRows.length})`}
        </TabBtn>
        <TabBtn active={tab === 'assignments'} onClick={() => setTab('assignments')}>
          {isRtl ? `واجبات (${assignmentGrades.length})` : `Assignments (${assignmentGrades.length})`}
        </TabBtn>
        <TabBtn active={tab === 'assessments'} onClick={() => setTab('assessments')}>
          {isRtl ? `اختبارات (${assessmentGrades.length})` : `Assessments (${assessmentGrades.length})`}
        </TabBtn>
      </div>

      {/* Grades list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="text-5xl">📊</div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            {isRtl ? 'لا توجد درجات في هذا القسم بعد.' : 'No grades in this section yet.'}
          </div>
        </div>
      ) : (
        <div className="gap-2 grid">
          {displayed.map((g) => {
            const isAssignment = g._type === 'assignment'
            const title = isAssignment
              ? (g.assignment?.title || (isRtl ? 'واجب' : 'Assignment'))
              : (g.assessment?.title || (isRtl ? 'اختبار' : 'Assessment'))
            const score = typeof g.score === 'number' ? g.score : null
            const maxScore = typeof g.maxScore === 'number' ? g.maxScore : null
            const date = fmt(g.createdAt || g.gradedAt)

            return (
              <div
                key={g._id}
                className="flex flex-row items-center justify-between gap-3 p-4 border border-black/5 dark:border-white/[0.06] rounded-2xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Left: icon + info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={
                    'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ' +
                    (isAssignment
                      ? 'bg-blue-400/10 text-blue-400'
                      : 'bg-purple-400/10 text-purple-400')
                  }>
                    {isAssignment
                      ? <FileText className="w-5 h-5" />
                      : <ClipboardList className="w-5 h-5" />}
                  </div>

                  <div className="gap-0.5 grid min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate">
                      {title}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className={
                        'px-2 py-0.5 rounded-full text-xs font-medium ' +
                        (isAssignment
                          ? 'bg-blue-400/10 text-blue-500 dark:text-blue-400'
                          : 'bg-purple-400/10 text-purple-500 dark:text-purple-400')
                      }>
                        {isAssignment ? (isRtl ? 'واجب' : 'Assignment') : (isRtl ? 'اختبار' : 'Assessment')}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">{date}</span>
                    </div>
                    {g.feedback && (
                      <div className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs italic line-clamp-1 hidden sm:block">
                        💬 {g.feedback}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: score - always visible, same row */}
                <div className="flex-shrink-0 flex items-center justify-end">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    {score != null ? score : '—'}
                    {maxScore != null && (
                      <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/{maxScore}</span>
                    )}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import Spinner from '../../components/ui/Spinner.jsx'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'

export default function StudentStatsPage() {
  const { isRtl } = useLanguage()
  const { notify } = useToast()
  const [state, setState] = useState({ status: 'loading', data: null, error: '' })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setState({ status: 'loading', data: null, error: '' })
        const res = await api.get('/users/me/stats')
        if (!mounted) return
        setState({ status: 'success', data: res.data, error: '' })
      } catch (e) {
        if (!mounted) return
        const msg = e?.response?.data?.message || e?.message || 'Error'
        setState({ status: 'error', data: null, error: msg })
        notify({ title: isRtl ? 'تعذر تحميل الإحصائيات' : 'Failed to load stats', description: msg, variant: 'destructive' })
      }
    }
    load()
    return () => { mounted = false }
  }, [isRtl, notify])

  if (state.status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <Spinner />
        {isRtl ? 'جاري التحميل...' : 'Loading...'}
      </div>
    )
  }

  if (state.status === 'error') {
    return <div className="text-slate-700 dark:text-slate-200 text-sm">{state.error}</div>
  }

  const d = state.data || {}
  const courses = d.courses || {}
  const assessments = d.assessments || {}
  const profile = d.profile || {}
  const courseItems = Array.isArray(courses.items) ? courses.items : []
  const recentResults = Array.isArray(assessments.recentResults) ? assessments.recentResults : []

  function formatNum(x) {
    if (x === null || x === undefined) return '-'
    const n = Number(x)
    if (!Number.isFinite(n)) return '-'
    const s = n.toFixed(2)
    return s.replace(/\.00$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '')
  }

  function fmtDate(dt) {
    if (!dt) return '-'
    try {
      return new Date(dt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    } catch { return String(dt) }
  }

  function translateGradeYear(gy) {
    if (!gy) return '-'
    const map = {
      '1_secondary': { ar: 'الصف الأول الثانوي', en: '1st Secondary' },
      '2_secondary': { ar: 'الصف الثاني الثانوي', en: '2nd Secondary' },
      '3_secondary': { ar: 'الصف الثالث الثانوي', en: '3rd Secondary' },
      secondary_1: { ar: 'الصف الأول الثانوي', en: '1st Secondary' },
      secondary_2: { ar: 'الصف الثاني الثانوي', en: '2nd Secondary' },
      secondary_3: { ar: 'الصف الثالث الثانوي', en: '3rd Secondary' },
      '1_primary': { ar: 'الصف الأول الابتدائي', en: '1st Primary' },
      '2_primary': { ar: 'الصف الثاني الابتدائي', en: '2nd Primary' },
      '3_primary': { ar: 'الصف الثالث الابتدائي', en: '3rd Primary' },
      '4_primary': { ar: 'الصف الرابع الابتدائي', en: '4th Primary' },
      '5_primary': { ar: 'الصف الخامس الابتدائي', en: '5th Primary' },
      '6_primary': { ar: 'الصف السادس الابتدائي', en: '6th Primary' },
      '1_middle': { ar: 'الصف الأول الإعدادي', en: '1st Middle' },
      '2_middle': { ar: 'الصف الثاني الإعدادي', en: '2nd Middle' },
      '3_middle': { ar: 'الصف الثالث الإعدادي', en: '3rd Middle' },
    }
    const found = map[gy]
    if (found) return isRtl ? found.ar : found.en
    return gy // fallback: show raw value
  }

  function translateSection(sec) {
    if (!sec) return '-'
    const map = {
      science: { ar: 'علمي علوم', en: 'Science (Biology)' },
      math: { ar: 'علمي رياضة', en: 'Science (Math)' },
      literature: { ar: 'أدبي', en: 'Literature' },
      english: { ar: 'اللغة الإنجليزية', en: 'English' },
      arabic: { ar: 'اللغة العربية', en: 'Arabic' },
    }
    const found = map[sec]
    if (found) return isRtl ? found.ar : found.en
    return sec // fallback
  }

  function StatCard({ title, value, hint, tone = 'brand' }) {
    const toneClass =
      tone === 'slate'
        ? 'border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.04]'
        : 'border-brand/25 bg-brand/10'

    return (
      <div className={'p-5 border rounded-3xl shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none ' + toneClass}>
        <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{title}</div>
        <div className="mt-2 font-extrabold text-slate-900 dark:text-white text-3xl">{value}</div>
        {hint ? <div className="mt-1 text-slate-600 dark:text-slate-300 text-sm">{hint}</div> : null}
      </div>
    )
  }

  return (
    <div className={"gap-6 grid " + (isRtl ? 'text-right' : 'text-left')}>

      {/* Header */}
      <div className="flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
            <span className="bg-brand rounded-full w-1.5 h-1.5" />
            {isRtl ? 'إحصائيات الطالب' : 'Student analytics'}
          </div>
          <div className="mt-3 text-center">
            <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl sm:text-5xl leading-[1.1]">
              <span className="font-perfect text-slate-900 dark:text-white">{isRtl ? 'إحصائياتي' : 'My Stats'}</span>
            </h1>
            <svg className="mx-auto mt-2 w-full max-w-[520px] h-4" viewBox="0 0 520 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M10 20 C 130 6, 390 6, 510 20" stroke="#069484" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm text-center">
            {isRtl
              ? `السنة: ${translateGradeYear(profile.gradeYear)} | القسم: ${translateSection(profile.section)}`
              : `Grade: ${translateGradeYear(profile.gradeYear)} | Section: ${translateSection(profile.section)}`}
          </p>
          {d.usedFallback && (
            <p className="mt-1 text-brand text-xs text-center">
              {isRtl
                ? 'السنة الدراسية غير مضبوطة في الكورسات — يتم عرض جميع الكورسات المسجل بها.'
                : 'Course grade year not set — showing all enrolled courses.'}
            </p>
          )}
        </div>
      </div>

      {/* Row 1: Course stats */}
      <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isRtl ? 'الكورسات' : 'Courses'}
          value={Number(courses.enrolledSameYear || 0)}
          hint={isRtl
            ? `إجمالي مشترك: ${Number(courses.enrolledTotal || 0)}`
            : `Total enrolled: ${Number(courses.enrolledTotal || 0)}`}
          tone="brand"
        />
        <StatCard
          title={isRtl ? 'ساعات المشاهدة' : 'Watched hours'}
          value={formatNum(courses.watchedTotalHours)}
          hint={isRtl
            ? (courses.totalVideoHours > 0 ? `من ${formatNum(courses.totalVideoHours)} ساعة` : 'ساعة')
            : (courses.totalVideoHours > 0 ? `of ${formatNum(courses.totalVideoHours)}h total` : 'hours')}
          tone="brand"
        />
        <StatCard
          title={isRtl ? 'المدرسين' : 'Teachers'}
          value={Number(courses.teachersSameYear || 0)}
          hint={isRtl ? 'مدرس مختلف' : 'unique teachers'}
          tone="slate"
        />
        <StatCard
          title={isRtl ? 'المحاولات' : 'Attempts'}
          value={Number(assessments.attemptsTotal || 0)}
          hint={isRtl
            ? `مصححة: ${Number(assessments.gradedAttempts || 0)}`
            : `Graded: ${Number(assessments.gradedAttempts || 0)}`}
          tone="slate"
        />
      </div>

      {/* Row 2: Score stats */}
      <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={isRtl ? 'متوسط الدرجات' : 'Average score'}
          value={`${formatNum(assessments.avgPercent)}%`}
          tone="emerald"
        />
        <StatCard
          title={isRtl ? 'أعلى درجة' : 'Best score'}
          value={`${formatNum(assessments.bestPercent)}%`}
          tone="brand"
        />
        <StatCard
          title={isRtl ? 'آخر درجة' : 'Last score'}
          value={
            assessments.lastPercent !== null && assessments.lastPercent !== undefined
              ? `${formatNum(assessments.lastPercent)}%`
              : '-'
          }
          tone="slate"
        />
      </div>

      {/* Courses list */}
      <div className="bg-white/70 dark:bg-white/[0.04] p-5 border border-black/10 dark:border-white/10 rounded-3xl">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="font-extrabold text-slate-900 dark:text-white text-lg">
            {isRtl ? 'كورساتي' : 'My courses'}
          </div>
          {courses.watchedTotalHours > 0 && (
            <div className="text-slate-600 dark:text-slate-300 text-sm">
              {isRtl ? 'إجمالي المشاهدة:' : 'Total watched:'} {formatNum(courses.watchedTotalHours)} {isRtl ? 'س' : 'h'}
              {courses.totalVideoHours > 0 ? ` / ${formatNum(courses.totalVideoHours)} ${isRtl ? 'س' : 'h'}` : ''}
            </div>
          )}
        </div>
        {courseItems.length === 0 ? (
          <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'لا توجد كورسات لعرضها.' : 'No courses to show.'}
          </div>
        ) : (
          <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-3 mt-3">
            {courseItems.map((c) => (
              <div key={c.id} className="bg-white/60 dark:bg-white/[0.03] p-4 border border-black/10 dark:border-white/10 rounded-2xl">
                <div className="font-extrabold text-slate-900 dark:text-white truncate">{c.title || (isRtl ? 'كورس' : 'Course')}</div>
                <div className="mt-1 text-slate-600 dark:text-slate-300 text-sm truncate">
                  {isRtl ? 'المدرس:' : 'Teacher:'} {c.teacherName || '-'}
                </div>
                <div className="flex justify-between items-center gap-2 mt-2">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {isRtl ? 'مشاهدة:' : 'Watched:'} {formatNum(c.watchedHours)} {isRtl ? 'س' : 'h'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {c.completionPercent !== null && c.completionPercent !== undefined
                      ? `${formatNum(c.completionPercent)}%`
                      : '-'}
                  </span>
                </div>
                <div className="bg-black/5 dark:bg-white/10 mt-2 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, Number(c.completionPercent || 0)))}%` }}
                  />
                </div>
                <div className="mt-2 text-slate-500 dark:text-slate-400 text-xs">
                  {c.isFree ? (isRtl ? 'مجاني' : 'Free') : (isRtl ? 'مدفوع' : 'Paid')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent assessment results */}
      <div className="bg-white/70 dark:bg-white/[0.04] p-5 border border-black/10 dark:border-white/10 rounded-3xl">
        <div className="font-extrabold text-slate-900 dark:text-white text-lg">
          {isRtl ? 'آخر نتائج الاختبارات' : 'Recent assessment results'}
        </div>
        {recentResults.length === 0 ? (
          <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'لا توجد نتائج مصححة بعد.' : 'No graded results yet.'}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block mt-3 border border-black/5 dark:border-white/10 rounded-2xl overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>{isRtl ? 'الاختبار' : 'Assessment'}</TH>
                    <TH>{isRtl ? 'الكورس' : 'Course'}</TH>
                    <TH className="text-center">{isRtl ? 'الدرجة' : 'Score'}</TH>
                    <TH className="text-center">{isRtl ? 'النسبة' : '%'}</TH>
                    <TH className="text-center">{isRtl ? 'التاريخ' : 'Date'}</TH>
                  </TR>
                </THead>
                <TBody>
                  {recentResults.map((r) => {
                    const pct = Number(r.percent || 0)
                    const pctCls = pct >= 75
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : pct >= 50
                        ? 'text-brand'
                        : 'text-rose-600 dark:text-rose-400'
                    return (
                      <TR key={r.attemptId}>
                        <TD className="font-semibold text-slate-900 dark:text-slate-100">{r.assessmentTitle || '-'}</TD>
                        <TD className="text-slate-600 dark:text-slate-300">{r.courseTitle || '-'}</TD>
                        <TD className="font-medium text-slate-700 dark:text-slate-200 text-center">
                          {r.score}/{r.maxScore}
                        </TD>
                        <TD className={`text-center font-bold ${pctCls}`}>{formatNum(r.percent)}%</TD>
                        <TD className="text-slate-500 dark:text-slate-400 text-sm text-center">
                          {fmtDate(r.submittedAt || r.createdAt)}
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden gap-3 grid mt-3">
              {recentResults.map((r) => {
                const pct = Number(r.percent || 0)
                const pctCls = pct >= 75
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : pct >= 50
                    ? 'text-brand'
                    : 'text-rose-600 dark:text-rose-400'
                return (
                  <div key={r.attemptId} className="bg-white/60 dark:bg-white/[0.03] p-4 border border-black/10 dark:border-white/10 rounded-2xl">
                    <div className="font-extrabold text-slate-900 dark:text-white">{r.assessmentTitle || '-'}</div>
                    <div className="mt-1 text-slate-600 dark:text-slate-300 text-sm">{r.courseTitle || '-'}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-600 dark:text-slate-300 text-sm">{r.score}/{r.maxScore}</span>
                      <span className={`font-bold text-xl ${pctCls}`}>{formatNum(r.percent)}%</span>
                    </div>
                    <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
                      {fmtDate(r.submittedAt || r.createdAt)}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

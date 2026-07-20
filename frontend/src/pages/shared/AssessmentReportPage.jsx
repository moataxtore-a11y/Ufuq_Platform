import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import ScorePill from '../../components/ui/ScorePill.jsx'
import { BadgeCheck, Clock, Minus, Users, FileCheck2 } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'

function StatusPill({ status, isRtl }) {
  const cfg =
    status === 'graded'
      ? {
        label: isRtl ? 'مصحَّح' : 'Graded',
        cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
      }
      : status === 'submitted'
        ? {
          label: isRtl ? 'تم الإرسال' : 'Submitted',
          cls: 'bg-brand/10 dark:bg-brand/20 text-brand-700 dark:text-brand-300 border-brand/20 dark:border-brand/30'
        }
        : status === 'in_progress'
          ? {
            label: isRtl ? 'جاري الحل' : 'In progress',
            cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30'
          }
          : {
            label: isRtl ? 'لم يبدأ' : 'Not attempted',
            cls: 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border-black/5 dark:border-white/10'
          }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function StatCard({ icon, label, value, iconCls }) {
  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-neutral-900 shadow-sm p-5 border border-black/5 dark:border-white/[0.06] rounded-2xl">
      <div className="flex items-center gap-2">
        <span className={`flex items-center justify-center w-8 h-8 rounded-xl ${iconCls}`}>
          {icon}
        </span>
        <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">{label}</span>
      </div>
      <div className="font-bold tabular-nums text-slate-900 dark:text-slate-100 text-2xl leading-none">
        {value ?? '-'}
      </div>
    </div>
  )
}

function fmt(dt, isRtl) {
  if (!dt) return '-'
  try {
    return new Date(dt).toLocaleString(isRtl ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return String(dt)
  }
}

export default function AssessmentReportPage() {
  const { assessmentId } = useParams()
  const { notify } = useToast()
  const { isRtl } = useLanguage()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const summary = useMemo(() => data?.summary || null, [data])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await api.get(`/assessments/${assessmentId}/report`)
        if (mounted) setData(res.data)
      } catch (e) {
        notify({
          title: isRtl ? 'فشل تحميل التقرير' : 'Failed to load report',
          description: e?.response?.data?.message || 'Error',
          variant: 'destructive'
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [assessmentId, notify])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
        <Spinner />
        {isRtl ? 'جاري التحميل...' : 'Loading...'}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="gap-5 grid" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div>
        <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-2xl sm:text-3xl">
          {isRtl ? 'تقرير الاختبار' : 'Assessment Report'}
        </h1>
        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400 text-sm">
          {data?.course?.title && (
            <>
              <span className="font-medium text-slate-600 dark:text-slate-300">{data.course.title}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
            </>
          )}
          <span>{data?.assessment?.title || (isRtl ? 'اختبار' : 'Assessment')}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
          iconCls="bg-violet-50 dark:bg-violet-500/10"
          label={isRtl ? 'الإجمالي' : 'Total'}
          value={summary?.total}
        />
        <StatCard
          icon={<Minus className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
          iconCls="bg-slate-100 dark:bg-white/[0.06]"
          label={isRtl ? 'لم يبدأ' : 'Not attempted'}
          value={summary?.not_attempted}
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          iconCls="bg-blue-50 dark:bg-blue-500/10"
          label={isRtl ? 'جاري الحل' : 'In progress'}
          value={summary?.in_progress}
        />
        <StatCard
          icon={<BadgeCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
          iconCls="bg-brand/10 dark:bg-brand/20"
          label={isRtl ? 'تم الإرسال' : 'Submitted'}
          value={summary?.submitted}
        />
        <StatCard
          icon={<FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          iconCls="bg-emerald-50 dark:bg-emerald-500/10"
          label={isRtl ? 'مصحَّح' : 'Graded'}
          value={summary?.graded}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/[0.06] rounded-2xl overflow-x-auto">
        {(data.rows || []).length === 0 ? (
          <div className="p-8 text-slate-500 dark:text-slate-400 text-sm text-center">
            {isRtl ? 'لا يوجد طلاب في هذا الكورس.' : 'No students in this course.'}
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className={isRtl ? 'text-right' : 'text-left'}>{isRtl ? 'الطالب' : 'Student'}</TH>
                <TH className="text-center">{isRtl ? 'الحالة' : 'Status'}</TH>
                <TH className="text-center">{isRtl ? 'الدرجة' : 'Score'}</TH>
                <TH className="text-center">{isRtl ? 'وقت البدء' : 'Started'}</TH>
                <TH className="text-center">{isRtl ? 'وقت التسليم' : 'Submitted'}</TH>
                <TH className="text-center">{isRtl ? 'وقت التصحيح' : 'Graded'}</TH>
              </TR>
            </THead>
            <TBody>
              {(data.rows || []).map((r) => (
                <TR key={r.studentId}>
                  <TD>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{r.name || '-'}</div>
                    <div className="mt-0.5 text-slate-400 dark:text-slate-500 text-xs">{r.email || '-'}</div>
                  </TD>
                    <TD className="text-center">
                    <StatusPill status={r.status} isRtl={isRtl} />
                  </TD>
                  <TD className="text-center">
                    <ScorePill
                      score={typeof r.score === 'number' ? r.score : null}
                      maxScore={typeof r.maxScore === 'number' ? r.maxScore : null}
                    />
                  </TD>
                  <TD className="text-slate-600 dark:text-slate-300 text-sm text-center">{fmt(r.startedAt, isRtl)}</TD>
                  <TD className="text-slate-600 dark:text-slate-300 text-sm text-center">{fmt(r.submittedAt, isRtl)}</TD>
                  <TD className="text-slate-600 dark:text-slate-300 text-sm text-center">{fmt(r.gradedAt, isRtl)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  )
}


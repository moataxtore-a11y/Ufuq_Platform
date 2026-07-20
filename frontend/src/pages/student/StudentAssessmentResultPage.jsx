import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function StudentAssessmentResultPage() {
  const { attemptId } = useParams()
  const { notify } = useToast()
  const navigate = useNavigate()
  const { isRtl } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await api.get(`/assessments/attempts/${attemptId}/result`)
        if (!mounted) return
        setData(res.data)
      } catch (e) {
        notify({ title: isRtl ? 'فشل تحميل النتيجة' : 'Failed to load result', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
        navigate('/student/assessments', { replace: true })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId])

  const answerMap = useMemo(() => {
    const m = new Map()
    for (const a of data?.answers || []) m.set(String(a.questionId), a)
    return m
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
        <Spinner />
        {isRtl ? 'جاري التحميل...' : 'Loading...'}
      </div>
    )
  }

  const assessment = data?.assessment

  function statusLabel(s) {
    const v = String(s || '').toLowerCase()
    if (!isRtl) return s || '-'
    if (v === 'graded') return 'تم التصحيح'
    if (v === 'submitted') return 'تم الإرسال'
    if (v === 'pending') return 'قيد المراجعة'
    if (v === 'in_progress') return 'قيد الحل'
    return s || '-'
  }

  function boolLabel(v) {
    if (typeof v !== 'boolean') return '-'
    return isRtl ? (v ? 'صح' : 'خطأ') : String(v)
  }

  function questionCorrectness(q, a) {
    if (!q) return { canJudge: false, isCorrect: false }
    if (!a) return { canJudge: false, isCorrect: false }

    if (q.type === 'mcq') {
      const canJudge = Boolean(q.correctOptionId)
      const isCorrect = canJudge && String(a.selectedOptionId || '') === String(q.correctOptionId || '')
      return { canJudge, isCorrect }
    }
    if (q.type === 'true_false') {
      const canJudge = typeof q.correctBoolean === 'boolean'
      const isCorrect = canJudge && typeof a.booleanAnswer === 'boolean' && a.booleanAnswer === q.correctBoolean
      return { canJudge, isCorrect }
    }
    if (q.type === 'short_answer') {
      const correct = String(q.correctText || '').trim()
      const student = String(a.textAnswer || '').trim()
      const canJudge = Boolean(correct)
      const isCorrect = canJudge && student && student.toLowerCase() === correct.toLowerCase()
      return { canJudge, isCorrect }
    }
    return { canJudge: false, isCorrect: false }
  }

  return (
    <div className="gap-4 grid" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto w-full max-w-5xl">
        <div className={'text-center ' + (isRtl ? '' : '')}>
          <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
            {isRtl ? 'النتيجة' : 'Result'}
          </h2>
          <div className="flex justify-center mt-2">
            <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
              <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mt-3 font-extrabold text-slate-900 dark:text-slate-100 text-2xl sm:text-3xl break-words">
            {assessment?.title || (isRtl ? 'اختبار' : 'Assessment')}
          </div>

          <div className="mt-2">
            {String(data?.status || '').toLowerCase() === 'graded' ? (
              <div className="flex justify-center">
                {(() => {
                  const score = typeof data?.score === 'number' ? data.score : null
                  const maxScore = typeof data?.maxScore === 'number' ? data.maxScore : null
                  const ratio = score !== null && maxScore ? score / maxScore : null

                  const cardBg = ratio === null
                    ? 'bg-slate-100 dark:bg-neutral-800'
                    : ratio < 0.5
                      ? 'bg-rose-500'
                      : ratio < 0.75
                        ? 'bg-brand'
                        : 'bg-emerald-500'

                  const scoreTextCls = ratio === null
                    ? 'text-slate-900 dark:text-slate-100'
                    : ratio < 0.5
                      ? 'text-rose-700 dark:text-rose-200'
                      : ratio < 0.75
                        ? 'text-brand'
                        : 'text-emerald-700 dark:text-emerald-200'

                  const scoreText = score !== null && maxScore !== null
                    ? `${score}/${maxScore}`
                    : '-'

                  return (
                    <div className={"w-full max-w-[300px] rounded-[20px] p-3 " + cardBg}>
                      <div className="flex justify-center">
                        <div className="px-4 py-1.5 rounded-xl font-extrabold text-white text-3xl">
                          {isRtl ? 'درجتك' : 'Your score'}
                        </div>
                      </div>

                      <div className="flex justify-center mt-4">
                        <div className="bg-slate-300/90 dark:bg-neutral-700/80 px-4 py-2.5 rounded-2xl min-w-[180px]">
                          <div className={"text-center font-extrabold text-4xl tabular-nums " + scoreTextCls}>
                            {scoreText}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="inline-flex items-center bg-white/60 dark:bg-neutral-900/40 px-3 py-2 border border-black/5 dark:border-white/[0.06] rounded-full font-semibold text-slate-700 dark:text-slate-200 text-sm">
                {isRtl ? 'جاري التصحيح' : 'Grading in progress'}
              </div>
            )}
          </div>
        </div>

        {data?.feedback ? (
          <div className="bg-slate-50 dark:bg-neutral-900 mt-4 p-3 border border-black/5 dark:border-white/[0.06] rounded-2xl text-sm">
            <div className="font-bold text-slate-900 dark:text-slate-100">{isRtl ? 'ملاحظات' : 'Feedback'}</div>
            <div className="mt-1 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{data.feedback}</div>
          </div>
        ) : null}

        <div className="gap-3 grid mt-4">
          {(assessment?.questions || []).map((q, idx) => {
            const a = answerMap.get(String(q._id)) || {}
            const studentText = a.textAnswer || a.fileUrl || ''
            const { canJudge, isCorrect } = questionCorrectness(q, a)
            const showCorrect = Boolean(canJudge && !isCorrect)

            const yourAnswerCls = canJudge
              ? (isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200')
              : 'bg-slate-50 dark:bg-neutral-900 border-black/5 dark:border-white/[0.06] text-slate-800 dark:text-slate-100'

            const correctAnswerCls = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'

            return (
              <div key={q._id} className="bg-white dark:bg-neutral-900 p-4 border border-black/5 dark:border-white/[0.06] rounded-2xl">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg break-words">
                  {idx + 1}. {q.prompt}
                </div>
                <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">{(isRtl ? 'الدرجة: ' : 'Points: ')}{Number(q.points || 0)}</div>

                <div className="gap-3 grid mt-3 text-sm">
                  <div className={"p-3 border rounded-xl " + yourAnswerCls}>
                    <div className={showCorrect ? 'font-bold' : 'font-semibold'}>{isRtl ? 'إجابتك' : 'Your answer'}</div>
                    <div className="mt-1 break-words whitespace-pre-wrap">
                      {q.type === 'mcq'
                        ? ((q.options || []).find((o) => String(o._id) === String(a.selectedOptionId))?.text || '-')
                        : q.type === 'true_false'
                          ? boolLabel(a.booleanAnswer)
                          : q.type === 'file_upload'
                            ? (a.fileUrl
                              ? <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-teal-100 dark:bg-teal-900/30 px-3 py-1.5 rounded-lg font-semibold text-teal-700 dark:text-teal-300 text-xs hover:underline">
                                <span>📎</span>
                                <span>{isRtl ? 'عرض الملف' : 'View File'}</span>
                              </a>
                              : '-')
                            : (studentText || '-')}
                    </div>
                  </div>

                  {showCorrect && q.type === 'mcq' ? (
                    <div className={"p-3 border rounded-xl " + correctAnswerCls}>
                      <div className="font-semibold">{isRtl ? 'الإجابة الصحيحة' : 'Correct answer'}</div>
                      <div className="mt-1 break-words">
                        {(q.options || []).find((o) => String(o._id) === String(q.correctOptionId))?.text || '-'}
                      </div>
                    </div>
                  ) : null}

                  {showCorrect && q.type === 'true_false' ? (
                    <div className={"p-3 border rounded-xl " + correctAnswerCls}>
                      <div className="font-semibold">{isRtl ? 'الإجابة الصحيحة' : 'Correct answer'}</div>
                      <div className="mt-1">{boolLabel(q.correctBoolean)}</div>
                    </div>
                  ) : null}

                  {showCorrect && q.type === 'short_answer' ? (
                    <div className={"p-3 border rounded-xl " + correctAnswerCls}>
                      <div className="font-semibold">{isRtl ? 'الإجابة الصحيحة' : 'Correct answer'}</div>
                      <div className="mt-1 break-words whitespace-pre-wrap">{q.correctText || '-'}</div>
                    </div>
                  ) : null}

                  {!canJudge && (q.type === 'essay' || q.type === 'file_upload') ? (
                    <div className="bg-brand/10 dark:bg-brand/20 p-3 border border-brand/20 dark:border-brand/30 rounded-xl text-brand-700 dark:text-brand-200">
                      {isRtl ? 'قد يحتاج هذا السؤال إلى تصحيح يدوي.' : 'Manual grading may apply.'}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        <div className={'flex justify-end gap-2 pt-2 ' + (isRtl ? '' : '')}>
          <Button variant="secondary" onClick={() => navigate('/student/assessments')}>
            {isRtl ? 'العودة للاختبارات' : 'Back to assessments'}
          </Button>
        </div>
      </div>
    </div>
  )
}

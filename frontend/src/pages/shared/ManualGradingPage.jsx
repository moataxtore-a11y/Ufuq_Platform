import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api.js'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Textarea from '../../components/ui/Textarea.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import ScorePill from '../../components/ui/ScorePill.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

function fmt(dt) {
  if (!dt) return '-'
  try {
    return new Date(dt).toLocaleString()
  } catch {
    return String(dt)
  }
}

function getAnswerForQuestion(attempt, questionId) {
  const a = (attempt?.answers || []).find((x) => String(x?.questionId) === String(questionId))
  return a || null
}

export default function ManualGradingPage() {
  const { notify } = useToast()
  const { t, isRtl } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])

  // Assignment submissions
  const [assignmentSubs, setAssignmentSubs] = useState([])
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [selectedSub, setSelectedSub] = useState(null)
  const [subScore, setSubScore] = useState('')
  const [subFeedback, setSubFeedback] = useState('')
  const [savingSub, setSavingSub] = useState(false)
  const [subModalOpen, setSubModalOpen] = useState(false)

  async function openSubmissionUrl(u) {
    const url = String(u || '')
    if (!url) return
    try {
      if (/\/storage\/v1\/object\/public\//i.test(url)) {
        const res = await api.get('/uploads/signed', { params: { url } })
        const signedUrl = res?.data?.url
        if (!signedUrl) throw new Error('No signed url returned')
        window.open(signedUrl, '_blank', 'noopener,noreferrer')
        return
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      notify({ title: isRtl ? 'فشل فتح الملف' : 'Failed to open file', description: e?.response?.data?.message || e?.message || 'Error', variant: 'destructive' })
    }
  }

  const [open, setOpen] = useState(false)
  const [activeAttempt, setActiveAttempt] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [loadingAssessment, setLoadingAssessment] = useState(false)

  const [manualScore, setManualScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/assessments/grading/queue')
      setRows(res.data)
    } catch (e) {
      notify({ title: t('manualGrading.failedToLoadQueue'), description: e?.response?.data?.message || t('manualGrading.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function loadAssignmentSubs() {
    try {
      setLoadingAssignments(true)
      const res = await api.get('/assignments/submissions/queue')
      setAssignmentSubs(res.data)
    } catch (e) {
      notify({ title: isRtl ? 'فشل تحميل الواجبات' : 'Failed to load assignments', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoadingAssignments(false)
    }
  }

  useEffect(() => {
    load()
    loadAssignmentSubs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pendingCount = useMemo(() => rows.filter(r => r.status !== 'graded').length, [rows])

  async function openGrade(attempt) {
    setActiveAttempt(attempt)
    setAssessment(null)
    setManualScore(typeof attempt?.manualGradedScore === 'number' ? String(attempt.manualGradedScore) : '')
    setFeedback(attempt?.feedback || '')
    setOpen(true)

    const assessmentId = attempt?.assessment?._id || attempt?.assessment
    if (!assessmentId) return

    try {
      setLoadingAssessment(true)
      const res = await api.get(`/assessments/${assessmentId}`)
      setAssessment(res.data)
    } catch (e) {
      notify({ title: t('manualGrading.failedToLoadAssessment'), description: e?.response?.data?.message || t('manualGrading.error'), variant: 'destructive' })
    } finally {
      setLoadingAssessment(false)
    }
  }

  async function submitGrade(e) {
    e.preventDefault()
    if (!activeAttempt?._id) return

    const ms = Number(manualScore)
    if (!Number.isFinite(ms) || ms < 0) {
      notify({ title: t('manualGrading.invalidScore'), description: t('manualGrading.invalidScoreHint'), variant: 'destructive' })
      return
    }

    try {
      setSaving(true)
      await api.post(`/assessments/grading/attempts/${activeAttempt._id}`, {
        manualScore: ms,
        feedback
      })
      notify({ title: t('manualGrading.graded') })
      setOpen(false)
      setActiveAttempt(null)
      setAssessment(null)
      await load()
    } catch (e2) {
      notify({ title: t('manualGrading.gradeFailed'), description: e2?.response?.data?.message || t('manualGrading.error'), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function openSubGrade(sub) {
    setSelectedSub(sub)
    setSubScore(sub.score != null ? String(sub.score) : '')
    setSubFeedback(sub.feedback || '')
    setSubModalOpen(true)
  }

  async function submitSubGrade(e) {
    e.preventDefault()
    if (!selectedSub?._id) return
    try {
      setSavingSub(true)
      await api.post(`/assignments/submissions/${selectedSub._id}/grade`, {
        score: Number(subScore),
        feedback: subFeedback
      })
      notify({ title: isRtl ? 'تم تصحيح الواجب' : 'Assignment graded' })
      setSubModalOpen(false)
      setSelectedSub(null)
      loadAssignmentSubs()
    } catch (e2) {
      notify({ title: isRtl ? 'فشل التصحيح' : 'Grade failed', description: e2?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setSavingSub(false)
    }
  }

  return (
    <div className="gap-4 grid">
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {t('manualGrading.title')}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{t('manualGrading.subtitle')}</div>

        <div className="flex justify-center mt-4">
          <Button variant="secondary" onClick={() => { load(); loadAssignmentSubs() }} disabled={loading || loadingAssignments}>
            {t('manualGrading.refresh')}
          </Button>
        </div>
      </div>

      {/* ── Assessment grading queue ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t('manualGrading.queue')} ({pendingCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Spinner />
              {t('manualGrading.loading')}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-slate-600 dark:text-slate-300 text-sm">{t('manualGrading.empty')}</div>
          ) : (
            <div className="gap-2 grid">
              {rows.map((a) => (
                <div key={a._id} className={
                  'p-3 border rounded-xl ' +
                  (a.status === 'graded'
                    ? 'border-green-200/50 dark:border-green-400/20 bg-green-50/30 dark:bg-green-400/5'
                    : 'border-black/5 dark:border-white/[0.06]')
                }>
                  <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-2">
                    <div className="gap-1 grid">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{a?.assessment?.title || t('manualGrading.assessmentFallback')}</div>
                        {a.status === 'graded' ? (
                          <span className="bg-green-100 dark:bg-green-400/15 px-2 py-0.5 rounded-full font-semibold text-green-700 dark:text-green-400 text-xs">
                            {isRtl ? '✓ مصحح' : '✓ Graded'}
                          </span>
                        ) : (
                          <span className="bg-brand/10 dark:bg-brand/20 px-2 py-0.5 rounded-full font-semibold text-brand dark:text-brand-200 text-xs">
                            {isRtl ? '⏳ معلق' : '⏳ Pending'}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                        {t('manualGrading.student')}: {a?.student?.name || '-'} ({a?.student?.email || '-'})
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">{t('manualGrading.submitted')}: {fmt(a?.submittedAt)}</div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        {t('manualGrading.auto')}: <ScorePill score={typeof a?.autoGradedScore === 'number' ? a.autoGradedScore : 0} maxScore={typeof a?.maxScore === 'number' ? a.maxScore : null} className="ml-2" />
                        {a.status === 'graded' && typeof a.score === 'number' && (
                          <>
                            <span className="text-slate-300">|</span>
                            {isRtl ? 'النهائي' : 'Total'}: <ScorePill score={a.score} maxScore={a.maxScore} />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end items-center">
                      <Button onClick={() => openGrade(a)} variant={a.status === 'graded' ? 'secondary' : 'default'}>
                        {a.status === 'graded'
                          ? (isRtl ? 'تعديل الدرجة' : 'Edit grade')
                          : t('manualGrading.grade')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Assignment submissions queue ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <CardTitle>
              {isRtl ? 'تسليمات الواجبات' : 'Assignment Submissions'} ({assignmentSubs.filter(s => !s.graded).length} {isRtl ? 'معلقة' : 'pending'})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAssignments ? (
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Spinner />
              {isRtl ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : assignmentSubs.length === 0 ? (
            <div className="text-slate-600 dark:text-slate-300 text-sm">
              {isRtl ? 'لا توجد تسليمات للواجبات.' : 'No assignment submissions.'}
            </div>
          ) : (
            <div className="gap-2 grid">
              {assignmentSubs.map((s) => (
                <div
                  key={s._id}
                  className={
                    'p-3 border rounded-xl ' +
                    (s.graded
                      ? 'border-green-200/50 dark:border-green-400/20 bg-green-50/30 dark:bg-green-400/5'
                      : 'border-black/5 dark:border-white/[0.06]')
                  }
                >
                  <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-2">
                    <div className="gap-1 grid">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {s.assignment?.title || (isRtl ? 'واجب' : 'Assignment')}
                        </div>
                        {s.graded ? (
                          <span className="bg-green-100 dark:bg-green-400/15 px-2 py-0.5 rounded-full font-semibold text-green-700 dark:text-green-400 text-xs">
                            {isRtl ? '✓ مصحح' : '✓ Graded'}
                          </span>
                        ) : (
                          <span className="bg-brand/10 dark:bg-brand/20 px-2 py-0.5 rounded-full font-semibold text-brand dark:text-brand-200 text-xs">
                            {isRtl ? '⏳ معلق' : '⏳ Pending'}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                        {isRtl ? 'الطالب' : 'Student'}: {s.student?.name || '-'} ({s.student?.email || '-'})
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                        {isRtl ? 'التسليم' : 'Submitted'}: {fmt(s.submittedAt || s.createdAt)}
                      </div>
                      {s.contentUrl && (
                        <button
                          type="button"
                          onClick={() => openSubmissionUrl(s.contentUrl)}
                          className="inline-flex items-center gap-1 w-fit font-medium text-brand text-xs hover:underline"
                        >
                          {/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|png|jpg|jpeg|gif|webp|mp4|mp3)(\?|$)/i.test(s.contentUrl)
                            ? (isRtl ? '📎 عرض الملف المرفق' : '📎 View attachment')
                            : (isRtl ? '🔗 فتح الرابط' : '🔗 Open link')}
                        </button>
                      )}
                      {s.graded && s.score != null && (
                        <div className="text-xs">
                          <ScorePill score={s.score} />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end items-center">
                      <Button onClick={() => openSubGrade(s)} variant={s.graded ? 'secondary' : 'default'}>
                        {s.graded
                          ? (isRtl ? 'تعديل الدرجة' : 'Edit grade')
                          : (isRtl ? 'تصحيح' : 'Grade')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment grade modal */}
      <Modal open={open} onOpenChange={setOpen} title={t('manualGrading.gradeAttempt')}>
        {!activeAttempt ? (
          <div className="text-slate-600 dark:text-slate-300 text-sm">{t('manualGrading.noAttemptSelected')}</div>
        ) : (
          <form onSubmit={submitGrade} className="gap-4 grid">
            <div className="p-3 border border-black/5 dark:border-white/[0.06] rounded-xl">
              <div className="font-medium text-slate-900 dark:text-slate-100">{activeAttempt?.assessment?.title || t('manualGrading.assessmentFallback')}</div>
              <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
                {t('manualGrading.student')}: {activeAttempt?.student?.name || '-'} ({activeAttempt?.student?.email || '-'})
              </div>
              <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">{t('manualGrading.submitted')}: {fmt(activeAttempt?.submittedAt)}</div>
              <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
                {t('manualGrading.autoScore')}{' '}
                <ScorePill
                  score={typeof activeAttempt?.autoGradedScore === 'number' ? activeAttempt.autoGradedScore : 0}
                  maxScore={typeof activeAttempt?.maxScore === 'number' ? activeAttempt.maxScore : null}
                  className="ml-2"
                />
              </div>
            </div>

            <div className="gap-2 grid">
              <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{t('manualGrading.studentAnswers')}</div>
              {loadingAssessment ? (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Spinner />
                  {t('manualGrading.loadingAssessment')}
                </div>
              ) : !assessment ? (
                <div className="text-slate-600 dark:text-slate-300 text-sm">{t('manualGrading.couldNotLoadAssessment')}</div>
              ) : (assessment.questions || []).length === 0 ? (
                <div className="text-slate-600 dark:text-slate-300 text-sm">{t('manualGrading.noQuestions')}</div>
              ) : (
                <div className="gap-3 grid">
                  {(assessment.questions || []).map((q, idx) => {
                    const ans = getAnswerForQuestion(activeAttempt, q._id)

                    // Resolve the display value based on question type
                    let displayValue = null
                    if (q.type === 'mcq') {
                      const optionId = ans?.selectedOptionId
                      const option = (q.options || []).find((o) => String(o._id) === String(optionId || ''))
                      displayValue = option ? option.text : (optionId ? String(optionId) : null)
                    } else if (q.type === 'true_false') {
                      const bv = ans?.booleanAnswer
                      displayValue = typeof bv === 'boolean' ? (isRtl ? (bv ? 'صح' : 'خطأ') : String(bv)) : null
                    } else if (q.type === 'short_answer' || q.type === 'essay') {
                      displayValue = ans?.textAnswer || null
                    } else if (q.type === 'file_upload') {
                      displayValue = ans?.fileUrl || null
                    }

                    return (
                      <div key={q._id} className="p-3 border border-black/5 dark:border-white/[0.06] rounded-xl">
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                          Q{idx + 1}. {q.prompt} <span className="font-normal text-slate-500">({q.type}{q.points ? `, ${q.points} pts` : ''})</span>
                        </div>

                        {q.type === 'file_upload' ? (
                          <div className="mt-2 text-sm">
                            {displayValue ? (
                              <button
                                type="button"
                                onClick={() => openSubmissionUrl(displayValue)}
                                className="inline-flex items-center gap-1.5 bg-brand/10 hover:bg-brand/15 dark:bg-brand/20 dark:hover:bg-brand/25 px-3 py-1.5 border border-brand/20 dark:border-brand/25 rounded-lg font-medium text-brand dark:text-brand-200 text-xs transition-colors"
                              >
                                <span>📎</span>
                                <span>{isRtl ? 'عرض الملف المرفوع' : 'Open uploaded file'}</span>
                              </button>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'لم يرفع الطالب ملفًا.' : 'No file.'}</span>
                            )}
                          </div>
                        ) : q.type === 'mcq' ? (
                          <div className="mt-2 text-slate-700 dark:text-slate-300 text-sm">
                            {isRtl ? 'الإجابة المحددة: ' : 'Selected option: '}<span className="font-semibold">{displayValue || '-'}</span>
                          </div>
                        ) : q.type === 'true_false' ? (
                          <div className="mt-2 text-slate-700 dark:text-slate-300 text-sm">
                            {isRtl ? 'الإجابة: ' : 'Answer: '}<span className="font-semibold">{displayValue || '-'}</span>
                          </div>
                        ) : (
                          <div className="mt-2 text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                            {displayValue || <span className="text-slate-400 dark:text-slate-500 italic">{isRtl ? 'لم يجب الطالب' : 'No answer provided'}</span>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{t('manualGrading.manualScore')}</label>
              <Input value={manualScore} onChange={(e) => setManualScore(e.target.value)} placeholder="e.g. 10" />
              <div className="text-slate-500 dark:text-slate-400 text-xs">{t('manualGrading.manualScoreHint')}</div>
            </div>

            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{t('manualGrading.feedback')}</label>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
                {t('manualGrading.cancel')}
              </Button>
              <Button type="submit" disabled={saving || manualScore.trim() === ''}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="border-t-white w-4 h-4" />
                    {t('manualGrading.saving')}
                  </span>
                ) : (
                  t('manualGrading.finalize')
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Assignment grade modal */}
      <Modal open={subModalOpen} onOpenChange={setSubModalOpen} title={isRtl ? 'تصحيح الواجب' : 'Grade Assignment'}>
        {selectedSub ? (
          <form onSubmit={submitSubGrade} className="gap-4 grid">
            <div className="p-3 border border-black/5 dark:border-white/[0.06] rounded-xl text-sm">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {selectedSub.assignment?.title || (isRtl ? 'واجب' : 'Assignment')}
              </div>
              <div className="mt-1 text-slate-500 dark:text-slate-400">
                {isRtl ? 'الطالب' : 'Student'}: <span className="font-medium text-slate-700 dark:text-slate-200">{selectedSub.student?.name || '-'}</span>
              </div>
              <div className="mt-1 text-slate-500 dark:text-slate-400">
                {isRtl ? 'التسليم' : 'Submitted'}: {fmt(selectedSub.submittedAt || selectedSub.createdAt)}
              </div>
              {selectedSub.contentUrl && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => openSubmissionUrl(selectedSub.contentUrl)}
                    className="inline-flex items-center gap-1.5 bg-brand/10 hover:bg-brand/15 dark:bg-brand/20 dark:hover:bg-brand/25 px-3 py-1.5 border border-brand/20 dark:border-brand/25 rounded-lg font-medium text-brand dark:text-brand-200 text-xs transition-colors"
                  >
                    {/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|png|jpg|jpeg|gif|webp|mp4|mp3)(\?|$)/i.test(selectedSub.contentUrl)
                      ? (isRtl ? '📎 عرض الملف المرفق' : '📎 View attachment')
                      : (isRtl ? '🔗 فتح الرابط' : '🔗 Open link')}
                  </button>
                </div>
              )}
            </div>

            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الدرجة' : 'Score'}</label>
              <Input value={subScore} onChange={(e) => setSubScore(e.target.value)} placeholder="e.g. 10" inputMode="numeric" />
            </div>

            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'ملاحظات' : 'Feedback'}</label>
              <Textarea value={subFeedback} onChange={(e) => setSubFeedback(e.target.value)} placeholder={isRtl ? 'أي تعليق للطالب...' : 'Any comments for the student...'} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setSubModalOpen(false)} disabled={savingSub}>
                {isRtl ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={savingSub || subScore.trim() === ''}>
                {savingSub ? (
                  <span className="flex items-center gap-2"><Spinner className="border-t-white w-4 h-4" />{isRtl ? 'جاري الحفظ...' : 'Saving...'}</span>
                ) : (isRtl ? 'تأكيد التصحيح' : 'Confirm grade')}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  )
}


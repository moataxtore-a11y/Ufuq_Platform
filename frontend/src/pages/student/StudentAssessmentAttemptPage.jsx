import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Textarea from '../../components/ui/Textarea.jsx'

export default function StudentAssessmentAttemptPage() {
  const { assessmentId } = useParams()
  const { notify } = useToast()
  const navigate = useNavigate()

  const lang = typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'ar' : 'en'
  const isRtl = lang === 'ar'

  const [loading, setLoading] = useState(true)
  const [attemptId, setAttemptId] = useState('')
  const [assessment, setAssessment] = useState(null)
  const [startedAt, setStartedAt] = useState(null)
  const [durationMinutes, setDurationMinutes] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  const [answerByQ, setAnswerByQ] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // uploading state per question: { [qId]: { progress: 0-100, uploading: bool, fileName: string } }
  const [uploadStateByQ, setUploadStateByQ] = useState({})

  useEffect(() => {
    let mounted = true
    async function start() {
      try {
        setLoading(true)
        const res = await api.post(`/assessments/${assessmentId}/attempts/start`)
        if (!mounted) return
        setAttemptId(res.data.attemptId)
        setAssessment(res.data.assessment)
        setStartedAt(new Date(res.data.startedAt))
        setDurationMinutes(res.data.durationMinutes)
      } catch (e) {
        notify({ title: 'فشل بدء الاختبار', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
        navigate('/student/assessments', { replace: true })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    start()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId])

  const deadline = useMemo(() => {
    if (!startedAt || !durationMinutes) return null
    return new Date(startedAt.getTime() + Number(durationMinutes) * 60 * 1000)
  }, [startedAt, durationMinutes])

  const timeLeft = useMemo(() => {
    if (!deadline) return null
    const ms = deadline.getTime() - now
    return Math.max(0, ms)
  }, [deadline, now])

  const isTimeUp = Boolean(deadline && timeLeft === 0)

  useEffect(() => {
    if (!deadline) return
    const t = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(t)
  }, [deadline])

  function setAnswer(questionId, patch) {
    setAnswerByQ((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), questionId, ...patch }
    }))
  }

  async function handleFileChange(questionId, file) {
    if (!file) return

    setUploadStateByQ((prev) => ({
      ...prev,
      [questionId]: { progress: 0, uploading: true, fileName: file.name }
    }))

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await api.post('/uploads/assignment', form, {
        onUploadProgress: (evt) => {
          const pct = evt.total ? Math.round((evt.loaded / evt.total) * 100) : 0
          setUploadStateByQ((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], progress: pct }
          }))
        }
      })

      const url = res.data?.url || ''
      setAnswer(questionId, { fileUrl: url })
      setUploadStateByQ((prev) => ({
        ...prev,
        [questionId]: { progress: 100, uploading: false, fileName: file.name }
      }))
    } catch (e) {
      notify({ title: isRtl ? 'فشل رفع الملف' : 'Upload failed', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
      setUploadStateByQ((prev) => ({
        ...prev,
        [questionId]: { progress: 0, uploading: false, fileName: '' }
      }))
    }
  }

  function removeFile(questionId) {
    setAnswer(questionId, { fileUrl: '' })
    setUploadStateByQ((prev) => ({
      ...prev,
      [questionId]: { progress: 0, uploading: false, fileName: '' }
    }))
  }

  async function submit() {
    try {
      setSubmitting(true)
      const answers = Object.values(answerByQ)
      const res = await api.post(`/assessments/attempts/${attemptId}/submit`, { answers })
      notify({ title: 'تم الإرسال', description: res.data.status === 'graded' ? 'تم التصحيح تلقائيًا' : 'بانتظار التصحيح اليدوي' })
      navigate(`/student/assessments/attempts/${attemptId}/result`)
    } catch (e) {
      notify({ title: 'فشل الإرسال', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
        <Spinner />
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="gap-4 grid" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto w-full max-w-5xl">
        <div className={'flex flex-col md:flex-row md:items-start md:justify-between gap-3 ' + (isRtl ? 'text-right' : 'text-left')}>
          <div className="min-w-0">
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xl sm:text-2xl break-words">
              {assessment?.title || 'اختبار'}
            </div>
            <div className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
              {isRtl ? 'أجب عن جميع الأسئلة ثم اضغط إرسال.' : 'Answer all questions then submit.'}
            </div>
          </div>

          <div className={'shrink-0 ' + (isRtl ? 'text-right' : 'text-left')}>
            <div
              className={
                'inline-flex items-center px-4 py-2 border rounded-full font-semibold text-sm ' +
                (isTimeUp
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-200'
                  : 'bg-white/80 dark:bg-neutral-900/70 border-black/5 dark:border-white/[0.06] text-slate-700 dark:text-slate-200')
              }
            >
              {deadline ? (isRtl ? `الوقت المتبقي: ${formatMs(timeLeft)}` : `Time left: ${formatMs(timeLeft)}`) : (isRtl ? 'لا يوجد مؤقت' : 'No timer')}
            </div>
            {isTimeUp ? (
              <div className="mt-1 font-semibold text-rose-700 dark:text-rose-200 text-xs">
                {isRtl ? 'انتهى الوقت' : 'Time is up'}
              </div>
            ) : null}
          </div>
        </div>

        <div className="gap-3 grid mt-4">
          {(assessment?.questions || []).map((q, idx) => (
            <div key={q._id} className="bg-white dark:bg-neutral-900 p-4 border border-black/5 dark:border-white/[0.06] rounded-2xl">
              <div className={'flex items-start justify-between gap-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg break-words">
                    {idx + 1}. {q.prompt || (isRtl ? 'سؤال' : 'Question')}
                  </div>
                  <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
                    {(isRtl ? 'الدرجة: ' : 'Points: ')}{Number(q.points || 0)}
                  </div>
                </div>
              </div>

              {q.imageUrl ? (
                <div className="bg-white dark:bg-neutral-950 mt-3 p-2 border border-black/5 dark:border-neutral-800 rounded-2xl">
                  <img src={q.imageUrl} alt="Question" className="rounded-xl w-full max-h-80 object-contain" />
                </div>
              ) : null}

              {q.type === 'mcq' ? (
                <div className="gap-2 grid mt-3">
                  {(q.options || []).map((o) => (
                    <label
                      key={o._id}
                      className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 px-3 py-2 border border-black/5 dark:border-white/[0.06] rounded-xl text-slate-800 dark:text-slate-100 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`q-${q._id}`}
                        className="sr-only peer"
                        checked={answerByQ[q._id]?.selectedOptionId === o._id}
                        onChange={() => setAnswer(q._id, { selectedOptionId: o._id })}
                        disabled={submitting || isTimeUp}
                      />
                      <span className="flex justify-center items-center peer-checked:bg-[#14B8A6] border-2 border-slate-300 dark:border-neutral-500 peer-checked:border-[#14B8A6] rounded-full w-5 h-5 shrink-0">
                        <span className="bg-white opacity-0 peer-checked:opacity-100 rounded-full w-2 h-2" />
                      </span>
                      <span className="min-w-0 break-words">{o.text}</span>
                    </label>
                  ))}
                </div>
              ) : null}

              {q.type === 'true_false' ? (
                <div className="gap-2 grid mt-3">
                  <label className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 px-3 py-2 border border-black/5 dark:border-white/[0.06] rounded-xl text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${q._id}`}
                      className="sr-only peer"
                      checked={answerByQ[q._id]?.booleanAnswer === true}
                      onChange={() => setAnswer(q._id, { booleanAnswer: true })}
                      disabled={submitting || isTimeUp}
                    />
                    <span className="flex justify-center items-center peer-checked:bg-[#14B8A6] border-2 border-slate-300 dark:border-neutral-500 peer-checked:border-[#14B8A6] rounded-full w-5 h-5 shrink-0">
                      <span className="bg-white opacity-0 peer-checked:opacity-100 rounded-full w-2 h-2" />
                    </span>
                    {isRtl ? 'صح' : 'True'}
                  </label>
                  <label className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 px-3 py-2 border border-black/5 dark:border-white/[0.06] rounded-xl text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${q._id}`}
                      className="sr-only peer"
                      checked={answerByQ[q._id]?.booleanAnswer === false}
                      onChange={() => setAnswer(q._id, { booleanAnswer: false })}
                      disabled={submitting || isTimeUp}
                    />
                    <span className="flex justify-center items-center peer-checked:bg-[#14B8A6] border-2 border-slate-300 dark:border-neutral-500 peer-checked:border-[#14B8A6] rounded-full w-5 h-5 shrink-0">
                      <span className="bg-white opacity-0 peer-checked:opacity-100 rounded-full w-2 h-2" />
                    </span>
                    {isRtl ? 'خطأ' : 'False'}
                  </label>
                </div>
              ) : null}

              {q.type === 'short_answer' ? (
                <div className="gap-1 grid mt-3">
                  <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الإجابة' : 'Answer'}</label>
                  <Input value={answerByQ[q._id]?.textAnswer || ''} onChange={(e) => setAnswer(q._id, { textAnswer: e.target.value })} disabled={submitting || isTimeUp} />
                </div>
              ) : null}

              {q.type === 'essay' ? (
                <div className="gap-1 grid mt-3">
                  <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الإجابة' : 'Answer'}</label>
                  <Textarea value={answerByQ[q._id]?.textAnswer || ''} onChange={(e) => setAnswer(q._id, { textAnswer: e.target.value })} disabled={submitting || isTimeUp} />
                </div>
              ) : null}

              {q.type === 'file_upload' ? (
                <FileUploadQuestion
                  questionId={q._id}
                  isRtl={isRtl}
                  disabled={submitting || isTimeUp}
                  uploadState={uploadStateByQ[q._id] || {}}
                  fileUrl={answerByQ[q._id]?.fileUrl || ''}
                  onFileChange={(file) => handleFileChange(q._id, file)}
                  onRemove={() => removeFile(q._id)}
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className={'flex flex-col sm:flex-row justify-end gap-2 pt-2 ' + (isRtl ? 'sm:flex-row' : 'sm:flex-row-reverse')}>
          <Button variant="secondary" onClick={() => navigate('/student/assessments')} disabled={submitting}>
            {isRtl ? 'رجوع' : 'Back'}
          </Button>
          <Button onClick={submit} disabled={submitting || !attemptId}>
            {submitting ? (isRtl ? 'جارٍ الإرسال...' : 'Submitting...') : (isRtl ? 'إرسال' : 'Submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── File Upload Sub-component ─── */
function FileUploadQuestion({ questionId, isRtl, disabled, uploadState, fileUrl, onFileChange, onRemove }) {
  const { uploading = false, progress = 0, fileName = '' } = uploadState

  const hasFile = Boolean(fileUrl)

  function getFileIcon(name) {
    const ext = (name || '').split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext)) return '📄'
    if (['doc', 'docx'].includes(ext)) return '📝'
    if (['xls', 'xlsx'].includes(ext)) return '📊'
    if (['ppt', 'pptx'].includes(ext)) return '📑'
    if (['zip', 'rar', '7z'].includes(ext)) return '🗜️'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️'
    return '📎'
  }

  return (
    <div className="gap-2 grid mt-3">
      <label className="font-medium text-slate-600 dark:text-slate-300 text-sm">
        {isRtl ? 'رفع ملف' : 'Upload File'}
      </label>

      {!hasFile && !uploading ? (
        <label
          className={
            'relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-8 px-4 cursor-pointer transition-all ' +
            (disabled
              ? 'border-slate-200 dark:border-neutral-700 opacity-50 cursor-not-allowed'
              : 'border-slate-300 dark:border-neutral-600 hover:border-[#14B8A6] dark:hover:border-[#14B8A6] hover:bg-teal-50/30 dark:hover:bg-teal-900/10')
          }
        >
          <input
            type="file"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileChange(file)
              e.target.value = ''
            }}
          />
          <div className="text-3xl">📎</div>
          <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
            {isRtl ? 'اضغط لاختيار ملف' : 'Click to choose a file'}
          </div>
          <div className="text-slate-400 dark:text-slate-500 text-xs">
            {isRtl ? 'PDF، Word، Excel، صور، وغيرها — حتى 100MB' : 'PDF, Word, Excel, Images & more — up to 100MB'}
          </div>
        </label>
      ) : null}

      {uploading ? (
        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-neutral-800/60 p-4 border border-black/5 dark:border-white/[0.06] rounded-2xl">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
            <span className="text-lg animate-spin">⏳</span>
            <span className="flex-1 truncate">{fileName || (isRtl ? 'جاري الرفع...' : 'Uploading...')}</span>
            <span className="font-semibold tabular-nums text-slate-500 dark:text-slate-400 shrink-0">{progress}%</span>
          </div>
          <div className="bg-slate-200 dark:bg-neutral-700 rounded-full w-full h-2 overflow-hidden">
            <div
              className="rounded-full h-2 transition-all duration-300 app-gradient-155"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {hasFile && !uploading ? (
        <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-900/20 p-4 border border-teal-200 dark:border-teal-800/50 rounded-2xl">
          <span className="text-2xl shrink-0">{getFileIcon(fileName)}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
              {fileName || (isRtl ? 'تم رفع الملف' : 'File uploaded')}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-teal-600 dark:text-teal-400 text-xs">
              <span>✓</span>
              <span>{isRtl ? 'تم الرفع بنجاح' : 'Uploaded successfully'}</span>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="flex justify-center items-center hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full w-8 h-8 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 dark:text-slate-500 transition-colors shrink-0"
              title={isRtl ? 'حذف الملف' : 'Remove file'}
            >
              ✕
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

function formatMs(ms) {
  if (ms == null) return '-'
  const total = Math.floor(ms / 1000)
  const s = total % 60
  const m = Math.floor(total / 60) % 60
  const h = Math.floor(total / 3600)
  const pad = (n) => String(n).padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
  return `${m}:${pad(s)}`
}

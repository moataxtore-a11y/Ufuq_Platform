import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Textarea from '../../components/ui/Textarea.jsx'
import { uploadFile } from '../../utils/upload.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import Select from '../../components/ui/Select.jsx'

function safeId() {
  try {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID()
    }
  } catch {
    // ignore
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toLocalDateTimeValue(value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  } catch {
    return ''
  }
}

function toIsoFromLocalDateTime(value) {
  if (!value) return null
  const v = String(value).trim()
  if (!v) return null
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})$/)
  if (!m) return new Date(v).toISOString()
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const hour = Number(m[4])
  const minute = Number(m[5])
  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString()
}

export default function AssessmentEditPage() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { isRtl } = useLanguage()

  const basePath = useMemo(() => (typeof window !== 'undefined' && window.location.pathname.startsWith('/team') ? '/team' : '/teacher'), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [type, setType] = useState('quiz')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [attemptLimit, setAttemptLimit] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [questions, setQuestions] = useState([])

  const [uploadingQuestionId, setUploadingQuestionId] = useState('')
  const fileRefs = useRef({})

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await api.get(`/assessments/${assessmentId}`)
        const a = res?.data
        if (!mounted) return

        setType(a?.type || 'quiz')
        setTitle(a?.title || '')
        setDescription(a?.description || '')
        setDurationMinutes(typeof a?.durationMinutes === 'number' ? String(a.durationMinutes) : '')
        setAttemptLimit(typeof a?.attemptLimit === 'number' ? String(a.attemptLimit) : '')
        setStartAt(toLocalDateTimeValue(a?.startAt))
        setEndAt(toLocalDateTimeValue(a?.endAt))

        const qs = Array.isArray(a?.questions) ? a.questions : []
        setQuestions(
          qs.map((q) => ({
            id: String(q?._id || safeId()),
            type: q?.type || 'mcq',
            prompt: q?.prompt || '',
            imageUrl: q?.imageUrl || '',
            points: typeof q?.points === 'number' ? q.points : 1,
            required: typeof q?.required === 'boolean' ? q.required : true,
            options: Array.isArray(q?.options) ? q.options.map((o) => ({ text: o?.text || '' })) : [{ text: '' }, { text: '' }],
            correctOptionIndex: typeof q?.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
            correctBoolean: typeof q?.correctBoolean === 'boolean' ? q.correctBoolean : true,
            correctText: q?.correctText || ''
          }))
        )
      } catch (e) {
        notify({ title: 'فشل تحميل الاختبار', description: e?.response?.data?.message || e?.message || 'Error', variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [assessmentId, notify])

  function addQuestion() {
    setQuestions((qs) => [
      ...qs,
      {
        id: safeId(),
        type: 'mcq',
        prompt: '',
        imageUrl: '',
        points: 1,
        required: true,
        options: [{ text: '' }, { text: '' }],
        correctOptionIndex: 0,
        correctBoolean: true,
        correctText: ''
      }
    ])
  }

  function updateQuestion(id, patch) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  function removeQuestion(id) {
    setQuestions((qs) => qs.filter((q) => q.id !== id))
  }

  async function onPickQuestionImage(qid, file) {
    if (!qid || !file) return
    try {
      setUploadingQuestionId(qid)
      const res = await uploadFile(file)
      updateQuestion(qid, { imageUrl: res?.url || '' })
    } catch (e) {
      notify({ title: 'فشل رفع الصورة', description: e?.response?.data?.message || e?.message || 'Error', variant: 'destructive' })
    } finally {
      setUploadingQuestionId('')
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!assessmentId) return
    try {
      setSaving(true)

      const payload = {
        type,
        title,
        description,
        durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : undefined,
        attemptLimit: attemptLimit !== '' ? Number(attemptLimit) : undefined,
        startAt: startAt ? toIsoFromLocalDateTime(startAt) : null,
        endAt: endAt ? toIsoFromLocalDateTime(endAt) : null,
        questions: questions.map((q) => {
          const base = {
            type: q.type,
            prompt: q.prompt || '',
            imageUrl: q.imageUrl || '',
            points: Number(q.points || 1),
            required: Boolean(q.required)
          }

          if (q.type === 'mcq') {
            return {
              ...base,
              options: (q.options || []).map((o) => ({ text: o.text })),
              correctOptionIndex: Number.isInteger(q.correctOptionIndex) ? q.correctOptionIndex : 0
            }
          }
          if (q.type === 'true_false') {
            return { ...base, correctBoolean: Boolean(q.correctBoolean) }
          }
          if (q.type === 'short_answer') {
            return { ...base, correctText: q.correctText || '' }
          }
          return base
        })
      }

      await api.patch(`/assessments/${assessmentId}`, payload)
      notify({ title: 'تم حفظ التعديلات' })
    } catch (e) {
      notify({ title: 'فشل الحفظ', description: e?.response?.data?.message || e?.message || 'Error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <Spinner />
        Loading...
      </div>
    )
  }

  return (
    <div className="gap-4 grid px-3 sm:px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="gap-4 grid mx-auto w-full max-w-4xl">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2">
          <div>
            <div className="font-semibold text-lg">تعديل الاختبار</div>
            <div className="text-slate-600 dark:text-slate-300 text-sm truncate">{title || '—'}</div>
          </div>
          <div className="flex justify-end items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate(`${basePath}/assessments`)} disabled={saving}>
              رجوع
            </Button>
          </div>
        </div>

        <form onSubmit={submit} className="gap-3 grid">
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">النوع</label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={saving}
              options={[
                { value: 'quiz', label: 'كويز' },
                { value: 'exam', label: 'امتحان' },
                { value: 'homework', label: 'واجب' }
              ]}
            />
          </div>

          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">العنوان</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
          </div>

          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">الوصف</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اختياري" disabled={saving} />
          </div>

          <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-200 text-sm">المدة (بالدقائق)</label>
              <Input value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} inputMode="numeric" disabled={saving} />
            </div>
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-200 text-sm">عدد المحاولات</label>
              <Input value={attemptLimit} onChange={(e) => setAttemptLimit(e.target.value)} inputMode="numeric" disabled={saving} />
            </div>
          </div>

          <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-200 text-sm">يبدأ في</label>
              <Input dir="ltr" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} disabled={saving} />
            </div>
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-200 text-sm">ينتهي في</label>
              <Input dir="ltr" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} disabled={saving} />
            </div>
          </div>

          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 pt-2">
            <div>
              <div className="font-medium">الأسئلة</div>
              <div className="text-slate-500 text-xs">أضف/احذف/عدّل الأسئلة قبل الحفظ</div>
            </div>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <Button type="button" variant="outline" onClick={addQuestion} disabled={saving}>
                إضافة سؤال
              </Button>
            </div>
          </div>

          {questions.length === 0 ? <div className="text-slate-600 dark:text-slate-300 text-sm">لا يوجد أسئلة</div> : null}

          <div className="gap-3 grid">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-3 border border-black/5 rounded-xl">
                <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-2">
                  <div className="font-medium">سؤال {idx + 1}</div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeQuestion(q.id)} disabled={saving}>
                    حذف
                  </Button>
                </div>

                <div className="gap-2 grid mt-3">
                  <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
                    <div className="gap-1 grid">
                      <label className="text-slate-600 dark:text-slate-200 text-sm">النوع</label>
                      <Select
                        value={q.type}
                        onChange={(e) => {
                          const t2 = e.target.value
                          const patch = { type: t2 }
                          if (t2 === 'mcq' && (!q.options || q.options.length === 0)) {
                            patch.options = [{ text: '' }, { text: '' }]
                            patch.correctOptionIndex = 0
                          }
                          updateQuestion(q.id, patch)
                        }}
                        disabled={saving}
                        options={[
                          { value: 'mcq', label: 'اختيار متعدد (MCQ)' },
                          { value: 'true_false', label: 'صح / خطأ' },
                          { value: 'short_answer', label: 'إجابة قصيرة' },
                          { value: 'essay', label: 'مقال' },
                          { value: 'file_upload', label: 'رفع ملف' }
                        ]}
                      />
                    </div>
                    <div className="gap-1 grid">
                      <label className="text-slate-600 dark:text-slate-200 text-sm">الدرجات</label>
                      <Input value={String(q.points ?? 1)} onChange={(e) => updateQuestion(q.id, { points: e.target.value })} inputMode="numeric" disabled={saving} />
                    </div>
                  </div>

                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-200 text-sm">نص السؤال</label>
                    <Textarea value={q.prompt} onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })} placeholder="اختياري" disabled={saving} />
                  </div>

                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-200 text-sm">صورة (اختياري)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => {
                        if (el) fileRefs.current[q.id] = el
                      }}
                      onChange={(e) => {
                        const f = e.target.files && e.target.files[0]
                        if (f) onPickQuestionImage(q.id, f)
                        if (e.target) e.target.value = ''
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileRefs.current[q.id]?.click()} disabled={saving || uploadingQuestionId === q.id}>
                        {uploadingQuestionId === q.id ? 'جارٍ الرفع...' : 'اختيار صورة'}
                      </Button>
                      {q.imageUrl ? (
                        <Button type="button" variant="secondary" size="sm" onClick={() => updateQuestion(q.id, { imageUrl: '' })} disabled={saving || uploadingQuestionId === q.id}>
                          إزالة الصورة
                        </Button>
                      ) : null}
                    </div>
                    {q.imageUrl ? (
                      <div className="bg-white mt-2 p-2 border border-black/5 rounded-xl overflow-hidden">
                        <img src={q.imageUrl} alt="Question" className="rounded-lg w-full max-h-52 object-contain" />
                      </div>
                    ) : null}
                  </div>

                  {q.type === 'mcq' ? (
                    <div className="gap-2 grid">
                      <div className="font-medium text-sm">الاختيارات</div>
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className="gap-2 grid grid-cols-1 sm:grid-cols-[1fr_140px]">
                          <Input
                            value={opt.text}
                            onChange={(e) => {
                              const next = (q.options || []).map((x, idx2) => (idx2 === oi ? { ...x, text: e.target.value } : x))
                              updateQuestion(q.id, { options: next })
                            }}
                            placeholder={`اختيار ${oi + 1}`}
                            disabled={saving}
                          />
                          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
                            <input type="radio" name={`correct-${q.id}`} checked={Number(q.correctOptionIndex) === oi} onChange={() => updateQuestion(q.id, { correctOptionIndex: oi })} disabled={saving} />
                            صحيح
                          </label>
                        </div>
                      ))}
                      <Button type="button" variant="secondary" size="sm" onClick={() => updateQuestion(q.id, { options: [...(q.options || []), { text: '' }] })} disabled={saving}>
                        إضافة اختيار
                      </Button>
                    </div>
                  ) : null}

                  {q.type === 'true_false' ? (
                    <div className="gap-1 grid">
                      <label className="text-slate-600 dark:text-slate-200 text-sm">الإجابة الصحيحة</label>
                      <Select
                        value={q.correctBoolean ? 'true' : 'false'}
                        onChange={(e) => updateQuestion(q.id, { correctBoolean: e.target.value === 'true' })}
                        disabled={saving}
                        options={[
                          { value: 'true', label: 'صح' },
                          { value: 'false', label: 'خطأ' }
                        ]}
                      />
                    </div>
                  ) : null}

                  {q.type === 'short_answer' ? (
                    <div className="gap-1 grid">
                      <label className="text-slate-600 dark:text-slate-200 text-sm">الإجابة الصحيحة</label>
                      <Input value={q.correctText || ''} onChange={(e) => updateQuestion(q.id, { correctText: e.target.value })} disabled={saving} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={saving || !title.trim() || questions.length === 0}>
              {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

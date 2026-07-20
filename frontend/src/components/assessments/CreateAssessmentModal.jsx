import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../utils/api.js'
import { useToast } from '../ui/toast.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import Textarea from '../ui/Textarea.jsx'
import { Modal } from '../ui/Modal.jsx'
import { uploadFile } from '../../utils/upload.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import homeworkIcon from '../../cvg/؟.svg'
import Select from '../ui/Select.jsx'

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

export default function CreateAssessmentModal({
  open,
  onOpenChange,
  courses,
  courseId,
  onCourseChange,
  onCreated,
  hideCoursePicker,
  fixedType,
  lessonId,
  allowLessonLinking,
  allowGateOptions
}) {
  const { notify } = useToast()
  const { isRtl, t } = useLanguage()

  const [type, setType] = useState('quiz')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [attemptLimit, setAttemptLimit] = useState('')

  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)
  const [uploadingQuestionId, setUploadingQuestionId] = useState('')
  const fileRefs = useRef({})
  const [coursePickerOpen, setCoursePickerOpen] = useState(false)
  const [courseQuery, setCourseQuery] = useState('')

  const [attachToLesson, setAttachToLesson] = useState(true)
  const [gateNextLessons, setGateNextLessons] = useState(false)

  const selectedCourse = useMemo(() => {
    return (Array.isArray(courses) ? courses : []).find((c) => c?._id === courseId) || null
  }, [courseId, courses])

  const filteredCourses = useMemo(() => {
    const list = Array.isArray(courses) ? courses : []
    const needle = String(courseQuery || '').trim().toLowerCase()
    if (!needle) return list
    return list.filter((c) => String(c?.title || '').toLowerCase().includes(needle))
  }, [courseQuery, courses])

  useEffect(() => {
    if (!open) return
    setType(fixedType || 'quiz')
    setTitle('')
    setDescription('')
    setDurationMinutes('')
    setStartAt('')
    setEndAt('')
    setAttemptLimit('')
    setQuestions([])
    setCoursePickerOpen(false)
    setCourseQuery('')
    setAttachToLesson(true)
    setGateNextLessons(false)
  }, [open, fixedType])

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

  async function onPickQuestionImage(qid, file) {
    if (!qid || !file) return
    try {
      setUploadingQuestionId(qid)
      const res = await uploadFile(file)
      updateQuestion(qid, { imageUrl: res?.url || '' })
    } catch (e) {
      notify({ title: t('createAssessmentModal.uploadFailed'), description: e?.response?.data?.message || e?.message || t('createAssessmentModal.error'), variant: 'destructive' })
    } finally {
      setUploadingQuestionId('')
    }
  }

  function updateQuestion(id, patch) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  function removeQuestion(id) {
    setQuestions((qs) => qs.filter((q) => q.id !== id))
  }

  function toIsoFromLocalDateTime(value) {
    if (!value) return undefined
    const v = String(value).trim()
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})$/)
    if (!m) return new Date(v).toISOString()
    const year = Number(m[1])
    const month = Number(m[2])
    const day = Number(m[3])
    const hour = Number(m[4])
    const minute = Number(m[5])
    return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString()
  }

  async function submit(e) {
    e.preventDefault()
    try {
      setSaving(true)

      const computedTitle = String(title || '').trim() || (String(questions?.[0]?.prompt || '').trim() ? String(questions[0].prompt).trim().slice(0, 80) : (fixedType === 'homework' || type === 'homework' ? 'واجب' : 'اختبار'))

      const payload = {
        type: fixedType || type,
        title: computedTitle,
        description,
        courseId,
        lessonId: allowLessonLinking && attachToLesson && lessonId ? lessonId : undefined,
        durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : undefined,
        startAt: startAt ? toIsoFromLocalDateTime(startAt) : undefined,
        endAt: endAt ? toIsoFromLocalDateTime(endAt) : undefined,
        attemptLimit: attemptLimit !== '' ? Number(attemptLimit) : undefined,
        showCorrectAnswersPolicy: 'after_submit',
        releaseScorePolicy: 'immediate',
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

      const res = await api.post('/assessments', payload)
      const assessmentId = res?.data?._id

      if (allowGateOptions && gateNextLessons && allowLessonLinking && attachToLesson && lessonId && assessmentId) {
        await api.patch(`/courses/lessons/${lessonId}`, {
          gateAssessmentId: String(assessmentId),
          gateNextLessons: true
        })
      }

      notify({ title: t('createAssessmentModal.created') })
      onCreated?.(res?.data, {
        attachToLesson,
        gateNextLessons,
        lessonId: allowLessonLinking && attachToLesson && lessonId ? lessonId : ''
      })
    } catch (e2) {
      notify({ title: t('createAssessmentModal.createFailed'), description: e2?.response?.data?.message || t('createAssessmentModal.error'), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const lessonAvailable = Boolean(lessonId)
  const attachDisabled = !lessonAvailable || saving
  const gateDisabled = saving || !lessonAvailable || !attachToLesson
  const standaloneGateDisabled = saving

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('createAssessmentModal.title')}>
      <form onSubmit={submit} className="gap-3 grid">
        {!hideCoursePicker ? (
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.course')}</label>
            <button
              type="button"
              onClick={() => setCoursePickerOpen((v) => !v)}
              className="flex justify-between items-center gap-3 bg-white dark:bg-neutral-900 px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl text-sm"
            >
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">{selectedCourse?.title || t('createAssessmentModal.selectCourse')}</span>
              <span className="text-slate-500 dark:text-slate-400">▾</span>
            </button>

            {coursePickerOpen ? (
              <div className="bg-white dark:bg-neutral-900 p-3 border border-black/5 dark:border-white/10 rounded-2xl">
                <div className="gap-2 grid">
                  <Input value={courseQuery} onChange={(e) => setCourseQuery(e.target.value)} placeholder={t('createAssessmentModal.searchCourses')} />
                  <div className="gap-2 grid max-h-56 overflow-auto">
                    {filteredCourses.map((c) => {
                      const active = c?._id === courseId
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => {
                            onCourseChange?.(c._id)
                            setCoursePickerOpen(false)
                          }}
                          className={
                            'rounded-xl border px-3 py-2 transition ' +
                            (active
                              ? 'border-brand/60 bg-brand/10 dark:bg-brand/5'
                              : 'border-black/5 dark:border-white/10 hover:border-brand/40 dark:hover:border-brand/40 hover:bg-slate-50 dark:hover:bg-neutral-800')
                          }
                        >
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{c.title}</div>
                          <div className="mt-0.5 text-slate-600 dark:text-slate-300 text-xs">{(c.description || '').slice(0, 80) || ' '}</div>
                        </button>
                      )
                    })}
                    {filteredCourses.length === 0 ? <div className="text-slate-600 dark:text-slate-300 text-sm">{t('createAssessmentModal.noMatchingCourses')}</div> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!fixedType ? (
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.type')}</label>
            <div className="bg-white dark:bg-neutral-900 p-1 border border-black/5 dark:border-white/10 rounded-xl">
              <div className="gap-1 grid grid-cols-3">
                <button
                  type="button"
                  onClick={() => setType('quiz')}
                  className={
                    'rounded-lg px-3 py-2 text-sm font-semibold transition ' +
                    (type === 'quiz' ? 'bg-brand/20 text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800')
                  }
                >
                  {t('createAssessmentModal.quiz')}
                </button>
                <button
                  type="button"
                  onClick={() => setType('exam')}
                  className={
                    'rounded-lg px-3 py-2 text-sm font-semibold transition ' +
                    (type === 'exam' ? 'bg-brand/20 text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800')
                  }
                >
                  {t('createAssessmentModal.exam')}
                </button>
                <button
                  type="button"
                  onClick={() => setType('homework')}
                  className={
                    'rounded-lg px-3 py-2 text-sm font-semibold transition ' +
                    (type === 'homework' ? 'bg-brand/20 text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800')
                  }
                >
                  <span className={'inline-flex items-center justify-center gap-2 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                    {type === 'homework' ? <img src={homeworkIcon} alt="" className="w-5 h-5 shrink-0" /> : null}
                    <span>{t('createAssessmentModal.homework')}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.formTitle')}</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.formDescription')}</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('createAssessmentModal.optional')} />
        </div>

        <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.durationMinutes')}</label>
            <Input value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} inputMode="numeric" />
          </div>
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.attemptLimit')}</label>
            <Input value={attemptLimit} onChange={(e) => setAttemptLimit(e.target.value)} inputMode="numeric" />
          </div>
        </div>

        <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.startAt')}</label>
            <Input dir="ltr" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </div>
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.endAt')}</label>
            <Input dir="ltr" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </div>
        </div>

        {allowLessonLinking ? (
          <>
            <label className="flex flex-row-reverse justify-between items-center gap-3 text-slate-700 text-sm">
              <span>ربط الامتحان بالمحاضرة الحالية</span>
              <input type="checkbox" checked={attachToLesson} onChange={(e) => setAttachToLesson(e.target.checked)} disabled={attachDisabled} />
            </label>
            {allowGateOptions ? (
              <label className="flex flex-row-reverse justify-between items-center gap-3 text-slate-700 text-sm">
                <span>يقفل المحاضرات اللي بعده داخل نفس الوحدة لحد ما الطالب ينجح (50%)</span>
                <input type="checkbox" checked={gateNextLessons} onChange={(e) => setGateNextLessons(e.target.checked)} disabled={gateDisabled} />
              </label>
            ) : null}
            {!lessonAvailable ? <div className="text-slate-500 text-xs">{t('createAssessmentModal.selectLessonFirst')}</div> : null}
          </>
        ) : allowGateOptions ? (
          <label className="flex flex-row-reverse justify-between items-center gap-3 text-slate-700 text-sm">
            <span>يقفل المحاضرات اللي بعده داخل نفس الوحدة لحد ما الطالب ينجح (50%)</span>
            <input type="checkbox" checked={gateNextLessons} onChange={(e) => setGateNextLessons(e.target.checked)} disabled={standaloneGateDisabled} />
          </label>
        ) : null}

        <div className="flex justify-between items-center gap-2 pt-2">
          <div>
            <div className="font-medium">{t('createAssessmentModal.questions')}</div>
            <div className="text-slate-500 text-xs">{t('createAssessmentModal.questionsHint')}</div>
          </div>
          <Button type="button" variant="outline" onClick={addQuestion} disabled={saving}>
            {t('createAssessmentModal.addQuestion')}
          </Button>
        </div>

        {questions.length === 0 ? <div className="text-slate-600 dark:text-slate-300 text-sm">{t('createAssessmentModal.noQuestionsYet')}</div> : null}

        <div className="gap-3 grid">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-3 border border-black/5 rounded-xl">
              <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-2">
                <div className="font-medium">{t('createAssessmentModal.questionNumber', { n: idx + 1 })}</div>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeQuestion(q.id)} disabled={saving}>
                  {t('createAssessmentModal.remove')}
                </Button>
              </div>

              <div className="gap-2 grid mt-3">
                <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.type')}</label>
                    <Select
                      value={q.type}
                      onChange={(e) => {
                        const t = e.target.value
                        const patch = { type: t }
                        if (t === 'mcq' && (!q.options || q.options.length === 0)) {
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
                    <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.points')}</label>
                    <Input
                      value={String(q.points ?? 1)}
                      onChange={(e) => updateQuestion(q.id, { points: e.target.value })}
                      inputMode="numeric"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="gap-1 grid">
                  <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.prompt')}</label>
                  <Textarea
                    value={q.prompt}
                    onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                    placeholder={t('createAssessmentModal.optional')}
                    disabled={saving}
                  />
                </div>

                <div className="gap-1 grid">
                  <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.imageOptional')}</label>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileRefs.current[q.id]?.click()}
                      disabled={saving || uploadingQuestionId === q.id}
                    >
                      {uploadingQuestionId === q.id ? t('createAssessmentModal.uploading') : t('createAssessmentModal.chooseImage')}
                    </Button>
                    {q.imageUrl ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => updateQuestion(q.id, { imageUrl: '' })}
                        disabled={saving || uploadingQuestionId === q.id}
                      >
                        {t('createAssessmentModal.removeImage')}
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
                    <div className="font-medium text-sm">{t('createAssessmentModal.options')}</div>
                    {(q.options || []).map((opt, oi) => (
                      <div key={oi} className="gap-2 grid grid-cols-1 md:grid-cols-[1fr_140px]">
                        <Input
                          value={opt.text}
                          onChange={(e) => {
                            const next = (q.options || []).map((x, idx2) => (idx2 === oi ? { ...x, text: e.target.value } : x))
                            updateQuestion(q.id, { options: next })
                          }}
                          placeholder={t('createAssessmentModal.optionNumber', { n: oi + 1 })}
                          disabled={saving}
                        />
                        <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={Number(q.correctOptionIndex) === oi}
                            onChange={() => updateQuestion(q.id, { correctOptionIndex: oi })}
                            disabled={saving}
                          />
                          {t('createAssessmentModal.correct')}
                        </label>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => updateQuestion(q.id, { options: [...(q.options || []), { text: '' }] })}
                      disabled={saving}
                    >
                      {t('createAssessmentModal.addOption')}
                    </Button>
                  </div>
                ) : null}

                {q.type === 'true_false' ? (
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.correctAnswer')}</label>
                    <Select
                      value={q.correctBoolean ? 'true' : 'false'}
                      onChange={(e) => updateQuestion(q.id, { correctBoolean: e.target.value === 'true' })}
                      disabled={saving}
                      options={[
                        { value: 'true', label: t('createAssessmentModal.true') },
                        { value: 'false', label: t('createAssessmentModal.false') }
                      ]}
                    />
                  </div>
                ) : null}

                {q.type === 'short_answer' ? (
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-200 text-sm">{t('createAssessmentModal.correctText')}</label>
                    <Input value={q.correctText || ''} onChange={(e) => updateQuestion(q.id, { correctText: e.target.value })} disabled={saving} />
                  </div>
                ) : null}

                {q.type === 'essay' || q.type === 'file_upload' ? (
                  <div className="bg-brand/10 p-3 border border-brand/20 rounded-lg text-brand-700 dark:text-brand-300 text-sm">
                    {t('createAssessmentModal.manualGradingRequired')}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('createAssessmentModal.cancel')}
          </Button>
          <Button type="submit" disabled={saving || !courseId || questions.length === 0}>
            {saving ? t('createAssessmentModal.saving') : t('createAssessmentModal.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import Select from '../../components/ui/Select.jsx'
import { uploadFile } from '../../utils/upload.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function StudentAssignmentsPage() {
  const { notify } = useToast()
  const { isRtl } = useLanguage()

  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [rows, setRows] = useState([])
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  async function openSubmissionUrl(u, cid) {
    const url = String(u || '')
    if (!url) return
    try {
      if (/\/storage\/v1\/object\/public\//i.test(url)) {
        const courseIdParam = String(cid || '').trim()
        const res = await api.get('/uploads/signed', { params: { url, courseId: courseIdParam } })
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

  async function loadCourses() {
    const res = await api.get('/courses/mine')
    setCourses(res.data)
    if (!courseId && res.data?.[0]?._id) setCourseId(res.data[0]._id)
  }

  async function loadAssignments(cid) {
    if (!cid) {
      setRows([])
      return
    }
    const res = await api.get(`/assignments/course/${cid}`)
    setRows(res.data)
  }

  async function loadMySubmissions() {
    const res = await api.get('/assignments/submissions/mine')
    setSubs(res.data)
  }

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        setLoading(true)
        await Promise.all([loadCourses(), loadMySubmissions()])
      } catch (e) {
        notify({ title: isRtl ? 'فشل التحميل' : 'Failed to load', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
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
    loadAssignments(courseId).catch((e) => {
      notify({ title: isRtl ? 'فشل تحميل الواجبات' : 'Failed to load assignments', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const submittedAssignmentIds = useMemo(() => {
    const s = new Set()
    for (const sub of Array.isArray(subs) ? subs : []) {
      const aid = sub?.assignment?._id || sub?.assignment
      if (aid) s.add(String(aid))
    }
    return s
  }, [subs])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
        <Spinner />
        {isRtl ? 'جاري التحميل...' : 'Loading...'}
      </div>
    )
  }

  return (
    <div className="gap-4 grid" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto w-full max-w-5xl">
        <div className="text-center">
          <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
            {isRtl ? 'الواجبات' : 'Assignments'}
          </h2>
          <div className="flex justify-center mt-2">
            <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
              <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'عرض وتسليم الواجبات.' : 'View and submit assignments.'}
          </div>
        </div>

        <div className="gap-1 grid mt-4">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الكورس' : 'Course'}</label>
          <Select
            value={courseId}
            onChange={(e) => setCourseId(e?.target?.value ?? e)}
            options={(courses || []).map((c) => ({ value: c._id, label: c.title }))}
            placeholder={isRtl ? 'اختر الكورس' : 'Select course'}
            className="w-full"
          />
        </div>

        <div className="bg-white dark:bg-neutral-900 mt-4 border border-black/5 dark:border-white/[0.06] rounded-2xl overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>{isRtl ? 'العنوان' : 'Title'}</TH>
                <TH>{isRtl ? 'موعد التسليم' : 'Due'}</TH>
                <TH className={isRtl ? 'text-left' : 'text-right'}>{isRtl ? 'إجراء' : 'Action'}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((a) => (
                <TR key={a._id}>
                  <TD className="text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <span>{a.title}</span>
                      {submittedAssignmentIds.has(String(a._id)) ? (
                        <span className="bg-green-100 dark:bg-green-400/15 px-2 py-0.5 rounded-full font-semibold text-green-700 dark:text-green-400 text-xs">
                          {isRtl ? 'تم التسليم' : 'Submitted'}
                        </span>
                      ) : null}
                    </div>
                  </TD>
                  <TD className="text-slate-700 dark:text-slate-200">{a.dueAt ? new Date(a.dueAt).toLocaleString() : '-'}</TD>
                  <TD className={isRtl ? 'text-left' : 'text-right'}>
                    <Button
                      size="sm"
                      onClick={() => {
                        const already = submittedAssignmentIds.has(String(a._id))
                        setSelected({ ...a, _alreadySubmitted: already })
                      }}
                      disabled={submittedAssignmentIds.has(String(a._id))}
                      variant={submittedAssignmentIds.has(String(a._id)) ? 'secondary' : 'default'}
                    >
                      {isRtl ? 'تسليم' : 'Submit'}
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        <div className="gap-2 grid mt-6">
          <div className="font-extrabold text-slate-900 dark:text-slate-100">{isRtl ? 'تسليماتي' : 'My submissions'}</div>
          <div className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/[0.06] rounded-2xl overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>{isRtl ? 'الواجب' : 'Assignment'}</TH>
                  <TH>{isRtl ? 'تاريخ التسليم' : 'Submitted'}</TH>
                  <TH>{isRtl ? 'المحتوى' : 'Content'}</TH>
                </TR>
              </THead>
              <TBody>
                {subs.map((s) => (
                  <TR key={s._id}>
                    <TD className="text-slate-900 dark:text-slate-100">{s.assignment?.title || (isRtl ? 'واجب' : 'Assignment')}</TD>
                    <TD className="text-slate-700 dark:text-slate-200">{new Date(s.submittedAt || s.createdAt).toLocaleString()}</TD>
                    <TD className="text-slate-700 dark:text-slate-200">
                      {s.contentUrl ? (
                        <button
                          type="button"
                          onClick={() => openSubmissionUrl(s.contentUrl, s?.assignment?.course || courseId)}
                          className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                        >
                          {/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|png|jpg|jpeg|gif|webp|mp4|mp3)(\?|$)/i.test(s.contentUrl)
                            ? (isRtl ? '📎 عرض الملف' : '📎 View file')
                            : (isRtl ? '🔗 فتح الرابط' : '🔗 Open link')}
                        </button>
                      ) : '-'}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </div>

        <SubmitModal
          isRtl={isRtl}
          open={Boolean(selected)}
          onOpenChange={(v) => {
            if (!v) setSelected(null)
          }}
          assignment={selected}
          onSubmitted={() => {
            setSelected(null)
            loadMySubmissions().catch(() => { })
          }}
        />
      </div>
    </div>
  )
}

function SubmitModal({ open, onOpenChange, assignment, onSubmitted, isRtl }) {
  const { notify } = useToast()
  const [mode, setMode] = useState('url') // 'url' | 'file'
  const [contentUrl, setContentUrl] = useState('')
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const alreadySubmitted = Boolean(assignment && assignment._alreadySubmitted)

  useEffect(() => {
    if (open) {
      setContentUrl('')
      setFile(null)
      setUploadProgress(0)
      setMode('url')
    }
  }, [open])

  const canSubmit = mode === 'url' ? contentUrl.trim().length > 0 : file !== null

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      let finalUrl = contentUrl.trim()

      if (mode === 'file' && file) {
        setUploadProgress(1)
        const result = await uploadFile(file, '/uploads/assignment', {
          skipPresign: true,
          onProgress: ({ loaded, total }) => {
            if (total > 0) setUploadProgress(Math.round((loaded / total) * 100))
          }
        })
        finalUrl = result.url
        setUploadProgress(100)
      }

      await api.post(`/assignments/${assignment._id}/submit`, { contentUrl: finalUrl })
      notify({ title: isRtl ? 'تم التسليم بنجاح' : 'Submitted successfully' })
      onSubmitted()
    } catch (e2) {
      notify({ title: isRtl ? 'فشل التسليم' : 'Submit failed', description: e2?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isRtl ? 'تسليم الواجب' : 'Submit assignment'}>
      {assignment ? (
        <form onSubmit={submit} className="gap-3 grid">
          {/* Assignment info */}
          <div className="p-3 border border-black/5 dark:border-white/[0.06] rounded-xl text-sm">
            <div className="font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</div>
            <div className="mt-0.5 text-slate-500 dark:text-slate-400">{assignment.description || (isRtl ? 'لا يوجد وصف' : 'No description')}</div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('url')}
              className={
                'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ' +
                (mode === 'url'
                  ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')
              }
            >
              {isRtl ? '🔗 رابط' : '🔗 Link'}
            </button>
            <button
              type="button"
              onClick={() => setMode('file')}
              className={
                'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ' +
                (mode === 'file'
                  ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')
              }
            >
              {isRtl ? '📎 ملف' : '📎 File'}
            </button>
          </div>

          {/* URL input */}
          {mode === 'url' && (
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'رابط التسليم' : 'Submission URL'}</label>
              <Input value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="https://..." dir="ltr" />
            </div>
          )}

          {/* File upload */}
          {mode === 'file' && (
            <div className="gap-2 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'رفع ملف' : 'Upload file'}</label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex justify-center items-center gap-2 px-4 py-6 border-2 border-black/10 hover:border-brand dark:border-white/15 dark:hover:border-brand border-dashed rounded-xl text-slate-500 hover:text-brand dark:text-slate-400 text-sm transition-colors cursor-pointer"
              >
                {file ? (
                  <span className="font-medium text-slate-800 dark:text-slate-200">📄 {file.name}</span>
                ) : (
                  <>
                    <span className="text-2xl">📁</span>
                    <span>{isRtl ? 'اضغط لاختيار ملف' : 'Click to choose a file'}</span>
                  </>
                )}
              </button>

              {/* Upload progress */}
              {loading && uploadProgress > 0 && (
                <div className="gap-1 grid">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
                    <span>{isRtl ? 'جاري الرفع...' : 'Uploading...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand rounded-full h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading || !canSubmit || alreadySubmitted}>
              {loading
                ? (mode === 'file' && uploadProgress > 0 && uploadProgress < 100
                  ? `${uploadProgress}%`
                  : (isRtl ? 'جارٍ التسليم...' : 'Submitting...'))
                : (alreadySubmitted ? (isRtl ? 'تم التسليم' : 'Submitted') : (isRtl ? 'تسليم' : 'Submit'))}
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  )
}


import { useEffect, useState } from 'react'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import Select from '../../components/ui/Select.jsx'

export default function TeacherAssignmentsPage() {
  const { notify } = useToast()
  const { isRtl, t } = useLanguage()
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

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

  async function refresh() {
    try {
      setLoading(true)
      await loadCourses()
    } catch (e) {
      notify({ title: t('assignmentsPage.failedToLoadCourses'), description: e?.response?.data?.message || t('assignmentsPage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadAssignments(courseId).catch((e) => {
      notify({ title: t('assignmentsPage.failedToLoadAssignments'), description: e?.response?.data?.message || t('assignmentsPage.error'), variant: 'destructive' })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700">
        <Spinner />
        {t('assignmentsPage.loading')}
      </div>
    )
  }

  return (
    <div className="gap-4 grid">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-lg">{t('assignmentsPage.title')}</h2>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">{t('assignmentsPage.subtitle')}</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!courseId} size="sm">
          {t('assignmentsPage.createAssignment')}
        </Button>
      </div>

      <div className="gap-1 grid">
        <label className="text-slate-600 dark:text-slate-200 text-sm">{t('assignmentsPage.course')}</label>
        <Select
          value={courseId}
          onChange={(e) => setCourseId(e?.target?.value ?? e)}
          options={(courses || []).map((c) => ({ value: c._id, label: c.title }))}
          placeholder={isRtl ? 'اختر الكورس' : 'Select course'}
        />
      </div>

      <div className="border border-black/5 rounded-xl overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH>{t('assignmentsPage.tableTitle')}</TH>
              <TH>{t('assignmentsPage.tableDue')}</TH>
              <TH>{t('assignmentsPage.tableDescription')}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((a) => (
              <TR key={a._id}>
                <TD>{a.title}</TD>
                <TD className="text-slate-700">{a.dueAt ? new Date(a.dueAt).toLocaleString() : '-'}</TD>
                <TD className="text-slate-700">{a.description || '-'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <CreateAssignmentModal
        open={open}
        onOpenChange={setOpen}
        courseId={courseId}
        onCreated={() => {
          setOpen(false)
          loadAssignments(courseId).catch(() => { })
        }}
      />
    </div>
  )
}

function CreateAssignmentModal({ open, onOpenChange, courseId, onCreated }) {
  const { notify } = useToast()
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setDueAt('')
    }
  }, [open])

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      await api.post(`/assignments/course/${courseId}`, {
        title,
        description,
        ...(dueAt ? { dueAt } : {})
      })
      notify({ title: t('assignmentsPage.assignmentCreated') })
      onCreated()
    } catch (e2) {
      notify({ title: t('assignmentsPage.createFailed'), description: e2?.response?.data?.message || t('assignmentsPage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('assignmentsPage.createAssignment')}>
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('assignmentsPage.formTitle')}</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('assignmentsPage.formDescription')}</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('assignmentsPage.formDue')}</label>
          <Input value={dueAt} onChange={(e) => setDueAt(e.target.value)} placeholder="2026-02-08T18:00" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('assignmentsPage.cancel')}
          </Button>
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? t('assignmentsPage.saving') : t('assignmentsPage.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../utils/api.js'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import noSvg from '../../cvg/NO.svg'
import { Trash2 } from 'lucide-react'

function normalizePermissions(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean)
  return String(raw)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

export default function AdminJoinTeachersApplicationsPage() {
  const { notify } = useToast()
  const { t, isRtl } = useLanguage()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [teamById, setTeamById] = useState({})
  const [autoAssign, setAutoAssign] = useState({ open: false, applicationId: null, defaultName: '', defaultEmail: '' })

  const [deleteId, setDeleteId] = useState('')
  const [deleting, setDeleting] = useState(false)

  const filteredRows = useMemo(() => {
    const qq = String(q || '').trim().toLowerCase()
    if (!qq) return rows
    return rows.filter((r) => {
      const hay = [
        r?.firstName,
        r?.secondName,
        r?.thirdName,
        r?.lastName,
        r?.email,
        r?.phone,
        r?.nationalId,
        r?.governorate,
        r?.jobTitle,
        r?.subject,
        r?.assignedTeamId
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(qq)
    })
  }, [q, rows])

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/join-teachers/applications')
      setRows(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      notify({ title: t('joinTeachersApplicationsPage.failedToLoad'), description: e?.response?.data?.message || t('joinTeachersApplicationsPage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function assignTeam(applicationId, overrideTeamId) {
    try {
      const tid = typeof overrideTeamId === 'string' ? overrideTeamId : teamById[applicationId]
      await api.patch(`/join-teachers/applications/${applicationId}/assign-team`, { teamId: typeof tid === 'string' ? tid : '' })
      notify({ title: t('joinTeachersApplicationsPage.teamAssigned') })
      await load()
    } catch (e) {
      notify({ title: t('joinTeachersApplicationsPage.assignTeamFailed'), description: e?.response?.data?.message || t('joinTeachersApplicationsPage.error'), variant: 'destructive' })
    }
  }

  async function runDelete() {
    const id = String(deleteId || '')
    if (!id) return
    try {
      setDeleting(true)
      await api.delete(`/join-teachers/applications/${id}`)
      notify({ title: isRtl ? 'تم رفض الطلب وحذفه' : 'Application rejected' })
      setDeleteId('')
      await load()
    } catch (e) {
      notify({
        title: isRtl ? 'تعذر رفض الطلب' : 'Failed to reject',
        description: e?.response?.data?.message || t('joinTeachersApplicationsPage.error'),
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  async function openFile(url) {
    try {
      const u = String(url || '')
      if (!u) return

      if (/\/storage\/v1\/object\/public\//i.test(u)) {
        const res = await api.get('/uploads/signed', { params: { url: u } })
        const signedUrl = res?.data?.url
        if (!signedUrl) throw new Error('Failed to load signed url')
        window.open(signedUrl, '_blank', 'noopener,noreferrer')
        return
      }

      window.open(u, '_blank', 'noopener,noreferrer')
    } catch (e) {
      notify({ title: t('joinTeachersApplicationsPage.error'), description: e?.response?.data?.message || e?.message || t('joinTeachersApplicationsPage.error'), variant: 'destructive' })
    }
  }

  return (
    <div className="gap-4 grid">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
          <span className="bg-emerald-500 rounded-full w-1.5 h-1.5" />
          {isRtl ? 'مساحة الأدمن' : 'Admin workspace'}
        </div>
        <div className="mt-2">
          <h1 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
            {t('joinTeachersApplicationsPage.title')}
          </h1>
          <div className="flex justify-center mt-2">
            <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
              <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(212,175,55,0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{t('joinTeachersApplicationsPage.subtitle')}</p>
      </div>

      <div className="flex md:flex-row flex-col md:items-center gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('joinTeachersApplicationsPage.searchPlaceholder')} className="max-w-md" />
        <Button variant="secondary" onClick={load}>
          {t('joinTeachersApplicationsPage.refresh')}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner />
          {t('joinTeachersApplicationsPage.loading')}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="bg-white/75 dark:bg-[#171717] p-5 border border-black/5 dark:border-white/10 rounded-3xl">
          <div className="flex flex-col justify-center items-center gap-3 text-center">
            <img src={noSvg} alt="" aria-hidden="true" className="w-12 h-12 object-contain" />
            <div className="font-semibold text-base" style={{ color: '#F74343' }}>
              {t('joinTeachersApplicationsPage.empty')}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-black/5 rounded-xl overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>{t('joinTeachersApplicationsPage.tableName')}</TH>
                <TH>{t('joinTeachersApplicationsPage.tableContact')}</TH>
                <TH>{t('joinTeachersApplicationsPage.tableJob')}</TH>
                <TH>{t('joinTeachersApplicationsPage.tableTeam')}</TH>
                <TH>{t('joinTeachersApplicationsPage.tableCreated')}</TH>
                <TH>{t('joinTeachersApplicationsPage.tableFiles')}</TH>
                <TH>{isRtl ? 'إجراءات' : 'Actions'}</TH>
              </TR>
            </THead>
            <TBody>
              {filteredRows.map((r) => {
                const id = r?._id || r?.id
                const fullName = [r?.firstName, r?.secondName, r?.thirdName, r?.lastName].filter(Boolean).join(' ')
                return (
                  <TR key={id}>
                    <TD>
                      <Link
                        to={`/admin/applications/${id}`}
                        className="font-semibold text-slate-900 dark:text-slate-100 underline underline-offset-4"
                      >
                        {fullName || '-'}
                      </Link>
                      <div className="text-slate-600 dark:text-slate-300 text-xs">{r?.governorate || '-'}</div>
                      <div className="text-slate-600 dark:text-slate-300 text-xs">{t('joinTeachersApplicationsPage.nationalId')}: {r?.nationalId || '-'}</div>
                    </TD>
                    <TD>
                      <div>{r?.email || '-'}</div>
                      <div className="text-slate-600 dark:text-slate-300 text-xs">{r?.phone || '-'}</div>
                    </TD>
                    <TD>
                      <div>{r?.jobTitle || '-'}</div>
                      <div className="text-slate-600 dark:text-slate-300 text-xs">{t('joinTeachersApplicationsPage.subject')}: {r?.subject || '-'}</div>
                      <div className="text-slate-600 dark:text-slate-300 text-xs">{t('joinTeachersApplicationsPage.expectedSalary')}: {r?.expectedSalary || '-'}</div>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Input
                          value={teamById[id] ?? (r?.assignedTeamId || '')}
                          onChange={(e) => setTeamById((prev) => ({ ...prev, [id]: e.target.value }))}
                          placeholder={t('joinTeachersApplicationsPage.teamIdPlaceholder')}
                          className="h-9"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setAutoAssign({ open: true, applicationId: id, defaultName: fullName || '', defaultEmail: r?.email || '' })}
                        >
                          {t('joinTeachersApplicationsPage.assignTeam')}
                        </Button>
                      </div>
                    </TD>
                    <TD>{r?.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</TD>
                    <TD>
                      <div className="flex flex-col gap-1">
                        {r?.cvUrl ? (
                          <button
                            type="button"
                            className="text-brand text-sm text-left underline underline-offset-4"
                            onClick={() => openFile(r.cvUrl)}
                          >
                            {t('joinTeachersApplicationsPage.cv')}
                          </button>
                        ) : (
                          <div className="text-slate-500 dark:text-slate-400 text-sm">{t('joinTeachersApplicationsPage.noCv')}</div>
                        )}
                        {r?.photoUrl ? (
                          <button
                            type="button"
                            className="text-brand text-sm text-left underline underline-offset-4"
                            onClick={() => openFile(r.photoUrl)}
                          >
                            {t('joinTeachersApplicationsPage.photo')}
                          </button>
                        ) : (
                          <div className="text-slate-500 dark:text-slate-400 text-sm">{t('joinTeachersApplicationsPage.noPhoto')}</div>
                        )}
                      </div>
                    </TD>
                    <TD>
                      <div className={"flex items-center gap-2 " + (isRtl ? 'justify-start flex-row-reverse' : 'justify-end flex-row')}>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(String(id))}
                        >
                          {isRtl ? 'رفض' : 'Reject'}
                        </Button>
                      </div>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(v) => {
          if (!v) setDeleteId('')
        }}
        title={isRtl ? 'رفض الطلب' : 'Reject application'}
        description={isRtl ? 'هل تريد رفض هذا الطلب وحذفه نهائيًا؟' : 'Do you want to reject and permanently delete this application?'}
        confirmLabel={isRtl ? 'رفض وحذف' : 'Reject & delete'}
        cancelLabel={isRtl ? 'إلغاء' : 'Cancel'}
        loading={deleting}
        icon={<Trash2 className="w-6 h-6 text-red-700" />}
        onConfirm={runDelete}
      />

      <AutoAssignTeamModal
        open={autoAssign.open}
        onOpenChange={(v) => setAutoAssign((s) => ({ ...s, open: v }))}
        applicationId={autoAssign.applicationId}
        defaultName={autoAssign.defaultName}
        defaultEmail={autoAssign.defaultEmail}
        onAssigned={async ({ applicationId, teamId }) => {
          setTeamById((prev) => ({ ...prev, [applicationId]: teamId }))
          setAutoAssign({ open: false, applicationId: null, defaultName: '', defaultEmail: '' })
          await assignTeam(applicationId, teamId)
        }}
      />
    </div>
  )
}

function AutoAssignTeamModal({ open, onOpenChange, applicationId, defaultName, defaultEmail, onAssigned }) {
  const { notify } = useToast()
  const { t } = useLanguage()

  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)

  const [teacherId, setTeacherId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamTask, setTeamTask] = useState('')
  const [teamPermissions, setTeamPermissions] = useState('approvals')
  const [lastError, setLastError] = useState('')

  useEffect(() => {
    if (!open) return
    setTeacherId('')
    setName(typeof defaultName === 'string' ? defaultName : '')
    setEmail(typeof defaultEmail === 'string' ? defaultEmail : '')
    setPassword('')
    setTeamTask('')
    setTeamPermissions('approvals')
    setLastError('')
    setTeachers([])

      ; (async () => {
        try {
          const res = await api.get('/admin/users', { params: { role: 'teacher' } })
          setTeachers(Array.isArray(res.data) ? res.data : [])
        } catch (e) {
          notify({ title: t('joinTeachersApplicationsPage.failedToLoadTeachers'), description: e?.response?.data?.message || t('joinTeachersApplicationsPage.error'), variant: 'destructive' })
        }
      })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultEmail, defaultName])

  const selectedTeacher = (teachers || []).find((x) => String(x?._id || x?.id) === String(teacherId)) || null
  const selectedTeamId = selectedTeacher?.teamId || ''
  const selectedSubject = selectedTeacher?.profile?.teachingSubject || ''

  const teacherOptions = (teachers || []).map((x) => {
    const id = x?._id || x?.id
    const subject = x?.profile?.teachingSubject || ''
    const label = subject ? `${x?.name || '-'} — ${subject}` : `${x?.name || '-'}`
    return { value: String(id), label }
  })

  async function runSubmit() {
    if (!applicationId) return

    try {
      setLoading(true)
      setLastError('')

      if (!teacherId) {
        notify({ title: t('joinTeachersApplicationsPage.chooseTeacher'), variant: 'destructive' })
        return
      }
      if (!name || !String(name).trim()) {
        notify({ title: t('joinTeachersApplicationsPage.teamMemberName'), variant: 'destructive' })
        return
      }
      if (!email || !String(email).trim()) {
        notify({ title: t('joinTeachersApplicationsPage.teamMemberEmail'), variant: 'destructive' })
        return
      }
      if (!password) {
        notify({ title: t('joinTeachersApplicationsPage.teamMemberPassword'), variant: 'destructive' })
        return
      }

      let ensuredTeamId = selectedTeamId
      if (!ensuredTeamId) {
        try {
          const res = await api.patch(`/admin/users/${teacherId}`, { role: 'teacher' })
          ensuredTeamId = res?.data?.teamId || ''
          if (ensuredTeamId) {
            setTeachers((prev) => (Array.isArray(prev) ? prev.map((x) => (String(x?._id || x?.id) === String(teacherId) ? { ...x, teamId: ensuredTeamId } : x)) : prev))
          }
        } catch (e3) {
          setLastError(`${e3?.response?.status || ''} ${e3?.response?.data?.message || e3?.message || ''}`.trim())
          notify({
            title: t('joinTeachersApplicationsPage.teacherHasNoTeamId'),
            description: e3?.response?.data?.message || t('joinTeachersApplicationsPage.error'),
            variant: 'destructive'
          })
          return
        }
      }
      if (!ensuredTeamId) {
        notify({ title: t('joinTeachersApplicationsPage.teacherHasNoTeamId'), variant: 'destructive' })
        return
      }

      await api.post('/admin/users', {
        name,
        email,
        password,
        role: 'team',
        teamId: ensuredTeamId,
        teamTask: typeof teamTask === 'string' ? teamTask : '',
        teamPermissions: normalizePermissions(teamPermissions)
      })

      notify({ title: t('joinTeachersApplicationsPage.teamMemberCreated') })
      onAssigned?.({ applicationId, teamId: ensuredTeamId })
    } catch (e2) {
      setLastError(`${e2?.response?.status || ''} ${e2?.response?.data?.message || e2?.message || ''}`.trim())
      const status = e2?.response?.status
      if (status === 409) {
        try {
          const lookup = await api.get('/admin/users/by-email', { params: { email } })
          const existingId = lookup?.data?.id
          if (!existingId) throw new Error('User not found')

          await api.patch(`/admin/users/${existingId}`, {
            role: 'team',
            teamId: ensuredTeamId,
            password,
            mustChangePassword: true,
            teamTask: typeof teamTask === 'string' ? teamTask : '',
            teamPermissions: normalizePermissions(teamPermissions)
          })

          notify({ title: t('joinTeachersApplicationsPage.teamMemberCreated') })
          onAssigned?.({ applicationId, teamId: ensuredTeamId })
        } catch (eReuse) {
          notify({ title: t('joinTeachersApplicationsPage.emailAlreadyExists'), description: t('joinTeachersApplicationsPage.pleaseChangeEmail'), variant: 'destructive' })
        }
      } else {
        notify({ title: t('joinTeachersApplicationsPage.createTeamMemberFailed'), description: e2?.response?.data?.message || t('joinTeachersApplicationsPage.error'), variant: 'destructive' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    await runSubmit()
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('joinTeachersApplicationsPage.autoAssignTitle')}>
      <form onSubmit={submit} className="gap-3 grid">
        {lastError ? (
          <div className="bg-red-50 px-3 py-2 border border-red-200 rounded-xl text-red-800 text-sm">
            {lastError}
          </div>
        ) : null}
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('joinTeachersApplicationsPage.chooseTeacher')}</label>
          <Select value={teacherId} onChange={(e) => setTeacherId(e?.target?.value ?? e)} options={teacherOptions} placeholder={t('joinTeachersApplicationsPage.chooseTeacherPlaceholder')} />
          <div className="text-slate-600 dark:text-slate-300 text-xs">
            {t('joinTeachersApplicationsPage.teacherSubject')}: {selectedSubject || '-'}
          </div>
          <div className="text-slate-600 dark:text-slate-300 text-xs">
            Team ID: {selectedTeamId || '-'}
          </div>
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('joinTeachersApplicationsPage.teamMemberName')}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('joinTeachersApplicationsPage.teamMemberEmail')}</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('joinTeachersApplicationsPage.teamMemberPassword')}</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" dir="ltr" />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('joinTeachersApplicationsPage.teamMemberTask')}</label>
          <Input value={teamTask} onChange={(e) => setTeamTask(e.target.value)} placeholder={t('joinTeachersApplicationsPage.teamMemberTaskPlaceholder')} />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('joinTeachersApplicationsPage.teamMemberPermissions')}</label>
          <Input value={teamPermissions} onChange={(e) => setTeamPermissions(e.target.value)} dir="ltr" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('joinTeachersApplicationsPage.cancel')}
          </Button>
          <Button type="submit" onClick={runSubmit} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="border-t-white w-4 h-4" />
                {t('joinTeachersApplicationsPage.saving')}
              </span>
            ) : (
              t('joinTeachersApplicationsPage.createAndAssign')
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

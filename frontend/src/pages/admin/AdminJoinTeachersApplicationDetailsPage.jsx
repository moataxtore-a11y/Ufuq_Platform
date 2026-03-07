import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../utils/api.js'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import noSvg from '../../cvg/NO.svg'

function normalizePermissions(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean)
  return String(raw)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

function Field({ label, value }) {
  return (
    <div className="gap-1 grid">
      <div className="text-slate-600 dark:text-slate-300 text-xs">{label}</div>
      <div className="font-medium text-slate-900 dark:text-slate-100 break-words">{value || '-'}</div>
    </div>
  )
}

export default function AdminJoinTeachersApplicationDetailsPage() {
  const { notify } = useToast()
  const { t, isRtl } = useLanguage()
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [row, setRow] = useState(null)
  const [teamId, setTeamId] = useState('')
  const [autoAssignOpen, setAutoAssignOpen] = useState(false)

  const fullName = useMemo(() => {
    return [row?.firstName, row?.secondName, row?.thirdName, row?.lastName].filter(Boolean).join(' ')
  }, [row])

  async function load() {
    try {
      setLoading(true)
      const res = await api.get(`/join-teachers/applications/${id}`)
      setRow(res.data || null)
      setTeamId(res.data?.assignedTeamId || '')
    } catch (e) {
      notify({ title: t('joinTeachersApplicationsPage.failedToLoad'), description: e?.response?.data?.message || t('joinTeachersApplicationsPage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function assign(overrideTeamId) {
    try {
      const tid = typeof overrideTeamId === 'string' ? overrideTeamId : teamId
      await api.patch(`/join-teachers/applications/${id}/assign-team`, { teamId: tid })
      notify({ title: t('joinTeachersApplicationsPage.teamAssigned') })
      await load()
    } catch (e) {
      notify({ title: t('joinTeachersApplicationsPage.assignTeamFailed'), description: e?.response?.data?.message || t('joinTeachersApplicationsPage.error'), variant: 'destructive' })
    }
  }

  async function openFile(url) {
    try {
      const u = String(url || '')
      if (!u) return

      // If it's a Supabase public object URL, request a signed URL from backend.
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
      <div className={'flex items-center justify-between gap-3 ' + (isRtl ? 'flex-row-reverse' : '')}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <div className="font-semibold text-lg">{t('joinTeachersApplicationsPage.title')}</div>
          <div className="text-slate-600 dark:text-slate-300 text-sm">{fullName || '-'}</div>
        </div>

        <div className={'flex items-center gap-2 ' + (isRtl ? 'flex-row-reverse' : '')}>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('joinTeachersApplicationsPage.back')}
          </Button>
          <Link to="/admin/applications">
            <Button variant="secondary">{t('joinTeachersApplicationsPage.allApplications')}</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner />
          {t('joinTeachersApplicationsPage.loading')}
        </div>
      ) : !row ? (
        <div className="bg-white/75 dark:bg-[#171717] p-5 border border-black/5 dark:border-white/10 rounded-3xl">
          <div className="flex flex-col justify-center items-center gap-3 text-center">
            <img src={noSvg} alt="" aria-hidden="true" className="w-12 h-12 object-contain" />
            <div className="font-semibold text-base" style={{ color: '#F74343' }}>
              {t('joinTeachersApplicationsPage.empty')}
            </div>
          </div>
        </div>
      ) : (
        <div className="gap-4 grid">
          <Card>
            <CardHeader>
              <CardTitle>{t('joinTeachersApplicationsPage.sectionApplicant')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="gap-4 grid md:grid-cols-3">
                <Field label={t('joinTeachersApplicationsPage.tableName')} value={fullName} />
                <Field label={t('joinTeachersApplicationsPage.tableContact')} value={[row?.email, row?.phone].filter(Boolean).join(' | ')} />
                <Field label={t('joinTeachersApplicationsPage.nationalId')} value={row?.nationalId} />
                <Field label={t('joinTeachersApplicationsPage.governorate')} value={row?.governorate} />
                <Field label={t('joinTeachersApplicationsPage.createdAt')} value={row?.createdAt ? new Date(row.createdAt).toLocaleString() : '-'} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('joinTeachersApplicationsPage.sectionJob')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="gap-4 grid md:grid-cols-3">
                <Field label={t('joinTeachersApplicationsPage.jobTitle')} value={row?.jobTitle} />
                <Field label={t('joinTeachersApplicationsPage.subject')} value={row?.subject} />
                <Field label={t('joinTeachersApplicationsPage.expectedSalary')} value={row?.expectedSalary} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('joinTeachersApplicationsPage.sectionNotes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{row?.notes || '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('joinTeachersApplicationsPage.sectionTeam')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex md:flex-row flex-col md:items-center gap-3">
                <Input value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder={t('joinTeachersApplicationsPage.teamIdPlaceholder')} className="max-w-sm" />
                <Button variant="secondary" onClick={() => setAutoAssignOpen(true)}>
                  {t('joinTeachersApplicationsPage.assignTeam')}
                </Button>
                <div className="text-slate-600 dark:text-slate-300 text-sm">
                  {t('joinTeachersApplicationsPage.currentTeam')}: {row?.assignedTeamId || '-'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('joinTeachersApplicationsPage.tableFiles')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="gap-2 grid">
                <div>
                  {row?.cvUrl ? (
                    <button
                      type="button"
                      className="text-brand text-sm text-left underline underline-offset-4"
                      onClick={() => openFile(row.cvUrl)}
                    >
                      {t('joinTeachersApplicationsPage.cv')}
                    </button>
                  ) : (
                    <div className="text-slate-500 dark:text-slate-400 text-sm">{t('joinTeachersApplicationsPage.noCv')}</div>
                  )}
                </div>
                <div>
                  {row?.photoUrl ? (
                    <button
                      type="button"
                      className="text-brand text-sm text-left underline underline-offset-4"
                      onClick={() => openFile(row.photoUrl)}
                    >
                      {t('joinTeachersApplicationsPage.photo')}
                    </button>
                  ) : (
                    <div className="text-slate-500 dark:text-slate-400 text-sm">{t('joinTeachersApplicationsPage.noPhoto')}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AutoAssignTeamModal
        open={autoAssignOpen}
        onOpenChange={setAutoAssignOpen}
        applicationId={id}
        defaultName={fullName || ''}
        defaultEmail={row?.email || ''}
        onAssigned={async ({ teamId }) => {
          setTeamId(teamId)
          setAutoAssignOpen(false)
          await assign(teamId)
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
      onAssigned?.({ teamId: ensuredTeamId })
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
          onAssigned?.({ teamId: ensuredTeamId })
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

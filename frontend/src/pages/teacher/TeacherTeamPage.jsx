import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function normalizePermissions(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean)
  return String(raw)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

export default function TeacherTeamPage() {
  const { notify } = useToast()
  const { auth, setAuth } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState({ open: false, member: null })
  const [generating, setGenerating] = useState(false)

  const lang = typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'ar' : 'en'
  const isRtl = lang === 'ar'

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/teachers/me/team')
      setRows(res.data)
    } catch (e) {
      notify({ title: isRtl ? 'فشل تحميل التيم' : 'Failed to load team', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hint = useMemo(() => {
    const t = auth?.teamId
    if (!t) return isRtl ? 'لا يوجد Team ID مرتبط بحسابك' : 'No teamId is linked to your account'
    return isRtl ? `Team ID الخاص بك: ${t}` : `Your scope Team ID: ${t}`
  }, [auth?.teamId, isRtl])

  const filteredRows = useMemo(() => {
    const list = Array.isArray(rows) ? rows : []
    const needle = String(q || '').trim().toLowerCase()
    if (!needle) return list
    return list.filter((u) => {
      const id = String(u?._id || u?.id || '').toLowerCase()
      const name = String(u?.name || '').toLowerCase()
      const email = String(u?.email || '').toLowerCase()
      return id.includes(needle) || name.includes(needle) || email.includes(needle)
    })
  }, [q, rows])

  async function generateTeamId() {
    try {
      setGenerating(true)
      const res = await api.post('/teachers/me/team-id')
      const teamId = res?.data?.teamId
      if (teamId) {
        setAuth?.({ ...(auth || {}), teamId })
        notify({ title: isRtl ? 'تم إنشاء Team ID' : 'Team ID generated' })
      }
    } catch (e) {
      notify({ title: isRtl ? 'فشل إنشاء Team ID' : 'Failed to generate Team ID', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="gap-4 grid">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-lg">
            {isRtl ? 'التيم' : 'My Team'}
          </h2>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
            {isRtl ? 'إدارة أعضاء التيم المرتبطين بك.' : 'Manage team members linked to your scope.'}
          </p>
        </div>
        <div className="inline-flex items-center bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
          {hint}
        </div>
      </div>

      <div className={isRtl ? 'flex justify-start' : 'flex justify-end'}>
        <div className={isRtl ? 'flex flex-row-reverse gap-2 flex-wrap items-center' : 'flex gap-2 flex-wrap items-center'}>
          <div className="min-w-[220px]">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isRtl ? 'بحث بالاسم أو الـ ID أو الإيميل' : 'Search by name, ID, or email'}
              dir={isRtl ? 'rtl' : 'ltr'}
            />
          </div>
          {!auth?.teamId ? (
            <Button onClick={generateTeamId} disabled={generating}>
              {generating ? (isRtl ? 'جاري الإنشاء...' : 'Generating...') : (isRtl ? 'إنشاء Team ID' : 'Generate Team ID')}
            </Button>
          ) : null}

          <Button onClick={() => setOpen(true)} disabled={!auth?.teamId}>
            {isRtl ? 'إضافة عضو تيم' : 'Add team member'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Spinner />
          {isRtl ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="text-slate-600 dark:text-slate-300 text-sm">
          {q.trim()
            ? (isRtl ? 'لا توجد نتائج مطابقة.' : 'No matching results.')
            : (isRtl ? 'لا يوجد أعضاء تيم حتى الآن.' : 'No team members yet.')}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 rounded-2xl overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>{isRtl ? 'الاسم' : 'Name'}</TH>
                <TH>{isRtl ? 'البريد' : 'Email'}</TH>
                <TH>{isRtl ? 'المهمة' : 'Task'}</TH>
                <TH>{isRtl ? 'الصلاحيات' : 'Permissions'}</TH>
                <TH>{isRtl ? 'Team ID' : 'Team ID'}</TH>
                <TH>{isRtl ? 'تاريخ الإنشاء' : 'Created'}</TH>
                <TH>{isRtl ? 'إجراءات' : 'Actions'}</TH>
              </TR>
            </THead>
            <TBody>
              {filteredRows.map((u) => (
                <TR key={u._id || u.id}>
                  <TD>{u.name}</TD>
                  <TD className="text-slate-700 dark:text-slate-200">{u.email}</TD>
                  <TD className="text-slate-700 dark:text-slate-200">{u.teamTask || '-'}</TD>
                  <TD className="text-slate-700 dark:text-slate-200">
                    {Array.isArray(u.teamPermissions) && u.teamPermissions.length
                      ? u.teamPermissions.join(', ')
                      : '-'}
                  </TD>
                  <TD>{u.teamId || '-'}</TD>
                  <TD className="text-slate-700 dark:text-slate-200">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</TD>
                  <TD>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setEdit({ open: true, member: u })}
                    >
                      {isRtl ? 'تعديل' : 'Edit'}
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      <AddTeamMemberModal
        open={open}
        onOpenChange={setOpen}
        onCreated={async () => {
          setOpen(false)
          await load()
        }}
        isRtl={isRtl}
      />

      <EditTeamMemberModal
        open={edit.open}
        onOpenChange={(v) => setEdit((s) => ({ ...s, open: v }))}
        member={edit.member}
        isRtl={isRtl}
        onSaved={async () => {
          setEdit({ open: false, member: null })
          await load()
        }}
      />
    </div>
  )
}

function AddTeamMemberModal({ open, onOpenChange, onCreated, isRtl }) {
  const { notify } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamTask, setTeamTask] = useState('')
  const [teamPermissions, setTeamPermissions] = useState(['courses', 'students', 'grading'])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setName('')
    setEmail('')
    setPassword('')
    setTeamTask('')
    setTeamPermissions(['courses', 'students', 'grading'])
  }, [open])

  function togglePerm(p) {
    setTeamPermissions((prev) => {
      const list = Array.isArray(prev) ? prev : []
      return list.includes(p) ? list.filter((x) => x !== p) : [...list, p]
    })
  }

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      await api.post('/teachers/me/team', {
        name,
        email,
        password,
        teamTask,
        teamPermissions
      })
      notify({ title: isRtl ? 'تم إضافة العضو' : 'Team member added', description: isRtl ? 'سيُطلب منه تغيير كلمة المرور عند أول تسجيل دخول.' : 'They will be asked to change password on first login.' })
      onCreated?.()
    } catch (e2) {
      notify({ title: isRtl ? 'فشل الإضافة' : 'Create failed', description: e2?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isRtl ? 'إضافة عضو تيم' : 'Add team member'}>
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الاسم' : 'Name'}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'كلمة مرور مؤقتة' : 'Temporary password'}</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" dir="ltr" />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'المهمة' : 'Task'}</label>
          <Input value={teamTask} onChange={(e) => setTeamTask(e.target.value)} placeholder={isRtl ? 'مثال: مساعد' : 'e.g. TA'} />
        </div>

        <div className="gap-2 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الصلاحيات' : 'Permissions'}</label>
          <div className={isRtl ? 'flex flex-row-reverse flex-wrap gap-2' : 'flex flex-wrap gap-2'}>
            <label className={isRtl ? 'inline-flex flex-row-reverse items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none' : 'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none'}>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={teamPermissions.includes('courses')}
                onChange={() => togglePerm('courses')}
                disabled={loading}
              />
              <span className="flex justify-center items-center bg-white dark:bg-black/20 peer-checked:bg-brand border border-slate-300/70 dark:border-white/20 peer-checked:border-brand rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 w-5 h-5 transition" />
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{isRtl ? 'الكورسات' : 'Courses'}</span>
            </label>

            <label className={isRtl ? 'inline-flex flex-row-reverse items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none' : 'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none'}>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={teamPermissions.includes('students')}
                onChange={() => togglePerm('students')}
                disabled={loading}
              />
              <span className="flex justify-center items-center bg-white dark:bg-black/20 peer-checked:bg-brand border border-slate-300/70 dark:border-white/20 peer-checked:border-brand rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 w-5 h-5 transition" />
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{isRtl ? 'الطلاب' : 'Students'}</span>
            </label>

            <label className={isRtl ? 'inline-flex flex-row-reverse items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none' : 'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none'}>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={teamPermissions.includes('grading')}
                onChange={() => togglePerm('grading')}
                disabled={loading}
              />
              <span className="flex justify-center items-center bg-white dark:bg-black/20 peer-checked:bg-brand border border-slate-300/70 dark:border-white/20 peer-checked:border-brand rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 w-5 h-5 transition" />
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{isRtl ? 'التصحيح' : 'Grading'}</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={loading || !name.trim() || !email.trim() || !password}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="border-t-white w-4 h-4" />
                {isRtl ? 'جاري الحفظ...' : 'Saving...'}
              </span>
            ) : (
              isRtl ? 'إضافة' : 'Add'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditTeamMemberModal({ open, onOpenChange, member, isRtl, onSaved }) {
  const { notify } = useToast()
  const [teamTask, setTeamTask] = useState('')
  const [teamPermissions, setTeamPermissions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setTeamTask(member?.teamTask || '')
    setTeamPermissions(Array.isArray(member?.teamPermissions) ? member.teamPermissions : [])
  }, [open, member])

  function togglePerm(p) {
    setTeamPermissions((prev) => {
      const list = Array.isArray(prev) ? prev : []
      return list.includes(p) ? list.filter((x) => x !== p) : [...list, p]
    })
  }

  async function submit(e) {
    e.preventDefault()
    if (!member?._id && !member?.id) return
    try {
      setLoading(true)
      const id = member?._id || member?.id
      await api.patch(`/teachers/me/team/${id}`, {
        teamTask,
        teamPermissions
      })
      notify({ title: isRtl ? 'تم التحديث' : 'Updated' })
      onSaved?.()
    } catch (e2) {
      notify({ title: isRtl ? 'فشل التحديث' : 'Update failed', description: e2?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isRtl ? 'تعديل عضو تيم' : 'Edit team member'}>
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'العضو' : 'Member'}</label>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">{member?.name || '-'}</div>
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'المهمة' : 'Task'}</label>
          <Input value={teamTask} onChange={(e) => setTeamTask(e.target.value)} placeholder={isRtl ? 'مثال: مساعد' : 'e.g. TA'} />
        </div>

        <div className="gap-2 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الصلاحيات' : 'Permissions'}</label>
          <div className={isRtl ? 'flex flex-row-reverse flex-wrap gap-2' : 'flex flex-wrap gap-2'}>
            <label className={isRtl ? 'inline-flex flex-row-reverse items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none' : 'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none'}>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={teamPermissions.includes('courses')}
                onChange={() => togglePerm('courses')}
                disabled={loading}
              />
              <span className="flex justify-center items-center bg-white dark:bg-black/20 peer-checked:bg-brand border border-slate-300/70 dark:border-white/20 peer-checked:border-brand rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 w-5 h-5 transition" />
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{isRtl ? 'الكورسات' : 'Courses'}</span>
            </label>

            <label className={isRtl ? 'inline-flex flex-row-reverse items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none' : 'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none'}>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={teamPermissions.includes('students')}
                onChange={() => togglePerm('students')}
                disabled={loading}
              />
              <span className="flex justify-center items-center bg-white dark:bg-black/20 peer-checked:bg-brand border border-slate-300/70 dark:border-white/20 peer-checked:border-brand rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 w-5 h-5 transition" />
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{isRtl ? 'الطلاب' : 'Students'}</span>
            </label>

            <label className={isRtl ? 'inline-flex flex-row-reverse items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none' : 'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.10] transition cursor-pointer select-none'}>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={teamPermissions.includes('grading')}
                onChange={() => togglePerm('grading')}
                disabled={loading}
              />
              <span className="flex justify-center items-center bg-white dark:bg-black/20 peer-checked:bg-brand border border-slate-300/70 dark:border-white/20 peer-checked:border-brand rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 w-5 h-5 transition" />
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{isRtl ? 'التصحيح' : 'Grading'}</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="border-t-white w-4 h-4" />
                {isRtl ? 'جاري الحفظ...' : 'Saving...'}
              </span>
            ) : (
              isRtl ? 'حفظ' : 'Save'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

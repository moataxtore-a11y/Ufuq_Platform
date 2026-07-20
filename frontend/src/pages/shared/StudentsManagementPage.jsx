import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { Trash2 } from 'lucide-react'
import Select from '../../components/ui/Select.jsx'

export default function StudentsManagementPage() {
  const { notify } = useToast()
  const { auth } = useAuth()
  const { t, isRtl } = useLanguage()
  const [q, setQ] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteUserId, setDeleteUserId] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [toggleSuspendUserId, setToggleSuspendUserId] = useState('')
  const [toggleSuspendNext, setToggleSuspendNext] = useState('suspend')
  const [toggleSuspendLoading, setToggleSuspendLoading] = useState(false)

  const [selected, setSelected] = useState(() => new Set())
  const selectedCount = selected.size

  const [grantOpen, setGrantOpen] = useState(false)
  const [grantMode, setGrantMode] = useState('fixed')
  const [grantAmount, setGrantAmount] = useState('')
  const [grantMin, setGrantMin] = useState('')
  const [grantMax, setGrantMax] = useState('')
  const [grantNote, setGrantNote] = useState('')
  const [grantSending, setGrantSending] = useState(false)

  const [grantTeachers, setGrantTeachers] = useState([])
  const [grantTeacherId, setGrantTeacherId] = useState('')

  const [randomPickCount, setRandomPickCount] = useState('')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [openProfile, setOpenProfile] = useState(false)
  const [profileUserId, setProfileUserId] = useState('')

  const filtered = useMemo(() => {
    if (!rows) return []
    return rows
  }, [rows, auth?.role, auth?.teamId])

  const isTeacherOrTeam = auth?.role === 'teacher' || auth?.role === 'team'

  async function load() {
    try {
      setLoading(true)
      const params = {}
      if (q && q.trim()) params.q = q.trim()
      const res = await api.get(isTeacherOrTeam ? '/courses/my/students' : '/students', { params })
      setRows(res.data)
      setSelected(new Set())
    } catch (e) {
      notify({ title: t('studentsPage.failedToLoad'), description: e?.response?.data?.message || t('studentsPage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function onToggleSuspend(user) {
    const id = String(user?._id || user?.id || '')
    if (!id) return
    const next = user?.isSuspended ? 'activate' : 'suspend'
    setToggleSuspendUserId(id)
    setToggleSuspendNext(next)
  }

  async function runToggleSuspend() {
    const id = toggleSuspendUserId
    const next = toggleSuspendNext
    if (!id) return
    try {
      setToggleSuspendLoading(true)
      if (next === 'activate') {
        await api.patch(`/students/${id}/activate`)
        notify({ title: isRtl ? 'تم تفعيل الحساب' : 'Account activated' })
      } else {
        await api.patch(`/students/${id}/suspend`)
        notify({ title: isRtl ? 'تم إيقاف الحساب' : 'Account suspended' })
      }
      setToggleSuspendUserId('')
      await load()
    } catch (e) {
      notify({
        title: isRtl ? 'تعذر تنفيذ العملية' : 'Action failed',
        description: e?.response?.data?.message || e?.message || 'Error',
        variant: 'destructive'
      })
    } finally {
      setToggleSuspendLoading(false)
    }
  }

  function pickRandomStudents(countRaw) {
    const n = Number(countRaw)
    const ids = filtered.map((u) => String(u?._id || u?.id || '')).filter(Boolean)
    if (!Number.isFinite(n) || n <= 0 || ids.length === 0) return
    const k = Math.min(ids.length, Math.floor(n))

    const arr = [...ids]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = arr[i]
      arr[i] = arr[j]
      arr[j] = tmp
    }

    setSelected(new Set(arr.slice(0, k)))
  }

  useEffect(() => {
    if (!grantOpen) return
    if (grantMode !== 'random') return

    const raw = String(randomPickCount || '').trim()
    if (!raw) {
      setSelected(new Set())
      return
    }

    const t = setTimeout(() => {
      pickRandomStudents(raw)
    }, 250)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grantOpen, grantMode, randomPickCount, filtered.length])

  useEffect(() => {
    let alive = true
    async function loadGrantTeachers() {
      if (auth?.role !== 'team') return
      try {
        const res = await api.get('/wallet/grant-teachers')
        const arr = Array.isArray(res?.data) ? res.data : []
        if (!alive) return
        setGrantTeachers(arr)
        if (!grantTeacherId && arr && arr[0] && arr[0].id) {
          setGrantTeacherId(String(arr[0].id))
        }
      } catch {
        if (!alive) return
        setGrantTeachers([])
      }
    }
    loadGrantTeachers()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.role])

  function toggleSelected(userId) {
    const id = String(userId || '')
    if (!id) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev)
      const ids = filtered.map((u) => String(u?._id || u?.id || '')).filter(Boolean)
      const allSelected = ids.length > 0 && ids.every((id) => next.has(id))
      if (allSelected) {
        ids.forEach((id) => next.delete(id))
      } else {
        ids.forEach((id) => next.add(id))
      }
      return next
    })
  }

  async function sendGrant() {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    try {
      setGrantSending(true)
      const payload = {
        studentIds: ids,
        amountMode: grantMode
      }
      if (grantMode === 'fixed') payload.amount = Number(grantAmount)
      else {
        payload.minAmount = Number(grantMin)
        payload.maxAmount = Number(grantMax)
      }
      if (grantNote && grantNote.trim()) payload.note = grantNote.trim()
      if (auth?.role === 'team') payload.teacherId = grantTeacherId

      await api.post('/wallet/grants', payload)

      notify({
        title: isRtl ? 'تم إضافة الرصيد' : 'Wallet credited',
        description: isRtl ? `تم إرسال الرصيد إلى ${ids.length} طالب.` : `Granted to ${ids.length} students.`
      })
      setGrantOpen(false)
      setGrantAmount('')
      setGrantMin('')
      setGrantMax('')
      setGrantNote('')
      setSelected(new Set())
    } catch (e) {
      notify({
        title: isRtl ? 'تعذر إرسال الرصيد' : 'Failed to grant wallet',
        description: e?.response?.data?.message || e?.message || 'Error',
        variant: 'destructive'
      })
    } finally {
      setGrantSending(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      load()
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  async function onDelete(userId) {
    setDeleteUserId(String(userId || ''))
  }

  async function runDelete() {
    const id = deleteUserId
    if (!id) return
    try {
      setDeleting(true)
      await api.delete(`/students/${id}`)
      notify({ title: t('studentsPage.deleted') })
      setDeleteUserId('')
      load()
    } catch (e) {
      notify({ title: t('studentsPage.deleteFailed'), description: e?.response?.data?.message || t('studentsPage.error'), variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  function onCreate() {
    setEditing(null)
    setOpen(true)
  }

  function onEdit(user) {
    setEditing(user)
    setOpen(true)
  }

  function onViewProfile(user) {
    setProfileUserId(user._id || user.id)
    setOpenProfile(true)
  }

  return (
    <div className="gap-4 grid">
      <ConfirmDialog
        open={Boolean(toggleSuspendUserId)}
        onOpenChange={(v) => {
          if (!v) setToggleSuspendUserId('')
        }}
        title={
          isRtl
            ? (toggleSuspendNext === 'activate' ? 'تفعيل الحساب' : 'إيقاف الحساب')
            : (toggleSuspendNext === 'activate' ? 'Activate account' : 'Suspend account')
        }
        description={
          isRtl
            ? (toggleSuspendNext === 'activate' ? 'هل تريد تفعيل هذا الحساب؟' : 'هل تريد إيقاف هذا الحساب عن العمل؟')
            : (toggleSuspendNext === 'activate' ? 'Activate this account?' : 'Suspend this account?')
        }
        confirmLabel={isRtl ? (toggleSuspendNext === 'activate' ? 'تفعيل' : 'إيقاف') : (toggleSuspendNext === 'activate' ? 'Activate' : 'Suspend')}
        cancelLabel={t('common.cancel') === 'common.cancel' ? 'Cancel' : t('common.cancel')}
        loading={toggleSuspendLoading}
        onConfirm={runToggleSuspend}
      />

      <Modal
        open={grantOpen}
        onOpenChange={(v) => {
          setGrantOpen(v)
        }}
        title={isRtl ? 'إضافة رصيد للمحفظة' : 'Grant wallet balance'}
      >
        <div className="gap-3 grid">
          <div className="text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? `سيتم إضافة الرصيد فورًا إلى ${selectedCount} طالب.` : `This will instantly credit ${selectedCount} students.`}
          </div>

          {grantMode === 'random' ? (
            <div className="bg-white/70 dark:bg-white/[0.04] p-3 border border-black/10 dark:border-white/10 rounded-2xl">
              <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                {isRtl ? 'تحديد الطلاب عشوائيًا' : 'Pick students randomly'}
              </div>
              <div className="items-end gap-2 grid mt-2">
                <div className="min-w-0">
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 text-xs">
                    {isRtl ? 'عدد الطلاب' : 'Students count'}
                  </label>
                  <Input
                    value={randomPickCount}
                    onChange={(e) => setRandomPickCount(e.target.value)}
                    placeholder={isRtl ? 'مثال: 10' : 'e.g. 10'}
                  />
                </div>
              </div>
              <div className="mt-2 text-slate-600 dark:text-slate-300 text-xs">
                {isRtl ? `المتاح الآن: ${filtered.length}` : `Available now: ${filtered.length}`}
              </div>
              <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs">
                {isRtl ? 'عند مسح الرقم سيتم إلغاء التحديد تلقائيًا.' : 'Clearing the number will clear the selection automatically.'}
              </div>
            </div>
          ) : null}

          {auth?.role === 'team' ? (
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'المدرس' : 'Teacher'}</label>
              <Select
                value={grantTeacherId}
                onChange={(e) => setGrantTeacherId(e.target.value)}
                options={grantTeachers.map((t2) => ({ value: t2.id, label: t2.name }))}
              />
            </div>
          ) : null}

          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'نوع المبلغ' : 'Amount mode'}</label>
            <div className={"flex items-center gap-2 " + (isRtl ? 'flex-row-reverse justify-end' : 'flex-row justify-start')}>
              <button
                type="button"
                className={
                  'px-4 py-2 rounded-2xl border text-sm font-semibold transition ' +
                  (grantMode === 'fixed'
                    ? 'bg-brand/20 border-brand/40 text-slate-900 dark:text-slate-100'
                    : 'bg-white/70 dark:bg-white/[0.04] border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200')
                }
                onClick={() => setGrantMode('fixed')}
              >
                {isRtl ? 'مبلغ ثابت' : 'Fixed'}
              </button>
              <button
                type="button"
                className={
                  'px-4 py-2 rounded-2xl border text-sm font-semibold transition ' +
                  (grantMode === 'random'
                    ? 'bg-brand/20 border-brand/40 text-slate-900 dark:text-slate-100'
                    : 'bg-white/70 dark:bg-white/[0.04] border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200')
                }
                onClick={() => setGrantMode('random')}
              >
                {isRtl ? 'عشوائي لكل طالب' : 'Random per student'}
              </button>
            </div>
          </div>

          {grantMode === 'fixed' ? (
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'المبلغ' : 'Amount'}</label>
              <Input value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} placeholder={isRtl ? 'مثال: 50' : 'e.g. 50'} />
            </div>
          ) : (
            <div className="gap-3 grid sm:grid-cols-2">
              <div className="gap-1 grid">
                <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'أقل مبلغ' : 'Min amount'}</label>
                <Input value={grantMin} onChange={(e) => setGrantMin(e.target.value)} placeholder={isRtl ? 'مثال: 10' : 'e.g. 10'} />
              </div>
              <div className="gap-1 grid">
                <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'أعلى مبلغ' : 'Max amount'}</label>
                <Input value={grantMax} onChange={(e) => setGrantMax(e.target.value)} placeholder={isRtl ? 'مثال: 100' : 'e.g. 100'} />
              </div>
            </div>
          )}

          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'ملاحظة (اختياري)' : 'Note (optional)'}</label>
            <Input value={grantNote} onChange={(e) => setGrantNote(e.target.value)} placeholder={isRtl ? 'مثال: مكافأة' : 'e.g. reward'} />
          </div>

          <div className={"flex items-center gap-2 pt-1 " + (isRtl ? 'flex-row-reverse justify-start' : 'flex-row justify-end')}>
            <Button variant="secondary" type="button" onClick={() => setGrantOpen(false)} disabled={grantSending}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="button" onClick={sendGrant} disabled={grantSending || selectedCount === 0}>
              {grantSending ? (isRtl ? 'جاري الإرسال...' : 'Sending...') : (isRtl ? 'إرسال' : 'Send')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteUserId)}
        onOpenChange={(v) => {
          if (!v) setDeleteUserId('')
        }}
        title={t('studentsPage.confirmDeleteTitle') === 'studentsPage.confirmDeleteTitle' ? (auth?.role === 'teacher' || auth?.role === 'team' ? 'تأكيد الحذف' : 'Confirm delete') : t('studentsPage.confirmDeleteTitle')}
        description={t('studentsPage.confirmDelete')}
        confirmLabel={t('studentsPage.delete') === 'studentsPage.delete' ? (isRtl ? 'حذف' : 'Delete') : t('studentsPage.delete')}
        cancelLabel={t('common.cancel') === 'common.cancel' ? 'Cancel' : t('common.cancel')}
        loading={deleting}
        icon={<Trash2 className="w-6 h-6 text-red-700" />}
        onConfirm={runDelete}
      />
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {t('studentsPage.title')}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{t('studentsPage.subtitle')}</div>

        {!isTeacherOrTeam ? (
          <div className="flex justify-center mt-4">
            <Button onClick={onCreate}>{t('studentsPage.createStudent')}</Button>
          </div>
        ) : null}
      </div>

      {(auth?.role === 'teacher' || auth?.role === 'team') ? (
        <div className={"bg-white/70 dark:bg-white/[0.04] p-4 border border-black/10 dark:border-white/10 rounded-3xl " + (isRtl ? 'text-right' : 'text-left')}>
          <div className={"flex items-center justify-between gap-3 " + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
            <div className="min-w-0">
              <div className="font-extrabold text-slate-900 dark:text-white">
                {isRtl ? 'إرسال رصيد للمحفظة' : 'Grant wallet balance'}
              </div>
              <div className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
                {isRtl ? `الطلاب المحددين: ${selectedCount}` : `Selected: ${selectedCount}`}
              </div>
            </div>
            <div className={"flex items-center gap-2 " + (isRtl ? 'justify-start' : 'justify-end')}>
              <Button type="button" onClick={() => setGrantOpen(true)}>
                {isRtl ? 'إضافة رصيد' : 'Grant'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="gap-1 grid">
        <label className="text-slate-600 dark:text-slate-200 text-sm">{t('studentsPage.search')}</label>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('studentsPage.searchPlaceholder')} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner />
          {t('studentsPage.loading')}
        </div>
      ) : (
        <div className="border border-black/5 rounded-xl overflow-x-auto">
          <Table>
            <THead>
              <TR>
                {(auth?.role === 'teacher' || auth?.role === 'team') ? (
                  <TH className="w-[56px] text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand cursor-pointer"
                      checked={filtered.length > 0 && filtered.every((u) => selected.has(String(u?._id || u?.id || '')))}
                      onChange={toggleAllVisible}
                      aria-label={isRtl ? 'تحديد الكل' : 'Select all'}
                    />
                  </TH>
                ) : null}
                <TH className="text-center">{t('studentsPage.tableName')}</TH>
                <TH className="text-center">{t('studentsPage.tableEmail')}</TH>
                <TH className="text-center">{t('studentsPage.tableStudentId')}</TH>
                <TH className="text-center">{t('studentsPage.tableTeamId')}</TH>
                <TH className="text-center">{t('studentsPage.tableStatus')}</TH>
                {(auth?.role === 'teacher' || auth?.role === 'team') ? (
                  <TH className="text-center">{isRtl ? 'الحساب' : 'Account'}</TH>
                ) : null}
                <TH className="text-center">{t('studentsPage.tableActions')}</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((u) => (
                <TR key={u._id || u.id}>
                  {(auth?.role === 'teacher' || auth?.role === 'team') ? (
                    <TD className="w-[56px] text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-brand cursor-pointer"
                        checked={selected.has(String(u?._id || u?.id || ''))}
                        onChange={() => toggleSelected(u._id || u.id)}
                        aria-label={isRtl ? 'تحديد' : 'Select'}
                      />
                    </TD>
                  ) : null}
                  <TD className="text-center">{u.name}</TD>
                  <TD className="text-slate-700 text-center">{u.email}</TD>
                  <TD className="text-center">{u.studentId || '-'}</TD>
                  <TD className="text-center">{u.teamId || '-'}</TD>
                  <TD className="text-center">{u.status || '-'}</TD>
                  {(auth?.role === 'teacher' || auth?.role === 'team') ? (
                    <TD className="text-center">
                      <span
                        className={
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ' +
                          (u?.isSuspended
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700')
                        }
                      >
                        {u?.isSuspended ? (isRtl ? 'موقوف' : 'Suspended') : (isRtl ? 'نشط' : 'Active')}
                      </span>
                    </TD>
                  ) : null}
                  <TD className="text-center">
                    <div className="inline-flex justify-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onViewProfile(u)}>
                        {t('studentsPage.profile')}
                      </Button>
                      {(auth?.role === 'teacher' || auth?.role === 'team') ? (
                        <Button
                          variant={auth?.role === 'teacher' ? 'outline' : (u?.isSuspended ? 'outline' : 'destructive')}
                          size="sm"
                          className={
                            auth?.role === 'teacher'
                              ? (u?.isSuspended
                                ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                : 'border-brand/40 text-brand hover:bg-brand/5')
                              : undefined
                          }
                          onClick={() => onToggleSuspend(u)}
                        >
                          {u?.isSuspended ? (isRtl ? 'تفعيل' : 'Activate') : (isRtl ? 'إيقاف' : 'Suspend')}
                        </Button>
                      ) : null}
                      {!isTeacherOrTeam ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => onEdit(u)}>
                            {t('studentsPage.edit')}
                          </Button>
                        </>
                      ) : null}
                      <Button variant="destructive" size="sm" onClick={() => onDelete(u._id || u.id)}>
                        {t('studentsPage.delete')}
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      <StudentModal
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSaved={() => {
          setOpen(false)
          load()
        }}
      />

      <StudentProfileModal open={openProfile} onOpenChange={setOpenProfile} userId={profileUserId} />
    </div>
  )
}

function StudentProfileModal({ open, onOpenChange, userId }) {
  const { notify } = useToast()
  const { t, isRtl } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!open || !userId) return
      try {
        setLoading(true)
        setStats(null)
        const res = await api.get(`/students/${userId}/profile`)
        if (mounted) setUser(res.data)

        try {
          const statsRes = await api.get(`/students/${userId}/stats`)
          if (mounted) setStats(statsRes.data)
        } catch (e) {
          // ignore stats error
        }
      } catch (e) {
        notify({ title: t('studentsPage.failedToLoadProfile'), description: e?.response?.data?.message || t('studentsPage.error'), variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [open, userId, notify])

  const info = user?.profile || {}

  function formatNum(x) {
    if (x === null || x === undefined) return '-'
    const n = Number(x)
    if (!Number.isFinite(n)) return '-'
    const s = n.toFixed(2)
    return s.replace(/\.00$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '')
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isRtl ? 'ملف الطالب' : 'Student Profile'}>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner />
          {t('studentsPage.loading')}
        </div>
      ) : !user ? (
        <div className="text-slate-600 dark:text-slate-300 text-sm">{t('studentsPage.noData')}</div>
      ) : (
        <div className="gap-3 grid">

          <div className={"flex items-center gap-3 mb-2 " + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
            <div className={"flex-1 " + (isRtl ? 'text-right' : 'text-left')}>
              <div className="mb-1 font-bold text-xl break-words">{user.name || '-'}</div>
              <div className="mb-3 font-medium text-slate-500 text-sm">{user.email}</div>
              <div className="font-semibold text-sm">{isRtl ? 'رقم الطالب:' : 'Student ID:'} {user.studentId || '-'}</div>
              <div className="font-semibold text-sm">{isRtl ? 'الحالة:' : 'Status:'} {user.status || '-'}</div>
            </div>
            {user?.profile?.avatarUrl ? (
              <img
                src={user.profile.avatarUrl}
                alt="avatar"
                className="border border-black/5 rounded-2xl w-24 h-24 object-cover shrink-0"
              />
            ) : (
              <div className="flex justify-center items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-24 h-24 shrink-0">
                <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
            )}
          </div>

          <div className="gap-2 grid grid-cols-1 md:grid-cols-2 mt-2">
            <div className="flex flex-col justify-center items-end p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="mb-1 w-full font-semibold text-slate-500 text-right">{isRtl ? 'العنوان' : 'Address'}</div>
              <div className="w-full text-sm text-right">{info.address || info.governorate || '-'}</div>
            </div>
            <div className="flex flex-col justify-center items-end p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="mb-1 w-full font-semibold text-slate-500 text-right">{isRtl ? 'الهاتف' : 'Phone'}</div>
              <div className="w-full text-sm text-right" dir="ltr">{info.studentPhone || info.phone || '-'}</div>
            </div>
          </div>

          <div className="gap-2 grid grid-cols-1 md:grid-cols-2 mt-2">
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="mb-1 font-semibold text-slate-500">{isRtl ? 'المدرسة' : 'School'}</div>
              <div className="text-sm">{info.schoolName || '-'}</div>
            </div>
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="mb-1 font-semibold text-slate-500">{isRtl ? 'هاتف ولي الأمر' : 'Parent Phone'}</div>
              <div className="text-sm" dir="ltr">{info.parentPhone || '-'}</div>
            </div>
          </div>

          <div className="gap-2 grid grid-cols-1 md:grid-cols-3 mt-2">
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="mb-1 font-semibold text-slate-500">{isRtl ? 'الصف' : 'Grade'}</div>
              <div className="text-sm">
                {(() => {
                  const v = String(info.gradeYear || '').trim()
                  if (!v) return '-'
                  if (v === '1_secondary' || v === 'secondary_1') return isRtl ? 'الصف الأول الثانوي' : '1st Secondary'
                  if (v === '2_secondary' || v === 'secondary_2') return isRtl ? 'الصف الثاني الثانوي' : '2nd Secondary'
                  if (v === '3_secondary' || v === 'secondary_3') return isRtl ? 'الصف الثالث الثانوي' : '3rd Secondary'
                  return v
                })()}
              </div>
            </div>
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="mb-1 font-semibold text-slate-500">{isRtl ? 'القسم' : 'Section'}</div>
              <div className="text-sm">
                {(() => {
                  const v = String(info.section || '').trim()
                  if (!v) return '-'
                  if (v === 'math') return isRtl ? 'علمي رياضة' : 'Science (Math)'
                  if (v === 'science') return isRtl ? 'علمي علوم' : 'Science (Biology)'
                  if (v === 'literature') return isRtl ? 'أدبي' : 'Literature'
                  return v
                })()}
              </div>
            </div>
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="mb-1 font-semibold text-slate-500">{isRtl ? 'الرقم القومي' : 'National ID'}</div>
              <div className="text-sm" dir="ltr">{info.nationalId || '-'}</div>
            </div>
          </div>

          <div className="mt-3 p-4 border border-black/5 dark:border-white/10 rounded-2xl">
            <div className={"font-extrabold text-lg mb-4 " + (isRtl ? 'text-right' : 'text-left')}>{isRtl ? 'إحصائيات الطالب' : 'Student Statistics'}</div>
            <div className="gap-3 grid grid-cols-2">
              <div className="bg-[#143B33] dark:bg-[rgba(20,184,166,0.15)] p-3 border border-[#1B4E44] dark:border-teal-900/50 rounded-xl">
                <div className="mb-1 font-semibold text-[#a1b8b2] text-xs text-right">{isRtl ? 'ساعات المشاهدة' : 'Watched Hours'}</div>
                <div className="font-bold text-white text-xl text-right">{stats ? formatNum(stats.courses?.watchedTotalHours) : 0}</div>
              </div>
              <div className="bg-brand/10 dark:bg-brand/20 p-3 border border-brand/20 dark:border-brand/30 rounded-xl">
                <div className="mb-1 font-semibold text-brand-600 dark:text-brand-200 text-xs text-right">{isRtl ? 'كورسات نفس السنة' : 'Same Year Courses'}</div>
                <div className="font-bold text-slate-900 dark:text-white text-xl text-right">{stats ? formatNum(stats.courses?.enrolledSameYear) : 0}</div>
              </div>
              <div className="bg-brand/5 dark:bg-brand/10 p-3 border border-brand/15 dark:border-brand/20 rounded-xl">
                <div className="mb-1 font-semibold text-brand-500 dark:text-brand-300 text-xs text-right">{isRtl ? 'أعلى درجة' : 'Highest Score'}</div>
                <div className="font-bold text-slate-900 dark:text-white text-xl text-right">{stats ? formatNum(stats.assessments?.bestPercent) : 0}%</div>
              </div>
              <div className="bg-[#142B28] dark:bg-[rgba(20,184,166,0.1)] p-3 border border-[#1A3834] dark:border-teal-900/30 rounded-xl">
                <div className="mb-1 font-semibold text-[#9ab1ad] text-xs text-right">{isRtl ? 'متوسط الدرجات' : 'Average Score'}</div>
                <div className="font-bold text-white text-xl text-right">{stats ? formatNum(stats.assessments?.avgPercent) : 0}%</div>
              </div>
            </div>
            <div className={"font-semibold text-sm mt-4 mb-2 " + (isRtl ? 'text-right' : 'text-left')}>{isRtl ? 'آخر النتائج' : 'Recent Results'}</div>
            <div className={"text-sm text-slate-500 " + (isRtl ? 'text-right' : 'text-left')}>
              {stats?.assessments?.recentResults?.length ? (
                <div className="gap-2 grid">
                  {stats.assessments.recentResults.slice(0, 3).map(r => (
                    <div key={r.attemptId} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{r.assessmentTitle}</span>
                      <span className="font-mono font-bold" dir="ltr">{formatNum(r.percent)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                isRtl ? 'لا توجد نتائج بعد.' : 'No results yet.'
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {t('common.close') === 'common.close' ? 'Close' : t('common.close')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function StudentModal({ open, onOpenChange, editing, onSaved }) {
  const { notify } = useToast()
  const { t } = useLanguage()
  const isEdit = Boolean(editing)

  const [name, setName] = useState(editing?.name || '')
  const [email, setEmail] = useState(editing?.email || '')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(editing?.status || 'approved')
  const [mustChangePassword, setMustChangePassword] = useState(editing?.mustChangePassword ?? true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(editing?.name || '')
    setEmail(editing?.email || '')
    setPassword('')
    setStatus(editing?.status || 'approved')
    setMustChangePassword(editing?.mustChangePassword ?? true)
  }, [editing, open])

  async function save(e) {
    e.preventDefault()
    try {
      setLoading(true)
      if (isEdit) {
        await api.patch(`/students/${editing._id || editing.id}`, {
          name,
          email,
          status,
          mustChangePassword,
          ...(password ? { password } : {})
        })
        notify({ title: t('studentsPage.updated') })
      } else {
        await api.post('/students', { name, email, password, status })
        notify({ title: t('studentsPage.created'), description: t('studentsPage.mustChangePasswordHint') })
      }
      onSaved()
    } catch (e2) {
      notify({ title: t('studentsPage.saveFailed'), description: e2?.response?.data?.message || t('studentsPage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isEdit ? t('studentsPage.editStudent') : t('studentsPage.createStudent')}>
      <form onSubmit={save} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('studentsPage.formName')}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('studentsPage.formEmail')}</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">{t('studentsPage.formStatus')}</label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'approved', label: t('studentsPage.statusApproved') },
              { value: 'pending', label: t('studentsPage.statusPending') },
              { value: 'rejected', label: t('studentsPage.statusRejected') }
            ]}
          />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-200 text-sm">
            {t('studentsPage.formPassword')} {isEdit ? t('studentsPage.passwordKeepHint') : ''}
          </label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
          <input type="checkbox" checked={mustChangePassword} onChange={(e) => setMustChangePassword(e.target.checked)} />
          {t('studentsPage.mustChangePassword')}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('studentsPage.cancel')}
          </Button>
          <Button type="submit" disabled={loading || !name.trim() || !email.trim() || (!isEdit && !password)}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="border-t-white w-4 h-4" />
                {t('studentsPage.saving')}
              </span>
            ) : (
              t('studentsPage.save')
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

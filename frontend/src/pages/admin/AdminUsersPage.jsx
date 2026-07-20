import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import Select from '../../components/ui/Select.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { Trash2, User } from 'lucide-react'

const ROLES = ['admin', 'teacher', 'team', 'student']
const TEACHING_SECTION_OPTIONS = [
  { value: '', label: 'كل الشعب' },
  { value: 'science', label: 'علمي' },
  { value: 'math', label: 'رياضة' },
  { value: 'literature', label: 'أدبي' }
]
const TEACHING_GRADE_YEAR_OPTIONS = [
  { value: '', label: 'كل السنوات' },
  { value: '1_secondary', label: 'الصف الأول الثانوي' },
  { value: '2_secondary', label: 'الصف الثاني الثانوي' },
  { value: '3_secondary', label: 'الصف الثالث الثانوي' }
]

function roleLabel(t, role) {
  const safe = role || ''
  const key = `roles.${safe}`
  const label = t(key)
  return label === key ? safe : label
}

export default function AdminUsersPage() {
  const { notify } = useToast()
  const { isRtl, t } = useLanguage()
  const [role, setRole] = useState('')
  const [q, setQ] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [toggleSuspendUserId, setToggleSuspendUserId] = useState('')
  const [toggleSuspendNext, setToggleSuspendNext] = useState(false)
  const [toggleSuspendLoading, setToggleSuspendLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [openProfile, setOpenProfile] = useState(false)
  const [profileUserId, setProfileUserId] = useState('')

  const [deleteUserId, setDeleteUserId] = useState('')
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => rows, [rows])

  async function load() {
    try {
      setLoading(true)
      const params = {}
      if (role) params.role = role
      if (q && q.trim()) params.q = q.trim()
      const res = await api.get('/admin/users', { params })
      setRows(res.data)
    } catch (e) {
      notify({ title: t('adminUsersPage.failedToLoad'), description: e?.response?.data?.message || t('common.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, q])

  async function onDelete(userId) {
    setDeleteUserId(String(userId || ''))
  }

  async function runDelete() {
    const id = deleteUserId
    if (!id) return
    try {
      setDeleting(true)
      await api.delete(`/admin/users/${id}`)
      notify({ title: t('adminUsersPage.deleted') })
      setDeleteUserId('')
      load()
    } catch (e) {
      notify({ title: t('adminUsersPage.deleteFailed'), description: e?.response?.data?.message || t('common.error'), variant: 'destructive' })
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

  function onToggleSuspend(user) {
    const id = String(user?._id || user?.id || '')
    if (!id) return
    setToggleSuspendUserId(id)
    setToggleSuspendNext(!Boolean(user?.isSuspended))
  }

  async function runToggleSuspend() {
    const id = toggleSuspendUserId
    if (!id) return
    try {
      setToggleSuspendLoading(true)
      if (toggleSuspendNext) {
        await api.patch(`/admin/users/${id}/suspend`, { reason: '' })
        notify({ title: isRtl ? 'تم إيقاف الحساب' : 'Account suspended' })
      } else {
        await api.patch(`/admin/users/${id}/activate`)
        notify({ title: isRtl ? 'تم تفعيل الحساب' : 'Account activated' })
      }
      setToggleSuspendUserId('')
      load()
    } catch (e) {
      notify({ title: isRtl ? 'فشل تحديث الحساب' : 'Failed to update account', description: e?.response?.data?.message || t('common.error'), variant: 'destructive' })
    } finally {
      setToggleSuspendLoading(false)
    }
  }

  return (
    <div className="gap-4 grid">
      <ConfirmDialog
        open={Boolean(toggleSuspendUserId)}
        onOpenChange={(v) => {
          if (!v) setToggleSuspendUserId('')
        }}
        title={toggleSuspendNext ? (isRtl ? 'إيقاف الحساب' : 'Suspend account') : (isRtl ? 'تفعيل الحساب' : 'Activate account')}
        description={toggleSuspendNext ? (isRtl ? 'هل أنت متأكد من إيقاف هذا الحساب؟' : 'Are you sure you want to suspend this account?') : (isRtl ? 'هل أنت متأكد من تفعيل هذا الحساب؟' : 'Are you sure you want to activate this account?')}
        confirmLabel={toggleSuspendNext ? (isRtl ? 'إيقاف' : 'Suspend') : (isRtl ? 'تفعيل' : 'Activate')}
        cancelLabel={t('common.cancel') === 'common.cancel' ? 'Cancel' : t('common.cancel')}
        loading={toggleSuspendLoading}
        onConfirm={runToggleSuspend}
      />

      <ConfirmDialog
        open={Boolean(deleteUserId)}
        onOpenChange={(v) => {
          if (!v) setDeleteUserId('')
        }}
        title={t('adminUsersPage.confirmDelete')}
        description={t('adminUsersPage.confirmDelete')}
        confirmLabel={t('adminUsersPage.delete') === 'adminUsersPage.delete' ? 'Delete' : t('adminUsersPage.delete')}
        cancelLabel={t('common.cancel') === 'common.cancel' ? 'Cancel' : t('common.cancel')}
        loading={deleting}
        icon={<Trash2 className="w-6 h-6 text-red-700" />}
        onConfirm={runDelete}
      />
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
          <span className="bg-emerald-500 rounded-full w-1.5 h-1.5" />
          {isRtl ? 'مساحة الأدمن' : 'Admin workspace'}
        </div>
        <div className="mt-2">
          <h1 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
            {t('adminUsersPage.title')}
          </h1>
          <div className="flex justify-center mt-2">
            <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
              <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.subtitle')}</p>
      </div>

      <div className={'flex ' + (isRtl ? 'justify-start' : 'justify-end')}>
        <Button onClick={onCreate}>{t('adminUsersPage.createUser')}</Button>
      </div>

      <div className="gap-3 grid grid-cols-1 md:grid-cols-3">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.filterByRole')}</label>
          <Select
            value={role}
            onChange={(e) => setRole(String(e?.target?.value ?? e ?? ''))}
            placeholder={t('adminUsersPage.all')}
            options={[
              { value: '', label: t('adminUsersPage.all') },
              ...ROLES.map((r) => ({ value: r, label: roleLabel(t, r) }))
            ]}
          />
        </div>
        <div className="gap-1 grid md:col-span-2">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.search')}</label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('adminUsersPage.searchPlaceholder')} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner />
          {t('adminUsersPage.loading')}
        </div>
      ) : (
        <div className="border border-black/5 rounded-xl overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>{t('adminUsersPage.table.name')}</TH>
                <TH>{t('adminUsersPage.table.email')}</TH>
                <TH>{t('adminUsersPage.table.role')}</TH>
                <TH>{t('adminUsersPage.table.teamId')}</TH>
                <TH>{t('adminUsersPage.table.studentId')}</TH>
                <TH>{t('adminUsersPage.table.mustChangePassword')}</TH>
                <TH>{isRtl ? 'الحالة' : 'Status'}</TH>
                <TH className="text-right">{t('adminUsersPage.table.actions')}</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((u) => (
                <TR key={u._id || u.id}>
                  <TD>{u.name}</TD>
                  <TD className="text-slate-700">{u.email}</TD>
                  <TD>{roleLabel(t, u.role)}</TD>
                  <TD>{u.teamId || '-'}</TD>
                  <TD>{u.studentId || '-'}</TD>
                  <TD>{u.mustChangePassword ? t('common.yes') : t('common.no')}</TD>
                  <TD>
                    {u.isSuspended ? (
                      <span className="inline-flex items-center bg-red-50 px-2 py-1 border border-red-200 rounded-full text-red-700 text-xs">
                        {isRtl ? 'موقوف' : 'Suspended'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-emerald-50 px-2 py-1 border border-emerald-200 rounded-full text-emerald-700 text-xs">
                        {isRtl ? 'نشط' : 'Active'}
                      </span>
                    )}
                  </TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onViewProfile(u)}>
                        {t('adminUsersPage.actions.profile')}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(u)}>
                        {t('adminUsersPage.actions.edit')}
                      </Button>
                      <Button
                        variant={u.isSuspended ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => onToggleSuspend(u)}
                      >
                        {u.isSuspended ? (isRtl ? 'تفعيل' : 'Activate') : (isRtl ? 'إيقاف' : 'Suspend')}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(u._id || u.id)}>
                        {t('adminUsersPage.actions.delete')}
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      <UserModal
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSaved={() => {
          setOpen(false)
          load()
        }}
      />

      <UserProfileModal open={openProfile} onOpenChange={setOpenProfile} userId={profileUserId} />
    </div>
  )
}

function UserProfileModal({ open, onOpenChange, userId }) {
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
        const res = await api.get(`/admin/users/${userId}/profile`)
        if (mounted) setUser(res.data)

        if (res.data?.role === 'student') {
          try {
            const statsRes = await api.get(`/admin/users/${userId}/stats`);
            if (mounted) setStats(statsRes.data);
          } catch (e) {
            // ignore stats error
          }
        }
      } catch (e) {
        notify({ title: 'Failed to load profile', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
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
  const role = user?.role || ''

  function formatNum(x) {
    if (x === null || x === undefined) return '-'
    const n = Number(x)
    if (!Number.isFinite(n)) return '-'
    const s = n.toFixed(2)
    return s.replace(/\.00$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '')
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={role === 'student' ? (isRtl ? 'ملف الطالب' : 'Student Profile') : t('adminUsersPage.profileModal.title')}>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner />
          {t('adminUsersPage.loading')}
        </div>
      ) : !user ? (
        <div className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.noData')}</div>
      ) : role === 'student' ? (
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
                <User className="w-10 h-10 text-slate-400" />
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
      ) : (
        <div className="gap-3 grid">
          <div className="flex items-center gap-3">
            {user?.profile?.avatarUrl ? (
              <img
                src={user.profile.avatarUrl}
                alt="avatar"
                className="border border-black/5 rounded-full w-16 h-16 object-cover"
              />
            ) : (
              <div className="bg-slate-50 border border-slate-300 border-dashed rounded-full w-16 h-16 shrink-0" />
            )}
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-slate-600 dark:text-slate-300 text-sm">{user.email}</div>
              <div className="text-slate-500 text-xs">
                {t('adminUsersPage.profileModal.role')}: {roleLabel(t, user.role)}
              </div>
              {user.teamId ? (
                <div className="text-slate-500 text-xs">
                  {t('adminUsersPage.profileModal.teamId')}: {user.teamId}
                </div>
              ) : null}
              {user.teamTask ? (
                <div className="text-slate-500 text-xs">
                  {t('adminUsersPage.profileModal.teamTask')}: {user.teamTask}
                </div>
              ) : null}
            </div>
          </div>

          <div className="gap-2 grid">
            <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
              <div className="p-3 border border-black/5 rounded-lg">
                <div className="text-slate-500 text-xs">{t('adminUsersPage.profileModal.phone')}</div>
                <div className="text-sm">{info.phone || '-'}</div>
              </div>
              <div className="p-3 border border-black/5 rounded-lg">
                <div className="text-slate-500 text-xs">{t('adminUsersPage.profileModal.address')}</div>
                <div className="text-sm">{info.address || '-'}</div>
              </div>
            </div>

            {role === 'teacher' ? (
              <>
                <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
                  <div className="p-3 border border-black/5 rounded-lg">
                    <div className="text-slate-500 text-xs">{t('adminUsersPage.profileModal.teachingSubject')}</div>
                    <div className="text-sm">{info.teachingSubject || '-'}</div>
                  </div>
                  <div className="p-3 border border-black/5 rounded-lg">
                    <div className="text-slate-500 text-xs">{t('adminUsersPage.profileModal.teachingSection')}</div>
                    <div className="text-sm">
                      {(() => {
                        const key = info.teachingSection
                        if (!key) return '-'
                        const translated = t(`landing.chooseTeachers.filters.section_${String(key)}`)
                        return translated && translated !== `landing.chooseTeachers.filters.section_${String(key)}` ? translated : String(key)
                      })()}
                    </div>
                  </div>
                  <div className="md:col-span-2 p-3 border border-black/5 rounded-lg">
                    <div className="text-slate-500 text-xs">{t('adminUsersPage.profileModal.teachingGradeYear')}</div>
                    <div className="text-sm">
                      {(() => {
                        const key = info.teachingGradeYear
                        if (!key) return '-'
                        const translated = t(`landing.gradeYears.${String(key)}`)
                        return translated && translated !== `landing.gradeYears.${String(key)}` ? translated : String(key)
                      })()}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {role === 'team' ? (
              <>
                {user.teamTask ? (
                  <div className="p-3 border border-black/5 rounded-lg">
                    <div className="text-slate-500 text-xs">{t('adminUsersPage.profileModal.teamTask')}</div>
                    <div className="text-sm">{user.teamTask}</div>
                  </div>
                ) : null}
              </>
            ) : null}

            <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
              <div className="p-3 border border-black/5 rounded-lg">
                <div className="text-slate-500 text-xs">{t('adminUsersPage.profileModal.status')}</div>
                <div className="text-sm">{user.status || '-'}</div>
              </div>
              <div className="p-3 border border-black/5 rounded-lg">
                <div className="text-slate-500 text-xs">{t('adminUsersPage.profileModal.mustChangePassword')}</div>
                <div className="text-sm">{user.mustChangePassword ? t('common.yes') : t('common.no')}</div>
              </div>
            </div>

            <div className="p-3 border border-black/5 rounded-lg">
              <div className="text-slate-500 text-xs">{t('adminUsersPage.profileModal.bio')}</div>
              <div className="text-sm whitespace-pre-wrap">{info.bio || '-'}</div>
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

function UserModal({ open, onOpenChange, editing, onSaved }) {
  const { notify } = useToast()
  const { t } = useLanguage()
  const isEdit = Boolean(editing)

  const [name, setName] = useState(editing?.name || '')
  const [email, setEmail] = useState(editing?.email || '')
  const [role, setRole] = useState(editing?.role || 'student')
  const [teamId, setTeamId] = useState(editing?.teamId || '')
  const [password, setPassword] = useState('')
  const [mustChangePassword, setMustChangePassword] = useState(editing?.mustChangePassword ?? true)
  const [teachingSubject, setTeachingSubject] = useState(editing?.profile?.teachingSubject || '')
  const [teachingSections, setTeachingSections] = useState(() => {
    const fromArr = Array.isArray(editing?.profile?.teachingSections) ? editing.profile.teachingSections : null
    if (fromArr && fromArr.length) return fromArr.map((x) => String(x))
    const single = editing?.profile?.teachingSection
    return single ? [String(single)] : []
  })
  const [teachingGradeYear, setTeachingGradeYear] = useState(editing?.profile?.teachingGradeYear || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(editing?.name || '')
    setEmail(editing?.email || '')
    setRole(editing?.role || 'student')
    setTeamId(editing?.teamId || '')
    setPassword('')
    setMustChangePassword(editing?.mustChangePassword ?? true)
    setTeachingSubject(editing?.profile?.teachingSubject || '')
    const fromArr = Array.isArray(editing?.profile?.teachingSections) ? editing.profile.teachingSections : null
    if (fromArr && fromArr.length) setTeachingSections(fromArr.map((x) => String(x)))
    else {
      const single = editing?.profile?.teachingSection
      setTeachingSections(single ? [String(single)] : [])
    }
    setTeachingGradeYear(editing?.profile?.teachingGradeYear || '')
  }, [editing, open])

  function toggleTeachingSection(value) {
    const v = String(value || '').trim()
    if (!v) return
    setTeachingSections((prev) => {
      const set = new Set((Array.isArray(prev) ? prev : []).map((x) => String(x)))
      if (set.has(v)) set.delete(v)
      else set.add(v)
      return Array.from(set)
    })
  }

  async function save(e) {
    e.preventDefault()
    try {
      setLoading(true)
      if (isEdit) {
        await api.patch(`/admin/users/${editing._id || editing.id}`,
          {
            name,
            email,
            role,
            teamId: teamId && teamId.trim() ? teamId.trim() : undefined,
            mustChangePassword,
            ...(role === 'teacher' ? {
              teachingSubject,
              teachingSections,
              teachingSection: Array.isArray(teachingSections) && teachingSections.length ? teachingSections[0] : '',
              teachingGradeYear
            } : {}),
            ...(password ? { password } : {})
          }
        )
        notify({ title: t('adminUsersPage.toasts.updated') })
      } else {
        await api.post('/admin/users', {
          name,
          email,
          role,
          teamId: teamId && teamId.trim() ? teamId.trim() : undefined,
          ...(role === 'teacher' ? {
            teachingSubject,
            teachingSections,
            teachingSection: Array.isArray(teachingSections) && teachingSections.length ? teachingSections[0] : '',
            teachingGradeYear
          } : {}),
          password
        })
        notify({ title: t('adminUsersPage.toasts.created'), description: t('adminUsersPage.toasts.mustChangePasswordHint') })
      }
      onSaved()
    } catch (e2) {
      notify({ title: t('adminUsersPage.toasts.saveFailed'), description: e2?.response?.data?.message || t('common.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('adminUsersPage.modal.editTitle') : t('adminUsersPage.modal.createTitle')}
    >
      <form onSubmit={save} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.form.name')}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.form.email')}</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.form.role')}</label>
          <Select
            value={role}
            onChange={(e) => setRole(String(e?.target?.value ?? e ?? 'student'))}
            options={ROLES.map((r) => ({ value: r, label: roleLabel(t, r) }))}
          />
        </div>

        {role !== 'admin' ? (
          <div className="gap-1 grid">
            <label className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.form.teamIdOptional')}</label>
            <Input value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder={t('adminUsersPage.form.teamIdPlaceholder')} />
          </div>
        ) : null}

        {isEdit ? (
          <label className="flex items-center gap-3 text-slate-700 text-sm">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[rgb(212,175,55)] cursor-pointer"
              checked={mustChangePassword}
              onChange={(e) => setMustChangePassword(e.target.checked)}
            />
            {t('adminUsersPage.form.forcePasswordChange')}
          </label>
        ) : null}

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">
            {isEdit ? t('adminUsersPage.form.newPasswordOptional') : t('adminUsersPage.form.temporaryPassword')}
          </label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </div>

        {role === 'teacher' ? (
          <>
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.form.teacherSubject')}</label>
              <Input value={teachingSubject} onChange={(e) => setTeachingSubject(e.target.value)} placeholder={t('adminUsersPage.form.teacherSubjectPlaceholder')} />
            </div>
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.form.teachingSection')}</label>
              <div className="bg-white/70 p-3 border border-black/5 rounded-2xl">
                <div className="gap-2 grid">
                  {TEACHING_SECTION_OPTIONS.filter((o) => o.value).map((o) => (
                    <label
                      key={o.value}
                      className="flex justify-between items-center gap-3 bg-white/60 hover:bg-white px-3 py-2 border border-black/5 rounded-xl text-slate-800 text-sm cursor-pointer"
                    >
                      <span className="font-medium">{o.label}</span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[rgb(212,175,55)] cursor-pointer"
                        checked={teachingSections.includes(String(o.value))}
                        onChange={() => toggleTeachingSection(o.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.form.teachingGradeYear')}</label>
              <Select
                value={teachingGradeYear}
                onChange={(e) => setTeachingGradeYear(String(e?.target?.value ?? e ?? ''))}
                options={TEACHING_GRADE_YEAR_OPTIONS}
              />
            </div>
          </>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="border-t-white w-4 h-4" />
                {t('adminUsersPage.saving')}
              </span>
            ) : (
              t('common.save')
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

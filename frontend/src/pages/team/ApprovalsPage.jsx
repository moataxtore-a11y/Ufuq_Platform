import { useEffect, useState } from 'react'
import { api } from '../../utils/api.js'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
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

function AdminStudentProfileModal({ open, onOpenChange, userId }) {
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

        // Fetch profile
        let profileRes;
        try {
          profileRes = await api.get(`/admin/users/${userId}/profile`)
        } catch {
          profileRes = await api.get(`/students/${userId}/profile`)
        }
        if (mounted) setUser(profileRes.data)

        try {
          let statsRes;
          try {
            statsRes = await api.get(`/admin/users/${userId}/stats`)
          } catch {
            statsRes = await api.get(`/students/${userId}/stats`)
          }
          if (mounted) setStats(statsRes.data)
        } catch (e) {
          // ignore stats error here
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
          {t('adminUsersPage.loading') === 'adminUsersPage.loading' ? 'Loading' : t('adminUsersPage.loading')}
        </div>
      ) : !user ? (
        <div className="text-slate-600 dark:text-slate-300 text-sm">{t('adminUsersPage.noData') === 'adminUsersPage.noData' ? 'No data' : t('adminUsersPage.noData')}</div>
      ) : (
        <div className="gap-3 grid">

          <div className={"flex items-center gap-3 mb-2 " + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
            <div className={"flex-1 " + (isRtl ? 'text-right' : 'text-left')}>
              <div className="text-xl font-bold mb-1 break-words">{user.name || '-'}</div>
              <div className="text-sm text-slate-500 font-medium mb-3">{user.email}</div>
              <div className="text-sm font-semibold">{isRtl ? 'رقم الطالب:' : 'Student ID:'} {user.studentId || '-'}</div>
              <div className="text-sm font-semibold">{isRtl ? 'الحالة:' : 'Status:'} {user.status || '-'}</div>
            </div>
            {user?.profile?.avatarUrl ? (
              <img
                src={user.profile.avatarUrl}
                alt="avatar"
                className="border border-black/5 rounded-2xl w-24 h-24 object-cover shrink-0"
              />
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
            )}
          </div>

          <div className="gap-2 grid grid-cols-1 md:grid-cols-2 mt-2">
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl flex flex-col justify-center items-end text-right">
              <div className="text-slate-500 font-semibold mb-1 w-full text-right">{isRtl ? 'العنوان' : 'Address'}</div>
              <div className="text-sm w-full text-right">{info.address || info.governorate || '-'}</div>
            </div>
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl flex flex-col justify-center items-end text-right">
              <div className="text-slate-500 font-semibold mb-1 w-full text-right">{isRtl ? 'الهاتف' : 'Phone'}</div>
              <div className="text-sm w-full text-right" dir="ltr">{info.studentPhone || info.phone || '-'}</div>
            </div>
          </div>

          <div className="gap-2 grid grid-cols-1 md:grid-cols-2 mt-2">
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="text-slate-500 font-semibold mb-1">{isRtl ? 'المدرسة' : 'School'}</div>
              <div className="text-sm">{info.schoolName || '-'}</div>
            </div>
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="text-slate-500 font-semibold mb-1">{isRtl ? 'هاتف ولي الأمر' : 'Parent Phone'}</div>
              <div className="text-sm" dir="ltr">{info.parentPhone || '-'}</div>
            </div>
          </div>

          <div className="gap-2 grid grid-cols-1 md:grid-cols-3 mt-2">
            <div className="p-3 border border-black/5 dark:border-white/10 rounded-2xl text-right">
              <div className="text-slate-500 font-semibold mb-1">{isRtl ? 'الصف' : 'Grade'}</div>
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
              <div className="text-slate-500 font-semibold mb-1">{isRtl ? 'القسم' : 'Section'}</div>
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
              <div className="text-slate-500 font-semibold mb-1">{isRtl ? 'الرقم القومي' : 'National ID'}</div>
              <div className="text-sm" dir="ltr">{info.nationalId || '-'}</div>
            </div>
          </div>

          <div className="border border-black/5 dark:border-white/10 rounded-2xl p-4 mt-3">
            <div className={"font-extrabold text-lg mb-4 " + (isRtl ? 'text-right' : 'text-left')}>{isRtl ? 'إحصائيات الطالب' : 'Student Statistics'}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#143B33] dark:bg-[rgba(20,184,166,0.15)] rounded-xl p-3 border border-[#1B4E44] dark:border-teal-900/50">
                <div className="text-[#a1b8b2] text-xs font-semibold text-right mb-1">{isRtl ? 'ساعات المشاهدة' : 'Watched Hours'}</div>
                <div className="text-white text-xl font-bold text-right">{stats ? formatNum(stats.courses?.watchedTotalHours) : 0}</div>
              </div>
              <div className="bg-[#382B14] dark:bg-[rgba(212,175,55,0.15)] rounded-xl p-3 border border-[#4F3C1C] dark:border-yellow-900/50">
                <div className="text-[#c7baa6] text-xs font-semibold text-right mb-1">{isRtl ? 'كورسات نفس السنة' : 'Same Year Courses'}</div>
                <div className="text-white text-xl font-bold text-right">{stats ? formatNum(stats.courses?.enrolledSameYear) : 0}</div>
              </div>
              <div className="bg-[#2E2818] dark:bg-[rgba(212,175,55,0.1)] rounded-xl p-3 border border-[#403822] dark:border-yellow-900/30">
                <div className="text-[#b1aa9c] text-xs font-semibold text-right mb-1">{isRtl ? 'أعلى درجة' : 'Highest Score'}</div>
                <div className="text-white text-xl font-bold text-right">{stats ? formatNum(stats.assessments?.bestPercent) : 0}%</div>
              </div>
              <div className="bg-[#142B28] dark:bg-[rgba(20,184,166,0.1)] rounded-xl p-3 border border-[#1A3834] dark:border-teal-900/30">
                <div className="text-[#9ab1ad] text-xs font-semibold text-right mb-1">{isRtl ? 'متوسط الدرجات' : 'Average Score'}</div>
                <div className="text-white text-xl font-bold text-right">{stats ? formatNum(stats.assessments?.avgPercent) : 0}%</div>
              </div>
            </div>
            <div className={"font-semibold text-sm mt-4 mb-2 " + (isRtl ? 'text-right' : 'text-left')}>{isRtl ? 'آخر النتائج' : 'Recent Results'}</div>
            <div className={"text-sm text-slate-500 " + (isRtl ? 'text-right' : 'text-left')}>
              {stats?.assessments?.recentResults?.length ? (
                <div className="gap-2 grid">
                  {stats.assessments.recentResults.slice(0, 3).map(r => (
                    <div key={r.attemptId} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{r.assessmentTitle}</span>
                      <span className="font-bold font-mono" dir="ltr">{formatNum(r.percent)}%</span>
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

export default function ApprovalsPage() {
  const { notify } = useToast()
  const { auth } = useAuth()
  const { t } = useLanguage()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [reasonById, setReasonById] = useState({})
  const [teamById, setTeamById] = useState({})
  const [autoAssign, setAutoAssign] = useState({ open: false, userId: null })

  const [openProfile, setOpenProfile] = useState(false)
  const [profileUserId, setProfileUserId] = useState('')

  const isScoped = auth?.role === 'teacher' || auth?.role === 'team'
  const teamId = auth?.teamId
  const isAdmin = auth?.role === 'admin'

  const visibleRows = !isScoped || !teamId ? rows : rows.filter((r) => r?.teamId && r.teamId === teamId)

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/approvals/pending-students')
      setRows(res.data)
    } catch (e) {
      notify({ title: t('approvalsPage.failedToLoad'), description: e?.response?.data?.message || t('approvalsPage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()

    try {
      sessionStorage.setItem('seen_badge_pendingStudents', String(Date.now()))
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onViewProfile(userId) {
    if (!isAdmin) return
    setProfileUserId(String(userId || ''))
    setOpenProfile(true)
  }

  async function approve(userId) {
    try {
      await api.patch(`/approvals/users/${userId}/approve`)
      notify({ title: t('approvalsPage.approved') })
      await load()
    } catch (e) {
      notify({ title: t('approvalsPage.approveFailed'), description: e?.response?.data?.message || t('approvalsPage.error'), variant: 'destructive' })
    }
  }

  async function reject(userId) {
    try {
      await api.patch(`/approvals/users/${userId}/reject`, { reason: reasonById[userId] || '' })
      notify({ title: t('approvalsPage.rejected') })
      await load()
    } catch (e) {
      notify({ title: t('approvalsPage.rejectFailed'), description: e?.response?.data?.message || t('approvalsPage.error'), variant: 'destructive' })
    }
  }

  async function assignTeam(userId) {
    try {
      const tid = teamById[userId]
      await api.patch(`/students/${userId}`, { teamId: typeof tid === 'string' ? tid : '' })
      notify({ title: t('approvalsPage.teamAssigned') })
      await load()
    } catch (e) {
      notify({ title: t('approvalsPage.assignTeamFailed'), description: e?.response?.data?.message || t('approvalsPage.error'), variant: 'destructive' })
    }
  }

  return (
    <div className="gap-4 grid">
      {isAdmin ? (
        <AdminStudentProfileModal open={openProfile} onOpenChange={setOpenProfile} userId={profileUserId} />
      ) : null}
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {t('approvalsPage.title')}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(212,175,55,0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{t('approvalsPage.subtitle')}</div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Spinner />
          {t('approvalsPage.loading')}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white/75 dark:bg-[#171717] p-5 border border-black/5 dark:border-white/10 rounded-3xl">
          <div className="flex flex-col justify-center items-center gap-3 text-center">
            <img src={noSvg} alt="" aria-hidden="true" className="w-12 h-12 object-contain" />
            <div className="font-semibold text-base" style={{ color: '#F74343' }}>
              {t('approvalsPage.empty')}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-black/5 rounded-xl overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>{t('approvalsPage.tableName')}</TH>
                <TH>{t('approvalsPage.tableEmail')}</TH>
                <TH>{t('approvalsPage.tableTeamId')}</TH>
                <TH>{t('approvalsPage.tableRequested')}</TH>
                <TH>{t('approvalsPage.tableRejectReason')}</TH>
                <TH className="text-right">{t('approvalsPage.tableActions')}</TH>
              </TR>
            </THead>
            <TBody>
              {visibleRows.map((u) => (
                <TR key={u._id || u.id}>
                  <TD>{u.name}</TD>
                  <TD>
                    {isAdmin ? (
                      <button type="button" className="text-brand underline underline-offset-4" onClick={() => onViewProfile(u._id || u.id)}>
                        {u.email}
                      </button>
                    ) : (
                      u.email
                    )}
                  </TD>
                  <TD>
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={teamById[u._id || u.id] ?? (u.teamId || '')}
                          onChange={(e) => setTeamById((prev) => ({ ...prev, [u._id || u.id]: e.target.value }))}
                          placeholder={t('approvalsPage.teamIdPlaceholder')}
                          className="h-9"
                        />
                        <Button size="sm" variant="secondary" onClick={() => assignTeam(u._id || u.id)}>
                          {t('approvalsPage.assignTeam')}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setAutoAssign({ open: true, userId: u._id || u.id })}>
                          {t('approvalsPage.autoAssign')}
                        </Button>
                      </div>
                    ) : (
                      u.teamId || '-'
                    )}
                  </TD>
                  <TD className="text-slate-700">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</TD>
                  <TD>
                    <Input
                      value={reasonById[u._id || u.id] || ''}
                      onChange={(e) => setReasonById((prev) => ({ ...prev, [u._id || u.id]: e.target.value }))}
                      placeholder={t('approvalsPage.optional')}
                    />
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-2">
                      {isAdmin ? (
                        <Button size="sm" variant="outline" onClick={() => onViewProfile(u._id || u.id)}>
                          {t('adminUsersPage.actions.profile') === 'adminUsersPage.actions.profile' ? 'Profile' : t('adminUsersPage.actions.profile')}
                        </Button>
                      ) : null}
                      <Button size="sm" variant="secondary" onClick={() => reject(u._id || u.id)}>
                        {t('approvalsPage.reject')}
                      </Button>
                      <Button size="sm" onClick={() => approve(u._id || u.id)}>
                        {t('approvalsPage.approve')}
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      <AutoAssignTeamModal
        open={autoAssign.open}
        onOpenChange={(v) => setAutoAssign((s) => ({ ...s, open: v }))}
        userId={autoAssign.userId}
        onAssigned={async ({ userId, teamId }) => {
          setTeamById((prev) => ({ ...prev, [userId]: teamId }))
          setAutoAssign({ open: false, userId: null })
          await assignTeam(userId)
        }}
      />
    </div>
  )
}

function AutoAssignTeamModal({ open, onOpenChange, userId, onAssigned }) {
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

  useEffect(() => {
    if (!open) return
    setTeacherId('')
    setName('')
    setEmail('')
    setPassword('')
    setTeamTask('')
    setTeamPermissions('approvals')
    setTeachers([])

      ; (async () => {
        try {
          const res = await api.get('/admin/users', { params: { role: 'teacher' } })
          setTeachers(Array.isArray(res.data) ? res.data : [])
        } catch (e) {
          notify({ title: t('approvalsPage.failedToLoadTeachers'), description: e?.response?.data?.message || t('approvalsPage.error'), variant: 'destructive' })
        }
      })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const selectedTeacher = (teachers || []).find((x) => String(x?._id || x?.id) === String(teacherId)) || null
  const selectedTeamId = selectedTeacher?.teamId || ''
  const selectedSubject = selectedTeacher?.profile?.teachingSubject || ''

  const teacherOptions = (teachers || []).map((x) => {
    const id = x?._id || x?.id
    const subject = x?.profile?.teachingSubject || ''
    const label = subject ? `${x?.name || '-'} — ${subject}` : `${x?.name || '-'}`
    return { value: String(id), label }
  })

  async function submit(e) {
    e.preventDefault()
    if (!userId) return

    try {
      setLoading(true)

      if (!selectedTeamId) {
        notify({ title: t('approvalsPage.teacherHasNoTeamId'), variant: 'destructive' })
        return
      }

      await api.post('/admin/users', {
        name,
        email,
        password,
        role: 'team',
        teamId: selectedTeamId,
        teamTask: typeof teamTask === 'string' ? teamTask : '',
        teamPermissions: normalizePermissions(teamPermissions)
      })

      notify({ title: t('approvalsPage.teamMemberCreated') })
      onAssigned?.({ userId, teamId: selectedTeamId })
    } catch (e2) {
      notify({ title: t('approvalsPage.createTeamMemberFailed'), description: e2?.response?.data?.message || t('approvalsPage.error'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('approvalsPage.autoAssignTitle')}>
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('approvalsPage.chooseTeacher')}</label>
          <Select value={teacherId} onChange={(e) => setTeacherId(e?.target?.value ?? e)} options={teacherOptions} placeholder={t('approvalsPage.chooseTeacherPlaceholder')} />
          <div className="text-slate-600 dark:text-slate-300 text-xs">
            {t('approvalsPage.teacherSubject')}: {selectedSubject || '-'}
          </div>
          <div className="text-slate-600 dark:text-slate-300 text-xs">
            Team ID: {selectedTeamId || '-'}
          </div>
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('approvalsPage.teamMemberName')}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('approvalsPage.teamMemberEmail')}</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('approvalsPage.teamMemberPassword')}</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" dir="ltr" />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('approvalsPage.teamMemberTask')}</label>
          <Input value={teamTask} onChange={(e) => setTeamTask(e.target.value)} placeholder={t('approvalsPage.teamMemberTaskPlaceholder')} />
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{t('approvalsPage.teamMemberPermissions')}</label>
          <Input value={teamPermissions} onChange={(e) => setTeamPermissions(e.target.value)} dir="ltr" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('approvalsPage.cancel')}
          </Button>
          <Button type="submit" disabled={loading || !teacherId || !name.trim() || !email.trim() || !password}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="border-t-white w-4 h-4" />
                {t('approvalsPage.saving')}
              </span>
            ) : (
              t('approvalsPage.createAndAssign')
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

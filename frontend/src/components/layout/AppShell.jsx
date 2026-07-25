import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Search,
  Users,
  Wallet
} from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import { cn } from '../../utils/cn.js'
import { useAuth } from '../../context/AuthContext.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import logo from '../../cvg/logo (2)_3.webp'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { api } from '../../utils/api.js'
import defaultProfileAvatar from '../../cvg/profile.svg'

function roleNav(role) {
  if (role === 'admin') {
    return [
      { to: '/admin', key: 'overview', icon: LayoutDashboard },
      { to: '/admin/users', key: 'users', icon: Users },
      { to: '/admin/approvals', key: 'approvals', icon: CheckCircle },
      { to: '/profile', key: 'profile', icon: GraduationCap }
    ]
  }
  if (role === 'teacher') {
    return [
      { to: '/teacher', key: 'courses', icon: BookOpen },
      { to: '/teacher/team', key: 'my_team', icon: Users },
      { to: '/teacher/students', key: 'students', icon: Users },
      { to: '/teacher/assignments', key: 'assignments', icon: FileText },
      { to: '/teacher/assessments', key: 'assessments', icon: ListChecks },
      { to: '/teacher/assessments/grading', key: 'manual_grading', icon: ClipboardCheck },
      { to: '/teacher/grades', key: 'grades', icon: LayoutDashboard },
      { to: '/profile', key: 'profile', icon: GraduationCap }
    ]
  }
  return [
    { to: '/student', key: 'my_courses', icon: BookOpen },
    { to: '/student/assignments', key: 'assignments', icon: FileText },
    { to: '/student/assessments', key: 'assessments', icon: ListChecks },
    { to: '/student/grades', key: 'grades', icon: LayoutDashboard },
    { to: '/profile', key: 'profile', icon: GraduationCap }
  ]
}

export default function AppShell({ title, titleKey }) {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [me, setMe] = useState(null)
  const [walletBalance, setWalletBalance] = useState(null)
  const { isRtl, t } = useLanguage()

  const computedTitle = titleKey ? t(`dashboard.titles.${titleKey}`) : title

  const items = roleNav(auth?.role).map((it) => ({
    ...it,
    label: t(`dashboard.nav.${it.key}`)
  }))

  function onLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    let alive = true
    async function loadMe() {
      if (!auth?.token) return
      try {
        const res = await api.get('/users/me')
        if (alive) setMe(res.data)
      } catch {
        if (alive) setMe(null)
      }
    }
    async function loadWallet() {
      if (!auth?.token) return
      if (auth?.role !== 'student') return
      try {
        const res = await api.get('/wallet')
        const bal = Number(res?.data?.balance || 0)
        if (!alive) return
        setWalletBalance(Number.isFinite(bal) ? bal : 0)
      } catch {
        if (!alive) return
        setWalletBalance(null)
      }
    }
    loadMe()
    loadWallet()
    return () => { alive = false }
  }, [auth?.role, auth?.token, location.pathname])

  const displayName = String(me?.name || me?.email || auth?.email || '').trim()
  const avatarUrl = me?.profile?.avatarUrl || ''

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="relative bg-[#E0F3E9] dark:bg-[#0a0a0a] min-h-screen overflow-x-hidden text-slate-900 dark:text-slate-100">
      <div className="z-0 fixed inset-0 overflow-hidden pointer-events-none">
        <div className="top-[-10%] left-[-10%] absolute bg-brand/10 dark:bg-brand/[0.15] blur-[120px] rounded-full w-[50%] h-[50%] animate-blob-float" />
        <div className="right-[-10%] bottom-[-10%] absolute bg-brand/10 dark:bg-brand/[0.12] opacity-70 blur-[100px] rounded-full w-[40%] h-[40%] animate-blob-float" style={{ animationDelay: '2s' }} />
      </div>

      <header className="top-0 z-[100] fixed bg-white/30 dark:bg-[#0a0a0a]/30 shadow-glass-md backdrop-blur-glass-heavy border-white/20 dark:border-white/10 border-b w-full">
        <div className="flex items-center justify-between gap-3 mx-auto px-4 sm:px-6 py-2.5 w-full max-w-7xl">
          <div className={cn('flex items-center gap-3', isRtl ? 'flex-row-reverse' : 'flex-row')}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-icon shrink-0 rounded-full w-9 h-9 overflow-hidden border-2 border-slate-200 dark:border-white/20 p-0 hover:border-brand/30"
              aria-label={isRtl ? 'القائمة' : 'Menu'}
            >
              <img src={avatarUrl || defaultProfileAvatar} alt={displayName || 'User'} className="w-full h-full object-cover translate-y-0.5" />
            </button>
            <ThemeToggle className="shrink-0" />
          </div>

          <div className={cn('flex items-center gap-3', isRtl ? 'flex-row-reverse' : 'flex-row')}>
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Education Platform" className="w-auto h-10 sm:h-11" />
            </Link>
            <div className={cn('hidden sm:grid leading-tight', isRtl ? 'text-right' : 'text-left')}>
              <div className="font-semibold text-body-sm text-slate-900 dark:text-slate-100">{computedTitle}</div>
              <div className="text-caption text-slate-500 dark:text-slate-400">{auth?.email}</div>
            </div>

            {auth?.role === 'teacher' || auth?.role === 'team' ? (
              <div className="hidden sm:flex items-center gap-1.5 badge-neutral">
                <span className="bg-brand rounded-full w-1.5 h-1.5" />
                <span>{auth?.teamId || '-'}</span>
              </div>
            ) : null}

            {auth?.role === 'student' ? (
              <button
                type="button"
                onClick={() => navigate('/student/wallet')}
                className={cn(
                  'group hidden sm:inline-flex items-center justify-center gap-2 p-1 ps-3.5 pe-1 h-9 rounded-full transition-all duration-300 shrink-0 select-none border border-teal-400/40 shadow-sm hover:shadow-md hover:shadow-teal-950/40 hover:scale-[1.02] active:scale-[0.98]',
                  'bg-gradient-to-r from-[#023a34] via-[#044c44] to-[#075d53] hover:from-[#034942] hover:to-[#096e62]'
                )}
                title={isRtl ? 'محفظتي - انقر لإدارة المحفظة' : 'My Wallet - Click to manage'}
              >
                <div className="inline-flex items-center justify-center gap-1 text-white my-auto leading-none">
                  <span className="font-extrabold text-xs sm:text-sm tabular-nums tracking-tight my-auto">
                    {walletBalance === null ? '...' : `${Number(walletBalance || 0).toFixed(2)}`}
                  </span>
                  <span className="text-[11px] font-bold text-teal-200 my-auto">
                    {isRtl ? 'ج.م' : 'EGP'}
                  </span>
                </div>
                <span className="inline-flex items-center justify-center bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-300 rounded-full w-7 h-7 shadow-sm text-slate-950 shrink-0 my-auto group-hover:rotate-12 transition-transform duration-300">
                  <Wallet className="w-4 h-4 stroke-[2.5]" />
                </span>
              </button>
            ) : null}

            <Button variant="secondary" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('dashboard.ui.logout')}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="h-[60px] sm:h-[64px] md:h-[68px]" />

      {open ? (
        <div className="z-[110] fixed inset-0">
          <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div
            className={cn(
              'top-0 bottom-0 absolute bg-white dark:bg-[#141414] shadow-elevated p-4 w-[85%] max-w-xs overflow-y-auto transition-transform duration-300',
              isRtl ? 'right-0 rounded-l-2xl' : 'left-0 rounded-r-2xl'
            )}
          >
            <div className={cn('flex items-center justify-between mb-4 px-1', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <span className="font-semibold text-body-sm text-slate-900 dark:text-white">{isRtl ? 'القائمة' : 'Menu'}</span>
              <button type="button" onClick={() => setOpen(false)} className="btn-icon" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <SidebarNav items={items} isRtl={isRtl} onNavigate={() => setOpen(false)} auth={auth} />
          </div>
        </div>
      ) : null}

      <div className="z-10 relative mx-auto px-4 sm:px-6 pt-4 pb-6 w-full max-w-7xl">
        <div className="gap-5 grid grid-cols-1 md:grid-cols-[260px_1fr]">
          <aside className="hidden md:block">
            <div className="sticky top-[84px]">
              <div className="card-surface p-3">
                <SidebarNav items={items} isRtl={isRtl} onNavigate={() => {}} auth={auth} />
              </div>
              <div className="mt-3 px-1">
                <p className={cn('text-caption text-slate-400 dark:text-slate-500', isRtl ? 'text-right' : 'text-left')}>
                  {auth?.role === 'teacher' || auth?.role === 'team'
                    ? `${t('dashboard.ui.visible_within_scope')}: ${auth?.teamId || '-'}`
                    : t('dashboard.ui.platform_dashboard')}
                </p>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="card-surface p-5 md:p-6">
              <div key={location.pathname} className="animate-fade-in">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function SidebarNav({ items, isRtl, onNavigate, auth }) {
  return (
    <div className="flex flex-col gap-1">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-150',
              isRtl ? 'flex-row-reverse text-right' : 'text-left',
              isActive
                ? 'bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-300 font-semibold'
                : 'text-slate-600 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:bg-white/[0.04]'
            )
          }
          onClick={onNavigate}
          end
        >
          {it.icon && <it.icon className="w-[18px] h-[18px] shrink-0" />}
          <span className="truncate">{it.label || it.to}</span>
        </NavLink>
      ))}

      <div className="my-2 border-slate-100 dark:border-white/[0.06] border-t" />

      <div className={cn('px-3 py-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]', isRtl ? 'text-right' : 'text-left')}>
        <div className="text-overline font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
          {isRtl ? 'الحساب' : 'Account'}
        </div>
        <div className="text-caption text-slate-600 dark:text-slate-300 truncate">{auth?.email || '-'}</div>
        {(auth?.role === 'teacher' || auth?.role === 'team') && (
          <div className="text-caption text-slate-400 dark:text-slate-500 mt-1">Team: {auth?.teamId || '-'}</div>
        )}
      </div>
    </div>
  )
}

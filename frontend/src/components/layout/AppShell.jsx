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
    if (auth?.name || auth?.profile) {
      setMe({ name: auth.name, email: auth.email, profile: auth.profile })
    } else {
      async function loadMe() {
        if (!auth?.token) return
        try {
          const res = await api.get('/users/me')
          if (alive) setMe(res.data)
        } catch {
          if (alive) setMe(null)
        }
      }
      loadMe()
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
    loadWallet()
    return () => { alive = false }
  }, [auth?.role, auth?.token, auth?.name, auth?.email, auth?.profile])

  const displayName = String(me?.name || me?.email || auth?.email || '').trim()
  const avatarUrl = me?.profile?.avatarUrl || ''
  function formatAmount(n) {
    const x = Number(n || 0)
    if (!Number.isFinite(x)) return '0'
    const s = x.toFixed(2)
    return s.replace(/\.00$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '')
  }

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
              className="btn-icon relative shrink-0 rounded-full w-9 h-9 border-2 border-slate-200 dark:border-white/20 p-0 hover:border-brand/30"
              aria-label={isRtl ? 'القائمة' : 'Menu'}
            >
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                <img src={avatarUrl || defaultProfileAvatar} alt={displayName || 'User'} className={avatarUrl ? 'w-full h-full object-cover' : 'w-full h-full object-contain'} />
              </span>
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
                  'group hidden h-11 w-[128px] flex-row-reverse items-center justify-start gap-3 rounded-full border border-white/80 bg-white p-1 pe-1 ps-3 shadow-[0_10px_28px_rgba(15,23,42,0.10)] transition-all duration-300 shrink-0 select-none hover:scale-[1.02] hover:shadow-[0_14px_34px_rgba(15,23,42,0.14)] active:scale-[0.98] sm:inline-flex',
                  'dark:border-white/10 dark:bg-white/[0.08] dark:shadow-none'
                )}
                title={isRtl ? 'محفظتي - انقر لإدارة المحفظة' : 'My Wallet - Click to manage'}
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-900 dark:bg-white/15 dark:text-white">
                  <Wallet className="h-[18px] w-[18px] stroke-[2.5]" />
                </span>
                <div className="inline-flex min-w-0 items-baseline gap-1 leading-none text-slate-950 dark:text-white" dir="rtl">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-300">
                    {isRtl ? 'جنيه' : 'EGP'}
                  </span>
                  <span className="font-black text-xl tabular-nums tracking-tight">
                    {walletBalance === null ? '...' : formatAmount(walletBalance)}
                  </span>
                </div>
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

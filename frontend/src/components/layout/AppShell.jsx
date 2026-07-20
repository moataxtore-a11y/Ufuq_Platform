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
  Search,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import { cn } from '../../utils/cn.js'
import { useAuth } from '../../context/AuthContext.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import logo from '../../cvg/logo (2)_3.webp'
import walletBadgeIcon from '../../cvg/WALLET.svg'
import LanguageToggle from '../ui/LanguageToggle.jsx'
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
    return () => {
      alive = false
    }
  }, [auth?.role, auth?.token, location.pathname])

  const displayName = String(me?.name || me?.email || auth?.email || '').trim()
  const avatarUrl = me?.profile?.avatarUrl || ''

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="relative bg-[#E0F3E9] dark:bg-[#0a0a0a] min-h-screen overflow-x-hidden text-slate-900 dark:text-slate-100">
      {/* Modern floating background aesthetic */}
      <div className="z-0 fixed inset-0 overflow-hidden pointer-events-none">
        <div className="top-[-10%] left-[-10%] absolute bg-brand/10 dark:bg-brand/[0.15] blur-[120px] rounded-full w-[50%] h-[50%] animate-blob-float" />
        <div className="right-[-10%] bottom-[-10%] absolute bg-brand/10 dark:bg-brand/[0.12] opacity-70 blur-[100px] rounded-full w-[40%] h-[40%] animate-blob-float" style={{ animationDelay: '2s' }} />
      </div>

      <header className="top-0 right-0 left-0 z-50 fixed bg-white/60 dark:bg-[#0a0a0a]/80 shadow-glass-sm backdrop-blur-glass border-slate-200/50 dark:border-white/10 border-b w-full will-change-transform">
        <div className="flex justify-between items-center gap-3 mx-auto px-4 sm:px-6 py-2 w-full max-w-7xl">
          <div className={cn('flex items-center gap-3', isRtl ? 'flex-row-reverse' : 'flex-row')}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="md:hidden relative flex justify-center items-center bg-black rounded-full w-8 h-8 text-slate-100"
              aria-label={isRtl ? 'القائمة' : 'Menu'}
              title={isRtl ? 'القائمة' : 'Menu'}
            >
              <span className="absolute inset-0 rounded-full overflow-hidden">
                <img
                  src={avatarUrl || defaultProfileAvatar}
                  alt={displayName || (isRtl ? 'المستخدم' : 'User')}
                  className="w-full h-full object-cover"
                />
              </span>
            </button>

            <div className={cn('flex items-center gap-3', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <Link to="/">
                <img src={logo} alt="Education Platform" className="w-auto h-10 sm:h-11 md:h-[48px]" />
              </Link>
              <div className={cn('grid leading-tight', isRtl ? 'text-right' : 'text-left')}>
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight">{computedTitle}</div>
                <div className="hidden sm:block text-slate-600 dark:text-slate-300 text-xs">
                  {auth?.email}
                </div>
              </div>
            </div>

            <ThemeToggle className="hidden sm:inline-flex" />
          </div>

          <div className={cn('flex items-center gap-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
            {auth?.role === 'teacher' || auth?.role === 'team' ? (
              <div className="hidden sm:flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
                <span className="bg-brand rounded-full w-1.5 h-1.5" />
                <span>{t('dashboard.ui.scope')}</span>
                <span className="text-slate-500 dark:text-slate-400">{auth?.teamId || '-'}</span>
              </div>
            ) : null}

            {auth?.role === 'student' ? (
              <button
                type="button"
                onClick={() => navigate('/student/wallet')}
                className={cn(
                  'hidden sm:flex items-center gap-3 shadow-[0_10px_22px_rgba(15,23,42,0.10)] px-3 py-1.5 rounded-full transition',
                  'bg-brand hover:bg-brand-600',
                  isRtl ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <span className="font-extrabold text-white text-xs tracking-wide">
                  {walletBalance === null
                    ? '-'
                    : `${Number(walletBalance || 0).toFixed(2)} ${isRtl ? 'جنيه' : 'EGP'}`}
                </span>
                <span className="inline-flex justify-center items-center bg-black rounded-full w-9 h-9">
                  <img src={walletBadgeIcon} alt="Wallet" className="w-5 h-5" />
                </span>
              </button>
            ) : null}

            <Button variant="secondary" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              {t('dashboard.ui.logout')}
            </Button>
          </div>
        </div>
      </header>

      <div className="h-[72px] sm:h-[76px] md:h-[80px]" />

      {open ? (
        <div className="md:hidden z-[70] fixed inset-0">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div
            className={cn(
              'top-0 absolute bg-white/90 dark:bg-[#0a0a0a]/90 shadow-glass-lg backdrop-blur-glass-heavy p-4 border border-slate-200/50 dark:border-white/10 w-[88%] max-w-sm h-full overflow-y-auto',
              isRtl ? 'right-0 rounded-l-[1.25rem] sm:rounded-l-3xl' : 'left-0 rounded-r-[1.25rem] sm:rounded-r-3xl'
            )}
          >
            <div className={cn('flex justify-between items-center gap-2 px-2 py-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{t('dashboard.ui.menu')}</div>
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                {t('dashboard.ui.close')}
              </Button>
            </div>
            <SidebarNav items={items} isRtl={isRtl} onNavigate={() => setOpen(false)} auth={auth} />
          </div>
        </div>
      ) : null}

      <div className="z-10 relative mx-auto px-4 sm:px-6 pt-2.5 pb-4 w-full max-w-7xl">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-[280px_1fr]">
          <aside className="hidden md:block">
            <div className="bg-white/80 dark:bg-white/[0.04] shadow-glass-sm backdrop-blur-glass p-4 border border-slate-200/50 dark:border-white/10 rounded-[1.25rem] sm:rounded-3xl">
              <SidebarNav items={items} isRtl={isRtl} onNavigate={() => {}} auth={auth} />
            </div>
          </aside>

          <main className="min-w-0">
            <div className="bg-white/80 dark:bg-white/[0.04] shadow-glass-sm backdrop-blur-glass p-5 md:p-8 border border-slate-200/50 dark:border-white/10 rounded-[1.25rem] sm:rounded-3xl">
              <div key={location.pathname} className="animate-fade-in">
                <Outlet />
              </div>
            </div>

            <footer className={cn('mt-3 px-1 text-slate-500 dark:text-slate-400 text-xs', isRtl ? 'text-right' : 'text-left')}>
              {auth?.role === 'teacher' || auth?.role === 'team'
                ? isRtl
                  ? `${t('dashboard.ui.visible_within_scope')}: ${auth?.teamId || '-'}`
                  : `${t('dashboard.ui.visible_within_scope')}: ${auth?.teamId || '-'}`
                : t('dashboard.ui.platform_dashboard')}
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}

function SidebarNav({ items, isRtl, onNavigate, auth }) {
  return (
    <div className="gap-3 grid">
      <nav className="gap-1 grid">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-2xl font-medium text-sm transition-all duration-200 ease-out',
                isRtl ? 'flex-row-reverse text-right' : 'text-left',
                'hover:-translate-y-0.5',
                isActive
                  ? 'bg-gradient-to-r from-brand/20 to-brand/10 text-slate-900 dark:text-slate-100 border border-brand/20'
                  : 'text-slate-700 hover:bg-black/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]'
              )
            }
            onClick={onNavigate}
            end
          >
            {it.icon ? <it.icon className="w-4 h-4" /> : null}
            <span className="truncate">{it.label || it.to}</span>
          </NavLink>
        ))}
      </nav>

      <div className="bg-[rgb(247,244,236)] dark:bg-[#202020] px-3 py-2 border border-black/5 dark:border-white/10 rounded-2xl text-slate-700 dark:text-slate-200 text-sm">
        <div className={cn('flex items-center gap-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
          <Search className="w-4 h-4" />
          <Input className="bg-transparent p-0 border-0 focus-visible:ring-0 h-7" placeholder={isRtl ? 'بحث' : 'Search'} />
        </div>
      </div>

      <div className={cn('bg-white dark:bg-white/[0.04] px-3 py-2 border border-black/5 dark:border-white/10 rounded-2xl text-slate-600 dark:text-slate-300 text-xs', isRtl ? 'text-right' : 'text-left')}>
        <div className="font-semibold text-slate-700 dark:text-slate-200">{isRtl ? 'الحساب' : 'Account'}</div>
        <div className="mt-1 truncate">{auth?.email || '-'}</div>
        {(auth?.role === 'teacher' || auth?.role === 'team') ? (
          <div className="mt-1 text-slate-500 dark:text-slate-400">{isRtl ? 'Team ID' : 'Team ID'}: {auth?.teamId || '-'}</div>
        ) : null}
      </div>
    </div>
  )
}

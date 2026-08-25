import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, ClipboardCheck, GraduationCap, KeyRound, LayoutDashboard, ListChecks, LogOut, Menu, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AnimatedBackdrop from '../ui/AnimatedBackdrop.jsx'
import Button from '../ui/Button.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import LanguageToggle from '../ui/LanguageToggle.jsx'
import logo from '../../cvg/logo (2)_3.webp'
import defaultProfileAvatar from '../../cvg/profile.svg'
import { api } from '../../utils/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import SiteFooter from './SiteFooter.jsx'
import CompanyCredit from './CompanyCredit.jsx'
import { cn } from '../../utils/cn.js'
import MotivationalBanner from '../student/MotivationalBanner.jsx'

export default function StudentLandingLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { auth, logout } = useAuth()
  const { isRtl, t } = useLanguage()

  const [open, setOpen] = useState(false)

  const [me, setMe] = useState(null)

  const [walletBalance, setWalletBalance] = useState(null)

  const [badgeTotal] = useState(0)

  useEffect(() => {
    let alive = true

    async function loadMe() {
      try {
        const res = await api.get('/users/me')
        if (alive) setMe(res.data)
      } catch {
        if (alive) setMe(null)
      }
    }

    loadMe()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true

    async function loadWallet() {
      if (!auth?.token) return
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
    return () => {
      alive = false
    }
  }, [auth?.token, location.pathname])

  function formatAmount(n) {
    const x = Number(n || 0)
    if (!Number.isFinite(x)) return '0'
    const s = x.toFixed(2)
    return s.replace(/\.00$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '')
  }

  function WalletBadge({ className }) {
    return (
      <button
        type="button"
        onClick={() => navigate('/student/wallet')}
        className={cn(
          'group inline-flex min-w-[128px] items-center justify-between gap-3 rounded-full p-1 ps-4 h-10 sm:h-11 transition-all duration-300 shrink-0 select-none border border-teal-400/40 shadow-sm hover:shadow-md hover:shadow-teal-950/40 hover:scale-[1.02] active:scale-[0.98]',
          'bg-gradient-to-r from-[#023a34] via-[#044c44] to-[#075d53] hover:from-[#034942] hover:to-[#096e62]',
          isRtl ? 'flex-row-reverse pe-1 ps-4' : 'flex-row pe-1 ps-4',
          className
        )}
        title={isRtl ? 'محفظتي - انقر لإدارة المحفظة' : 'My Wallet - Click to manage'}
      >
        <div className={cn('inline-flex min-w-0 flex-1 items-baseline gap-1 text-white leading-none', isRtl ? 'justify-start text-left' : 'justify-start text-left')} dir="ltr">
          <span className="font-extrabold text-xs sm:text-sm tabular-nums tracking-tight">
            {walletBalance === null ? '...' : formatAmount(walletBalance)}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-teal-200">
            {isRtl ? 'ج.م' : 'EGP'}
          </span>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-300 text-slate-950 shadow-sm sm:h-9 sm:w-9">
          <Wallet className="h-4 w-4 stroke-[2.5] sm:h-[18px] sm:w-[18px]" />
        </span>
      </button>
    )
  }

  const displayName = useMemo(() => {
    return String(me?.name || me?.email || '').trim()
  }, [me?.email, me?.name])

  const avatarUrl = me?.profile?.avatarUrl || ''

  const quickLinks = [
    { to: '/student', icon: BookOpen, label: t('dashboard.nav.my_courses') },
    { to: '/student/redeem', icon: KeyRound, label: isRtl ? 'استرداد كود' : 'Redeem' },
    { to: '/student/assignments', icon: LayoutDashboard, label: t('dashboard.nav.assignments') },
    { to: '/student/assessments', icon: ListChecks, label: t('dashboard.nav.assessments') },
    { to: '/student/grades', icon: ClipboardCheck, label: isRtl ? 'درجاتي' : 'My Grades' },
    { to: '/student/stats', icon: BarChart3, label: isRtl ? 'إحصائياتي' : 'My stats' },
    { to: '/student/profile', icon: GraduationCap, label: t('dashboard.titles.profile') }
  ]

  return (
    <div className="relative flex flex-col min-h-screen text-slate-900 dark:text-slate-100" dir={isRtl ? 'rtl' : 'ltr'}>
      <AnimatedBackdrop />

      <header className="top-0 z-[100] fixed bg-white/30 dark:bg-[#0a0a0a]/30 shadow-glass-md backdrop-blur-glass-heavy border-white/20 dark:border-white/10 border-b w-full">
        <div className="mx-auto px-3 sm:px-4 py-2.5 min-w-0 max-w-7xl">
          <div className="sm:hidden">
            <div className="px-1 py-1">
              <div className="flex items-center justify-between gap-2">
                <Link to="/" className="flex items-center shrink-0">
                  <img src={logo} alt="Education Platform" className="w-auto h-9 object-contain" />
                </Link>
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <WalletBadge />
                  <ThemeToggle className="shrink-0 h-9" />
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="relative flex items-center justify-center shrink-0 rounded-full w-9 h-9 border-2 border-slate-200 dark:border-white/20 shadow-sm"
                    aria-label={isRtl ? 'القائمة' : 'Menu'}
                    title={isRtl ? 'القائمة' : 'Menu'}
                  >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                      <img src={avatarUrl || defaultProfileAvatar} alt={displayName || (isRtl ? 'المستخدم' : 'User')} className={avatarUrl ? 'w-full h-full object-cover' : 'w-full h-full object-contain'} />
                    </span>
                    {badgeTotal > 0 ? (
                      <span className="-top-1 -right-1 absolute flex justify-center items-center bg-rose-600 shadow px-1 border-2 border-black rounded-full min-w-4 h-4 text-[10px] text-white">
                        {badgeTotal > 99 ? '99+' : badgeTotal}
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden sm:flex items-center justify-between gap-4 h-10">
            {/* Logo & Wallet (Far Right in RTL) */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/" className="flex items-center shrink-0">
                <img src={logo} alt="Education Platform" className="w-auto h-9 object-contain" />
              </Link>
              <WalletBadge />
            </div>

            {/* Center: Nav links */}
            <nav className="flex items-center justify-center gap-1 flex-1">
              {quickLinks.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === '/student'}
                  className={({ isActive }) =>
                    cn(
                      'group inline-flex items-center justify-center h-9 rounded-xl transition-all duration-300 ease-out',
                      isActive
                        ? 'bg-black/[0.06] dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 px-3 gap-2'
                        : 'text-slate-700 hover:bg-black/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06] px-2.5 gap-0 hover:px-3 hover:gap-2'
                    )
                  }
                  aria-label={it.label}
                >
                  {({ isActive }) => (
                    <>
                      {it.icon ? <it.icon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" /> : null}
                      <span
                        className={cn(
                          'inline-block text-xs font-bold truncate transition-all duration-300 ease-out overflow-hidden whitespace-nowrap transform',
                          isRtl ? 'origin-right' : 'origin-left',
                          isActive
                            ? 'max-w-[120px] opacity-100 scale-100 translate-x-0'
                            : cn(
                                'max-w-0 opacity-0 scale-90',
                                isRtl ? 'translate-x-3 group-hover:translate-x-0' : '-translate-x-3 group-hover:translate-x-0',
                                'group-hover:max-w-[120px] group-hover:opacity-100 group-hover:scale-100'
                              )
                        )}
                      >
                        {it.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* ThemeToggle & Profile (Far Left in RTL) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <ThemeToggle className="shrink-0 h-9" />
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative flex items-center justify-center shrink-0 rounded-full w-9 h-9 border-2 border-slate-200 dark:border-white/20 shadow-sm"
                aria-label={isRtl ? 'القائمة' : 'Menu'}
                title={isRtl ? 'القائمة' : 'Menu'}
              >
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                  <img src={avatarUrl || defaultProfileAvatar} alt={displayName || (isRtl ? 'المستخدم' : 'User')} className={avatarUrl ? 'w-full h-full object-cover' : 'w-full h-full object-contain'} />
                </span>
                {badgeTotal > 0 ? (
                  <span className="-top-1 -right-1 absolute flex justify-center items-center bg-rose-600 shadow px-1 border-2 border-black rounded-full min-w-4 h-4 text-[10px] text-white">
                    {badgeTotal > 99 ? '99+' : badgeTotal}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </header>

      {open ? (
        <div className="z-[110] fixed inset-0">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'}
          />
          <div
            className={cn(
              'top-0 absolute bg-white/90 dark:bg-[#0a0a0a]/90 shadow-glass-lg backdrop-blur-glass-heavy p-4 border border-slate-200/50 dark:border-white/10 w-[88%] max-w-sm h-full overflow-y-auto',
              isRtl ? 'left-0 rounded-r-[1.25rem] sm:rounded-r-3xl' : 'left-0 rounded-r-[1.25rem] sm:rounded-r-3xl'
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="flex justify-between items-center gap-2 px-2 py-2">
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{t('dashboard.ui.menu')}</div>
              <div className="flex items-center gap-2">
                <ThemeToggle className="shrink-0" />
                <LanguageToggle />
                <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                  {t('dashboard.ui.close')}
                </Button>
              </div>
            </div>

            <div className="gap-2 grid px-2 pt-2">
              <div
                className={cn(
                  'flex items-center gap-3 px-1 py-1',
                  isRtl ? 'flex-row text-right' : 'flex-row text-left'
                )}
              >
                <span className="flex justify-center items-center bg-black rounded-full w-11 h-11 overflow-hidden shrink-0">
                  <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                    <img src={avatarUrl || defaultProfileAvatar} alt={displayName || 'User'} className={avatarUrl ? 'w-full h-full object-cover' : 'w-full h-full object-contain'} />
                  </span>
                </span>
                <div className="min-w-0">
                  <div className="text-slate-600 dark:text-slate-300 text-xs">{isRtl ? 'أهلا،' : 'Hi,'}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm break-words leading-snug whitespace-normal">{displayName || t('dashboard.titles.profile')}</div>
                </div>
              </div>

              <Button asChild variant="secondary" className="w-full" onClick={() => setOpen(false)}>
                <Link to="/student/profile">{t('dashboard.titles.profile')}</Link>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                  setOpen(false)
                }}
              >
                <LogOut className="w-4 h-4" />
                {t('dashboard.ui.logout')}
              </Button>

              <div className="gap-1 grid mt-1">
                {quickLinks.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.to === '/student'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-2xl font-medium text-sm transition-all duration-200 ease-out',
                        isRtl ? 'flex-row text-right' : 'text-left',
                        isActive
                          ? 'bg-brand/20 text-brand-900 dark:text-brand-100'
                          : 'text-slate-700 dark:text-slate-200'
                      )
                    }
                  >
                    {it.icon ? <it.icon className="w-4 h-4" /> : null}
                    <span className="truncate">{it.label}</span>
                  </NavLink>
                ))}
              </div>
              <div className="md:hidden mt-3 pt-4 border-black/10 dark:border-white/10 border-t text-center">
                <CompanyCredit className="text-slate-600 hover:text-brand dark:text-slate-300 dark:hover:text-teal-300 text-xs font-medium" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="h-[72px] sm:h-[76px] md:h-[80px]" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-3 max-w-7xl">
        <MotivationalBanner />
      </div>

      <main className="relative flex-1 mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full max-w-7xl">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}

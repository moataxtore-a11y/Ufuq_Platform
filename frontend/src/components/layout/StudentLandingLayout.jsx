import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, ClipboardCheck, GraduationCap, KeyRound, LayoutDashboard, ListChecks, LogOut } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AnimatedBackdrop from '../ui/AnimatedBackdrop.jsx'
import Button from '../ui/Button.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import LanguageToggle from '../ui/LanguageToggle.jsx'
import logo from '../../cvg/logo (2).svg'
import defaultProfileAvatar from '../../cvg/profile.svg'
import { api } from '../../utils/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import SiteFooter from './SiteFooter.jsx'
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

  function WalletIcon({ className }) {
    return (
      <svg
        className={className}
        viewBox="0 0 226.1 235.35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g stroke="#ffffff" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round">
          <path
            strokeWidth="19.63"
            d="M149.88,141.14c0,6.69,2.72,12.75,7.1,17.13,4.38,4.38,10.44,7.1,17.13,7.1h42.17v23.76c0,20.11-16.31,36.41-36.42,36.41H46.23c-20.12,0-36.42-16.29-36.42-36.41v-92.13c0-19.56,15.4-35.51,34.73-36.37.56-.04,1.13-.05,1.69-.05h133.63c2.02,0,4.01.17,5.94.48,17.28,2.83,30.48,17.84,30.48,35.94v19.91h-42.17c-13.38,0-24.23,10.84-24.23,24.23Z"
          />
          <path
            strokeWidth="19.63"
            d="M216.28,116.91v48.46h-42.17c-6.69,0-12.75-2.72-17.13-7.1-4.38-4.38-7.1-10.44-7.1-17.13,0-13.38,10.84-24.23,24.23-24.23h42.17Z"
          />
          <path
            strokeWidth="22.28"
            d="M185.81,61.06c-1.93-.32-3.92-.48-5.94-.48H46.23c-.56,0,37.16-16.64,36.6-16.6L153.89,11.95c4.7-2.1,10.2.01,12.28,4.71l19.12,42.96c.2.47.38.95.51,1.43Z"
          />
        </g>
      </svg>
    )
  }

  function WalletBadge({ className }) {
    return (
      <button
        type="button"
        onClick={() => navigate('/student/wallet')}
        className={cn(
          'inline-flex relative items-center shadow-[0_10px_22px_rgba(15,23,42,0.10)] rounded-full max-w-[160px] sm:max-w-none h-10 transition',
          'bg-[#322C18] hover:bg-[#66582F]/90',
          isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4',
          className
        )}
        title={isRtl ? 'المحفظة' : 'Wallet'}
      >
        <span className="flex-1 min-w-0 font-extrabold text-[#ffffff] text-[11px] sm:text-[15px] text-center truncate leading-none tracking-wide whitespace-nowrap">
          {walletBalance === null ? '-' : formatAmount(walletBalance)} جنيه
        </span>

        <span
          className={cn(
            'inline-flex top-1/2 absolute justify-center items-center rounded-full w-10 sm:w-10 h-10 sm:h-10 -translate-y-1/2',
            'bg-[#66582F]',
            isRtl ? 'right-[-6px]' : 'left-[-6px]'
          )}
        >
          <WalletIcon className="w-6 h-6" />
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

      <header className="top-0 right-0 left-0 z-50 fixed bg-white/90 dark:bg-[#121212]/80 backdrop-blur border-slate-300/60 dark:border-white/10 border-b">
        <div className="mx-auto px-3 sm:px-4 py-3 min-w-0 max-w-7xl">
          <div className="sm:hidden">
            {/* <div className="bg-white/65 dark:bg-white/[0.06] shadow-[0_10px_26px_rgba(15,23,42,0.10)] dark:shadow-none backdrop-blur px-3 py-2 border border-black/5 dark:border-white/10 rounded-3xl"> */}
            <div className="px-1 py-1">
              <div className="flex justify-between items-center gap-2 min-w-0">
                <div className={cn('flex items-center gap-2', isRtl ? 'order-1 justify-start' : 'order-3 justify-end')}>
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="relative flex justify-center items-center bg-black rounded-full w-8 h-8 text-slate-100"
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
                </div>

                <Link to="/" className={cn('flex justify-center items-center gap-2 min-w-0', isRtl ? 'order-2' : 'order-2')}>
                  <img src={logo} alt="Education Platform" className="w-auto h-14" />
                </Link>

                <div className={cn('flex items-center gap-2 min-w-0', isRtl ? 'order-3 justify-end' : 'order-1 justify-start')}>
                  <WalletBadge className="shadow-none" />
                </div>
              </div>
            </div>
          </div>

          <div className={'hidden sm:flex justify-between items-center gap-2 min-w-0 ' + (isRtl ? 'flex-row-reverse' : '')}>
            <div className={'flex items-center gap-3 ' + (isRtl ? 'flex-row-reverse' : '')}>
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Education Platform" className="w-auto h-14 sm:h-16 md:h-[72px]" />
              </Link>
              <ThemeToggle className="shrink-0" />
            </div>

            <nav className={cn('hidden sm:flex items-center gap-1', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              {quickLinks.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === '/student'}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex justify-center items-center rounded-xl w-10 h-10 transition-colors',
                      isActive
                        ? 'bg-black/[0.06] dark:bg-white/[0.08] text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 hover:bg-black/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06]'
                    )
                  }
                  aria-label={it.label}
                  title={it.label}
                >
                  {it.icon ? <it.icon className="w-5 h-5" /> : null}
                </NavLink>
              ))}
            </nav>

            <div className={'flex items-center gap-2 min-w-0 ' + (isRtl ? 'flex-row-reverse' : '')}>
              <WalletBadge />
              <button
                type="button"
                onClick={() => setOpen(true)}
                className={
                  'flex items-center gap-2 text-xs font-semibold transition ' +
                  (isRtl ? 'flex-row-reverse' : 'flex-row')
                }
                title={t('dashboard.ui.menu')}
                aria-label={t('dashboard.ui.menu')}
              >
                <span className="relative flex justify-center items-center bg-black rounded-full w-8 sm:w-10 h-8 sm:h-10 overflow-hidden text-slate-100 shrink-0">
                  <img src={avatarUrl || defaultProfileAvatar} alt={displayName || 'User'} className="w-full h-full object-cover" />
                </span>
                <span className="hidden xs:inline max-w-[140px] text-slate-700 hover:text-slate-900 dark:hover:text-slate-100 dark:text-slate-200 truncate">
                  {displayName || t('dashboard.titles.profile')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {open ? (
        <div className="z-50 fixed inset-0">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'}
          />
          <div
            className={cn(
              'top-0 absolute bg-white dark:bg-[#1a1a1a] shadow-2xl p-3 border border-black/5 dark:border-white/10 w-[88%] max-w-sm h-full overflow-y-auto',
              isRtl ? 'right-0 rounded-l-3xl' : 'left-0 rounded-r-3xl'
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className={cn('flex justify-between items-center gap-2 px-2 py-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{t('dashboard.ui.menu')}</div>
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                {t('dashboard.ui.close')}
              </Button>
            </div>

            <div className="gap-2 grid px-2 pt-2">
              <div
                className={cn(
                  'flex items-center gap-3 px-1 py-1',
                  isRtl ? 'flex-row text-right' : 'flex-row text-left'
                )}
              >
                <span className="flex justify-center items-center bg-black rounded-full w-11 h-11 overflow-hidden shrink-0">
                  <img src={avatarUrl || defaultProfileAvatar} alt={displayName || 'User'} className="w-full h-full object-cover" />
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
                        'flex items-center gap-2 px-3 py-2 rounded-2xl font-medium text-sm transition-all duration-200 ease-out',
                        isRtl ? 'flex-row-reverse text-right' : 'text-left',
                        isActive
                          ? 'bg-[rgba(244,206,125,0.35)] text-slate-900 dark:text-slate-100'
                          : 'text-slate-700 hover:bg-black/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]'
                      )
                    }
                  >
                    {it.icon ? <it.icon className="w-4 h-4" /> : null}
                    <span className="truncate">{it.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="h-[88px] sm:h-[96px] md:h-[104px]" />

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

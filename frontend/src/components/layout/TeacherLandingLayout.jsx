import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle, ClipboardCheck, GraduationCap, KeyRound, LayoutDashboard, ListChecks, LogOut, Menu, MessageSquareQuote, Users } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
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
import { cn } from '../../utils/cn.js'

export default function TeacherLandingLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth, logout } = useAuth()
  const { isRtl, t } = useLanguage()

  const [open, setOpen] = useState(false)

  const [me, setMe] = useState(null)

  const [badgeTotal, setBadgeTotal] = useState(0)

  const seenRef = useRef(0)

  useEffect(() => {
    try {
      const s = Number(sessionStorage.getItem('seen_total_teacher') || 0)
      seenRef.current = Number.isFinite(s) ? s : 0
    } catch {
      seenRef.current = 0
    }
  }, [])

  useEffect(() => {
    const path = String(location?.pathname || '')
    if (!path.startsWith('/teacher/approvals')) return
    try {
      sessionStorage.setItem('seen_total_teacher', String(badgeTotal || 0))
      seenRef.current = badgeTotal || 0
    } catch {
      // ignore
    }
  }, [location?.pathname, badgeTotal])

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
    let intervalId = null

    async function loadBadges() {
      if (!auth?.token) return
      try {
        const res = await api.get('/notifications/badges')
        const total = Number(res?.data?.total || 0)
        if (!alive) return
        const safeTotal = Number.isFinite(total) ? total : 0
        const unread = Math.max(0, safeTotal - seenRef.current)
        if (!alive) return
        setBadgeTotal(unread)
      } catch {
        if (!alive) return
        setBadgeTotal(0)
      }
    }

    loadBadges()
    intervalId = setInterval(loadBadges, 30000)

    return () => {
      alive = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [auth?.token])

  const displayName = useMemo(() => {
    return String(me?.name || me?.email || '').trim()
  }, [me?.email, me?.name])

  const avatarUrl = me?.profile?.avatarUrl || ''

  const quickLinks = [
    { to: '/teacher', icon: BookOpen, label: t('dashboard.nav.courses') },
    { to: '/teacher/team', icon: Users, label: t('dashboard.nav.my_team') },
    { to: '/teacher/students', icon: Users, label: t('dashboard.nav.students') },
    { to: '/teacher/access-codes', icon: KeyRound, label: isRtl ? 'أكواد' : 'Codes' },
    { to: '/teacher/approvals', icon: CheckCircle, label: t('dashboard.nav.approvals') },
    { to: '/teacher/motivational-message', icon: MessageSquareQuote, label: isRtl ? 'رسالة للطلاب' : 'Student message' },
    { to: '/teacher/assignments', icon: LayoutDashboard, label: t('dashboard.nav.assignments') },
    { to: '/teacher/assessments', icon: ListChecks, label: t('dashboard.nav.assessments') },
    { to: '/teacher/assessments/grading', icon: ClipboardCheck, label: t('dashboard.nav.manual_grading') },
    { to: '/teacher/grades', icon: LayoutDashboard, label: t('dashboard.nav.grades') },
    { to: '/teacher/profile', icon: GraduationCap, label: t('dashboard.titles.profile') }
  ]

  return (
    <div className="relative flex flex-col min-h-screen text-slate-900 dark:text-slate-100" dir={isRtl ? 'rtl' : 'ltr'}>
      <AnimatedBackdrop />

      <header className="top-0 z-[100] fixed bg-white/30 dark:bg-[#0a0a0a]/30 shadow-glass-md backdrop-blur-glass-heavy border-white/20 dark:border-white/10 border-b w-full">
        <div className="mx-auto px-3 sm:px-4 py-2 min-w-0 max-w-7xl">
          <div className="sm:hidden">
            <div className="px-1 py-1" dir="ltr">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center justify-start shrink-0 w-8" />
                <Link to="/" className="flex justify-center items-center shrink-0">
                  <img src={logo} alt="Education Platform" className="w-auto h-9 object-contain" />
                </Link>
                <div className="flex items-center justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="relative flex items-center justify-center rounded-full w-9 h-9 overflow-hidden border-2 border-slate-200 dark:border-white/20 hover:border-teal-500/50 transition-colors shadow-sm"
                    aria-label={isRtl ? 'القائمة' : 'Menu'}
                    title={isRtl ? 'القائمة' : 'Menu'}
                  >
                    <img src={avatarUrl || defaultProfileAvatar} alt={displayName || (isRtl ? 'المستخدم' : 'User')} className={avatarUrl ? 'w-full h-full object-cover' : 'w-full h-full object-contain'} />
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

          <div className="hidden sm:flex justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="Education Platform" className="w-auto h-10 sm:h-11 md:h-[48px]" />
              </Link>
            </div>

            <nav className={cn('hidden sm:flex items-center gap-0.5', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              {quickLinks.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'group inline-flex items-center rounded-xl transition-all duration-300 ease-out',
                      isRtl ? 'flex-row-reverse' : 'flex-row',
                      isActive
                        ? 'bg-black/[0.06] dark:bg-white/[0.08] text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 hover:bg-black/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06]',
                      isActive ? 'px-3 py-2 gap-2' : 'px-2.5 py-2 gap-0 hover:px-3 hover:gap-2'
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
                                isRtl ? 'translate-x-3' : '-translate-x-3',
                                'group-hover:max-w-[120px] group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0'
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

            <div className="flex items-center gap-2.5">
              <ThemeToggle className="shrink-0 h-9" />
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center justify-center shrink-0 rounded-full w-9 h-9 overflow-hidden border-2 border-slate-200 dark:border-white/20"
                aria-label={isRtl ? 'القائمة' : 'Menu'}
                title={isRtl ? 'القائمة' : 'Menu'}
              >
                <img src={avatarUrl || defaultProfileAvatar} alt={displayName || (isRtl ? 'المستخدم' : 'User')} className={avatarUrl ? 'w-full h-full object-cover' : 'w-full h-full object-contain'} />
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

      <div className="h-[72px] sm:h-[76px] md:h-[80px]" />

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
              isRtl ? 'right-0 rounded-l-[1.25rem] sm:rounded-l-3xl' : 'left-0 rounded-r-[1.25rem] sm:rounded-r-3xl'
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className={cn('flex justify-between items-center gap-2 px-2 py-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
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
                  <img src={avatarUrl || defaultProfileAvatar} alt={displayName || 'User'} className={avatarUrl ? 'w-full h-full object-cover' : 'w-full h-full object-contain'} />
                </span>
                <div className="min-w-0">
                  <div className="text-slate-600 dark:text-slate-300 text-xs">{isRtl ? 'أهلا،' : 'Hi,'}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm break-words leading-snug whitespace-normal">{displayName || t('dashboard.titles.profile')}</div>
                </div>
              </div>

              <Button asChild variant="secondary" className="w-full" onClick={() => setOpen(false)}>
                <Link to="/teacher/profile">{t('dashboard.titles.profile')}</Link>
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
                    end
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-3 py-2 rounded-2xl font-medium text-sm transition-all duration-200 ease-out',
                        isRtl ? 'flex-row-reverse text-right' : 'text-left',
                        isActive
                          ? 'bg-brand/20 text-brand-900 dark:text-brand-100'
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

      <main className="relative flex-1 mx-auto px-4 sm:px-6 lg:px-8 pt-2.5 pb-12 w-full max-w-7xl">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}

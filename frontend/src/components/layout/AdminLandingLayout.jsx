import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle, ClipboardList, GraduationCap, LayoutDashboard, LogOut, MessageSquareQuote, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
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

export default function AdminLandingLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth, logout } = useAuth()
  const { isRtl, t } = useLanguage()

  const [open, setOpen] = useState(false)

  const [me, setMe] = useState(null)

  const [badgeTotal, setBadgeTotal] = useState(0)
  const [badgeCounts, setBadgeCounts] = useState({ pendingStudents: 0, joinTeamApplications: 0, total: 0 })

  const [rawBadgeCounts, setRawBadgeCounts] = useState({ pendingStudents: 0, joinTeamApplications: 0, total: 0 })

  const [seen, setSeen] = useState({ pendingStudents: 0, joinTeamApplications: 0 })

  useEffect(() => {
    function readSeen() {
      try {
        const pending = Number(sessionStorage.getItem('seen_count_pendingStudents') || 0)
        const apps = Number(sessionStorage.getItem('seen_count_joinTeamApplications') || 0)
        return {
          pendingStudents: Number.isFinite(pending) ? pending : 0,
          joinTeamApplications: Number.isFinite(apps) ? apps : 0
        }
      } catch {
        return { pendingStudents: 0, joinTeamApplications: 0 }
      }
    }

    setSeen(readSeen())
  }, [])

  useEffect(() => {
    const path = String(location?.pathname || '')
    if (!path.startsWith('/admin')) return

    try {
      if (path.startsWith('/admin/approvals')) {
        sessionStorage.setItem('seen_count_pendingStudents', String(rawBadgeCounts.pendingStudents || 0))
        setSeen((s) => ({ ...s, pendingStudents: rawBadgeCounts.pendingStudents || 0 }))
      }
      if (path.startsWith('/admin/applications')) {
        sessionStorage.setItem('seen_count_joinTeamApplications', String(rawBadgeCounts.joinTeamApplications || 0))
        setSeen((s) => ({ ...s, joinTeamApplications: rawBadgeCounts.joinTeamApplications || 0 }))
      }
    } catch {
      // ignore
    }
  }, [location?.pathname, rawBadgeCounts.joinTeamApplications, rawBadgeCounts.pendingStudents])

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
        const pendingStudents = Number(res?.data?.pendingStudents || 0)
        const joinTeamApplications = Number(res?.data?.joinTeamApplications || 0)
        const total = Number(res?.data?.total || 0)
        if (!alive) return
        const safePending = Number.isFinite(pendingStudents) ? pendingStudents : 0
        const safeApps = Number.isFinite(joinTeamApplications) ? joinTeamApplications : 0
        const safeTotal = Number.isFinite(total) ? total : safePending + safeApps

        setRawBadgeCounts({ pendingStudents: safePending, joinTeamApplications: safeApps, total: safeTotal })

        const unreadPending = Math.max(0, safePending - (seen.pendingStudents || 0))
        const unreadApps = Math.max(0, safeApps - (seen.joinTeamApplications || 0))
        const unreadTotal = unreadPending + unreadApps

        setBadgeCounts({ pendingStudents: unreadPending, joinTeamApplications: unreadApps, total: unreadTotal })
        setBadgeTotal(unreadTotal)
      } catch {
        if (!alive) return
        setBadgeTotal(0)
        setBadgeCounts({ pendingStudents: 0, joinTeamApplications: 0, total: 0 })
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
    { to: '/admin', icon: LayoutDashboard, label: t('dashboard.nav.overview') },
    { to: '/admin/users', icon: Users, label: t('dashboard.nav.users') },
    { to: '/admin/courses', icon: BookOpen, label: isRtl ? 'إدارة الكورسات' : 'Courses' },
    { to: '/admin/approvals', icon: CheckCircle, label: t('dashboard.nav.approvals') },
    { to: '/admin/applications', icon: ClipboardList, label: t('dashboard.nav.applications') },
    { to: '/admin/motivational-message', icon: MessageSquareQuote, label: isRtl ? 'رسالة للطلاب' : 'Student message' },
    { to: '/admin/profile', icon: GraduationCap, label: t('dashboard.titles.profile') }
  ]

  return (
    <div className="relative flex flex-col min-h-screen text-slate-900 dark:text-slate-100" dir={isRtl ? 'rtl' : 'ltr'}>
      <AnimatedBackdrop />

      <header className="top-0 z-40 sticky bg-white/90 dark:bg-[#121212]/80 backdrop-blur border-slate-300/60 dark:border-white/10 border-b">
        <div className="mx-auto px-3 sm:px-4 py-3 min-w-0 max-w-7xl">
          <div className="sm:hidden">
            <div className="px-3 py-2">
              <div className="items-center grid grid-cols-3">
                <div className="flex justify-start items-center gap-2">
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
                    {badgeTotal > 0 ? (
                      <span className="-top-1 -right-1 absolute flex justify-center items-center bg-rose-600 shadow px-1 border-2 border-black rounded-full min-w-4 h-4 text-[10px] text-white">
                        {badgeTotal > 99 ? '99+' : badgeTotal}
                      </span>
                    ) : null}
                  </button>
                </div>

                <Link to="/" className="flex justify-center items-center gap-2 min-w-0">
                  <img src={logo} alt="Education Platform" className="w-auto h-14" />
                </Link>

                <div className="flex justify-end items-center gap-2 min-w-0">
                  <ThemeToggle className="shrink-0" />
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
                  end={it.to === '/admin'}
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
                <span className="relative flex justify-center items-center bg-black rounded-full w-8 sm:w-10 h-8 sm:h-10 text-slate-100 shrink-0">
                  <span className="absolute inset-0 rounded-full overflow-hidden">
                    <img src={avatarUrl || defaultProfileAvatar} alt={displayName || 'User'} className="w-full h-full object-cover" />
                  </span>
                  {badgeTotal > 0 ? (
                    <span className="-top-1 -right-1 absolute flex justify-center items-center bg-rose-600 shadow px-1 border-2 border-black rounded-full min-w-5 h-5 text-[11px] text-white">
                      {badgeTotal > 99 ? '99+' : badgeTotal}
                    </span>
                  ) : null}
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
                <Link to="/admin/profile">{t('dashboard.titles.profile')}</Link>
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
                    end={it.to === '/admin'}
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
                    {it.to === '/admin/approvals' && badgeCounts.pendingStudents > 0 ? (
                      <span
                        className={cn(
                          'inline-flex justify-center items-center bg-rose-600 px-1 rounded-full min-w-5 h-5 text-[11px] text-white',
                          isRtl ? 'mr-auto' : 'ml-auto'
                        )}
                      >
                        {badgeCounts.pendingStudents > 99 ? '99+' : badgeCounts.pendingStudents}
                      </span>
                    ) : null}
                    {it.to === '/admin/applications' && badgeCounts.joinTeamApplications > 0 ? (
                      <span
                        className={cn(
                          'inline-flex justify-center items-center bg-rose-600 px-1 rounded-full min-w-5 h-5 text-[11px] text-white',
                          isRtl ? 'mr-auto' : 'ml-auto'
                        )}
                      >
                        {badgeCounts.joinTeamApplications > 99 ? '99+' : badgeCounts.joinTeamApplications}
                      </span>
                    ) : null}
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

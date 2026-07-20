import { Link, NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, CheckCircle, ClipboardCheck, ClipboardList, GraduationCap, KeyRound, LayoutDashboard, ListChecks, LogIn, LogOut, Menu, MessageSquareQuote, Search, UserPlus, Users } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import Button from '../ui/Button.jsx'
import logo from '../../cvg/logo (2)_3.webp'
import LanguageToggle from '../ui/LanguageToggle.jsx'
import defaultProfileAvatar from '../../cvg/profile.svg'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { cn } from '../../utils/cn.js'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api.js'
import { Modal } from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Spinner from '../ui/Spinner.jsx'

export default function SiteHeader() {
  const { isRtl, t } = useLanguage()
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  const [me, setMe] = useState(null)

  const [badgeTotal, setBadgeTotal] = useState(0)

  const loggedIn = Boolean(auth?.token)

  async function runSearch() {
    const q = String(searchQuery || '').trim()
    if (!q) {
      setSearchError('')
      return
    }

    try {
      setSearchError('')
      setSearchLoading(true)
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setSearchOpen(false)
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || (isRtl ? 'فشل البحث' : 'Search failed')
      setSearchError(msg)
    } finally {
      setSearchLoading(false)
    }
  }

  function openSearch() {
    setSearchOpen(true)
    setSearchError('')
    setSearchQuery('')
  }

  useEffect(() => {
    let alive = true

    async function loadMe() {
      if (!loggedIn) return
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
  }, [loggedIn])

  useEffect(() => {
    let alive = true
    let intervalId = null

    async function loadBadges() {
      if (!auth?.token) return
      const role = String(auth?.role || '')
      if (role !== 'admin' && role !== 'teacher' && role !== 'team') {
        if (!alive) return
        setBadgeTotal(0)
        return
      }
      try {
        const res = await api.get('/notifications/badges')
        const total = Number(res?.data?.total || 0)
        if (!alive) return
        setBadgeTotal(Number.isFinite(total) ? total : 0)
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
  }, [auth?.role, auth?.token])

  const displayName = useMemo(() => {
    return String(me?.name || me?.email || '').trim()
  }, [me?.email, me?.name])

  const avatarUrl = me?.profile?.avatarUrl || ''

  function dashboardHref() {
    if (auth?.role === 'admin') return '/admin'
    if (auth?.role === 'teacher') return '/teacher'
    if (auth?.role === 'team') return '/team'
    if (auth?.role === 'student') return '/student'
    return '/'
  }

  const quickLinks = useMemo(() => {
    const role = auth?.role

    if (role === 'student') {
      return [
        { to: '/student', icon: BookOpen, label: t('dashboard.nav.my_courses') },
        { to: '/student/redeem', icon: KeyRound, label: isRtl ? 'استرداد كود' : 'Redeem' },
        { to: '/student/assignments', icon: LayoutDashboard, label: t('dashboard.nav.assignments') },
        { to: '/student/assessments', icon: ListChecks, label: t('dashboard.nav.assessments') },
        { to: '/student/grades', icon: ClipboardCheck, label: isRtl ? 'درجاتي' : 'My Grades' },
        { to: '/student/stats', icon: BarChart3, label: isRtl ? 'إحصائياتي' : 'My stats' },
        { to: '/student/profile', icon: GraduationCap, label: t('dashboard.titles.profile') }
      ]
    }

    if (role === 'teacher') {
      return [
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
    }

    if (role === 'team') {
      return [
        { to: '/team', icon: BookOpen, label: t('dashboard.nav.courses') },
        { to: '/team/queue', icon: LayoutDashboard, label: t('dashboard.nav.queue') },
        { to: '/team/approvals', icon: CheckCircle, label: t('dashboard.nav.approvals') },
        { to: '/team/motivational-message', icon: MessageSquareQuote, label: isRtl ? 'رسالة للطلاب' : 'Student message' },
        { to: '/team/students', icon: Users, label: t('dashboard.nav.students') },
        { to: '/team/access-codes', icon: KeyRound, label: isRtl ? 'أكواد' : 'Codes' },
        { to: '/team/assessments', icon: ListChecks, label: t('dashboard.nav.assessments') },
        { to: '/team/profile', icon: GraduationCap, label: t('dashboard.titles.profile') }
      ]
    }

    if (role === 'admin') {
      return [
        { to: '/admin', icon: LayoutDashboard, label: t('dashboard.nav.overview') },
        { to: '/admin/users', icon: Users, label: t('dashboard.nav.users') },
        { to: '/admin/courses', icon: BookOpen, label: isRtl ? 'إدارة الكورسات' : 'Courses' },
        { to: '/admin/approvals', icon: CheckCircle, label: t('dashboard.nav.approvals') },
        { to: '/admin/applications', icon: ClipboardList, label: t('dashboard.nav.applications') },
        { to: '/admin/motivational-message', icon: MessageSquareQuote, label: isRtl ? 'رسالة للطلاب' : 'Student message' },
        { to: '/admin/profile', icon: GraduationCap, label: t('dashboard.titles.profile') }
      ]
    }

    return []
  }, [auth?.role, isRtl, t])

  return (
    <>
      <header className="top-0 z-[100] fixed bg-white/30 dark:bg-[#0a0a0a]/30 shadow-glass-md backdrop-blur-glass-heavy border-white/20 dark:border-white/10 border-b w-full">
        <div className={"mx-auto px-3 sm:px-4 py-2 min-w-0 w-full max-w-7xl"}>
          <div className="md:hidden items-center grid grid-cols-3">
            <div className={cn('flex items-center gap-2', isRtl ? 'justify-end flex-row-reverse' : 'justify-start flex-row')}>
              <button
                type="button"
                aria-label={isRtl ? 'بحث' : 'Search'}
                title={isRtl ? 'بحث' : 'Search'}
                onClick={openSearch}
                className="flex justify-center items-center hover:bg-black/[0.04] dark:hover:bg-white/[0.08] rounded-full w-8 h-8 text-slate-800 dark:text-slate-100 transition"
              >
                <Search className="w-4 h-4" />
              </button>

              <ThemeToggle className="shrink-0" />
            </div>

            <Link to="/" className="flex justify-center items-center">
              <img src={logo} alt="Education Platform" className="w-auto h-11" />
            </Link>

            <div className="flex justify-end items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative flex justify-center items-center bg-black rounded-full w-9 h-9 text-slate-100"
                aria-label={t('dashboard.ui.menu')}
                title={t('dashboard.ui.menu')}
              >
                <span className="absolute inset-0 rounded-full overflow-hidden">
                  <img
                    src={loggedIn ? (avatarUrl || defaultProfileAvatar) : defaultProfileAvatar}
                    alt={displayName || (isRtl ? 'المستخدم' : 'User')}
                    className="w-full h-full object-cover"
                  />
                </span>
                {loggedIn && badgeTotal > 0 ? (
                  <span className="-top-1 -right-1 absolute flex justify-center items-center bg-rose-600 shadow px-1 border-2 border-black rounded-full min-w-4 h-4 text-[10px] text-white">
                    {badgeTotal > 99 ? '99+' : badgeTotal}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {loggedIn ? (
            <div className={"hidden md:flex justify-between items-center gap-3 " + (isRtl ? 'flex-row-reverse' : '')}>
              <div className={"flex items-center gap-3 " + (isRtl ? 'flex-row-reverse' : '')}>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="relative flex justify-center items-center bg-black rounded-full w-10 h-10 text-slate-100"
                  aria-label={t('dashboard.ui.menu')}
                  title={t('dashboard.ui.menu')}
                >
                  <span className="absolute inset-0 rounded-full overflow-hidden">
                    <img src={avatarUrl || defaultProfileAvatar} alt={displayName || 'User'} className="w-full h-full object-cover" />
                  </span>
                  {badgeTotal > 0 ? (
                    <span className="-top-1 -right-1 absolute flex justify-center items-center bg-rose-600 shadow px-1 border-2 border-black rounded-full min-w-5 h-5 text-[11px] text-white">
                      {badgeTotal > 99 ? '99+' : badgeTotal}
                    </span>
                  ) : null}
                </button>

                <ThemeToggle className="shrink-0" />
              </div>

              <nav className={cn('hidden md:flex items-center gap-0.5', isRtl ? 'flex-row-reverse' : 'flex-row')}>
                {quickLinks.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.to === '/admin' || it.to === '/teacher' || it.to === '/team' || it.to === '/student'}
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

              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2">
                  <img src={logo} alt="Education Platform" className="w-auto h-10 sm:h-11 md:h-[48px]" />
                </Link>
              </div>
            </div>
          ) : (
            <div className={"hidden md:flex justify-between items-center" + (isRtl ? ' flex-row-reverse' : '')}>
              <div className={"flex items-center gap-2 " + (isRtl ? 'flex-row-reverse' : '')}>
                <button
                  type="button"
                  onClick={openSearch}
                  aria-label={isRtl ? 'ابحث في الموقع' : 'Search the site'}
                  className="inline-flex justify-center items-center hover:bg-black/[0.04] dark:hover:bg-white/[0.08] rounded-full w-9 h-9 text-slate-700 dark:text-slate-200 transition"
                >
                  <Search className="w-5 h-5" />
                </button>
                <ThemeToggle className="shrink-0" />
              </div>

              <div className={"flex items-center gap-3 " + (isRtl ? 'flex-row-reverse' : '')}>
                <Link
                  to="/login"
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-brand text-sm transition-colors',
                    'bg-white/70 border border-black/5 shadow-sm hover:shadow-md',
                    'dark:bg-transparent dark:border dark:border-transparent dark:shadow-none dark:hover:shadow-none',
                    'dark:hover:bg-transparent dark:hover:border-brand dark:focus-visible:border-brand'
                  )}
                >
                  <LogIn className="w-4 h-4" />
                  {isRtl ? 'سجل دخولك' : t('auth.login')}
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="bg-brand hover:bg-brand-600 px-5 border border-brand/20 rounded-xl text-white transition"
                >
                  <Link to="/register" className={cn('inline-flex items-center gap-2', isRtl ? 'flex-row' : 'flex-row-reverse')}>
                    <UserPlus className="w-4 h-4" />
                    {isRtl ? 'اعمل حساب جديد!' : 'Create account'}
                  </Link>
                </Button>
                <Link to="/" className="flex items-center gap-2">
                  <img src={logo} alt="Education Platform" className="w-auto h-10 sm:h-11 md:h-[48px]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {open ? (
        <div className="z-[110] fixed inset-0">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'} />
          <div
            className={cn(
              'top-0 absolute bg-white/90 dark:bg-[#0a0a0a]/90 shadow-glass-lg backdrop-blur-glass-heavy p-4 border border-slate-200/50 dark:border-white/10 w-[88%] max-w-sm h-full overflow-y-auto',
              'right-0 rounded-l-[1.25rem] sm:rounded-l-3xl'
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className={cn('flex justify-between items-center gap-2 px-2 py-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{isRtl ? 'القائمة' : 'Menu'}</div>
              <div className={cn('flex items-center gap-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
                <LanguageToggle />
                <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                  {isRtl ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </div>

            <div className="gap-2 grid px-2 pt-2">
              {!loggedIn ? (
                <div className="gap-2 grid">
                  <Button
                    asChild
                    className="bg-brand hover:bg-brand-600 px-5 border border-brand/20 rounded-xl w-full text-white transition"
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/register">{isRtl ? 'اعمل حساب جديد!' : 'Create account'}</Link>
                  </Button>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className={cn(
                      'py-2 font-semibold text-brand text-sm text-center hover:underline underline-offset-4',
                      isRtl ? 'text-right' : 'text-left'
                    )}
                  >
                    {isRtl ? 'سجل دخولك' : t('auth.login')}
                  </Link>
                </div>
              ) : (
                <div className="gap-2 grid">
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
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{displayName || t('dashboard.titles.profile')}</div>
                    </div>
                  </div>

                  {auth?.role ? (
                    <Button asChild variant="secondary" className="w-full" onClick={() => setOpen(false)}>
                      <Link to={auth.role === 'student' ? '/student/profile' : auth.role === 'teacher' ? '/teacher/profile' : auth.role === 'team' ? '/team/profile' : '/admin/profile'}>
                        {t('dashboard.titles.profile')}
                      </Link>
                    </Button>
                  ) : null}
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
                    {t('auth.logout')}
                  </Button>

                  {quickLinks.length ? (
                    <div className="gap-1 grid mt-1">
                      {quickLinks.map((it) => (
                        <NavLink
                          key={it.to}
                          to={it.to}
                          end={it.to === dashboardHref()}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 px-3 py-2 rounded-2xl font-medium text-sm transition-all duration-200 ease-out',
                              isRtl ? 'flex-row-reverse text-right' : 'text-left',
                              isActive
                                ? 'bg-gradient-to-r from-brand/20 to-brand/10 text-slate-900 dark:text-slate-100 border border-brand/20'
                                : 'text-slate-700 hover:bg-black/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]'
                            )
                          }
                        >
                          {it.icon ? <it.icon className="w-4 h-4" /> : null}
                          <span className="truncate">{it.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="bg-[rgb(247,244,236)] dark:bg-[#202020] px-3 py-3 border border-black/5 dark:border-white/10 rounded-2xl">
                <div className={cn('flex items-center gap-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
                  <Search className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'بحث' : 'Search'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        open={searchOpen}
        onOpenChange={(v) => {
          setSearchOpen(Boolean(v))
          if (!v) {
            setSearchLoading(false)
            setSearchError('')
            setSearchQuery('')
          }
        }}
        title={isRtl ? 'ابحث في كورسات الموقع..' : 'Search courses'}
        contentClassName="bg-[#0b1220] border-white/10 rounded-3xl"
        bodyClassName="bg-[#0b1220]"
      >
        <div className={cn('gap-5 grid', isRtl ? 'text-right' : 'text-left')}>
          <div className={cn('flex items-center gap-2', isRtl ? 'flex-row' : 'flex-row-reverse')}>
            <Search className="w-5 h-5 text-brand" />
            <div className="font-semibold text-white text-sm">
              {isRtl ? 'ابحث بكلمة وسيتم عرض النتائج في صفحة البحث' : 'Type a keyword and open results page'}
            </div>
          </div>

          <div className="relative">
            <div
              className={cn(
                'flex items-center gap-3 bg-white/[0.06] px-4 py-3 border-0 rounded-2xl transition',
                'outline-none focus:outline-none focus-within:outline-none focus-within:ring-0 focus-within:ring-offset-0 shadow-none',
                isRtl ? 'flex-row' : 'flex-row-reverse'
              )}
            >
              <Search className="w-5 h-5 text-white/60 shrink-0" />
              <Input
                dir={isRtl ? 'rtl' : 'ltr'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'اكتب كلمة للبحث...' : 'Type to search...'}
                className="bg-transparent shadow-none px-0 py-0 border-0 focus-visible:border-transparent rounded-none outline-none focus-visible:outline-none focus:outline-none !focus-visible:ring-0 !focus-visible:ring-offset-0 h-auto text-white placeholder:text-white/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    runSearch()
                  }
                }}
              />
            </div>
          </div>

          <Button
            type="button"
            className="bg-brand shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:brightness-95 py-2 rounded-2xl w-full min-h-[48px] text-white leading-relaxed"
            onClick={runSearch}
            disabled={searchLoading}
          >
            {searchLoading ? <Spinner className="w-4 h-4" /> : null}
            {isRtl ? 'بحث' : 'Search'}
          </Button>

          {searchError ? <div className="text-rose-200 text-sm">{searchError}</div> : null}
        </div>
      </Modal>
    </>
  )
}

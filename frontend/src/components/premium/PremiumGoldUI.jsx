import React, { useMemo, useState } from 'react'

const translations = {
  en: {
    brand: 'Edu Platform',
    languageLabel: 'Language',
    roleStudent: 'Student',
    roleInstructor: 'Instructor',
    roleInstructorAdmin: 'Instructor Admin',

    breadcrumbHome: 'Home',
    breadcrumbLearning: 'Learning',
    breadcrumbInstructor: 'Instructor',
    breadcrumbAdmin: 'Admin',

    heroTitle: 'Learn with clarity. Grow with confidence.',
    heroSubtitle: 'Premium learning experience designed for focus, progress, and results.',
    heroCtaPrimary: 'Explore Courses',
    heroCtaSecondary: 'View Categories',
    heroImageAlt: 'Hero image',

    categoriesTitle: 'Categories',
    categoriesSubtitle: 'Find what fits your goals.',
    advantagesTitle: 'Why learners choose us',
    advantagesSubtitle: 'Premium learning, minimal distractions.',
    advantagesImageAlt: 'Advantages image',

    coursesTitle: 'Featured Courses',
    coursesSubtitle: 'Pick a path and start learning today.',
    courseRatingLabel: 'Rating',
    courseCategoryLabel: 'Category',
    courseCtaStart: 'Start Learning',
    courseCtaManage: 'Manage Course',

    servicesTitle: 'Student Services',
    servicesSubtitle: 'Support beyond the classroom.',
    serviceCvTitle: 'CV Preparation',
    serviceCvDesc: 'Polish your resume and stand out.',
    serviceMentoringTitle: 'Mentoring',
    serviceMentoringDesc: 'Guidance from experienced mentors.',
    serviceCareerTitle: 'Career Support',
    serviceCareerDesc: 'Interview prep and career advice.',

    faqTitle: 'FAQ',
    faqSubtitle: 'Quick answers to common questions.',
    faqQ1: 'How do I start a course?',
    faqA1: 'Choose a course and press “Start Learning”.',
    faqQ2: 'Can I learn on mobile?',
    faqA2: 'Yes, the experience is fully responsive.',
    faqQ3: 'Do I get support?',
    faqA3: 'Student services include mentoring and career support.',

    instructorHeaderTitle: 'Instructor Workspace',
    instructorHeaderSubtitle: 'Manage teaching and content in one place.',
    overviewTitle: 'Overview',
    overviewCourses: 'Courses',
    overviewStudents: 'Students',
    overviewContent: 'Content',
    myCoursesTitle: 'My Courses',
    myCoursesSubtitle: 'Your active teaching catalog.',
    toolsTitle: 'Instructor Tools',
    toolsSubtitle: 'Everything you need to teach effectively.',
    tool1Title: 'Announcements',
    tool1Desc: 'Notify learners with important updates.',
    tool2Title: 'Resources',
    tool2Desc: 'Share PDFs, links, and materials.',
    tool3Title: 'Discussions',
    tool3Desc: 'Engage students and answer questions.',
    helpTitle: 'Help & Support',
    helpSubtitle: 'We’re here to assist you.',

    adminSidebarDashboard: 'Dashboard',
    adminSidebarMyCourses: 'My Courses',
    adminSidebarStudents: 'Students',
    adminSidebarContent: 'Content',
    adminSidebarSettings: 'Settings',

    adminHeaderTitle: 'Control Panel',
    adminHeaderSubtitle: 'Monitor performance and manage content.',
    adminOverviewTitle: 'Admin Overview',
    adminCourseMgmtTitle: 'Course Management',
    adminCourseMgmtSubtitle: 'Quick access to course controls.',
    adminToolsTitle: 'Admin Tools',
    adminToolsSubtitle: 'Operational panels and guidelines.',
    adminGuidelinesTitle: 'Help & Guidelines',
    adminGuidelinesSubtitle: 'Maintain quality and consistency across the platform.',

    ctaManage: 'Manage',
    placeholderBreadcrumbCurrent: 'Current Page',
    placeholderAvatarAlt: 'Avatar',
    placeholderImageAlt: 'Image',
    placeholderNumber: '—',
    placeholderTextShort: 'Placeholder text',
    placeholderTextLong:
      'This is placeholder content. It represents an existing production field or message rendered by the system.'
  },
  ar: {
    brand: 'منصة التعليم',
    languageLabel: 'اللغة',
    roleStudent: 'طالب',
    roleInstructor: 'مدرّس',
    roleInstructorAdmin: 'لوحة المدرّس',

    breadcrumbHome: 'الرئيسية',
    breadcrumbLearning: 'التعلّم',
    breadcrumbInstructor: 'المدرّس',
    breadcrumbAdmin: 'الإدارة',

    heroTitle: 'تعلّم بوضوح. وتقدّم بثقة.',
    heroSubtitle: 'تجربة تعلّم فاخرة مصممة للتركيز والتقدّم والنتائج.',
    heroCtaPrimary: 'استكشف الدورات',
    heroCtaSecondary: 'عرض التصنيفات',
    heroImageAlt: 'صورة البطل',

    categoriesTitle: 'التصنيفات',
    categoriesSubtitle: 'اعثر على ما يناسب أهدافك.',
    advantagesTitle: 'لماذا يختارنا المتعلمون',
    advantagesSubtitle: 'تعلّم فخم بأقل تشتيت.',
    advantagesImageAlt: 'صورة المزايا',

    coursesTitle: 'دورات مميزة',
    coursesSubtitle: 'اختر المسار وابدأ التعلّم اليوم.',
    courseRatingLabel: 'التقييم',
    courseCategoryLabel: 'التصنيف',
    courseCtaStart: 'ابدأ التعلّم',
    courseCtaManage: 'إدارة الدورة',

    servicesTitle: 'خدمات الطالب',
    servicesSubtitle: 'دعم يتجاوز الفصل الدراسي.',
    serviceCvTitle: 'تجهيز السيرة الذاتية',
    serviceCvDesc: 'حسّن سيرتك وبرز بين الآخرين.',
    serviceMentoringTitle: 'الإرشاد',
    serviceMentoringDesc: 'توجيه من خبراء وموجّهين.',
    serviceCareerTitle: 'دعم المسار المهني',
    serviceCareerDesc: 'تجهيز للمقابلات ونصائح مهنية.',

    faqTitle: 'الأسئلة الشائعة',
    faqSubtitle: 'إجابات سريعة لأكثر الأسئلة شيوعًا.',
    faqQ1: 'كيف أبدأ دورة؟',
    faqA1: 'اختر دورة ثم اضغط “ابدأ التعلّم”.',
    faqQ2: 'هل يمكنني التعلّم من الهاتف؟',
    faqA2: 'نعم، التجربة متجاوبة بالكامل.',
    faqQ3: 'هل يوجد دعم؟',
    faqA3: 'تتوفر خدمات مثل الإرشاد والدعم المهني.',

    instructorHeaderTitle: 'مساحة المدرّس',
    instructorHeaderSubtitle: 'إدارة التدريس والمحتوى في مكان واحد.',
    overviewTitle: 'نظرة عامة',
    overviewCourses: 'الدورات',
    overviewStudents: 'الطلاب',
    overviewContent: 'المحتوى',
    myCoursesTitle: 'دوراتي',
    myCoursesSubtitle: 'كتالوج التدريس النشط لديك.',
    toolsTitle: 'أدوات المدرّس',
    toolsSubtitle: 'كل ما تحتاجه للتدريس بكفاءة.',
    tool1Title: 'الإعلانات',
    tool1Desc: 'أبلغ الطلاب بالتحديثات المهمة.',
    tool2Title: 'الموارد',
    tool2Desc: 'شارك ملفات وروابط ومواد.',
    tool3Title: 'النقاشات',
    tool3Desc: 'تفاعل مع الطلاب وأجب عن الأسئلة.',
    helpTitle: 'المساعدة والدعم',
    helpSubtitle: 'نحن هنا لمساعدتك.',

    adminSidebarDashboard: 'لوحة التحكم',
    adminSidebarMyCourses: 'دوراتي',
    adminSidebarStudents: 'الطلاب',
    adminSidebarContent: 'المحتوى',
    adminSidebarSettings: 'الإعدادات',

    adminHeaderTitle: 'لوحة الإدارة',
    adminHeaderSubtitle: 'راقب الأداء وأدر المحتوى.',
    adminOverviewTitle: 'نظرة عامة للإدارة',
    adminCourseMgmtTitle: 'إدارة الدورات',
    adminCourseMgmtSubtitle: 'وصول سريع لأدوات التحكم بالدورات.',
    adminToolsTitle: 'أدوات الإدارة',
    adminToolsSubtitle: 'لوحات تشغيلية وإرشادات.',
    adminGuidelinesTitle: 'المساعدة والإرشادات',
    adminGuidelinesSubtitle: 'حافظ على الجودة والاتساق عبر المنصة.',

    ctaManage: 'إدارة',
    placeholderBreadcrumbCurrent: 'الصفحة الحالية',
    placeholderAvatarAlt: 'الصورة الشخصية',
    placeholderImageAlt: 'صورة',
    placeholderNumber: '—',
    placeholderTextShort: 'نص تجريبي',
    placeholderTextLong:
      'هذا محتوى تجريبي. يمثل حقلاً موجودًا في نظام الإنتاج أو رسالة يعرضها النظام.'
  }
}

function t(lang, key) {
  return (translations[lang] && translations[lang][key]) || translations.en[key] || key
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function AppSurface({ lang, children }) {
  const isRtl = lang === 'ar'
  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cx(
        'min-h-screen',
        'bg-white text-slate-900',
        'dark:bg-neutral-950 dark:text-white',
        'selection:bg-amber-200/50 dark:selection:bg-amber-200/20'
      )}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-200/10" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-100/30 blur-3xl dark:bg-amber-200/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.06),transparent_55%)]" />
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}

function Container({ className, children }) {
  return <div className={cx('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}

function SoftCard({ className, children }) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-black/5 bg-white/90 shadow-sm backdrop-blur',
        'dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none',
        className
      )}
    >
      {children}
    </div>
  )
}

function GoldButton({ children, variant = 'primary', className }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 dark:focus-visible:ring-amber-200/40'
  const styles =
    variant === 'primary'
      ? 'bg-amber-300 text-neutral-950 hover:bg-amber-200 active:bg-amber-300/90 dark:bg-amber-200 dark:hover:bg-amber-100'
      : 'border border-black/5 bg-white/70 text-slate-900 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.06]'
  return <button className={cx(base, styles, className)}>{children}</button>
}

function MutedPill({ children, className }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border border-black/5 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700',
        'dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200',
        className
      )}
    >
      {children}
    </span>
  )
}

function Breadcrumbs({ lang, items }) {
  const isRtl = lang === 'ar'
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
      {items.map((it, idx) => (
        <React.Fragment key={it.key}>
          <span className={cx('font-medium', idx === items.length - 1 && 'text-slate-900 dark:text-white')}>{it.label}</span>
          {idx !== items.length - 1 ? <span className="opacity-60">{isRtl ? '‹' : '›'}</span> : null}
        </React.Fragment>
      ))}
    </nav>
  )
}

function SectionHeader({ title, subtitle, align = 'start' }) {
  return (
    <div className={cx('grid gap-1', align === 'center' ? 'text-center' : '')}>
      <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{title}</div>
      {subtitle ? <div className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</div> : null}
    </div>
  )
}

function PlaceholderImage({ alt, className }) {
  return (
    <div
      aria-label={alt}
      className={cx(
        'relative overflow-hidden rounded-2xl border border-black/5 bg-slate-50',
        'dark:border-white/10 dark:bg-white/[0.03]',
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(251,191,36,0.06),transparent_35%,rgba(251,191,36,0.06))] dark:bg-[linear-gradient(120deg,rgba(251,191,36,0.08),transparent_35%,rgba(251,191,36,0.08))]" />
      <div className="flex h-full items-center justify-center">
        <div className="rounded-xl border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          {alt}
        </div>
      </div>
    </div>
  )
}

function CourseCard({ lang, course, ctaLabelKey }) {
  const isRtl = lang === 'ar'
  return (
    <SoftCard className="group overflow-hidden">
      <div className={cx('flex gap-4 p-4', isRtl ? 'flex-row-reverse' : 'flex-row')}>
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_55%)]" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent dark:from-black/20" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t(lang, 'placeholderImageAlt')}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{course.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <MutedPill>
                  {t(lang, 'courseCategoryLabel')}: {course.category}
                </MutedPill>
                <MutedPill>
                  {t(lang, 'courseRatingLabel')}: {course.rating}
                </MutedPill>
              </div>
            </div>

            <div className="shrink-0">
              <GoldButton className="px-3 py-2" variant="primary">
                {t(lang, ctaLabelKey)}
              </GoldButton>
            </div>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-amber-300 dark:bg-amber-200" />
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-200/70 dark:bg-white/10" />
      <div className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{t(lang, 'placeholderTextShort')}</div>
    </SoftCard>
  )
}

function StatCard({ title, value, hint }) {
  return (
    <SoftCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{title}</div>
          <div className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">{value}</div>
        </div>
        <div className="h-9 w-9 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-200/30 dark:bg-amber-200/10 dark:text-amber-200" />
      </div>
      {hint ? <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">{hint}</div> : null}
    </SoftCard>
  )
}

function Accordion({ lang, items }) {
  const [openKey, setOpenKey] = useState(items[0]?.key || null)
  const isRtl = lang === 'ar'
  return (
    <div className="grid gap-2">
      {items.map((it) => {
        const open = openKey === it.key
        return (
          <SoftCard key={it.key} className="overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenKey(open ? null : it.key)}
              className={cx('flex w-full items-center justify-between gap-3 p-4 text-start', 'hover:bg-slate-50 dark:hover:bg-white/[0.04]')}
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{it.q}</div>
              <span
                className={cx(
                  'inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/5 bg-white text-slate-700',
                  'dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200'
                )}
              >
                {open ? '−' : '+'}
              </span>
            </button>
            <div className={cx('grid transition-all', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <div className={cx('px-4 pb-4 text-sm text-slate-600 dark:text-slate-300', isRtl ? 'text-right' : 'text-left')}>{it.a}</div>
              </div>
            </div>
          </SoftCard>
        )
      })}
    </div>
  )
}

export function StudentLayout({ lang = 'en', children, breadcrumbKeys }) {
  const isRtl = lang === 'ar'
  const crumbs = useMemo(() => {
    const base = [
      { key: 'home', label: t(lang, 'breadcrumbHome') },
      { key: 'learning', label: t(lang, 'breadcrumbLearning') }
    ]
    const extra = (breadcrumbKeys || []).map((k) => ({ key: k, label: t(lang, k) }))
    return [...base, ...extra]
  }, [lang, breadcrumbKeys])

  return (
    <AppSurface lang={lang}>
      <header className="relative border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-neutral-950/40">
        <Container className="py-5">
          <div className={cx('flex items-center justify-between gap-4', isRtl ? 'flex-row-reverse' : 'flex-row')}>
            <div className="grid gap-1">
              <div className={cx('flex items-center gap-2', isRtl ? 'justify-end' : 'justify-start')}>
                <div className="h-9 w-9 rounded-xl bg-amber-300 dark:bg-amber-200" />
                <div className="text-sm font-semibold tracking-tight">{t(lang, 'brand')}</div>
                <MutedPill>{t(lang, 'roleStudent')}</MutedPill>
              </div>
              <Breadcrumbs lang={lang} items={crumbs} />
            </div>

            <div className={cx('flex items-center gap-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <MutedPill>
                {t(lang, 'languageLabel')}: {lang.toUpperCase()}
              </MutedPill>
              <GoldButton variant="secondary">{t(lang, 'heroCtaSecondary')}</GoldButton>
              <GoldButton>{t(lang, 'heroCtaPrimary')}</GoldButton>
            </div>
          </div>
        </Container>
      </header>

      <main className="relative">
        <Container className="py-8">{children}</Container>
      </main>

      <footer className="relative border-t border-black/5 bg-white/60 py-8 backdrop-blur dark:border-white/10 dark:bg-neutral-950/40">
        <Container>
          <div className={cx('flex items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-300', isRtl ? 'flex-row-reverse' : 'flex-row')}>
            <div className="font-semibold text-slate-900 dark:text-white">{t(lang, 'brand')}</div>
            <div>{t(lang, 'placeholderTextShort')}</div>
          </div>
        </Container>
      </footer>
    </AppSurface>
  )
}

export function InstructorLayout({ lang = 'en', children, breadcrumbKeys }) {
  const isRtl = lang === 'ar'
  const crumbs = useMemo(() => {
    const base = [
      { key: 'home', label: t(lang, 'breadcrumbHome') },
      { key: 'instructor', label: t(lang, 'breadcrumbInstructor') }
    ]
    const extra = (breadcrumbKeys || []).map((k) => ({ key: k, label: t(lang, k) }))
    return [...base, ...extra]
  }, [lang, breadcrumbKeys])

  return (
    <AppSurface lang={lang}>
      <header className="relative border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-neutral-950/40">
        <Container className="py-5">
          <div className={cx('flex items-center justify-between gap-4', isRtl ? 'flex-row-reverse' : 'flex-row')}>
            <div className="grid gap-1">
              <div className={cx('flex items-center gap-2', isRtl ? 'justify-end' : 'justify-start')}>
                <div className="h-9 w-9 rounded-xl bg-amber-300 dark:bg-amber-200" />
                <div className="text-sm font-semibold tracking-tight">{t(lang, 'brand')}</div>
                <MutedPill>{t(lang, 'roleInstructor')}</MutedPill>
              </div>
              <Breadcrumbs lang={lang} items={crumbs} />
            </div>

            <div className={cx('flex items-center gap-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <MutedPill>
                {t(lang, 'languageLabel')}: {lang.toUpperCase()}
              </MutedPill>
              <GoldButton variant="secondary">{t(lang, 'helpTitle')}</GoldButton>
              <GoldButton>{t(lang, 'myCoursesTitle')}</GoldButton>
            </div>
          </div>
        </Container>
      </header>

      <main className="relative">
        <Container className="py-8">{children}</Container>
      </main>
    </AppSurface>
  )
}

export function InstructorAdminLayout({ lang = 'en', pageTitleKey, breadcrumbKeys, children }) {
  const isRtl = lang === 'ar'
  const crumbs = useMemo(() => {
    const base = [
      { key: 'home', label: t(lang, 'breadcrumbHome') },
      { key: 'admin', label: t(lang, 'breadcrumbAdmin') }
    ]
    const extra = (breadcrumbKeys || []).map((k) => ({ key: k, label: t(lang, k) }))
    return [...base, ...extra]
  }, [lang, breadcrumbKeys])

  const sidebarItems = useMemo(
    () => [
      { key: 'dash', label: t(lang, 'adminSidebarDashboard') },
      { key: 'courses', label: t(lang, 'adminSidebarMyCourses') },
      { key: 'students', label: t(lang, 'adminSidebarStudents') },
      { key: 'content', label: t(lang, 'adminSidebarContent') },
      { key: 'settings', label: t(lang, 'adminSidebarSettings') }
    ],
    [lang]
  )

  return (
    <AppSurface lang={lang}>
      <div className={cx('min-h-screen', isRtl ? 'flex flex-row-reverse' : 'flex')}>
        <aside
          className={cx(
            'sticky top-0 h-screen w-[280px] shrink-0 border-black/5 bg-white/70 backdrop-blur',
            'dark:border-white/10 dark:bg-neutral-950/40',
            isRtl ? 'border-l' : 'border-r',
            'hidden lg:block'
          )}
        >
          <div className="p-5">
            <div className={cx('flex items-center gap-3', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <div className="h-10 w-10 rounded-2xl bg-amber-300 dark:bg-amber-200" />
              <div className={cx('min-w-0', isRtl ? 'text-right' : 'text-left')}>
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'brand')}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{t(lang, 'roleInstructorAdmin')}</div>
              </div>
            </div>

            <div className="mt-5 h-px bg-slate-200/70 dark:bg-white/10" />

            <nav className="mt-5 grid gap-1">
              {sidebarItems.map((it, idx) => {
                const active = idx === 0
                return (
                  <button
                    key={it.key}
                    type="button"
                    className={cx(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition',
                      isRtl ? 'flex-row-reverse justify-end text-right' : 'justify-start text-left',
                      active
                        ? 'border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-200/30 dark:bg-amber-200/10 dark:text-amber-200'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.04]'
                    )}
                  >
                    <span
                      className={cx(
                        'h-9 w-9 rounded-xl border',
                        active
                          ? 'border-amber-200 bg-amber-200/40 dark:border-amber-200/30 dark:bg-amber-200/10'
                          : 'border-black/5 bg-white dark:border-white/10 dark:bg-white/[0.04]'
                      )}
                    />
                    <span className="truncate">{it.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="mt-5 h-px bg-slate-200/70 dark:bg-white/10" />

            <SoftCard className="mt-5 p-4">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t(lang, 'helpTitle')}</div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">{t(lang, 'placeholderTextLong')}</div>
              <div className={cx('mt-3 flex', isRtl ? 'justify-end' : 'justify-start')}>
                <GoldButton className="px-3 py-2" variant="secondary">
                  {t(lang, 'helpTitle')}
                </GoldButton>
              </div>
            </SoftCard>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-neutral-950/40">
            <Container className="py-4">
              <div className={cx('flex items-center justify-between gap-4', isRtl ? 'flex-row-reverse' : 'flex-row')}>
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, pageTitleKey || 'adminHeaderTitle')}</div>
                  <Breadcrumbs lang={lang} items={crumbs} />
                </div>

                <div className={cx('flex items-center gap-3', isRtl ? 'flex-row-reverse' : 'flex-row')}>
                  <MutedPill>
                    {t(lang, 'languageLabel')}: {lang.toUpperCase()}
                  </MutedPill>
                  <div
                    className={cx(
                      'h-9 w-9 overflow-hidden rounded-2xl border border-black/5 bg-white',
                      'dark:border-white/10 dark:bg-white/[0.04]'
                    )}
                    aria-label={t(lang, 'placeholderAvatarAlt')}
                    title={t(lang, 'placeholderAvatarAlt')}
                  />
                </div>
              </div>
            </Container>
          </header>

          <main className="relative">
            <Container className="py-8">{children}</Container>
          </main>
        </div>
      </div>
    </AppSurface>
  )
}

export function StudentLandingPageUI({ lang = 'en', data }) {
  const isRtl = lang === 'ar'
  const courses = (data && data.courses) || [
    { thumbnail: 'placeholder', title: 'Course Title A', category: 'Category', rating: '4.8' },
    { thumbnail: 'placeholder', title: 'Course Title B', category: 'Category', rating: '4.6' },
    { thumbnail: 'placeholder', title: 'Course Title C', category: 'Category', rating: '4.7' },
    { thumbnail: 'placeholder', title: 'Course Title D', category: 'Category', rating: '4.5' }
  ]

  const categories = (data && data.categories) || [
    { key: 'cat1', label: 'Category A' },
    { key: 'cat2', label: 'Category B' },
    { key: 'cat3', label: 'Category C' },
    { key: 'cat4', label: 'Category D' },
    { key: 'cat5', label: 'Category E' },
    { key: 'cat6', label: 'Category F' }
  ]

  const advantages = (data && data.advantages) || [
    { key: 'adv1', title: t(lang, 'placeholderTextShort'), desc: t(lang, 'placeholderTextLong') },
    { key: 'adv2', title: t(lang, 'placeholderTextShort'), desc: t(lang, 'placeholderTextLong') },
    { key: 'adv3', title: t(lang, 'placeholderTextShort'), desc: t(lang, 'placeholderTextLong') }
  ]

  return (
    <StudentLayout lang={lang} breadcrumbKeys={['placeholderBreadcrumbCurrent']}>
      <section className="grid gap-6">
        <SoftCard className="overflow-hidden">
          <div className={cx('grid gap-6 p-6 lg:grid-cols-2 lg:items-center', isRtl ? 'lg:[direction:rtl]' : 'lg:[direction:ltr]')}>
            <div className={cx('grid gap-4', isRtl ? 'text-right' : 'text-left')}>
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-300 dark:bg-amber-200" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">{t(lang, 'breadcrumbLearning')}</span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{t(lang, 'heroTitle')}</h1>

              <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">{t(lang, 'heroSubtitle')}</p>

              <div className={cx('flex flex-wrap gap-3', isRtl ? 'justify-end' : 'justify-start')}>
                <GoldButton>{t(lang, 'heroCtaPrimary')}</GoldButton>
                <GoldButton variant="secondary">{t(lang, 'heroCtaSecondary')}</GoldButton>
              </div>

              <div className={cx('flex flex-wrap gap-2 pt-1', isRtl ? 'justify-end' : 'justify-start')}>
                <MutedPill>{t(lang, 'placeholderTextShort')}</MutedPill>
                <MutedPill>{t(lang, 'placeholderTextShort')}</MutedPill>
                <MutedPill>{t(lang, 'placeholderTextShort')}</MutedPill>
              </div>
            </div>

            <div className={cx(isRtl ? 'order-first lg:order-none' : '')}>
              <PlaceholderImage alt={t(lang, 'heroImageAlt')} className="h-64 w-full lg:h-80" />
            </div>
          </div>
        </SoftCard>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'categoriesTitle')} subtitle={t(lang, 'categoriesSubtitle')} />
          <div className={cx('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', isRtl ? 'text-right' : 'text-left')}>
            {categories.map((c) => (
              <SoftCard key={c.key} className="p-4">
                <div className={cx('flex items-center gap-3', isRtl ? 'flex-row-reverse justify-end' : 'justify-start')}>
                  <div className="h-10 w-10 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{c.label}</div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t(lang, 'placeholderTextShort')}</div>
                  </div>
                </div>
              </SoftCard>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'advantagesTitle')} subtitle={t(lang, 'advantagesSubtitle')} />
          <div className={cx('grid gap-4 lg:grid-cols-2', isRtl ? 'lg:[direction:rtl]' : 'lg:[direction:ltr]')}>
            <div className="grid gap-3">
              {advantages.map((a) => (
                <SoftCard key={a.key} className="p-4">
                  <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                    <div className="mt-0.5 h-10 w-10 rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]" />
                    <div className="grid gap-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">{a.desc}</div>
                    </div>
                  </div>
                </SoftCard>
              ))}
            </div>

            <PlaceholderImage alt={t(lang, 'advantagesImageAlt')} className="h-64 w-full lg:h-full" />
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'coursesTitle')} subtitle={t(lang, 'coursesSubtitle')} />
          <div className="grid gap-3 md:grid-cols-2">
            {courses.map((c, idx) => (
              <CourseCard key={`${c.title}-${idx}`} lang={lang} course={c} ctaLabelKey="courseCtaStart" />
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'servicesTitle')} subtitle={t(lang, 'servicesSubtitle')} />
          <div className="grid gap-3 md:grid-cols-3">
            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="h-11 w-11 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'serviceCvTitle')}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'serviceCvDesc')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="h-11 w-11 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'serviceMentoringTitle')}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'serviceMentoringDesc')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="h-11 w-11 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'serviceCareerTitle')}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'serviceCareerDesc')}</div>
                </div>
              </div>
            </SoftCard>
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'faqTitle')} subtitle={t(lang, 'faqSubtitle')} />
          <Accordion
            lang={lang}
            items={[
              { key: 'q1', q: t(lang, 'faqQ1'), a: t(lang, 'faqA1') },
              { key: 'q2', q: t(lang, 'faqQ2'), a: t(lang, 'faqA2') },
              { key: 'q3', q: t(lang, 'faqQ3'), a: t(lang, 'faqA3') }
            ]}
          />
        </section>
      </section>
    </StudentLayout>
  )
}

export function InstructorWorkspacePageUI({ lang = 'en', data }) {
  const isRtl = lang === 'ar'
  const myCourses = (data && data.courses) || [
    { thumbnail: 'placeholder', title: 'Course Title A', category: 'Category', rating: '4.8' },
    { thumbnail: 'placeholder', title: 'Course Title B', category: 'Category', rating: '4.6' },
    { thumbnail: 'placeholder', title: 'Course Title C', category: 'Category', rating: '4.7' }
  ]

  return (
    <InstructorLayout lang={lang} breadcrumbKeys={['placeholderBreadcrumbCurrent']}>
      <section className="grid gap-6">
        <SoftCard className="p-6">
          <div className={cx('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', isRtl ? 'md:flex-row-reverse' : 'md:flex-row')}>
            <div className={cx('grid gap-1', isRtl ? 'text-right' : 'text-left')}>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{t(lang, 'instructorHeaderTitle')}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'instructorHeaderSubtitle')}</div>
            </div>
            <div className={cx('flex gap-2', isRtl ? 'justify-end md:flex-row-reverse' : 'justify-start')}>
              <GoldButton variant="secondary">{t(lang, 'toolsTitle')}</GoldButton>
              <GoldButton>{t(lang, 'myCoursesTitle')}</GoldButton>
            </div>
          </div>
        </SoftCard>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'overviewTitle')} subtitle={t(lang, 'placeholderTextShort')} />
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard title={t(lang, 'overviewCourses')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
            <StatCard title={t(lang, 'overviewStudents')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
            <StatCard title={t(lang, 'overviewContent')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'myCoursesTitle')} subtitle={t(lang, 'myCoursesSubtitle')} />
          <div className="grid gap-3 md:grid-cols-2">
            {myCourses.map((c, idx) => (
              <CourseCard key={`${c.title}-${idx}`} lang={lang} course={c} ctaLabelKey="courseCtaManage" />
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'toolsTitle')} subtitle={t(lang, 'toolsSubtitle')} />
          <div className="grid gap-3 md:grid-cols-3">
            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="h-11 w-11 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'tool1Title')}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'tool1Desc')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="h-11 w-11 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'tool2Title')}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'tool2Desc')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="h-11 w-11 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'tool3Title')}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'tool3Desc')}</div>
                </div>
              </div>
            </SoftCard>
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'helpTitle')} subtitle={t(lang, 'helpSubtitle')} />
          <SoftCard className="p-6">
            <div className={cx('grid gap-4 md:grid-cols-2 md:items-center', isRtl ? 'md:[direction:rtl]' : 'md:[direction:ltr]')}>
              <div className={cx('grid gap-2', isRtl ? 'text-right' : 'text-left')}>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'helpTitle')}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'placeholderTextLong')}</div>
                <div className={cx('flex gap-2 pt-1', isRtl ? 'justify-end' : 'justify-start')}>
                  <GoldButton>{t(lang, 'helpTitle')}</GoldButton>
                  <GoldButton variant="secondary">{t(lang, 'placeholderTextShort')}</GoldButton>
                </div>
              </div>
              <PlaceholderImage alt={t(lang, 'placeholderImageAlt')} className="h-40 w-full" />
            </div>
          </SoftCard>
        </section>
      </section>
    </InstructorLayout>
  )
}

export function InstructorAdminDashboardPageUI({ lang = 'en', data }) {
  const isRtl = lang === 'ar'
  const courses = (data && data.courses) || [
    { thumbnail: 'placeholder', title: 'Course Title A', category: 'Category', rating: '4.8' },
    { thumbnail: 'placeholder', title: 'Course Title B', category: 'Category', rating: '4.6' },
    { thumbnail: 'placeholder', title: 'Course Title C', category: 'Category', rating: '4.7' },
    { thumbnail: 'placeholder', title: 'Course Title D', category: 'Category', rating: '4.5' }
  ]

  return (
    <InstructorAdminLayout lang={lang} pageTitleKey="adminHeaderTitle" breadcrumbKeys={['placeholderBreadcrumbCurrent']}>
      <section className="grid gap-6">
        <SoftCard className="p-6">
          <div className={cx('flex flex-col gap-3 md:flex-row md:items-center md:justify-between', isRtl ? 'md:flex-row-reverse' : 'md:flex-row')}>
            <div className={cx('grid gap-1', isRtl ? 'text-right' : 'text-left')}>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{t(lang, 'adminHeaderTitle')}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'adminHeaderSubtitle')}</div>
            </div>
            <div className={cx('flex items-center gap-2', isRtl ? 'justify-end md:flex-row-reverse' : 'justify-start')}>
              <GoldButton variant="secondary">{t(lang, 'adminToolsTitle')}</GoldButton>
              <GoldButton>{t(lang, 'adminCourseMgmtTitle')}</GoldButton>
            </div>
          </div>
        </SoftCard>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'adminOverviewTitle')} subtitle={t(lang, 'placeholderTextShort')} />
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard title={t(lang, 'overviewCourses')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
            <StatCard title={t(lang, 'overviewStudents')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
            <StatCard title={t(lang, 'overviewContent')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'adminCourseMgmtTitle')} subtitle={t(lang, 'adminCourseMgmtSubtitle')} />
          <SoftCard className="overflow-hidden">
            <div className={cx('grid gap-2 p-4', isRtl ? 'text-right' : 'text-left')}>
              <div className={cx('hidden grid-cols-12 gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300 md:grid', isRtl ? 'text-right' : 'text-left')}>
                <div className="col-span-6">{t(lang, 'myCoursesTitle')}</div>
                <div className="col-span-3">{t(lang, 'courseCategoryLabel')}</div>
                <div className="col-span-2">{t(lang, 'courseRatingLabel')}</div>
                <div className="col-span-1">{t(lang, 'ctaManage')}</div>
              </div>

              <div className="h-px bg-slate-200/70 dark:bg-white/10" />

              <div className="grid gap-2">
                {courses.map((c, idx) => (
                  <div
                    key={`${c.title}-${idx}`}
                    className={cx(
                      'rounded-2xl border border-black/5 bg-white/80 p-4 transition hover:bg-white',
                      'dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]'
                    )}
                  >
                    <div className={cx('grid gap-3 md:grid-cols-12 md:items-center', isRtl ? 'md:[direction:rtl]' : 'md:[direction:ltr]')}>
                      <div className={cx('md:col-span-6', isRtl ? 'text-right' : 'text-left')}>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t(lang, 'placeholderTextShort')}</div>
                      </div>

                      <div className={cx('md:col-span-3', isRtl ? 'text-right' : 'text-left')}>
                        <MutedPill>
                          {t(lang, 'courseCategoryLabel')}: {c.category}
                        </MutedPill>
                      </div>

                      <div className={cx('md:col-span-2', isRtl ? 'text-right' : 'text-left')}>
                        <MutedPill>
                          {t(lang, 'courseRatingLabel')}: {c.rating}
                        </MutedPill>
                      </div>

                      <div className={cx('md:col-span-1', isRtl ? 'justify-end' : 'justify-start', 'flex')}>
                        <GoldButton className="px-3 py-2">{t(lang, 'ctaManage')}</GoldButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SoftCard>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'adminToolsTitle')} subtitle={t(lang, 'adminToolsSubtitle')} />
          <div className="grid gap-3 md:grid-cols-3">
            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="h-11 w-11 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'placeholderTextShort')}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'placeholderTextLong')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="h-11 w-11 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'placeholderTextShort')}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'placeholderTextLong')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="h-11 w-11 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-200/30 dark:bg-amber-200/10" />
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'placeholderTextShort')}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'placeholderTextLong')}</div>
                </div>
              </div>
            </SoftCard>
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeader title={t(lang, 'adminGuidelinesTitle')} subtitle={t(lang, 'adminGuidelinesSubtitle')} />
          <SoftCard className="p-6">
            <div className={cx('grid gap-4 md:grid-cols-2 md:items-center', isRtl ? 'md:[direction:rtl]' : 'md:[direction:ltr]')}>
              <div className={cx('grid gap-2', isRtl ? 'text-right' : 'text-left')}>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{t(lang, 'adminGuidelinesTitle')}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{t(lang, 'placeholderTextLong')}</div>
                <div className={cx('flex gap-2 pt-1', isRtl ? 'justify-end' : 'justify-start')}>
                  <GoldButton>{t(lang, 'helpTitle')}</GoldButton>
                  <GoldButton variant="secondary">{t(lang, 'placeholderTextShort')}</GoldButton>
                </div>
              </div>
              <PlaceholderImage alt={t(lang, 'placeholderImageAlt')} className="h-40 w-full" />
            </div>
          </SoftCard>
        </section>
      </section>
    </InstructorAdminLayout>
  )
}

export function PremiumGoldPageShellUI({ lang = 'en', role = 'student', data }) {
  if (role === 'student') return <StudentLandingPageUI lang={lang} data={data} />
  if (role === 'instructor') return <InstructorWorkspacePageUI lang={lang} data={data} />
  return <InstructorAdminDashboardPageUI lang={lang} data={data} />
}

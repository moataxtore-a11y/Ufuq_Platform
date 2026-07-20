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
        'selection:bg-brand/30 dark:selection:bg-brand/20'
      )}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="-top-24 -left-24 absolute bg-brand/10 dark:bg-brand/5 blur-3xl rounded-full w-80 h-80" />
        <div className="-right-24 -bottom-24 absolute bg-brand/10 dark:bg-brand/5 blur-3xl rounded-full w-80 h-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,148,132,0.05),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(6,148,132,0.03),transparent_55%)]" />
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

function BrandButton({ children, variant = 'primary', className }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
  const styles =
    variant === 'primary'
      ? 'bg-brand text-white hover:bg-brand-600 active:bg-brand-700'
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
    <nav className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
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
      <div className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight">{title}</div>
      {subtitle ? <div className="text-slate-600 dark:text-slate-300 text-sm">{subtitle}</div> : null}
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
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(6,148,132,0.05),transparent_35%,rgba(6,148,132,0.05))] dark:bg-[linear-gradient(120deg,rgba(6,148,132,0.08),transparent_35%,rgba(6,148,132,0.08))]" />
      <div className="flex justify-center items-center h-full">
        <div className="bg-white dark:bg-white/[0.04] shadow-sm px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl font-semibold text-slate-600 dark:text-slate-300 text-xs">
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
        <div className="relative bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-xl w-28 h-20 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,148,132,0.12),transparent_55%)]" />
          <div className="bottom-0 absolute inset-x-0 bg-gradient-to-t from-black/10 dark:from-black/20 to-transparent h-8" />
          <div className="absolute inset-0 flex justify-center items-center font-semibold text-slate-600 dark:text-slate-300 text-xs">
            {t(lang, 'placeholderImageAlt')}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{course.title}</div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <MutedPill>
                  {t(lang, 'courseCategoryLabel')}: {course.category}
                </MutedPill>
                <MutedPill>
                  {t(lang, 'courseRatingLabel')}: {course.rating}
                </MutedPill>
              </div>
            </div>

            <div className="shrink-0">
              <BrandButton className="px-3 py-2" variant="primary">
                {t(lang, ctaLabelKey)}
              </BrandButton>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-white/10 mt-3 rounded-full w-full h-1.5 overflow-hidden">
            <div className="bg-brand dark:bg-brand-400 rounded-full w-1/3 h-full" />
          </div>
        </div>
      </div>

      <div className="bg-slate-200/70 dark:bg-white/10 h-px" />
      <div className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">{t(lang, 'placeholderTextShort')}</div>
    </SoftCard>
  )
}

function StatCard({ title, value, hint }) {
  return (
    <SoftCard className="p-4">
      <div className="flex justify-between items-start gap-3">
        <div className="gap-1 grid">
          <div className="font-semibold text-slate-600 dark:text-slate-300 text-xs">{title}</div>
          <div className="font-semibold tabular-nums text-slate-900 dark:text-white text-2xl tracking-tight">{value}</div>
        </div>
        <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-xl w-9 h-9 text-brand dark:text-brand-300" />
      </div>
      {hint ? <div className="mt-2 text-slate-600 dark:text-slate-300 text-xs">{hint}</div> : null}
    </SoftCard>
  )
}

function Accordion({ lang, items }) {
  const [openKey, setOpenKey] = useState(items[0]?.key || null)
  const isRtl = lang === 'ar'
  return (
    <div className="gap-2 grid">
      {items.map((it) => {
        const open = openKey === it.key
        return (
          <SoftCard key={it.key} className="overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenKey(open ? null : it.key)}
              className={cx('flex w-full items-center justify-between gap-3 p-4 text-start', 'hover:bg-slate-50 dark:hover:bg-white/[0.04]')}
            >
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{it.q}</div>
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
      <header className="relative bg-white/70 dark:bg-neutral-950/40 backdrop-blur border-black/5 dark:border-white/10 border-b">
        <Container className="py-5">
          <div className={cx('flex items-center justify-between gap-4', isRtl ? 'flex-row-reverse' : 'flex-row')}>
            <div className="gap-1 grid">
              <div className={cx('flex items-center gap-2', isRtl ? 'justify-end' : 'justify-start')}>
                <div className="bg-brand dark:bg-brand-400 rounded-xl w-9 h-9" />
                <div className="font-semibold text-sm tracking-tight">{t(lang, 'brand')}</div>
                <MutedPill>{t(lang, 'roleStudent')}</MutedPill>
              </div>
              <Breadcrumbs lang={lang} items={crumbs} />
            </div>

            <div className={cx('flex items-center gap-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <MutedPill>
                {t(lang, 'languageLabel')}: {lang.toUpperCase()}
              </MutedPill>
              <BrandButton variant="secondary">{t(lang, 'heroCtaSecondary')}</BrandButton>
              <BrandButton>{t(lang, 'heroCtaPrimary')}</BrandButton>
            </div>
          </div>
        </Container>
      </header>

      <main className="relative">
        <Container className="py-8">{children}</Container>
      </main>

      <footer className="relative bg-white/60 dark:bg-neutral-950/40 backdrop-blur py-8 border-black/5 dark:border-white/10 border-t">
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
      <header className="relative bg-white/70 dark:bg-neutral-950/40 backdrop-blur border-black/5 dark:border-white/10 border-b">
        <Container className="py-5">
          <div className={cx('flex items-center justify-between gap-4', isRtl ? 'flex-row-reverse' : 'flex-row')}>
            <div className="gap-1 grid">
              <div className={cx('flex items-center gap-2', isRtl ? 'justify-end' : 'justify-start')}>
                <div className="bg-brand dark:bg-brand-400 rounded-xl w-9 h-9" />
                <div className="font-semibold text-sm tracking-tight">{t(lang, 'brand')}</div>
                <MutedPill>{t(lang, 'roleInstructor')}</MutedPill>
              </div>
              <Breadcrumbs lang={lang} items={crumbs} />
            </div>

            <div className={cx('flex items-center gap-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <MutedPill>
                {t(lang, 'languageLabel')}: {lang.toUpperCase()}
              </MutedPill>
              <BrandButton variant="secondary">{t(lang, 'helpTitle')}</BrandButton>
              <BrandButton>{t(lang, 'myCoursesTitle')}</BrandButton>
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
              <div className="bg-brand dark:bg-brand-400 rounded-2xl w-10 h-10" />
              <div className={cx('min-w-0', isRtl ? 'text-right' : 'text-left')}>
                <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{t(lang, 'brand')}</div>
                <div className="text-slate-600 dark:text-slate-300 text-xs">{t(lang, 'roleInstructorAdmin')}</div>
              </div>
            </div>

            <div className="bg-slate-200/70 dark:bg-white/10 mt-5 h-px" />

            <nav className="gap-1 grid mt-5">
              {sidebarItems.map((it, idx) => {
                const active = idx === 0
                return (
                  <button
                    key={it.key}
                    type="button"
                    className={cx(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition w-full',
                      isRtl ? 'flex-row-reverse justify-end text-right' : 'justify-start text-left',
                      active
                        ? 'border border-brand/20 bg-brand/10 text-brand dark:border-brand/30 dark:bg-brand/20 dark:text-brand-300'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.04]'
                    )}
                  >
                    <span
                      className={cx(
                        'h-9 w-9 rounded-xl border flex-shrink-0',
                        active
                          ? 'border-brand/20 bg-brand/20 dark:border-brand/30 dark:bg-brand/30'
                          : 'border-black/5 bg-white dark:border-white/10 dark:bg-white/[0.04]'
                      )}
                    />
                    <span className="truncate">{it.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="bg-slate-200/70 dark:bg-white/10 mt-5 h-px" />

            <SoftCard className="mt-5 p-4">
              <div className="font-semibold text-slate-600 dark:text-slate-300 text-xs">{t(lang, 'helpTitle')}</div>
              <div className="mt-2 text-slate-600 dark:text-slate-300 text-xs">{t(lang, 'placeholderTextLong')}</div>
              <div className={cx('mt-3 flex', isRtl ? 'justify-end' : 'justify-start')}>
                <BrandButton className="px-3 py-2" variant="secondary">
                  {t(lang, 'helpTitle')}
                </BrandButton>
              </div>
            </SoftCard>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="top-0 z-10 sticky bg-white/70 dark:bg-neutral-950/40 backdrop-blur border-black/5 dark:border-white/10 border-b">
            <Container className="py-4">
              <div className={cx('flex items-center justify-between gap-4', isRtl ? 'flex-row-reverse' : 'flex-row')}>
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, pageTitleKey || 'adminHeaderTitle')}</div>
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
      <section className="gap-6 grid">
        <SoftCard className="overflow-hidden">
          <div className={cx('grid gap-6 p-6 lg:grid-cols-2 lg:items-center', isRtl ? 'lg:[direction:rtl]' : 'lg:[direction:ltr]')}>
            <div className={cx('grid gap-4', isRtl ? 'text-right' : 'text-left')}>
              <div className="inline-flex items-center gap-2">
                <span className="bg-brand dark:bg-brand-400 rounded-full w-2 h-2" />
                <span className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">{t(lang, 'breadcrumbLearning')}</span>
              </div>

              <h1 className="font-semibold text-slate-900 dark:text-white text-3xl sm:text-4xl tracking-tight">{t(lang, 'heroTitle')}</h1>

              <p className="max-w-xl text-slate-600 dark:text-slate-300 text-sm leading-6">{t(lang, 'heroSubtitle')}</p>

              <div className={cx('flex flex-wrap gap-3', isRtl ? 'justify-end' : 'justify-start')}>
                <BrandButton>{t(lang, 'heroCtaPrimary')}</BrandButton>
                <BrandButton variant="secondary">{t(lang, 'heroCtaSecondary')}</BrandButton>
              </div>

              <div className={cx('flex flex-wrap gap-2 pt-1', isRtl ? 'justify-end' : 'justify-start')}>
                <MutedPill>{t(lang, 'placeholderTextShort')}</MutedPill>
                <MutedPill>{t(lang, 'placeholderTextShort')}</MutedPill>
                <MutedPill>{t(lang, 'placeholderTextShort')}</MutedPill>
              </div>
            </div>

            <div className={cx(isRtl ? 'order-first lg:order-none' : '')}>
              <PlaceholderImage alt={t(lang, 'heroImageAlt')} className="w-full h-64 lg:h-80" />
            </div>
          </div>
        </SoftCard>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'categoriesTitle')} subtitle={t(lang, 'categoriesSubtitle')} />
          <div className={cx('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', isRtl ? 'text-right' : 'text-left')}>
            {categories.map((c) => (
              <SoftCard key={c.key} className="p-4">
                <div className={cx('flex items-center gap-3', isRtl ? 'flex-row-reverse justify-end' : 'justify-start')}>
                  <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-10 h-10" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{c.label}</div>
                    <div className="mt-1 text-slate-600 dark:text-slate-300 text-xs">{t(lang, 'placeholderTextShort')}</div>
                  </div>
                </div>
              </SoftCard>
            ))}
          </div>
        </section>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'advantagesTitle')} subtitle={t(lang, 'advantagesSubtitle')} />
          <div className={cx('grid gap-4 lg:grid-cols-2', isRtl ? 'lg:[direction:rtl]' : 'lg:[direction:ltr]')}>
            <div className="gap-3 grid">
              {advantages.map((a) => (
                <SoftCard key={a.key} className="p-4">
                  <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                    <div className="bg-white dark:bg-white/[0.04] shadow-sm mt-0.5 border border-black/5 dark:border-white/10 rounded-2xl w-10 h-10" />
                    <div className="gap-1 grid">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">{a.title}</div>
                      <div className="text-slate-600 dark:text-slate-300 text-sm">{a.desc}</div>
                    </div>
                  </div>
                </SoftCard>
              ))}
            </div>

            <PlaceholderImage alt={t(lang, 'advantagesImageAlt')} className="w-full h-64 lg:h-full" />
          </div>
        </section>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'coursesTitle')} subtitle={t(lang, 'coursesSubtitle')} />
          <div className="gap-3 grid md:grid-cols-2">
            {courses.map((c, idx) => (
              <CourseCard key={`${c.title}-${idx}`} lang={lang} course={c} ctaLabelKey="courseCtaStart" />
            ))}
          </div>
        </section>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'servicesTitle')} subtitle={t(lang, 'servicesSubtitle')} />
          <div className="gap-3 grid md:grid-cols-3">
            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-11 h-11" />
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'serviceCvTitle')}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'serviceCvDesc')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-11 h-11" />
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'serviceMentoringTitle')}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'serviceMentoringDesc')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-11 h-11" />
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'serviceCareerTitle')}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'serviceCareerDesc')}</div>
                </div>
              </div>
            </SoftCard>
          </div>
        </section>

        <section className="gap-4 grid">
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
      <section className="gap-6 grid">
        <SoftCard className="p-6">
          <div className={cx('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', isRtl ? 'md:flex-row-reverse' : 'md:flex-row')}>
            <div className={cx('grid gap-1', isRtl ? 'text-right' : 'text-left')}>
              <div className="font-semibold text-slate-900 dark:text-white text-lg">{t(lang, 'instructorHeaderTitle')}</div>
              <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'instructorHeaderSubtitle')}</div>
            </div>
            <div className={cx('flex gap-2', isRtl ? 'justify-end md:flex-row-reverse' : 'justify-start')}>
              <BrandButton variant="secondary">{t(lang, 'toolsTitle')}</BrandButton>
              <BrandButton>{t(lang, 'myCoursesTitle')}</BrandButton>
            </div>
          </div>
        </SoftCard>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'overviewTitle')} subtitle={t(lang, 'placeholderTextShort')} />
          <div className="gap-3 grid md:grid-cols-3">
            <StatCard title={t(lang, 'overviewCourses')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
            <StatCard title={t(lang, 'overviewStudents')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
            <StatCard title={t(lang, 'overviewContent')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
          </div>
        </section>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'myCoursesTitle')} subtitle={t(lang, 'myCoursesSubtitle')} />
          <div className="gap-3 grid md:grid-cols-2">
            {myCourses.map((c, idx) => (
              <CourseCard key={`${c.title}-${idx}`} lang={lang} course={c} ctaLabelKey="courseCtaManage" />
            ))}
          </div>
        </section>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'toolsTitle')} subtitle={t(lang, 'toolsSubtitle')} />
          <div className="gap-3 grid md:grid-cols-3">
            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-11 h-11" />
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'tool1Title')}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'tool1Desc')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-11 h-11" />
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'tool2Title')}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'tool2Desc')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-11 h-11" />
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'tool3Title')}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'tool3Desc')}</div>
                </div>
              </div>
            </SoftCard>
          </div>
        </section>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'helpTitle')} subtitle={t(lang, 'helpSubtitle')} />
          <SoftCard className="p-6">
            <div className={cx('grid gap-4 md:grid-cols-2 md:items-center', isRtl ? 'md:[direction:rtl]' : 'md:[direction:ltr]')}>
              <div className={cx('grid gap-2', isRtl ? 'text-right' : 'text-left')}>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'helpTitle')}</div>
                <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'placeholderTextLong')}</div>
                <div className={cx('flex gap-2 pt-1', isRtl ? 'justify-end' : 'justify-start')}>
                  <BrandButton>{t(lang, 'helpTitle')}</BrandButton>
                  <BrandButton variant="secondary">{t(lang, 'placeholderTextShort')}</BrandButton>
                </div>
              </div>
              <PlaceholderImage alt={t(lang, 'placeholderImageAlt')} className="w-full h-40" />
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
      <section className="gap-6 grid">
        <SoftCard className="p-6">
          <div className={cx('flex flex-col gap-3 md:flex-row md:items-center md:justify-between', isRtl ? 'md:flex-row-reverse' : 'md:flex-row')}>
            <div className={cx('grid gap-1', isRtl ? 'text-right' : 'text-left')}>
              <div className="font-semibold text-slate-900 dark:text-white text-lg">{t(lang, 'adminHeaderTitle')}</div>
              <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'adminHeaderSubtitle')}</div>
            </div>
            <div className={cx('flex items-center gap-2', isRtl ? 'justify-end md:flex-row-reverse' : 'justify-start')}>
              <BrandButton variant="secondary">{t(lang, 'adminToolsTitle')}</BrandButton>
              <BrandButton>{t(lang, 'adminCourseMgmtTitle')}</BrandButton>
            </div>
          </div>
        </SoftCard>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'adminOverviewTitle')} subtitle={t(lang, 'placeholderTextShort')} />
          <div className="gap-3 grid md:grid-cols-3">
            <StatCard title={t(lang, 'overviewCourses')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
            <StatCard title={t(lang, 'overviewStudents')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
            <StatCard title={t(lang, 'overviewContent')} value={t(lang, 'placeholderNumber')} hint={t(lang, 'placeholderTextShort')} />
          </div>
        </section>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'adminCourseMgmtTitle')} subtitle={t(lang, 'adminCourseMgmtSubtitle')} />
          <SoftCard className="overflow-hidden">
            <div className={cx('grid gap-2 p-4', isRtl ? 'text-right' : 'text-left')}>
              <div className={cx('hidden grid-cols-12 gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300 md:grid', isRtl ? 'text-right' : 'text-left')}>
                <div className="col-span-6">{t(lang, 'myCoursesTitle')}</div>
                <div className="col-span-3">{t(lang, 'courseCategoryLabel')}</div>
                <div className="col-span-2">{t(lang, 'courseRatingLabel')}</div>
                <div className="col-span-1">{t(lang, 'ctaManage')}</div>
              </div>

              <div className="bg-slate-200/70 dark:bg-white/10 h-px" />

              <div className="gap-2 grid">
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
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{c.title}</div>
                        <div className="mt-1 text-slate-600 dark:text-slate-300 text-xs">{t(lang, 'placeholderTextShort')}</div>
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
                        <BrandButton className="px-3 py-2">{t(lang, 'ctaManage')}</BrandButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SoftCard>
        </section>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'adminToolsTitle')} subtitle={t(lang, 'adminToolsSubtitle')} />
          <div className="gap-3 grid md:grid-cols-3">
            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-11 h-11" />
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'adminCourseMgmtTitle')}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'adminCourseMgmtSubtitle')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-11 h-11" />
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'adminToolsTitle')}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'adminToolsSubtitle')}</div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="p-5">
              <div className={cx('flex items-start gap-3', isRtl ? 'flex-row-reverse text-right' : 'text-left')}>
                <div className="bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 rounded-2xl w-11 h-11" />
                <div className="gap-1 grid">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'adminGuidelinesTitle')}</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'adminGuidelinesSubtitle')}</div>
                </div>
              </div>
            </SoftCard>
          </div>
        </section>

        <section className="gap-4 grid">
          <SectionHeader title={t(lang, 'adminGuidelinesTitle')} subtitle={t(lang, 'adminGuidelinesSubtitle')} />
          <SoftCard className="p-6">
            <div className={cx('grid gap-4 md:grid-cols-2 md:items-center', isRtl ? 'md:[direction:rtl]' : 'md:[direction:ltr]')}>
              <div className={cx('grid gap-2', isRtl ? 'text-right' : 'text-left')}>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">{t(lang, 'adminGuidelinesTitle')}</div>
                <div className="text-slate-600 dark:text-slate-300 text-sm">{t(lang, 'placeholderTextLong')}</div>
                <div className={cx('flex gap-2 pt-1', isRtl ? 'justify-end' : 'justify-start')}>
                  <BrandButton>{t(lang, 'helpTitle')}</BrandButton>
                  <BrandButton variant="secondary">{t(lang, 'placeholderTextShort')}</BrandButton>
                </div>
              </div>
              <PlaceholderImage alt={t(lang, 'placeholderImageAlt')} className="w-full h-40" />
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

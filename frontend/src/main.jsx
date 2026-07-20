import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import App from './App.jsx'
import './index.css'
import { ToastProvider } from './components/ui/toast.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { useLanguage } from './context/LanguageContext.jsx'
import i18n from './i18n/i18n.js'
import WhatsAppButton from './components/ui/WhatsAppButton.jsx'

function ScrollToTop() {
  const location = useLocation()
  React.useLayoutEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      if (document?.documentElement) document.documentElement.scrollTop = 0
      if (document?.body) document.body.scrollTop = 0
    } catch {
      // ignore
    }
  }, [location.pathname, location.search])
  return null
}

function RouteTitle() {
  const { pathname } = useLocation()
  const { isRtl } = useLanguage()

  React.useEffect(() => {
    const brand = 'أُفُق للثانوية العامة'

    const ar = {
      '/': 'الرئيسية',
      '/login': 'تسجيل الدخول',
      '/register': 'إنشاء حساب',
      '/join-teachers': 'انضم كمدرس',
      '/change-password': 'تغيير كلمة المرور',
      '/profile': 'الملف الشخصي',
      '/admin': 'لوحة الأدمن',
      '/admin/overview': 'نظرة عامة',
      '/admin/users': 'المستخدمين',
      '/admin/approvals': 'الموافقات',
      '/admin/applications': 'طلبات الانضمام',
      '/teacher': 'لوحة المدرس',
      '/teacher/courses': 'الكورسات',
      '/teacher/access-codes': 'أكواد الدخول',
      '/teacher/approvals': 'الموافقات',
      '/teacher/assignments': 'الواجبات',
      '/teacher/assessments': 'الاختبارات',
      '/teacher/assessments/grading': 'تصحيح يدوي',
      '/teacher/students': 'الطلاب',
      '/teacher/team': 'الفريق',
      '/teacher/grades': 'الدرجات',
      '/team': 'لوحة الفريق',
      '/team/queue': 'الطابور',
      '/team/courses': 'الكورسات',
      '/team/access-codes': 'أكواد الدخول',
      '/team/approvals': 'الموافقات',
      '/team/assessments': 'الاختبارات',
      '/team/assessments/grading': 'تصحيح يدوي',
      '/team/students': 'الطلاب',
      '/student': 'لوحة الطالب',
      '/student/courses': 'كورساتي',
      '/student/select': 'اختيار مدرس',
      '/student/redeem': 'استرداد كود',
      '/student/assignments': 'الواجبات',
      '/student/assessments': 'الاختبارات',
      '/student/grades': 'الدرجات'
    }

    const en = {
      '/': 'Home',
      '/login': 'Login',
      '/register': 'Register',
      '/join-teachers': 'Join Teachers',
      '/change-password': 'Change Password',
      '/profile': 'Profile',
      '/admin': 'Admin Dashboard',
      '/admin/overview': 'Overview',
      '/admin/users': 'Users',
      '/admin/approvals': 'Approvals',
      '/admin/applications': 'Applications',
      '/teacher': 'Teacher Dashboard',
      '/teacher/courses': 'Courses',
      '/teacher/access-codes': 'Access Codes',
      '/teacher/approvals': 'Approvals',
      '/teacher/assignments': 'Assignments',
      '/teacher/assessments': 'Assessments',
      '/teacher/assessments/grading': 'Manual Grading',
      '/teacher/students': 'Students',
      '/teacher/team': 'Team',
      '/teacher/grades': 'Grades',
      '/team': 'Team Dashboard',
      '/team/queue': 'Queue',
      '/team/courses': 'Courses',
      '/team/access-codes': 'Access Codes',
      '/team/approvals': 'Approvals',
      '/team/assessments': 'Assessments',
      '/team/assessments/grading': 'Manual Grading',
      '/team/students': 'Students',
      '/student': 'Student Dashboard',
      '/student/courses': 'My Courses',
      '/student/select': 'Select Teacher',
      '/student/redeem': 'Redeem Code',
      '/student/assignments': 'Assignments',
      '/student/assessments': 'Assessments',
      '/student/grades': 'Grades'
    }

    const table = isRtl ? ar : en

    const exact = table[pathname]
    const computed = exact || (pathname.startsWith('/courses/') ? (isRtl ? 'الكورس' : 'Course') : null)
    document.title = computed ? `${computed} | ${brand}` : brand
  }, [pathname, isRtl])

  return null
}



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <RouteTitle />
              <WhatsAppButton />
              <App />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </ToastProvider>
  </React.StrictMode>
)

import { Link } from 'react-router-dom'
import logo from '../../cvg/logo (2)_3.webp'
import CompanyCredit from './CompanyCredit.jsx'

function BrandIcon({ name, className }) {
  if (name === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M23.5 6.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.8 2.6 12 2.6 12 2.6h0s-4.8 0-8.2.3c-.5.1-1.5.1-2.4 1C.7 4.6.5 6.2.5 6.2S.2 8.1.2 10v1.9c0 1.9.3 3.8.3 3.8s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 8 .3 8 .3s4.8 0 8.2-.3c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.3-1.9.3-3.8V10c0-1.9-.3-3.8-.3-3.8zM9.8 13.9V7.8l6.3 3.1-6.3 3z" />
      </svg>
    )
  }

  if (name === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M16.7 3c.5 3.4 2.9 5.4 6.1 5.6v3.2c-1.9.1-3.6-.5-5.1-1.5v6.3c0 4-3.3 7.2-7.4 7.2-4.1 0-7.4-3.2-7.4-7.2s3.3-7.2 7.4-7.2c.4 0 .8 0 1.2.1v3.6c-.4-.1-.8-.2-1.2-.2-2.1 0-3.7 1.6-3.7 3.7 0 2 1.7 3.7 3.7 3.7 2.2 0 3.9-1.8 3.7-4.2V3h2.7z" />
      </svg>
    )
  }

  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8z" />
        <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        <path d="M17.6 5.8a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.7 22v-8h2.7l.4-3.1h-3.1V9c0-.9.3-1.6 1.7-1.6h1.5V4.6c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6v1.8H7v3.1h2.2v8h4.5z" />
    </svg>
  )
}

export default function SiteFooter() {
  return <footer className="site-footer" dir="rtl">
    <div className="site-footer-inner">
      <div className="site-footer-brand">
        <Link to="/" aria-label="الصفحة الرئيسية"><img src={logo} alt="أُفُق" /></Link>
        <p>تم صنع هذه المنصة بهدف تهيئة الطالب بكامل جوانب الثانوية العامة وما بعدها.<br />معاك في كل خطوة، لحد ما توصل لحلمك.</p>
      </div>
      <nav className="site-footer-links" aria-label="روابط سريعة">
        <h3>روابط سريعة</h3>
        <Link to="/">الرئيسية</Link>
        <Link to="/#subjects">المواد المتاحة</Link>
        <Link to="/#choose-teachers">المدرسين</Link>
        <Link to="/login">تسجيل الدخول</Link>
        <Link to="/register">إنشاء حساب جديد</Link>
        <Link to="/join-teachers">انضم لفريقنا</Link>
        <CompanyCredit />
      </nav>
      <div className="site-footer-social"><h3>تابعنا على</h3><div>
        {['facebook', 'instagram', 'youtube'].map(name => <a key={name} href={'https://www.' + name + '.com'} target="_blank" rel="noreferrer" aria-label={name}><BrandIcon name={name} /></a>)}
      </div></div>
    </div>
  </footer>
}

import { Link } from 'react-router-dom'
import character from '../../assets/home/art-0.webp'

export default function HeroSection() {
  return <section className="home-hero" dir="rtl">
    <div className="home-mountains" aria-hidden="true" />
    <div className="home-hero-copy">
      <h1>أُفُق</h1>
      <p>منصة متكاملة بها كل ما يحتاجه الطالب ليتفوق في رحلته الدراسية، من البداية وحتى النجاح.</p>
      <Link className="home-button" to="/register">ابدأ رحلتك التعليمية مع أُفُق</Link>
    </div>
    <img className="home-character" src={character} alt="شخصية أُفُق التعليمية" fetchPriority="high" />
  </section>
}

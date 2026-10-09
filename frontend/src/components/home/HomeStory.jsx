import { Link } from 'react-router-dom'
import motivationArtwork from '../../assets/home/motivation-reference.svg'
import character from '../../assets/home/art-0.webp'
import team from '../../assets/home/art-3.webp'
import student from '../../assets/home/study-illustration.svg'

export function IntroSection() {
  return <section className="home-intro" dir="rtl">
    <img src={character} alt="" loading="lazy" />
    <div><h2>مش مجرد منصة.. <span>دي بداية أُفُق جديد!</span></h2><p>إحنا هنا عشان نسهل عليك الفهم، ونخلي رحلتك الدراسية أسهل وأمتع.<br />خطوة بخطوة، لحد ما توصل لحلمك.</p><span className="home-note">من أول درس، لحد آخر نجاح.</span></div>
    <svg className="home-wave" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90C220 260 420 0 670 70S1050 280 1440 30V220H0Z" fill="#afa391"/><path d="M0 160C300 0 430 250 800 100S1180 0 1440 160V220H0Z" fill="#776b5c"/></svg>
  </section>
}
const steps = [
  ['اختار صفك ومادتك', 'حدد الصف الدراسي والمادة اللي عايز تبدأ فيها، وخلي رحلتك مناسبة ليك من البداية.'],
  ['شوف الدرس وافهم', 'شرح واضح، أمثلة وتطبيقات، وكل اللي محتاجه عشان تستوعب المعلومة وتثبتها عندك.'],
  ['جرّب نفسك', 'حل التدريبات والاختبارات، واعرف مستواك وراجع اللي محتاج تشتغل عليه.'],
  ['تابع تقدمك', 'اعرف وصلت لفين وإيه الخطوة الجاية، وخليك دايمًا شايف طريقك قدامك.'],
  ['كمّل مشوارك', 'كل خطوة بتفرق، ومع كل درس وتدريب بتقرب من حلمك. إحنا معاك لحد ما تحقق هدفك.']
]
export function StudySteps() {
  return <section className="home-steps" dir="rtl"><h2>إزاي أُفُق بتسهّل عليك المذاكرة؟</h2><p>كل خطوة في المنصة معمولة عشان تخلي رحلتك التعليمية أسهل وأوضح.</p><div className="home-steps-grid">{steps.map(([title, text], i) => <article key={title}><span className="home-step-number">{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
}
export function MotivationSection() {
  return <section className="home-motivation-reference" dir="rtl" aria-labelledby="motivation-title">
    <h2 id="motivation-title" className="sr-only">كل خطوة صغيرة بتفرق.</h2>
    <p className="sr-only">درس خلصته، اختبار عديته، معلومة فهمتها، هدف قربت منه. استمر.. إنت أقرب مما تتخيل.</p>
    <img src={motivationArtwork} alt="" aria-hidden="true" loading="lazy" />
  </section>
}
export function HomeCta() {
  return <section className="home-cta home-cta-reference" dir="rtl"><article><div><h2>مذاكرتك معاك<br />في كل وقت</h2><p>دروسك وملفاتك متاحة ليك في أي وقت، وقت ما تحتاجها!</p><Link className="home-button home-button-light" to="/register">ابدأ رحلتك دلوقتي</Link></div><img src={student} alt="طالب يذاكر" loading="lazy" /></article><article><img src={team} alt="فريق أُفُق" loading="lazy" /><div><h2>عايز تكون جزء من<br />فريق أُفُق؟</h2><p>انضم لينا في فريق المنصة، وخلّي خبرتك تفرق في حياة طلاب كتير. نقدر ننجح ونطور التعليم سوا، ونفتح آفاق جديدة لكل طالب.</p><Link className="home-button home-button-light" to="/join-teachers">انضم دلوقتي لفريق أُفُق</Link></div></article></section>
}

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import heroPic from '../../img/3M@72x-8.png'

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          function tick(now) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { ref, count }
}

function StatItem({ target, label, suffix = '+' }) {
  const { ref, count } = useCountUp(target, 2200)
  return (
    <div ref={ref} className="flex flex-col justify-center items-center px-[clamp(0.25rem,2vw,1.5rem)] py-1">
      <span className="font-black text-white text-[clamp(1rem,3.5vw,3rem)] tracking-tight drop-shadow-sm">
        {suffix}{count}
      </span>
      <span className="mt-1 font-bold text-teal-100 dark:text-teal-200 text-[clamp(0.6rem,1.5vw,1.125rem)]">
        {label}
      </span>
    </div>
  )
}

export default function HeroSection() {
  const { isRtl, t } = useLanguage()

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -mt-[68px] sm:-mt-[72px] md:-mt-[76px] pt-20 sm:pt-24 lg:pt-28 flex flex-col overflow-hidden bg-gradient-to-br from-[#4ee3d0] via-[#6cecd9] to-[#c2f6ef] dark:from-[#052622] dark:via-[#083832] dark:to-[#0c443e]"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Background SVG Waves & Swooshes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <svg
          className="absolute w-full h-full object-cover opacity-40 dark:opacity-20"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M 500 -100 Q 1000 200 1500 -50 L 1500 1000 L -100 1000 Q 300 450 500 -100 Z"
            fill="url(#tealSwoosh1)"
          />
          <path
            d="M 200 1000 Q 800 300 1500 100 L 1500 1000 Z"
            fill="url(#tealSwoosh2)"
            opacity="0.8"
          />
          <path
            d="M -100 100 Q 600 -100 1300 400 Q 1550 700 1550 1000 L -100 1000 Z"
            fill="url(#tealSwoosh3)"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="tealSwoosh1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00bba9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#76ece0" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="tealSwoosh2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#008f81" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2bbbad" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="tealSwoosh3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3dbcb0" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>

        {/* Soft Ambient Glow */}
        <div className="absolute top-1/4 -right-20 w-[550px] h-[550px] bg-teal-300/30 dark:bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-[450px] h-[450px] bg-emerald-200/40 dark:bg-emerald-800/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col mx-auto px-[clamp(0.75rem,3vw,3rem)] pt-[clamp(1rem,2vw,1.5rem)] w-full max-w-7xl">
        
        {/* Content Row: Title (Right in RTL) + Character Image (Left in RTL) */}
        <div className="items-center gap-[clamp(0.5rem,3vw,2.5rem)] grid grid-cols-12 h-[clamp(300px,55vw,650px)] min-h-0">
          
          {/* Right Column in RTL: Title & Subtitle */}
          <div className="flex flex-col col-span-6 justify-center items-start space-y-[clamp(0.5rem,2vw,1.5rem)] z-20 order-1 min-w-0 text-start">
            
            {/* Main Title: منصة أُفُق */}
            <h1 className="font-perfect font-black text-slate-950 dark:text-teal-200 text-[clamp(1.75rem,7.2vw,6rem)] leading-[1.08] tracking-tight whitespace-nowrap drop-shadow-sm">
              <span className="inline-block ml-[clamp(0.2rem,1vw,0.5rem)]">
                {t('hero.titlePrefix') || 'منصة'}
              </span>
              <span className="inline-block">
                {t('hero.titleBrand') || 'أُفُق'}
              </span>
            </h1>

            {/* Description Subtitle */}
            <div className="space-y-1 max-w-xl font-bold text-slate-900 dark:text-slate-100 text-[clamp(0.68rem,2.1vw,1.5rem)] leading-[1.7]">
              <p className="drop-shadow-sm">
                منصة متكاملة بها كل ما يحتاجه الطالب ليتفوق
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[clamp(0.6rem,1.8vw,1.25rem)]">
                دروس مرتبة، اختبارات، وملفات مرفقة في مكان واحد.
              </p>
            </div>

          </div>

          {/* Left Column in RTL: 3D Character standing on left side */}
          <div className="relative flex col-span-6 justify-start items-end z-10 order-2 px-[clamp(0.25rem,1vw,0.75rem)] pt-2 h-full min-w-0 overflow-visible">
            <div className="relative flex justify-start items-end w-full max-w-[720px] h-full">
              <img
                src={heroPic}
                alt="Character Hero"
                className="relative z-10 object-contain origin-bottom w-full h-full drop-shadow-[0_20px_35px_rgba(0,90,80,0.16)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] transition-transform duration-500"
                style={{
                  width: '100%',
                  height: 'clamp(300px, 55vw, 650px)',
                  objectFit: 'contain',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
                }}
                draggable="false"
              />
            </div>
          </div>

        </div>

        {/* Floating Glassmorphic Stats Bar (Bottom Overlap Pill) */}
        <div className="relative z-30 flex justify-center -mt-[clamp(0.75rem,2.5vw,2.25rem)] mb-[clamp(1rem,2vw,1.5rem)] w-full">
          <div className="bg-[#0c6b73]/85 dark:bg-[#07474d]/90 shadow-[0_20px_50px_rgba(12,107,115,0.35)] hover:shadow-[0_25px_60px_rgba(12,107,115,0.45)] backdrop-blur-md px-[clamp(0.75rem,3vw,2rem)] py-[clamp(0.75rem,2vw,1.5rem)] border border-white/30 dark:border-teal-500/30 rounded-[clamp(1rem,3vw,2rem)] w-full max-w-4xl transition-all duration-300">
            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-white/30 dark:divide-teal-500/30 items-center text-center">
              <StatItem target={300} label="كورس" />
              <StatItem target={50} label="مدرس" />
              <StatItem target={5000} label="طالب" />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

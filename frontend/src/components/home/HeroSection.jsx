import { useLanguage } from '../../context/LanguageContext.jsx'
import heroPic from '../../img/3M@72x-8.png'

export default function HeroSection() {
  const { isRtl, t } = useLanguage()

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -mt-[68px] sm:-mt-[72px] md:-mt-[76px] pt-20 sm:pt-24 lg:pt-28 min-h-[88vh] lg:min-h-[92vh] flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4ee3d0] via-[#6cecd9] to-[#c2f6ef] dark:from-[#052622] dark:via-[#083832] dark:to-[#0c443e]"
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
      <div className="relative z-10 mx-auto px-4 sm:px-8 lg:px-12 w-full max-w-7xl flex-1 flex flex-col justify-between pt-6">
        
        {/* Content Row: Title (Right in RTL) + Character Image (Left in RTL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center flex-1">
          
          {/* Right Column in RTL: Title & Subtitle */}
          <div className="lg:col-span-6 order-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-right space-y-4 sm:space-y-6 z-20 pb-6 lg:pb-0">
            
            {/* Main Title: منصة أُفُق */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              <span className="inline-block text-slate-900 dark:text-slate-100 font-extrabold ml-3">
                {t('hero.titlePrefix') || 'منصة'}
              </span>
              <span className="inline-block font-perfect text-slate-950 dark:text-teal-200 drop-shadow-sm">
                {t('hero.titleBrand') || 'أُفُق'}
              </span>
            </h1>

            {/* Description Subtitle */}
            <div className="max-w-xl text-slate-900 dark:text-slate-100 text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed sm:leading-loose space-y-1">
              <p className="drop-shadow-sm">
                منصة متكاملة بها كل ما يحتاجه الطالب ليتفوق
              </p>
              <p className="text-slate-800 dark:text-slate-200 text-base sm:text-lg lg:text-xl font-semibold">
                دروس مرتبة، اختبارات، وملفات مرفقة في مكان واحد.
              </p>
            </div>

          </div>

          {/* Left Column in RTL: 3D Character standing on left side */}
          <div className="lg:col-span-6 order-2 flex justify-center lg:justify-start items-end h-full relative pt-2 lg:pt-0 z-10 overflow-hidden">
            <div className="relative w-full max-w-[420px] sm:max-w-[540px] lg:max-w-[660px] xl:max-w-[720px] flex items-end justify-center lg:justify-start">
              {/* Glow backdrop behind character */}
              <div className="absolute inset-0 bg-teal-400/25 dark:bg-teal-500/15 rounded-full blur-2xl scale-95 transform translate-y-6 pointer-events-none" />
              
              <img
                src={heroPic}
                alt="Character Hero"
                className="relative z-10 w-full h-auto object-contain max-h-[75vh] lg:max-h-[88vh] scale-105 sm:scale-110 lg:scale-115 origin-bottom translate-y-8 sm:translate-y-12 lg:translate-y-16 drop-shadow-[0_20px_35px_rgba(0,90,80,0.22)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-[0.75]"
                draggable="false"
              />
            </div>
          </div>

        </div>

        {/* Floating Glassmorphic Stats Bar (Bottom Overlap Pill) */}
        <div className="relative z-30 -mt-12 sm:-mt-16 lg:-mt-20 mb-4 sm:mb-6 w-full flex justify-center lg:justify-center">
          <div className="w-full max-w-3xl lg:max-w-4xl bg-[#0c6b73]/85 dark:bg-[#07474d]/90 backdrop-blur-md border border-white/30 dark:border-teal-500/30 rounded-[24px] sm:rounded-[32px] px-4 py-4 sm:px-8 sm:py-6 shadow-[0_20px_50px_rgba(12,107,115,0.35)] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(12,107,115,0.45)]">
            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-white/30 dark:divide-teal-500/30 items-center text-center">
              
              {/* Stat Item 1 (Rightmost in RTL): +300 كورس */}
              <div className="px-2 sm:px-6 py-1 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                  +300
                </span>
                <span className="text-xs sm:text-base lg:text-lg font-bold text-teal-100 dark:text-teal-200 mt-1">
                  كورس
                </span>
              </div>

              {/* Stat Item 2 (Middle in RTL): +50 مدرس */}
              <div className="px-2 sm:px-6 py-1 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                  +50
                </span>
                <span className="text-xs sm:text-base lg:text-lg font-bold text-teal-100 dark:text-teal-200 mt-1">
                  مدرس
                </span>
              </div>

              {/* Stat Item 3 (Leftmost in RTL): +5000 طالب */}
              <div className="px-2 sm:px-6 py-1 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                  +5000
                </span>
                <span className="text-xs sm:text-base lg:text-lg font-bold text-teal-100 dark:text-teal-200 mt-1">
                  طالب
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

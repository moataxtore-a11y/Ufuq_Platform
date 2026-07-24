import { useLanguage } from '../../context/LanguageContext.jsx'
import heroPic from '../../img/3M@72x-8.png'

export default function HeroSection() {
  const { isRtl, t } = useLanguage()

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -mt-[68px] sm:-mt-[72px] md:-mt-[76px] pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 min-h-[92vh] flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#53ebd8] via-[#7beedc] to-[#d0f9f3] dark:from-[#062925] dark:via-[#093933] dark:to-[#0e4841]"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Background SVG Waves & Swooshes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <svg
          className="absolute w-full h-full object-cover opacity-30 dark:opacity-25"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Curving swoosh 1 */}
          <path
            d="M 600 -100 Q 1050 180 1550 -20 L 1550 1000 L -100 1000 Q 350 480 600 -100 Z"
            fill="url(#tealSwoosh1)"
          />
          {/* Curving swoosh 2 */}
          <path
            d="M 250 1000 Q 850 350 1550 150 L 1550 1000 Z"
            fill="url(#tealSwoosh2)"
            opacity="0.75"
          />
          {/* Curving swoosh 3 */}
          <path
            d="M -100 150 Q 650 -80 1300 450 Q 1550 750 1550 1000 L -100 1000 Z"
            fill="url(#tealSwoosh3)"
            opacity="0.45"
          />
          <defs>
            <linearGradient id="tealSwoosh1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00b4a2" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#80e3d8" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="tealSwoosh2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00897b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#26a69a" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="tealSwoosh3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4db6ac" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 -right-20 w-[550px] h-[550px] bg-teal-300/30 dark:bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-[450px] h-[450px] bg-emerald-200/40 dark:bg-emerald-800/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-12 w-full max-w-7xl flex-1 flex flex-col justify-between">
        
        {/* Content Row: Character Image (Left in RTL) + Title & Desc (Right in RTL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center flex-1">
          
          {/* Left Column in RTL: 3D Character */}
          <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center lg:justify-start items-end h-full relative pt-4 lg:pt-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[480px]">
              {/* Soft background glow for character */}
              <div className="absolute inset-0 bg-teal-400/25 dark:bg-teal-500/15 rounded-full blur-2xl scale-95 transform translate-y-6" />
              
              <img
                src={heroPic}
                alt="Character Hero"
                className="relative z-10 w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,100,90,0.22)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-[1.01]"
                draggable="false"
              />
            </div>
          </div>

          {/* Right Column in RTL: Title & Subtitle */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center items-center lg:items-start text-center lg:text-right space-y-6">
            
            {/* Title: منصة أُفُق */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              <span className="inline-block text-slate-900 dark:text-slate-100 font-extrabold ml-3">
                {t('hero.titlePrefix') || 'منصة'}
              </span>
              <span className="inline-block font-perfect text-[#033c36] dark:text-teal-300 drop-shadow-sm">
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

        </div>

        {/* Floating Glassmorphic Stats Bar (Bottom Overlap Pill) */}
        <div className="mt-8 sm:mt-10 lg:mt-12 w-full flex justify-center">
          <div className="w-full max-w-4xl bg-[#044c43]/85 dark:bg-[#033630]/90 backdrop-blur-md border border-white/25 dark:border-teal-500/30 rounded-[28px] sm:rounded-[36px] px-4 py-4 sm:px-8 sm:py-6 shadow-[0_20px_50px_rgba(3,76,67,0.35)] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(3,76,67,0.45)]">
            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-white/25 dark:divide-teal-500/30 items-center text-center">
              
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
}

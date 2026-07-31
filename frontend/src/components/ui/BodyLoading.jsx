import logo from '../../cvg/logo (2)_3.webp'
import { cn } from '../../utils/cn.js'

export default function BodyLoading({ message = 'جاري التحميل...', className }) {
  return (
    <div
      className={cn(
        'min-h-screen min-h-dvh w-full overflow-hidden relative grid place-items-center px-5 py-8',
        'bg-[#E0F3E9] text-slate-900 dark:bg-[#0a0a0a] dark:text-slate-100',
        className
      )}
      dir="rtl"
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.32)),linear-gradient(135deg,#E0F3E9_0%,#F7FBF8_48%,#CDEBE4_100%)] dark:bg-[linear-gradient(180deg,rgba(10,10,10,0.42),rgba(10,10,10,0.9)),linear-gradient(135deg,#06231F_0%,#0A0A0A_48%,#083A34_100%)]" />
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(6,148,132,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(6,148,132,0.07)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_78%,transparent)] dark:opacity-45 dark:[background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)]" />

      <section className="relative z-10 flex w-full max-w-[420px] animate-slide-up flex-col items-center gap-4 text-center">
        <div className="grid h-[138px] w-[138px] place-items-center rounded-full border-[3px] border-transparent bg-[linear-gradient(#fff,#fff)_padding-box,linear-gradient(145deg,rgba(6,148,132,0.92),rgba(212,175,55,0.9))_border-box] shadow-[0_22px_55px_rgba(6,78,70,0.18)] dark:bg-[linear-gradient(#0f1917,#0f1917)_padding-box,linear-gradient(145deg,rgba(6,148,132,0.96),rgba(212,175,55,0.9))_border-box] dark:shadow-[0_26px_70px_rgba(0,0,0,0.36)]">
          <img src={logo} alt="" className="block h-24 w-24 object-contain" />
        </div>

        <div className="space-y-2">
          <p className="m-0 text-xs font-extrabold text-brand-800 dark:text-brand-200">
            منصة تعليمية ذكية
          </p>
          <h1 className="m-0 text-[clamp(28px,7vw,42px)] font-black leading-tight text-[#071B18] dark:text-[#F5FFFC]">
            أُفُق
          </h1>
          <p className="mx-auto m-0 max-w-[300px] text-sm font-bold leading-7 text-slate-700/75 dark:text-slate-100/70">
            بنجهزلك تجربة تعليمية هادئة وسريعة
          </p>
        </div>

        <div className="mt-2 h-2 w-[min(280px,82vw)] overflow-hidden rounded-full bg-brand/15 shadow-[inset_0_0_0_1px_rgba(6,148,132,0.08)] dark:bg-white/10">
          <div className="h-full w-[44%] rounded-full bg-gradient-to-r from-brand via-[#D4AF37] to-brand animate-[loadingBar_1.35s_ease-in-out_infinite]" />
        </div>

        <p className="m-0 text-xs font-extrabold text-slate-700/60 dark:text-slate-100/65">
          {message}
        </p>
      </section>
    </div>
  )
}

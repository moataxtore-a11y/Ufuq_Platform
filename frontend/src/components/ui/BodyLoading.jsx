import logo from '../../cvg/logo (2)_3.webp'
import { cn } from '../../utils/cn.js'

export default function BodyLoading({
  message = 'منصة تعليمية متكاملة و مصممة لتكون مساعد لجميع الطلاب',
  className,
}) {
  return (
    <div
      className={cn(
        'relative grid min-h-screen min-h-dvh w-full place-items-center overflow-hidden bg-[#010806] px-5 py-10 text-white',
        className
      )}
      dir="rtl"
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_66%_45%,rgba(6,148,132,0.13),transparent_32%),linear-gradient(135deg,#010806_0%,#020E0C_48%,#061F1B_100%)]" />
      <div className="pointer-events-none absolute -left-[42vw] -top-[30vh] h-[154vh] w-[82vw] rotate-[39deg] rounded-full border-[84px] border-solid border-[rgba(6,148,132,0.12)] max-sm:-left-[74vw] max-sm:-top-[24vh] max-sm:h-[142vh] max-sm:w-[112vw] max-sm:border-[48px]" />
      <div className="pointer-events-none absolute right-[11vw] -top-[34vh] h-[138vh] w-[64vw] rotate-[40deg] rounded-full border-[72px] border-solid border-[rgba(6,148,132,0.09)] max-sm:-right-[18vw] max-sm:-top-[32vh] max-sm:h-[128vh] max-sm:w-[96vw] max-sm:border-[42px]" />
      <div className="pointer-events-none absolute -right-[24vw] -top-[28vh] h-[150vh] w-[48vw] rotate-[16deg] rounded-full border-[62px] border-solid border-[rgba(6,148,132,0.22)] max-sm:-right-[62vw] max-sm:-top-[20vh] max-sm:h-[128vh] max-sm:w-[90vw] max-sm:border-[44px]" />

      <section className="relative z-10 flex w-full max-w-[900px] -translate-y-2 flex-col items-center text-center sm:-translate-y-[18px]">
        <img
          src={logo}
          alt="أُفُق"
          className="block h-auto w-[min(78vw,340px)] object-contain drop-shadow-[0_22px_45px_rgba(0,0,0,0.22)] sm:w-[clamp(270px,39vw,535px)]"
        />
        <p className="m-0 mt-9 max-w-full text-balance text-[clamp(19px,2.35vw,34px)] font-bold leading-[1.65] text-white/95 sm:mt-12">
          {message}
        </p>
      </section>
    </div>
  )
}

import { PhoneCall } from 'lucide-react'
import logo from '../../cvg/logo (2).svg'

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
  return (
    <footer className="z-10 relative mt-10 border-black/5 dark:border-white/10 border-t">
      <div className="bg-[#F4F2ED] dark:bg-[#1E1E1E]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 w-full max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <img src={logo} alt="Education Platform" className="w-auto h-24 sm:h-28" />

            <div className="mt-3 font-extrabold text-white text-3xl tracking-tight"></div>

            <div className="inline-flex items-center gap-4 bg-black/35 mt-8 px-9 py-5 border border-white/10 rounded-3xl text-[#FABC38]">
              <div className="inline-flex items-center gap-2 bg-[#FABC38]/15 px-5 py-2.5 rounded-2xl font-extrabold text-lg tracking-widest">
                <PhoneCall className="w-6 h-6" />
                <span>16546</span>
              </div>
              <div className="font-semibold text-lg">الخط الساخن</div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center items-center bg-[#FABC38]/10 hover:bg-white/15 border border-white/10 rounded-full w-16 h-16 text-[#FABC38] transition"
                aria-label="YouTube"
              >
                <BrandIcon name="youtube" className="w-8 h-8" />
              </a>
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center items-center bg-[#FABC38]/10 hover:bg-white/15 border border-white/10 rounded-full w-16 h-16 text-[#FABC38] transition"
                aria-label="TikTok"
              >
                <BrandIcon name="tiktok" className="w-8 h-8" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center items-center bg-[#FABC38]/10 hover:bg-white/15 border border-white/10 rounded-full w-16 h-16 text-[#FABC38] transition"
                aria-label="Instagram"
              >
                <BrandIcon name="instagram" className="w-8 h-8" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center items-center bg-[#FABC38]/10 hover:bg-white/15 border border-white/10 rounded-full w-16 h-16 text-[#FABC38] transition"
                aria-label="Facebook"
              >
                <BrandIcon name="facebook" className="w-8 h-8" />
              </a>
            </div>

            <div className="mt-12 text-[#FABC38]/85 text-lg sm:text-xl leading-9">
              تم صنع هذه المنصه بهدف تهيئة الطالب بكامل جوانب الثانوية العامة و ما بعدها
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

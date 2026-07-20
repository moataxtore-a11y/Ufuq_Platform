import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import { Modal } from '../ui/Modal.jsx'
import heroBg from '../../cvg/Golden_feather_floating_on_teal_202607201440.jpeg'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function HeroSection() {
  const [openHow, setOpenHow] = useState(false)
  const { isRtl, t } = useLanguage()
  return (
    <section className="relative flex items-center justify-center left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -mt-[68px] sm:-mt-[72px] md:-mt-[76px] min-h-screen">
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full select-none"
        draggable="false"
        style={{ objectFit: 'cover' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />

      <div className="z-10 absolute inset-0 flex items-center justify-center mx-auto px-4 w-full max-w-6xl">
        <div className="flex flex-col items-center text-center gap-5" dir={isRtl ? 'rtl' : 'ltr'}>
          <h1 className="font-extrabold text-white text-4xl sm:text-6xl lg:text-7xl leading-[1.06] tracking-tight drop-shadow-lg">
            <span className="text-[0.86em]">{t('hero.titlePrefix')}</span>{' '}
            <span className="font-perfect text-brand">{t('hero.titleBrand')}</span>
          </h1>
          <p className="mx-auto max-w-2xl font-semibold text-white/90 text-base sm:text-lg leading-8 drop-shadow">
            {t('hero.description')}
          </p>

        </div>
      </div>

      <Modal open={openHow} onOpenChange={setOpenHow} title={t('hero.howModalTitle')}>
        <div className="gap-3 grid" dir={isRtl ? 'rtl' : 'ltr'}>
          <p className={"text-slate-700 dark:text-slate-200 text-sm leading-7 " + (isRtl ? 'text-right' : 'text-left')}>
            {t('hero.howModalIntro')}
          </p>
          <div className="gap-2 grid">
            <div className="bg-[rgb(247,244,236)] dark:bg-[#202020] p-4 border border-black/5 dark:border-white/10 rounded-2xl">
              <div className={"font-semibold text-slate-800 dark:text-slate-100 text-sm " + (isRtl ? 'text-right' : 'text-left')}>{t('hero.howStep1Title')}</div>
              <div className={"mt-1 text-slate-600 dark:text-slate-300 text-sm " + (isRtl ? 'text-right' : 'text-left')}>{t('hero.howStep1Desc')}</div>
            </div>
            <div className="bg-[rgb(247,244,236)] dark:bg-[#202020] p-4 border border-black/5 dark:border-white/10 rounded-2xl">
              <div className={"font-semibold text-slate-800 dark:text-slate-100 text-sm " + (isRtl ? 'text-right' : 'text-left')}>{t('hero.howStep2Title')}</div>
              <div className={"mt-1 text-slate-600 dark:text-slate-300 text-sm " + (isRtl ? 'text-right' : 'text-left')}>{t('hero.howStep2Desc')}</div>
            </div>
            <div className="bg-[rgb(247,244,236)] dark:bg-[#202020] p-4 border border-black/5 dark:border-white/10 rounded-2xl">
              <div className={"font-semibold text-slate-800 dark:text-slate-100 text-sm " + (isRtl ? 'text-right' : 'text-left')}>{t('hero.howStep3Title')}</div>
              <div className={"mt-1 text-slate-600 dark:text-slate-300 text-sm " + (isRtl ? 'text-right' : 'text-left')}>{t('hero.howStep3Desc')}</div>
            </div>
          </div>
          <div className={"flex pt-2 " + (isRtl ? 'justify-end' : 'justify-start')}>
            <Button type="button" onClick={() => setOpenHow(false)}>{t('hero.howModalOk')}</Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

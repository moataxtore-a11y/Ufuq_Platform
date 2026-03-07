import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import { Modal } from '../ui/Modal.jsx'
import heroImg from '../../img/acd0e4527088f779ab7f45ac8389546f_imgupscaler.ai_Beta_2K.png'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function HeroSection() {
  const [openHow, setOpenHow] = useState(false)
  const { isRtl, t } = useLanguage()

  return (
    <section className="py-6">
      <div className="lg:items-center gap-8 grid lg:grid-cols-2">
        <div className="order-1 lg:order-2">
          <div className="relative flex justify-center lg:justify-start">
            <div className="w-full max-w-[560px] sm:max-w-[680px] lg:max-w-[820px]">
              <img
                src={heroImg}
                alt="Student"
                className="w-full h-auto select-none"
                draggable="false"
              />
            </div>
          </div>
        </div>

        <div className="order-2 lg:order-1" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={"gap-4 grid " + (isRtl ? 'text-center' : 'text-center')}>
            <h1 className="font-extrabold text-slate-800 dark:text-slate-100 text-4xl sm:text-6xl lg:text-7xl leading-[1.06] tracking-tight">
              <span className="text-[0.86em]">{t('hero.titlePrefix')}</span>{' '}
              <span className="font-perfect text-[rgb(212_175_55/var(--tw-text-opacity,1))]">{t('hero.titleBrand')}</span>
            </h1>
            <p className="mx-auto max-w-2xl font-semibold text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-8">
              {t('hero.description')}
            </p>
          </div>
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

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { Modal } from '../ui/Modal.jsx'
import ctaBottomImg from '../../img/cta bottom .png'
import heroImg from '../../img/acd0e4527088f779ab7f45ac8389546f_imgupscaler.ai_Beta_2K.png'
import joinus2 from '../../img/join us2.png'

export default function LandingCtaSection() {
  const { isRtl, t } = useLanguage()
  const [openStudentMsg, setOpenStudentMsg] = useState(false)

  return (
    <section className="mt-10">
      <div className="right-1/2 left-1/2 relative -mr-[50vw] -ml-[50vw] w-screen">
        <div className="gap-12 grid">
          <div className="relative bg-brand-800 rounded-r-[44px] rounded-l-[0px] overflow-hidden">
            <div className="absolute inset-0 opacity-15" aria-hidden="true">
              <div className="-top-24 -left-24 absolute bg-white/25 blur-3xl rounded-full w-80 h-80" />
              <div className="-right-28 -bottom-28 absolute bg-white/20 blur-3xl rounded-full w-96 h-96" />
            </div>

            <div className="relative mx-auto px-3 sm:px-5 lg:px-6 w-full max-w-6xl">
              <div className="items-center gap-20 grid lg:grid-cols-2 py-10 sm:py-12 min-h-[430px]">
                <div className={(isRtl ? 'order-1 text-right' : 'order-2 text-left')} dir={isRtl ? 'rtl' : 'ltr'}>
                  <h2 className="font-extrabold text-white text-5xl sm:text-6xl leading-tight">
                    {t('landing.cta.studyTitleLine1')}
                    <br />
                    <span className="text-white">{t('landing.cta.studyTitleLine2')}</span>
                  </h2>

                  <p className="mt-4 text-white/90 text-base sm:text-2xl leading-7">
                    {t('landing.cta.studyDescription')}
                  </p>

                  <div className={"mt-7 flex " + (isRtl ? 'justify-end' : 'justify-start')}>
                    <button
                      type="button"
                      onClick={() => setOpenStudentMsg(true)}
                      className="bg-brand hover:bg-brand-600 px-10 py-3.5 rounded-2xl font-semibold text-white text-base sm:text-xl transition-colors"
                    >
                      {t('landing.cta.studyButton')}
                    </button>
                  </div>
                </div>

                <div className={(isRtl ? 'order-2' : 'order-1') + ' flex justify-center lg:justify-end'}>
                  <img
                    src={ctaBottomImg}
                    alt=""
                    className="w-[300px] sm:w-[380px] lg:w-[460px] max-w-full h-auto select-none"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-brand-800 mx-auto rounded-r-[70px] rounded-l-[70px] w-full max-w-5xl overflow-hidden">
            <div
              className={
                "top-0 bottom-0 absolute bg-[#F0E6C8] opacity-95 " +
                (isRtl ? 'left-0' : 'right-0')
              }
              style={{
                width: '52%',
                clipPath: isRtl
                  ? 'polygon(0 0, 78% 0, 100% 100%, 0% 100%)'
                  : 'polygon(22% 0, 100% 0, 100% 100%, 0% 100%)'
              }}
              aria-hidden="true"
            />

            <div className="relative px-4 sm:px-6">
              <div className="items-center gap-10 grid lg:grid-cols-2 py-10 sm:py-12 min-h-[300px]">
                <div className={(isRtl ? 'text-right order-1' : 'text-left order-1') + ' relative z-10'} dir={isRtl ? 'rtl' : 'ltr'}>
                  <h2 className="font-extrabold text-white text-3xl sm:text-4xl leading-tight">
                    {t('landing.cta.joinTitle')}
                  </h2>
                  <p className="mt-4 text-white text-sm sm:text-base leading-7">
                    {t('landing.cta.joinDescription')}
                  </p>

                  <div className={"mt-7 flex " + (isRtl ? 'justify-end' : 'justify-start')}>
                    <Link
                      to="/join-teachers"
                      className="bg-brand hover:bg-brand-600 px-10 py-3.5 rounded-2xl font-extrabold text-white transition-colors"
                    >
                      {t('landing.cta.joinButton')}
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end order-2">
                  <img
                    src={joinus2}
                    alt=""
                    className="w-[300px] sm:w-[380px] lg:w-[460px] max-w-full h-auto select-none"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={openStudentMsg} onOpenChange={setOpenStudentMsg} title={t('landing.cta.studentModalTitle')}>
        <div className="gap-3 grid" dir={isRtl ? 'rtl' : 'ltr'}>
          <p className={"text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-7 " + (isRtl ? 'text-right' : 'text-left')}>
            {t('landing.cta.studentModalBody')}
          </p>
          <div className={"flex pt-2 " + (isRtl ? 'justify-end' : 'justify-start')}>
            <button
              type="button"
              onClick={() => setOpenStudentMsg(false)}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 px-6 py-2.5 rounded-xl font-semibold text-white dark:text-slate-900 transition-colors"
            >
              {t('landing.cta.studentModalOk')}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

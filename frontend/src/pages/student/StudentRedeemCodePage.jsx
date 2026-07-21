import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import CourseCard from '../../components/courses/CourseCard.jsx'
import { KeyRound } from 'lucide-react'

export default function StudentRedeemCodePage() {
  const navigate = useNavigate()
  const { isRtl } = useLanguage()

  const [code, setCode] = useState('')
  const [state, setState] = useState({ status: 'idle', allowedCourses: [], error: '' })
  const [choosing, setChoosing] = useState(false)
  const [usedPopupOpen, setUsedPopupOpen] = useState(false)

  const canSubmit = useMemo(() => String(code || '').trim().length > 0 && state.status !== 'loading', [code, state.status])

  function isCodeAlreadyUsedMessage(msg) {
    const s = String(msg || '').trim().toLowerCase()
    return s === 'code already used' || s.includes('code already used')
  }

  function CodeAlreadyUsedBanner() {
    return (
      <div className="bg-slate-950/80 dark:bg-slate-950/70 mt-3 px-4 py-3 border border-white/10 rounded-2xl">
        <div className={'flex items-center gap-3 ' + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
          <div className="relative shrink-0">
            <div className="flex justify-center items-center bg-white/10 border border-white/10 rounded-full w-10 h-10">
              <KeyRound className="text-white" size={18} strokeWidth={2.6} />
            </div>
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <div className="bg-white/80 rounded-full w-[2px] h-12 rotate-45" />
            </div>
          </div>
          <div className={'font-semibold text-white text-sm ' + (isRtl ? 'text-right' : 'text-left')}>
            الكود ده تم استخدامه قبل كده
          </div>
        </div>
      </div>
    )
  }

  function CodeAlreadyUsedPopup() {
    if (!usedPopupOpen) return null
    return (
      <div className="z-50 fixed inset-0 flex justify-center items-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setUsedPopupOpen(false)}
          aria-label={isRtl ? 'إغلاق' : 'Close'}
        />
        <div className="relative bg-white dark:bg-neutral-900 shadow-[0_18px_60px_rgba(0,0,0,0.35)] p-5 border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex justify-center items-center bg-brand/15 border border-brand/30 rounded-full w-14 h-14">
                <KeyRound className="text-brand" size={24} strokeWidth={2.6} />
              </div>
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <div className="bg-brand shadow rounded-full w-[3px] h-16 rotate-45" />
              </div>
            </div>
            <div className="mt-3 font-extrabold text-slate-900 dark:text-slate-100 text-base">
              {isRtl ? 'تنبيه' : 'Notice'}
            </div>
            <div className="mt-1 font-semibold text-slate-700 dark:text-slate-200 text-sm">
              الكود ده تم استخدامه قبل كده
            </div>
          </div>

          <div className={'mt-5 flex ' + (isRtl ? 'justify-start' : 'justify-end')}>
            <Button type="button" onClick={() => setUsedPopupOpen(false)} className="bg-brand hover:bg-brand-600 px-6 rounded-full h-11 text-white">
              {isRtl ? 'تمام' : 'OK'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  async function validate() {
    const normalized = String(code || '').trim().toUpperCase()
    if (!normalized) return
    try {
      setState({ status: 'loading', allowedCourses: [], error: '' })
      const res = await api.post('/access-codes/redeem/validate', { code: normalized })
      const list = Array.isArray(res.data?.allowedCourses) ? res.data.allowedCourses : []
      setState({ status: 'success', allowedCourses: list, error: '' })
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Error'
      if (isCodeAlreadyUsedMessage(msg)) setUsedPopupOpen(true)
      setState({ status: 'error', allowedCourses: [], error: msg })
    }
  }

  async function chooseCourse(courseId) {
    const normalized = String(code || '').trim().toUpperCase()
    if (!normalized || !courseId) return
    try {
      setChoosing(true)
      await api.post('/access-codes/redeem/choose', { code: normalized, courseId })
      navigate(`/student/courses/${courseId}`)
    } catch (e) {
      setChoosing(false)
      setState((s) => ({ ...s, status: 'error', error: e?.response?.data?.message || e?.message || 'Error' }))
    }
  }

  return (
    <div className="gap-5 grid" dir={isRtl ? 'rtl' : 'ltr'}>
      <CodeAlreadyUsedPopup />
      <div className="flex justify-center items-center">
        <div className={(isRtl ? 'text-right' : 'text-left') + ' flex flex-col items-center'}>
          <div className="mt-3 text-center">
            <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-3xl sm:text-5xl leading-[1.1]">
              <span className="text-slate-900 dark:text-white">{isRtl ? 'استرداد كود' : 'Redeem code'}</span>
            </h1>
            <svg className="mx-auto mt-2 w-full max-w-[520px] h-4" viewBox="0 0 520 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M10 20 C 130 6, 390 6, 510 20" stroke="#069484" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm text-center">
            {isRtl ? 'ادخل الكود ثم اختر كورس واحد لفتحه.' : 'Enter your code, then choose one course to unlock.'}
          </p>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur p-5 border border-black/5 dark:border-white/10 rounded-3xl">
        <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{isRtl ? 'الكود' : 'Code'}</div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={isRtl ? 'اكتب الكود هنا' : 'Enter code'}
          className="bg-white/70 dark:bg-white/[0.04] mt-2 px-4 py-3 border border-black/10 dark:border-white/10 rounded-2xl w-full text-sm tracking-widest"
        />

        <div className={"mt-4 flex gap-2 " + (isRtl ? 'justify-start' : 'justify-end')}>
          <Button type="button" onClick={validate} disabled={!canSubmit}>
            {state.status === 'loading' ? (isRtl ? 'جاري التحقق...' : 'Validating...') : (isRtl ? 'تحقق' : 'Validate')}
          </Button>
        </div>

        {state.status === 'error' ? (
          isCodeAlreadyUsedMessage(state.error) ? null : (
            <div className="mt-3 text-slate-700 dark:text-slate-200 text-sm">{state.error}</div>
          )
        ) : null}
      </div>

      {state.status === 'success' ? (
        <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur p-5 border border-black/5 dark:border-white/10 rounded-3xl">
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {isRtl ? 'اختر كورس واحد' : 'Choose one course'}
          </div>
          <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {state.allowedCourses.map((c) => (
              <div key={c.id} className={choosing ? 'opacity-50 pointer-events-none' : ''}>
                <CourseCard
                  course={c}
                  isRtl={isRtl}
                  ctaLabel={isRtl ? 'فتح هذا الكورس' : 'Unlock this course'}
                  onOpen={() => chooseCourse(c.id)}
                  hideSubscribe={true}
                />
              </div>
            ))}
          </div>

          {choosing ? (
            <div className="flex items-center gap-2 mt-4 text-slate-700 dark:text-slate-200">
              <Spinner />
              {isRtl ? 'جاري فتح الكورس...' : 'Unlocking course...'}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { KeyRound } from 'lucide-react'

function makeRefCode() {
  const n = Math.floor(100000000 + Math.random() * 900000000)
  return String(n)
}

export default function StudentCheckoutPage() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { courseId } = useParams()
  const { isRtl } = useLanguage()
  const { auth } = useAuth()
  const [usedPopupOpen, setUsedPopupOpen] = useState(false)

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
              <div className="flex justify-center items-center bg-[rgba(20,184,166,0.16)] border border-[rgba(20,184,166,0.38)] rounded-full w-14 h-14">
                <KeyRound className="text-[rgb(20,184,166)]" size={24} strokeWidth={2.6} />
              </div>
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <div className="bg-[rgb(234,179,8)] shadow rounded-full w-[3px] h-16 rotate-45" />
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
            <Button type="button" onClick={() => setUsedPopupOpen(false)} className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 px-6 rounded-full h-11 text-white">
              {isRtl ? 'تمام' : 'OK'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const [state, setState] = useState(() => {
    const c = location?.state?.course || null
    if (c) return { status: 'success', course: c, error: '' }
    return { status: 'loading', course: null, error: '' }
  })
  const [refCode, setRefCode] = useState('')
  const [accessCodeOpen, setAccessCodeOpen] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeState, setAccessCodeState] = useState({ status: 'idle', allowedCourses: [], error: '' })
  const [redeeming, setRedeeming] = useState(false)
  const [subscribedByCode, setSubscribedByCode] = useState(false)

  const [discountCodeOpen, setDiscountCodeOpen] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [discountState, setDiscountState] = useState({ status: 'idle', percent: 0, error: '' })
  const [redeemingDiscount, setRedeemingDiscount] = useState(false)

  const [walletBalance, setWalletBalance] = useState(null)
  const [payingWithWallet, setPayingWithWallet] = useState(false)

  useEffect(() => {
    let alive = true

    async function load() {
      if (!alive) return
      if (location?.state?.course) return
      setState({ status: 'loading', course: null, error: '' })
      try {
        const res = await api.get(`/courses/${courseId}/outline`)
        const c = res?.data || null
        if (alive) setState({ status: 'success', course: c, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || (isRtl ? 'فشل تحميل بيانات الكورس' : 'Failed to load course')
        if (alive) setState({ status: 'error', course: null, error: msg })
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [courseId, isRtl, location?.state?.course])

  useEffect(() => {
    let alive = true
    async function loadWallet() {
      if (!auth?.token) return
      if (auth?.role !== 'student') return
      try {
        const res = await api.get('/wallet')
        const bal = Number(res?.data?.balance || 0)
        if (!alive) return
        setWalletBalance(Number.isFinite(bal) ? bal : 0)
      } catch {
        if (!alive) return
        setWalletBalance(null)
      }
    }
    loadWallet()
    return () => {
      alive = false
    }
  }, [auth?.role, auth?.token])

  async function payWithWallet() {
    const cid = String(courseShape?.id || courseId || '')
    if (!cid) return
    try {
      setPayingWithWallet(true)
      const res = await api.post('/wallet/pay-course', { courseId: cid })
      setPayingWithWallet(false)

      if (res?.data?.alreadyEnrolled) {
        notify({
          title: isRtl ? 'أنت مشترك بالفعل' : 'Already enrolled',
          description: isRtl ? 'أنت مشترك بالفعل في هذا الكورس، ولم يتم خصم أي مبلغ.' : 'You are already enrolled in this course. No wallet charge was made.'
        })
        navigate(`/student/courses/${cid}`, { replace: true })
        return
      }

      notify({
        title: isRtl ? 'تم الدفع من المحفظة' : 'Paid with wallet',
        description: isRtl ? 'تم فتح الكورس بنجاح.' : 'Course unlocked successfully.'
      })
      navigate(`/student/courses/${cid}`, { replace: true })
    } catch (e) {
      setPayingWithWallet(false)
      const msg = e?.response?.data?.message || e?.message || 'Error'
      if (String(msg || '').toLowerCase().includes('insufficient')) {
        notify({
          title: isRtl ? 'الرصيد غير كافي' : 'Insufficient balance',
          description: isRtl ? 'قم بشحن رصيدك من صفحة المحفظة.' : 'Top up your wallet to continue.',
          variant: 'destructive'
        })
        navigate('/student/wallet')
        return
      }
      notify({
        title: isRtl ? 'تعذر الدفع من المحفظة' : 'Wallet payment failed',
        description: msg,
        variant: 'destructive'
      })
    }
  }

  async function validateDiscountCode() {
    const target = String(courseShape?.id || courseId || '')
    if (!normalizedDiscountCode || !target) return
    try {
      setDiscountState({ status: 'loading', percent: 0, error: '' })
      const res = await api.post('/discount-codes/redeem/validate', { code: normalizedDiscountCode, courseId: target })
      const pct = Number(res?.data?.discountPercent || 0)
      setDiscountState({ status: 'success', percent: Number.isFinite(pct) ? Math.max(0, Math.min(90, pct)) : 0, error: '' })
    } catch (e) {
      setDiscountState({ status: 'error', percent: 0, error: e?.response?.data?.message || e?.message || 'Error' })
    }
  }

  async function redeemDiscountCodeForCurrentCourse() {
    const target = String(courseShape?.id || courseId || '')
    if (!normalizedDiscountCode || !target) return
    try {
      setRedeemingDiscount(true)
      await api.post('/discount-codes/redeem/redeem', { code: normalizedDiscountCode, courseId: target })
      setRedeemingDiscount(false)
    } catch (e) {
      setRedeemingDiscount(false)
      notify({
        title: isRtl ? 'تعذر تفعيل كود الخصم' : 'Failed to redeem discount code',
        description: e?.response?.data?.message || e?.message || 'Error',
        variant: 'destructive'
      })
      throw e
    }
  }

  const courseShape = useMemo(() => {
    const c = state.course || null
    if (!c) return null

    return {
      id: c.id || c._id || courseId,
      title: c.title || '',
      thumbnailUrl: c.thumbnailUrl || '',
      price: c.price
    }
  }, [courseId, state.course])

  const courseIsFree = useMemo(() => {
    const c = state.course || null
    return Boolean(c?.isFree) || Number(c?.price || 0) <= 0
  }, [state.course])

  useEffect(() => {
    if (!auth?.token) return
    if (auth?.role !== 'student') return
    if (!courseShape?.id) return
    if (!courseIsFree) return
    navigate(`/student/courses/${courseShape.id}`, { replace: true })
  }, [auth?.role, auth?.token, courseIsFree, courseShape?.id, navigate])

  const price = useMemo(() => {
    const p = Number(courseShape?.price || 0)
    return Number.isFinite(p) ? p : 0
  }, [courseShape?.price])

  const courseDiscountPercent = useMemo(() => {
    const raw = state?.course?.discountPercent
    const n = typeof raw === 'number' ? raw : Number(raw || 0)
    return Number.isFinite(n) ? Math.max(0, Math.min(90, n)) : 0
  }, [state?.course?.discountPercent])

  const normalizedDiscountCode = useMemo(() => String(discountCode || '').trim().toUpperCase(), [discountCode])

  const effectiveDiscountPercent = useMemo(() => {
    const codePct = Number(discountState?.percent || 0)
    const total = (Number.isFinite(courseDiscountPercent) ? courseDiscountPercent : 0) + (Number.isFinite(codePct) ? codePct : 0)
    return Math.max(0, Math.min(90, total))
  }, [courseDiscountPercent, discountState?.percent])

  const finalPrice = useMemo(() => {
    if (price <= 0) return 0
    const pct = effectiveDiscountPercent
    const after = price * (1 - pct / 100)
    const rounded = Math.round(after * 100) / 100
    return Number.isFinite(rounded) ? Math.max(0, rounded) : price
  }, [effectiveDiscountPercent, price])

  const isFree = price <= 0

  const normalizedAccessCode = useMemo(() => String(accessCode || '').trim().toUpperCase(), [accessCode])
  const canValidateAccessCode = useMemo(
    () => normalizedAccessCode.length > 0 && accessCodeState.status !== 'loading',
    [normalizedAccessCode, accessCodeState.status]
  )

  const currentCourseAllowed = useMemo(() => {
    const list = Array.isArray(accessCodeState.allowedCourses) ? accessCodeState.allowedCourses : []
    const target = String(courseShape?.id || courseId || '')
    if (!target) return false
    return list.some((c) => String(c.id || c._id || '') === target)
  }, [accessCodeState.allowedCourses, courseId, courseShape?.id])

  async function validateAccessCode() {
    if (!normalizedAccessCode) return
    try {
      setAccessCodeState({ status: 'loading', allowedCourses: [], error: '' })
      const res = await api.post('/access-codes/redeem/validate', { code: normalizedAccessCode })
      const list = Array.isArray(res.data?.allowedCourses) ? res.data.allowedCourses : []
      setAccessCodeState({ status: 'success', allowedCourses: list, error: '' })
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Error'
      if (isCodeAlreadyUsedMessage(msg)) setUsedPopupOpen(true)
      setAccessCodeState({ status: 'error', allowedCourses: [], error: msg })
    }
  }

  async function redeemForCurrentCourse() {
    const target = String(courseShape?.id || courseId || '')
    if (!normalizedAccessCode || !target) return
    try {
      setRedeeming(true)
      await api.post('/access-codes/redeem/choose', { code: normalizedAccessCode, courseId: target })
      notify({
        title: isRtl ? 'تم تفعيل الكود' : 'Code redeemed',
        description: isRtl ? 'تم فتح الكورس بنجاح.' : 'Course unlocked successfully.'
      })
      setSubscribedByCode(true)
      setRedeeming(false)
      setAccessCodeOpen(false)
      navigate('/student', { replace: true, state: { refreshMyCourses: true } })
    } catch (e) {
      setRedeeming(false)
      setAccessCodeState((s) => ({ ...s, status: 'error', error: e?.response?.data?.message || e?.message || 'Error' }))
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      notify({ title: isRtl ? 'تم النسخ' : 'Copied', description: text })
    } catch {
      notify({ title: isRtl ? 'تعذر النسخ' : 'Copy failed', description: text, variant: 'destructive' })
    }
  }

  return (
    <div className="gap-5 grid" dir={isRtl ? 'rtl' : 'ltr'}>
      <CodeAlreadyUsedPopup />
      <div className={'flex items-start justify-between gap-3 ' + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
        <div className="gap-1 grid">
          <div className="font-extrabold text-slate-900 dark:text-white text-2xl sm:text-3xl">
            {isRtl ? 'الاشتراك والدفع' : 'Checkout'}
          </div>
          <div className="text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'أكمل الاشتراك في الكورس.' : 'Complete your course subscription.'}
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          {isRtl ? 'رجوع' : 'Back'}
        </Button>
      </div>

      {state.status === 'loading' ? (
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Spinner />
          {isRtl ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : null}

      {state.status === 'error' ? <div className="text-slate-700 dark:text-slate-200 text-sm">{state.error}</div> : null}

      {state.status === 'success' ? (
        <div className="bg-white dark:bg-[#1a1a1a] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none p-6 border border-black/5 dark:border-white/10 rounded-3xl">
          <div className={'gap-5 grid md:grid-cols-[240px_1fr] items-start ' + (isRtl ? 'text-right' : 'text-left')}>
            <div className="bg-[rgb(247,244,236)] dark:bg-[#202020] border border-black/5 dark:border-white/10 rounded-3xl">
              <div className="aspect-[16/10]">
                {courseShape?.thumbnailUrl ? (
                  <img src={courseShape.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex justify-center items-center w-full h-full text-slate-600 dark:text-slate-300 text-xs">Image</div>
                )}
              </div>

              {!isFree ? (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setAccessCodeOpen((v) => !v)}
                    className={
                      'w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ' +
                      'border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.06] ' +
                      (isRtl ? 'text-right' : 'text-left')
                    }
                  >
                    {isRtl ? 'معاك كود للكورس؟' : 'Have an access code?'}
                  </button>

                  {accessCodeOpen ? (
                    <div className="bg-white/70 dark:bg-white/[0.04] mt-3 p-4 border border-black/10 dark:border-white/10 rounded-2xl">
                      <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                        {isRtl ? 'اكتب الكود هنا' : 'Enter code'}
                      </div>
                      <input
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        className="bg-white/70 dark:bg-white/[0.04] mt-2 px-4 py-3 border border-black/10 dark:border-white/10 rounded-2xl w-full text-sm tracking-widest"
                        placeholder={isRtl ? 'مثال: ABCD1234' : 'e.g. ABCD1234'}
                      />

                      <div className={'mt-3 flex items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-end')}>
                        <Button type="button" variant="secondary" onClick={validateAccessCode} disabled={!canValidateAccessCode}>
                          {accessCodeState.status === 'loading' ? (isRtl ? 'جاري التحقق...' : 'Validating...') : (isRtl ? 'تحقق' : 'Validate')}
                        </Button>
                      </div>

                      {accessCodeState.status === 'error' ? (
                        isCodeAlreadyUsedMessage(accessCodeState.error) ? null : (
                          <div className="mt-2 text-slate-700 dark:text-slate-200 text-sm">{accessCodeState.error}</div>
                        )
                      ) : null}

                      {accessCodeState.status === 'success' ? (
                        <div className="mt-3">
                          {currentCourseAllowed ? (
                            <div className="gap-2 grid">
                              <div className="text-slate-700 dark:text-slate-200 text-sm">
                                {isRtl ? 'الكود صالح لهذا الكورس. يمكنك فتحه الآن.' : 'This code can unlock this course. You can redeem it now.'}
                              </div>
                              <div className={'flex items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-end')}>
                                <Button type="button" onClick={redeemForCurrentCourse} disabled={redeeming}>
                                  {redeeming ? (isRtl ? 'جاري الفتح...' : 'Unlocking...') : (isRtl ? 'فتح بالكود' : 'Unlock with code')}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-700 dark:text-slate-200 text-sm">
                              {isRtl
                                ? 'الكود لا يفتح هذا الكورس. اذهب لصفحة استرداد الأكواد لاختيار كورس من القائمة.'
                                : 'This code does not unlock this course. Go to Redeem page to choose from allowed courses.'}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="font-extrabold text-slate-900 dark:text-white text-xl sm:text-2xl truncate">
                {courseShape?.title || (isRtl ? 'الكورس' : 'Course')}
              </div>

              {subscribedByCode ? (
                <div className="bg-emerald-500/10 mt-4 px-4 py-3 border border-emerald-500/30 rounded-2xl">
                  <div className="font-extrabold text-emerald-700 dark:text-emerald-300">
                    {isRtl ? 'تم الاشتراك في هذا الكورس' : 'You are subscribed to this course'}
                  </div>
                  <div className="mt-1 text-slate-700 dark:text-slate-200 text-sm">
                    {isRtl ? 'تم إضافة الكورس إلى كورساتك.' : 'This course has been added to your courses.'}
                  </div>
                  <div className={'mt-3 flex items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-end')}>
                    <Button
                      type="button"
                      className="px-6 rounded-full h-11"
                      onClick={() => navigate(`/student/courses/${courseShape?.id || courseId}`)}
                    >
                      {isRtl ? 'الدخول للكورس' : 'Enter course'}
                    </Button>
                    <Button type="button" variant="secondary" className="px-6 rounded-full h-11" onClick={() => navigate('/student/courses')}>
                      {isRtl ? 'كورساتي' : 'My courses'}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-center md:justify-start mt-4">
                {isFree ? (
                  <div className="inline-flex items-center shadow-sm px-5 py-2 rounded-full font-extrabold text-white text-sm app-gradient-155">
                    {isRtl ? 'مجاني' : 'Free'}
                  </div>
                ) : subscribedByCode ? (
                  <div className="inline-flex items-center bg-emerald-500/10 px-5 py-2 border border-emerald-500/30 rounded-full font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">
                    {isRtl ? 'مشترك' : 'Subscribed'}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-[rgba(20,184,166,0.14)] shadow-sm px-5 py-2 border border-[rgba(20,184,166,0.35)] rounded-full font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    <span className="bg-[rgb(20,184,166)] px-4 py-1 rounded-full text-white">{finalPrice.toFixed(2)}</span>
                    <span className="text-slate-700 dark:text-slate-200">{isRtl ? 'جنيهًا' : 'EGP'}</span>
                  </div>
                )}
              </div>

              {!isFree && !subscribedByCode ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setDiscountCodeOpen((v) => !v)}
                    className={
                      'w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ' +
                      'border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.06] ' +
                      (isRtl ? 'text-right' : 'text-left')
                    }
                  >
                    {isRtl ? 'معاك كود خصم؟' : 'Have a discount code?'}
                  </button>

                  {discountCodeOpen ? (
                    <div className="bg-white/70 dark:bg-white/[0.04] mt-3 p-4 border border-black/10 dark:border-white/10 rounded-2xl">
                      <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                        {isRtl ? 'اكتب كود الخصم هنا' : 'Enter discount code'}
                      </div>
                      <input
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="bg-white/70 dark:bg-white/[0.04] mt-2 px-4 py-3 border border-black/10 dark:border-white/10 rounded-2xl w-full text-sm tracking-widest"
                        placeholder={isRtl ? 'مثال: ABCD1234' : 'e.g. ABCD1234'}
                      />

                      <div className={'mt-3 flex items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-end')}>
                        <Button type="button" variant="secondary" onClick={validateDiscountCode} disabled={!normalizedDiscountCode || discountState.status === 'loading'}>
                          {discountState.status === 'loading' ? (isRtl ? 'جاري التحقق...' : 'Validating...') : (isRtl ? 'تحقق' : 'Validate')}
                        </Button>
                      </div>

                      {discountState.status === 'error' ? (
                        <div className="mt-2 text-slate-700 dark:text-slate-200 text-sm">{discountState.error}</div>
                      ) : null}

                      {discountState.status === 'success' ? (
                        <div className="mt-3 text-slate-700 dark:text-slate-200 text-sm">
                          {isRtl
                            ? `خصم الكود: ${Number(discountState.percent || 0)}% (الإجمالي: ${Number(effectiveDiscountPercent || 0)}%)`
                            : `Code discount: ${Number(discountState.percent || 0)}% (total: ${Number(effectiveDiscountPercent || 0)}%)`}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isFree || subscribedByCode ? (
                <div className="gap-3 grid mt-5">
                  <div className="text-slate-600 dark:text-slate-300 text-sm">
                    {subscribedByCode
                      ? (isRtl ? 'أنت مشترك بالفعل في هذا الكورس. يمكنك الدخول مباشرة.' : 'You are already subscribed. You can open it now.')
                      : (isRtl ? 'هذا الكورس مجاني. يمكنك الدخول مباشرة.' : 'This course is free. You can open it now.')}
                  </div>
                  <div className={'flex items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-end')}>
                    <Button
                      className="px-6 rounded-full h-11"
                      onClick={() => {
                        navigate(`/student/courses/${courseShape?.id || courseId}`)
                      }}
                    >
                      {isRtl ? 'الدخول للكورس' : 'Enter course'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="gap-4 grid mt-5">
                  <div className="text-slate-600 dark:text-slate-300 text-sm">
                    {isRtl
                      ? 'اضغط على زر إنشاء كود فوري ثم ادفع بالكود من أي منفذ فوري.'
                      : 'Generate a Fawry reference code, then pay using that code at any Fawry outlet.'}
                  </div>

                  <div className="bg-white/70 dark:bg-white/[0.04] px-4 py-4 border border-black/10 dark:border-white/10 rounded-3xl">
                    <div className="flex justify-between items-center gap-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {isRtl ? 'المحفظة' : 'Wallet'}
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => navigate('/student/wallet')}>
                        {isRtl ? 'شحن الرصيد' : 'Top up'}
                      </Button>
                    </div>
                    <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
                      {isRtl ? 'رصيدك الحالي:' : 'Your balance:'}{' '}
                      {walletBalance === null ? '-' : `${Number(walletBalance || 0)} جنيه`}
                    </div>
                    <div className={'mt-3 flex items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-end')}>
                      <Button type="button" onClick={payWithWallet} disabled={payingWithWallet}>
                        {payingWithWallet ? (isRtl ? 'جاري الدفع...' : 'Paying...') : (isRtl ? 'اشترك من المحفظة' : 'Subscribe with wallet')}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-[rgb(247,244,236)] dark:bg-[#202020] px-4 py-4 border border-black/5 dark:border-white/10 rounded-3xl">
                    <div className="flex justify-between items-center gap-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {isRtl ? 'كود فوري' : 'Fawry reference'}
                      </div>
                      {refCode ? (
                        <Button variant="secondary" size="sm" onClick={() => copy(refCode)}>
                          {isRtl ? 'نسخ' : 'Copy'}
                        </Button>
                      ) : null}
                    </div>

                    <div className="flex justify-center mt-3">
                      {refCode ? (
                        <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/[0.06] px-5 py-3 border border-black/5 dark:border-white/10 rounded-full font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-widest">
                          {refCode}
                        </div>
                      ) : (
                        <div className="text-slate-500 dark:text-slate-400 text-sm">
                          {isRtl ? 'لم يتم الإنشاء بعد' : 'Not generated yet'}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center mt-4">
                      <Button
                        className="bg-[rgb(20,184,166)] hover:bg-[rgb(13,148,136)] shadow-[0_10px_22px_rgba(15,23,42,0.12)] px-8 rounded-full h-11 text-white"
                        onClick={() => {
                          Promise.resolve()
                            .then(async () => {
                              if (discountState.status === 'success' && normalizedDiscountCode) {
                                await redeemDiscountCodeForCurrentCourse()
                              }
                            })
                            .then(() => {
                              setRefCode(makeRefCode())
                              notify({
                                title: isRtl ? 'تم إنشاء كود فوري' : 'Reference generated',
                                description: isRtl ? 'هذا كود تجريبي لحين ربط API فوري.' : 'This is a demo code until Fawry API is connected.'
                              })
                            })
                            .catch(() => {})
                        }}
                      >
                        {isRtl ? 'إنشاء كود فوري' : 'Generate Fawry code'}
                      </Button>
                    </div>
                  </div>

                  <div className={'flex items-center gap-2 ' + (isRtl ? 'justify-start' : 'justify-end')}>
                    <Button
                      variant="outline"
                      className="px-6 rounded-full h-11"
                      onClick={() => {
                        navigate(`/courses/${courseShape?.id || courseId}/preview`)
                      }}
                    >
                      {isRtl ? 'معاينة الكورس' : 'Preview course'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

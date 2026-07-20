import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../components/ui/toast.jsx'

function formatMoney(n) {
  const x = Number(n || 0)
  if (!Number.isFinite(x)) return '0'
  const s = x.toFixed(2)
  return s.replace(/\.00$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '')
}

export default function StudentWalletPage() {
  const navigate = useNavigate()
  const { isRtl } = useLanguage()
  const { notify } = useToast()

  const [state, setState] = useState({ status: 'loading', balance: 0, transactions: [], error: '' })
  const [amount, setAmount] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let alive = true

    async function load() {
      if (!alive) return
      setState({ status: 'loading', balance: 0, transactions: [], error: '' })
      try {
        const res = await api.get('/wallet')
        const bal = Number(res?.data?.balance || 0)
        const tx = Array.isArray(res?.data?.transactions) ? res.data.transactions : []
        if (!alive) return
        setState({ status: 'success', balance: Number.isFinite(bal) ? bal : 0, transactions: tx, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Error'
        if (!alive) return
        setState({ status: 'error', balance: 0, transactions: [], error: msg })
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  const parsedAmount = useMemo(() => {
    const n = Number(String(amount || '').trim())
    return Number.isFinite(n) ? n : 0
  }, [amount])

  function translateType(type) {
    if (!isRtl) return type || '-'
    const map = { topup: 'شحن رصيد', purchase: 'شراء', adjustment: 'تعديل', refund: 'استرداد', withdrawal: 'سحب' }
    return map[String(type || '').toLowerCase()] || type || '-'
  }

  function translateStatus(status) {
    if (!isRtl) return status || '-'
    const map = { pending: 'قيد المراجعة', confirmed: 'مؤكد', rejected: 'مرفوض', cancelled: 'ملغي', completed: 'مكتمل' }
    return map[String(status || '').toLowerCase()] || status || '-'
  }

  async function createTopup() {
    if (!parsedAmount || parsedAmount <= 0) return
    try {
      setCreating(true)
      await api.post('/wallet/topups', { amount: parsedAmount })
      setCreating(false)
      setAmount('')
      notify({
        title: isRtl ? 'تم إرسال طلب الشحن' : 'Topup requested',
        description: isRtl ? 'تم إنشاء طلب شحن (قيد المراجعة).' : 'A pending topup request has been created.'
      })
      const res = await api.get('/wallet')
      const bal = Number(res?.data?.balance || 0)
      const tx = Array.isArray(res?.data?.transactions) ? res.data.transactions : []
      setState({ status: 'success', balance: Number.isFinite(bal) ? bal : 0, transactions: tx, error: '' })
    } catch (e) {
      setCreating(false)
      notify({
        title: isRtl ? 'تعذر إنشاء طلب الشحن' : 'Failed to request topup',
        description: e?.response?.data?.message || e?.message || 'Error',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="gap-5 grid overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative text-center">
        <div className="top-0 absolute flex justify-end w-full">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {isRtl ? 'رجوع' : 'Back'}
          </Button>
        </div>
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {isRtl ? 'محفظتي' : 'My Wallet'}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
          {isRtl ? 'اشحن رصيدك وافتح الكورسات.' : 'Top up your balance and unlock courses.'}
        </div>
      </div>

      {state.status === 'loading' ? (
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Spinner />
          {isRtl ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="text-slate-700 dark:text-slate-200 text-sm">{state.error}</div>
      ) : null}

      {state.status === 'success' ? (
        <div className="gap-4 grid">
          <div className="bg-white dark:bg-[#1a1a1a] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none p-5 border border-black/5 dark:border-white/10 rounded-3xl">
            <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
              {isRtl ? 'الرصيد الحالي' : 'Current balance'}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <div className="font-extrabold text-slate-900 dark:text-white text-3xl">
                {formatMoney(state.balance)}
              </div>
              <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                {isRtl ? 'جنيه' : 'جنيه'}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none p-5 border border-black/5 dark:border-white/10 rounded-3xl">
            <div className="font-extrabold text-slate-900 dark:text-white text-lg">
              {isRtl ? 'شحن رصيد' : 'Top up'}
            </div>
            <div className={'flex items-end gap-3 mt-3 ' + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                  {isRtl ? 'المبلغ' : 'Amount'}
                </div>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/70 dark:bg-white/[0.04] mt-2 px-4 py-3 border border-black/10 dark:border-white/10 rounded-2xl w-full text-sm"
                  placeholder={isRtl ? 'مثال: 100' : 'e.g. 100'}
                />
              </div>
              <Button type="button" onClick={createTopup} disabled={creating || parsedAmount <= 0} className="h-[46px] shrink-0">
                {creating ? (isRtl ? 'جاري الإرسال...' : 'Submitting...') : (isRtl ? 'طلب شحن' : 'Request topup')}
              </Button>
            </div>
            <div className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
              {isRtl ? 'ملاحظة: الشحن مؤقتًا يتم تأكيده يدويًا إلى أن يتم ربط فوري.' : 'Note: Topups are manually confirmed until payment integration is added.'}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:shadow-none p-5 border border-black/5 dark:border-white/10 rounded-3xl">
            <div className="font-extrabold text-slate-900 dark:text-white text-lg">
              {isRtl ? 'سجل المعاملات' : 'Transactions'}
            </div>

            {state.transactions.length === 0 ? (
              <div className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
                {isRtl ? 'لا توجد معاملات بعد.' : 'No transactions yet.'}
              </div>
            ) : (
              <div className="mt-4">
                <div className="sm:hidden gap-3 grid">
                  {state.transactions.map((tx) => (
                    <div
                      key={tx?._id || tx?.id || String(tx?.createdAt)}
                      className="bg-white/70 dark:bg-white/[0.04] px-4 py-3 border border-black/10 dark:border-white/10 rounded-2xl"
                    >
                      <div className={"flex items-start justify-between gap-3 " + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                            {translateType(tx?.type)}
                          </div>
                          <div className="mt-0.5 text-slate-600 dark:text-slate-300 text-xs">
                            {tx?.createdAt ? new Date(tx.createdAt).toLocaleString(isRtl ? 'ar-EG' : undefined) : '-'}
                          </div>
                        </div>
                        <div className={"text-xs font-semibold " + (isRtl ? 'text-left' : 'text-right')}>
                          <div className="text-slate-600 dark:text-slate-300">{translateStatus(tx?.status)}</div>
                          <div className="mt-1 text-slate-900 dark:text-slate-100">{formatMoney(tx?.amount)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead>
                      <tr className="text-slate-600 dark:text-slate-300">
                        <th className={'py-2 ' + (isRtl ? 'text-right' : 'text-left')}>{isRtl ? 'النوع' : 'Type'}</th>
                        <th className={'py-2 ' + (isRtl ? 'text-right' : 'text-left')}>{isRtl ? 'الحالة' : 'Status'}</th>
                        <th className={'py-2 ' + (isRtl ? 'text-right' : 'text-left')}>{isRtl ? 'المبلغ' : 'Amount'}</th>
                        <th className={'py-2 ' + (isRtl ? 'text-right' : 'text-left')}>{isRtl ? 'التاريخ' : 'Date'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.transactions.map((tx) => (
                        <tr key={tx?._id || tx?.id || String(tx?.createdAt)} className="border-black/5 dark:border-white/10 border-t">
                          <td className={'py-3 ' + (isRtl ? 'text-right' : 'text-left')}>{translateType(tx?.type)}</td>
                          <td className={'py-3 ' + (isRtl ? 'text-right' : 'text-left')}>{translateStatus(tx?.status)}</td>
                          <td className={'py-3 font-semibold ' + (isRtl ? 'text-right' : 'text-left')}>{formatMoney(tx?.amount)}</td>
                          <td className={'py-3 ' + (isRtl ? 'text-right' : 'text-left')}>{tx?.createdAt ? new Date(tx.createdAt).toLocaleString(isRtl ? 'ar-EG' : undefined) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

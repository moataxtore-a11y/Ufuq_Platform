import { useEffect, useMemo, useState } from 'react'
import { Check, RefreshCw, X } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Select from '../../components/ui/Select.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../components/ui/toast.jsx'

function formatMoney(value) {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '0'
  return n.toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '')
}

function statusLabel(isRtl, status) {
  const key = String(status || '').toLowerCase()
  if (!isRtl) return key || '-'
  const map = {
    pending: 'قيد المراجعة',
    completed: 'تم التأكيد',
    rejected: 'مرفوض',
    failed: 'فشل'
  }
  return map[key] || key || '-'
}

function statusClass(status) {
  const key = String(status || '').toLowerCase()
  if (key === 'completed') return 'bg-emerald-50 border-emerald-200 text-emerald-700'
  if (key === 'rejected') return 'bg-red-50 border-red-200 text-red-700'
  return 'bg-amber-50 border-amber-200 text-amber-700'
}

export default function AdminWalletTopupsPage() {
  const { isRtl } = useLanguage()
  const { notify } = useToast()
  const [status, setStatus] = useState('pending')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState('')

  const pendingCount = useMemo(() => {
    return rows.filter((row) => String(row?.status || '').toLowerCase() === 'pending').length
  }, [rows])

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/wallet/topups', { params: { status } })
      setRows(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      notify({
        title: isRtl ? 'تعذر تحميل طلبات الشحن' : 'Failed to load topups',
        description: e?.response?.data?.message || e?.message || 'Error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function act(row, action) {
    const id = String(row?.id || row?._id || '')
    if (!id) return
    try {
      setWorkingId(id)
      await api.post(`/wallet/topups/${id}/${action}`)
      notify({
        title: action === 'confirm'
          ? (isRtl ? 'تم تأكيد الشحن' : 'Topup confirmed')
          : (isRtl ? 'تم رفض الشحن' : 'Topup rejected')
      })
      await load()
    } catch (e) {
      notify({
        title: isRtl ? 'تعذر تنفيذ الإجراء' : 'Action failed',
        description: e?.response?.data?.message || e?.message || 'Error',
        variant: 'destructive'
      })
    } finally {
      setWorkingId('')
    }
  }

  return (
    <div className="gap-4 grid" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-extrabold text-slate-900 dark:text-white text-3xl">
            {isRtl ? 'طلبات شحن المحفظة' : 'Wallet Topup Requests'}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
            {isRtl ? 'راجع طلبات الشحن قبل إضافة الرصيد لحساب الطالب.' : 'Review topup requests before crediting student balances.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(String(e?.target?.value ?? e ?? 'pending'))}
            options={[
              { value: 'pending', label: isRtl ? 'قيد المراجعة' : 'Pending' },
              { value: 'completed', label: isRtl ? 'تم التأكيد' : 'Confirmed' },
              { value: 'rejected', label: isRtl ? 'مرفوض' : 'Rejected' },
              { value: 'all', label: isRtl ? 'كل الطلبات' : 'All' }
            ]}
          />
          <Button variant="secondary" onClick={load} disabled={loading}>
            <RefreshCw className="w-4 h-4" />
            {isRtl ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
        <div className="bg-white/80 dark:bg-white/[0.06] p-4 border border-black/5 dark:border-white/10 rounded-xl">
          <div className="font-semibold text-slate-500 text-xs">{isRtl ? 'طلبات ظاهرة' : 'Visible requests'}</div>
          <div className="mt-1 font-extrabold text-slate-900 dark:text-white text-2xl">{rows.length}</div>
        </div>
        <div className="bg-white/80 dark:bg-white/[0.06] p-4 border border-black/5 dark:border-white/10 rounded-xl">
          <div className="font-semibold text-slate-500 text-xs">{isRtl ? 'معلقة في هذه القائمة' : 'Pending in this view'}</div>
          <div className="mt-1 font-extrabold text-amber-700 text-2xl">{pendingCount}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white/80 dark:bg-white/[0.06] p-5 border border-black/5 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 text-sm">
          {isRtl ? 'لا توجد طلبات بهذا الفلتر.' : 'No requests match this filter.'}
        </div>
      ) : (
        <div className="border border-black/5 dark:border-white/10 rounded-xl overflow-hidden">
          <Table>
            <THead>
              <TR>
                <TH>{isRtl ? 'الطالب' : 'Student'}</TH>
                <TH>{isRtl ? 'الإيميل' : 'Email'}</TH>
                <TH>{isRtl ? 'المبلغ' : 'Amount'}</TH>
                <TH>{isRtl ? 'الحالة' : 'Status'}</TH>
                <TH>{isRtl ? 'الوقت' : 'Date'}</TH>
                <TH>{isRtl ? 'إجراءات' : 'Actions'}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => {
                const id = row?.id || row?._id || String(row?.createdAt)
                const pending = String(row?.status || '').toLowerCase() === 'pending'
                return (
                  <TR key={id}>
                    <TD>
                      <div className="font-semibold">{row?.user?.name || '-'}</div>
                      <div className="text-slate-500 text-xs">{row?.user?.studentId || row?.userId || '-'}</div>
                    </TD>
                    <TD>{row?.user?.email || '-'}</TD>
                    <TD className="font-extrabold">{formatMoney(row?.amount)} {isRtl ? 'جنيه' : 'EGP'}</TD>
                    <TD>
                      <span className={'inline-flex items-center px-2 py-1 border rounded-full font-semibold text-xs ' + statusClass(row?.status)}>
                        {statusLabel(isRtl, row?.status)}
                      </span>
                    </TD>
                    <TD>{row?.createdAt ? new Date(row.createdAt).toLocaleString(isRtl ? 'ar-EG' : undefined) : '-'}</TD>
                    <TD>
                      {pending ? (
                        <div className="inline-flex items-center gap-2">
                          <Button size="sm" onClick={() => act(row, 'confirm')} disabled={Boolean(workingId)}>
                            <Check className="w-4 h-4" />
                            {workingId === id ? (isRtl ? '...' : '...') : (isRtl ? 'تأكيد' : 'Confirm')}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => act(row, 'reject')} disabled={Boolean(workingId)}>
                            <X className="w-4 h-4" />
                            {isRtl ? 'رفض' : 'Reject'}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../components/ui/toast.jsx'

export default function MotivationalMessageAdminPage() {
  const { isRtl } = useLanguage()
  const { notify } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [ctaLabel, setCtaLabel] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        setLoading(true)
        const res = await api.get('/motivational-message')
        if (!alive) return
        const msg = res.data?.message
        setTitle(String(msg?.title || ''))
        setBody(String(msg?.body || ''))
        setCtaLabel(String(msg?.ctaLabel || ''))
        setCtaUrl(String(msg?.ctaUrl || ''))
      } catch {
        // ignore
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  async function save() {
    try {
      setSaving(true)
      await api.put('/motivational-message', { title, body, ctaLabel, ctaUrl })
      notify({ title: isRtl ? 'تم حفظ الرسالة' : 'Message saved' })
    } catch (e) {
      notify({ title: isRtl ? 'فشل الحفظ' : 'Save failed', description: e?.response?.data?.message || '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    try {
      setSaving(true)
      await api.delete('/motivational-message')
      setTitle('')
      setBody('')
      setCtaLabel('')
      setCtaUrl('')
      notify({ title: isRtl ? 'تم حذف الرسالة' : 'Message removed' })
    } catch (e) {
      notify({ title: isRtl ? 'فشل الحذف' : 'Delete failed', description: e?.response?.data?.message || '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={'gap-3 grid ' + (isRtl ? 'text-right' : 'text-left')} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {isRtl ? 'رسالة تحفيزية للطلاب' : 'Student motivational message'}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(6,148,132,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
          {isRtl
            ? 'هتظهر لكل الطلاب داخل المنصة. الطالب يقدر يقفلها عنده فقط.'
            : 'Shown to all students in the platform. A student can dismiss it only for themselves.'}
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.06] p-4 border border-black/5 dark:border-white/10 rounded-2xl">
        {loading ? (
          <div className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : (
          <div className="gap-3 grid">
            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'العنوان' : 'Title'}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="gap-1 grid">
              <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'الرسالة' : 'Message'}</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="bg-white dark:bg-white/[0.06] px-3 py-2 border border-slate-300 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand/30 w-full text-sm"
              />
            </div>

            <div className="gap-3 grid sm:grid-cols-2">
              <div className="gap-1 grid">
                <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'نص الزر (اختياري)' : 'Button label (optional)'}</label>
                <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
              </div>
              <div className="gap-1 grid">
                <label className="text-slate-600 dark:text-slate-200 text-sm">{isRtl ? 'رابط الزر (اختياري)' : 'Button URL (optional)'}</label>
                <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className={"flex flex-wrap gap-2 pt-1 " + (isRtl ? 'justify-start' : 'justify-end')}>
              <Button variant="secondary" onClick={remove} disabled={saving}>
                {isRtl ? 'حذف الرسالة' : 'Remove'}
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : isRtl ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

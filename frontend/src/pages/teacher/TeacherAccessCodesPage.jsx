import { useEffect, useMemo, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import cairoSemiBold from '../../assets/Cairo-SemiBold.ttf'

function CodeCard({ code, allowedCourses, teacherName, isRtl, kind, discountPercent, customDesignUrl, codeColor }) {
  const customOn = Boolean(customDesignUrl)
  const finalCodeColor = codeColor || '#ffffff'
  return (
    <div className="relative bg-white dark:bg-[#0b0b0f] border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden text-slate-900 dark:text-slate-100 [break-inside:avoid]">
      {customOn ? (
        <div className="relative">
          <img
            src={customDesignUrl}
            alt="custom-card"
            className="block w-full h-auto"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            <div
              className="text-[11px] font-semibold text-center"
              style={{ color: finalCodeColor, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              {kind === 'discount' ? (isRtl ? 'كود خصم' : 'Discount code') : (isRtl ? 'كود فتح الكورس' : 'Course access code')}
            </div>
            <div
              className="mt-1 font-extrabold text-2xl text-center tracking-[0.18em]"
              style={{ color: finalCodeColor, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
            >{code}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.20),transparent_55%)]" />
          <div className="relative p-4">
            <div
              className={"text-xs font-semibold text-slate-700 dark:text-slate-200 " + (isRtl ? 'text-right' : 'text-left')}
              style={{ fontFamily: 'PDFArabicLocal, Arial, sans-serif' }}
            >
              {isRtl ? 'منصة بيرفكت التعليمية' : 'Perfect Platform'}
            </div>
            <div className={"mt-1 text-[11px] text-slate-600 dark:text-slate-300 " + (isRtl ? 'text-right' : 'text-left')}>
              {teacherName || (isRtl ? 'مدرس' : 'Teacher')}
            </div>
            <div className={"mt-1 text-[11px] text-slate-600 dark:text-slate-300 " + (isRtl ? 'text-right' : 'text-left')}>
              {isRtl ? 'الكورسات المتاحة:' : 'Allowed courses:'}
            </div>
            <div className={"mt-1 text-[10px] text-slate-600 dark:text-slate-300 leading-5 " + (isRtl ? 'text-right' : 'text-left')}>
              {(allowedCourses || []).slice(0, 6).map((c) => c.title).join(' • ')}
              {(allowedCourses || []).length > 6 ? (isRtl ? ' ...' : ' ...') : ''}
            </div>

            <div className="flex justify-center mt-4">
              <div className="bg-[rgb(247,244,236)] dark:bg-white/[0.06] px-5 py-2.5 border border-black/10 dark:border-white/10 rounded-2xl">
                <div className="text-[10px] text-slate-600 dark:text-slate-300 text-center">
                  {kind === 'discount' ? (isRtl ? 'كود خصم' : 'Discount code') : (isRtl ? 'كود فتح الكورس' : 'Course access code')}
                </div>
                <div className="mt-1 font-extrabold text-slate-900 dark:text-white text-xl text-center tracking-[0.22em]">{code}</div>
              </div>
            </div>

            <div className="mt-4 text-[10px] text-slate-600 dark:text-slate-300 text-center">
              {kind === 'discount'
                ? (isRtl ? 'ادخل الكود في صفحة الدفع لتفعيل الخصم.' : 'Enter this code in checkout to apply the discount.')
                : (isRtl ? 'ادخل الكود داخل المنصة لفتح الكورس.' : 'Redeem this code inside the platform to unlock the course.')}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MasonryCodes({ items, customDesignUrl, codeColor }) {
  return (
    <div className="app-grid-cards">
      {items.map((it) => (
        <div key={it.id} className="min-w-0">
          <CodeCard
            code={it.code}
            allowedCourses={it.allowedCourses}
            teacherName={it.teacherName}
            isRtl={it.isRtl}
            kind={it.kind}
            discountPercent={it.discountPercent}
            customDesignUrl={customDesignUrl}
            codeColor={codeColor}
          />
        </div>
      ))}
    </div>
  )
}

function PrintableSheet({ items, isRtl, title }) {
  const pages = useMemo(() => {
    const list = Array.isArray(items) ? items : []
    const chunkSize = 21
    const out = []
    for (let i = 0; i < list.length; i += chunkSize) out.push(list.slice(i, i + chunkSize))
    return out
  }, [items])

  return (
    <div className="print-root pdf-export" dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        @font-face {
          font-family: 'PDFArabicLocal';
          src: url('${cairoSemiBold}') format('truetype');
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        .print-root { font-family: PDFArabicLocal, Arial, sans-serif !important; }
        .print-root * { font-family: PDFArabicLocal, Arial, sans-serif !important; }
        .print-root.pdf-export, .print-root.pdf-export * { border-radius: 0 !important; }

        @media print {
          @page { size: A4; margin: 0; }
          html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; overflow-x: hidden !important; }
          .no-print { display: none !important; }
          .print-root { background: #fff !important; }
          .codes-page { break-before: page; page-break-before: always; break-after: page; page-break-after: always; }
          .codes-page:first-child { break-before: auto; page-break-before: auto; }
          .codes-page:last-child { break-after: auto; page-break-after: auto; }
          .codes-card { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div style={{ position: 'fixed', left: '-99999px', top: 0, fontFamily: 'PDFArabicLocal, Arial, sans-serif' }}>
        {isRtl ? 'منصة بيرفكت التعليمية' : 'Perfect Platform'}
      </div>

      <div className="no-print" />

      {pages.map((pageItems, idx) => (
        <div
          key={idx}
          className="codes-page"
          style={{ width: '210mm', maxWidth: '210mm', height: '297mm', overflow: 'hidden', padding: '0', background: '#fff' }}
        >
          <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '200mm', height: '285mm', padding: '6mm', boxSizing: 'border-box' }}>
              <div className="font-extrabold text-slate-900 text-sm text-center" style={{ height: '6mm', lineHeight: '6mm' }}>
                {title}
              </div>
              <div className="gap-4 grid grid-cols-3 grid-rows-7 auto-rows-fr" style={{ height: 'calc(285mm - 6mm - 6mm)' }}>
                {pageItems.map((it) => (
                  <div key={it.id} className="codes-card">
                    <CodeCard
                      code={it.code}
                      allowedCourses={it.allowedCourses}
                      teacherName={it.teacherName}
                      isRtl={isRtl}
                      kind={it.kind}
                      discountPercent={it.discountPercent}
                      customDesignUrl={it.customDesignUrl}
                      codeColor={it.codeColor}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TeacherAccessCodesPage() {
  const { isRtl } = useLanguage()

  const [customDesignUrl, setCustomDesignUrl] = useState('')
  const [customDesignName, setCustomDesignName] = useState('')
  const [codeColor, setCodeColor] = useState('#ffffff')

  const [coursesState, setCoursesState] = useState({ status: 'loading', items: [], error: '' })
  const [selectedCourseIds, setSelectedCourseIds] = useState([])
  const [quantity, setQuantity] = useState(30)
  const [codesState, setCodesState] = useState({ status: 'idle', items: [], error: '' })
  const [teacherName, setTeacherName] = useState('')
  const [exportingPdf, setExportingPdf] = useState(false)
  const [showPdfArea, setShowPdfArea] = useState(false)

  const [mode, setMode] = useState('access')
  const [minPercent, setMinPercent] = useState(10)
  const [maxPercent, setMaxPercent] = useState(30)

  async function ensurePdfAreaReady() {
    await new Promise((r) => setTimeout(r, 350))
    if (document?.fonts?.load) {
      await Promise.all([
        document.fonts.load('600 14px PDFArabicLocal'),
        document.fonts.load('600 16px PDFArabicLocal'),
        document.fonts.load('600 20px PDFArabicLocal')
      ])
    }
    if (document?.fonts?.ready) {
      await document.fonts.ready
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  }

  const isDarkNow = useMemo(() => {
    return Boolean(document?.documentElement?.classList?.contains('dark'))
  }, [showPdfArea])

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        const [meRes, coursesRes] = await Promise.all([api.get('/users/me'), api.get('/courses/mine')])
        if (!alive) return
        setTeacherName(meRes?.data?.name || '')
        const items = Array.isArray(coursesRes.data) ? coursesRes.data : []
        setCoursesState({ status: 'success', items, error: '' })
        if (!selectedCourseIds.length && items?.[0]?._id) setSelectedCourseIds([items[0]._id])
      } catch (e) {
        if (!alive) return
        setCoursesState({ status: 'error', items: [], error: e?.response?.data?.message || e?.message || 'Error' })
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    try {
      const url = localStorage.getItem('codes.customDesignUrl') || ''
      const name = localStorage.getItem('codes.customDesignName') || ''
      const color = localStorage.getItem('codes.codeColor') || '#ffffff'
      if (url) setCustomDesignUrl(url)
      if (name) setCustomDesignName(name)
      setCodeColor(color)
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      if (customDesignUrl) localStorage.setItem('codes.customDesignUrl', customDesignUrl)
      else localStorage.removeItem('codes.customDesignUrl')
      if (customDesignName) localStorage.setItem('codes.customDesignName', customDesignName)
      else localStorage.removeItem('codes.customDesignName')
      localStorage.setItem('codes.codeColor', codeColor)
    } catch (e) {
      // ignore
    }
  }, [customDesignUrl, customDesignName, codeColor])

  useEffect(() => {
    setCodesState({ status: 'idle', items: [], error: '' })
  }, [mode])

  const selectedCourses = useMemo(() => {
    const list = Array.isArray(coursesState.items) ? coursesState.items : []
    const set = new Set((selectedCourseIds || []).map(String))
    return list.filter((c) => set.has(String(c._id)))
  }, [coursesState.items, selectedCourseIds])

  const allowedCoursesLabel = useMemo(() => {
    return selectedCourses.map((c) => c.title).join(isRtl ? '، ' : ', ')
  }, [isRtl, selectedCourses])

  async function generate() {
    if (!selectedCourseIds.length) {
      setCodesState({ status: 'error', items: [], error: isRtl ? 'اختر كورس واحد على الأقل' : 'Select at least one course' })
      return
    }
    try {
      setCodesState({ status: 'loading', items: [], error: '' })
      const res = mode === 'discount'
        ? await api.post('/discount-codes/generate', { allowedCourseIds: selectedCourseIds, quantity, minPercent, maxPercent })
        : await api.post('/access-codes/generate', { allowedCourseIds: selectedCourseIds, quantity })
      const list = Array.isArray(res.data?.codes) ? res.data.codes : []
      const normalized = list.map((it) => ({
        ...it,
        kind: mode === 'discount' ? 'discount' : 'access'
      }))
      setCodesState({ status: 'success', items: normalized, error: '' })
    } catch (e) {
      setCodesState({ status: 'error', items: [], error: e?.response?.data?.message || e?.message || 'Error' })
    }
  }

  async function loadMine() {
    try {
      setCodesState((s) => ({ ...s, status: 'loading', error: '' }))
      const res = mode === 'discount' ? await api.get('/discount-codes/mine') : await api.get('/access-codes/mine')
      const list = Array.isArray(res.data) ? res.data : []
      const normalized = list.map((it) => ({
        ...it,
        kind: mode === 'discount' ? 'discount' : 'access'
      }))
      setCodesState({ status: 'success', items: normalized, error: '' })
    } catch (e) {
      setCodesState({ status: 'error', items: [], error: e?.response?.data?.message || e?.message || 'Error' })
    }
  }

  async function downloadPdf() {
    const el = document.getElementById('codes-pdf-area')
    if (!el) return

    try {
      setExportingPdf(true)

      setShowPdfArea(true)

      await ensurePdfAreaReady()

      const expectedPages = Math.ceil(printItems.length / 21)
      for (let tries = 0; tries < 30; tries += 1) {
        const current = el.querySelectorAll('.codes-page').length
        if (current >= expectedPages) break
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 80))
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const pages = Array.from(document.getElementById('codes-pdf-area').querySelectorAll('.codes-page'))

      const totalPages = pages.length
      const heavy = totalPages >= 8
      const scale = heavy ? 3 : 4
      const format = heavy ? 'JPEG' : 'PNG'
      const jpegQuality = heavy ? 0.82 : 0.92

      for (let i = 0; i < pages.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const node = pages[i]
        // eslint-disable-next-line no-await-in-loop
        const canvas = await html2canvas(node, {
          scale,
          backgroundColor: isDarkNow ? '#0b0b0f' : '#ffffff',
          useCORS: true,
          allowTaint: true,
          windowWidth: node.scrollWidth,
          windowHeight: node.scrollHeight
        })

        const imgData = format === 'PNG'
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', jpegQuality)
        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, format, 0, 0, pageWidth, pageHeight)
      }

      const safeTitle = (allowedCoursesLabel || 'codes').slice(0, 60).replace(/[/\\?%*:|"<>]/g, '-')
      pdf.save(`${safeTitle}.pdf`)
    } catch (e) {
      setCodesState((s) => ({
        ...s,
        status: 'error',
        error: e?.message || (isRtl ? 'فشل تنزيل PDF' : 'Failed to download PDF')
      }))
    } finally {
      setShowPdfArea(false)
      setExportingPdf(false)
    }
  }

  function print() {
    setShowPdfArea(true)
    ensurePdfAreaReady()
      .catch(() => { })
      .finally(() => {
        window.print()
        setTimeout(() => setShowPdfArea(false), 600)
      })
  }

  const printItems = useMemo(() => {
    const list = Array.isArray(codesState.items) ? codesState.items : []
    return list.map((c) => ({
      id: c.id,
      code: c.code,
      kind: c.kind,
      discountPercent: c.discountPercent,
      allowedCourses: Array.isArray(c.allowedCourses) ? c.allowedCourses : (selectedCourses.map((x) => ({ id: x._id, title: x.title })) || []),
      teacherName,
      isRtl
    }))
  }, [codesState.items, selectedCourses, teacherName])

  return (
    <div className={"gap-6 grid " + (isRtl ? 'text-right' : 'text-left')}>
      <style>{`
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>
      <div className="text-center">
        <h2 className="font-extrabold text-slate-900 dark:text-white text-3xl sm:text-4xl md:text-5xl tracking-tight">
          {mode === 'discount' ? (isRtl ? 'أكواد خصم' : 'Discount codes') : (isRtl ? 'أكواد فتح الكورسات' : 'Course access codes')}
        </h2>
        <div className="flex justify-center mt-2">
          <svg width="520" height="28" viewBox="0 0 520 28" className="max-w-full" aria-hidden="true">
            <path d="M20 20 C 160 0, 360 0, 500 20" stroke="rgba(212,175,55,0.85)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
          {mode === 'discount'
            ? (isRtl ? 'ولّد أكواد خصم (مرة واحدة لكل طالب) على كورسات محددة.' : 'Generate single-use discount codes for selected courses.')
            : (isRtl ? 'ولّد أكواد (مرة واحدة لكل طالب) لفتح كورس كامل.' : 'Generate single-use codes to unlock a full course.')}
        </div>

        <div className="flex justify-center mt-4">
          <div className={'flex flex-wrap items-center gap-2 ' + (isRtl ? 'flex-row-reverse' : '')}>
            <Button type="button" variant={mode === 'access' ? 'default' : 'secondary'} onClick={() => setMode('access')}>
              {isRtl ? 'أكواد فتح' : 'Access'}
            </Button>
            <Button type="button" variant={mode === 'discount' ? 'default' : 'secondary'} onClick={() => setMode('discount')}>
              {isRtl ? 'أكواد خصم' : 'Discount'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur p-4 sm:p-5 border border-black/5 dark:border-white/10 rounded-3xl no-print">
        {coursesState.status === 'loading' ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : null}

        {coursesState.status === 'error' ? (
          <div className="text-slate-700 dark:text-slate-200 text-sm">{coursesState.error}</div>
        ) : null}

        {coursesState.status === 'success' ? (
          <div className="gap-4 grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 min-w-0">
              <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{isRtl ? 'الكورس' : 'Course'}</div>
              <div className="bg-white/70 dark:bg-white/[0.04] mt-2 p-3 border border-black/10 dark:border-white/10 rounded-2xl max-h-56 overflow-auto">
                {(coursesState.items || []).map((c) => {
                  const id = String(c._id)
                  const checked = (selectedCourseIds || []).some((x) => String(x) === id)
                  return (
                    <label key={id} className={"flex items-center gap-2 py-2 text-sm cursor-pointer " + (isRtl ? 'flex-row-reverse justify-between' : '')}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set((selectedCourseIds || []).map(String))
                          if (e.target.checked) next.add(id)
                          else next.delete(id)
                          setSelectedCourseIds(Array.from(next))
                        }}
                        className="bg-white dark:bg-neutral-900/40 shadow-sm border-2 border-slate-300 dark:border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/35 focus:ring-offset-0 w-5 h-5 text-amber-600 accent-amber-600 dark:accent-amber-400"
                      />
                      <span className="truncate">{c.title}</span>
                    </label>
                  )
                })}
              </div>
              <div className="mt-2 text-slate-600 dark:text-slate-300 text-xs">
                {isRtl ? 'المحدد:' : 'Selected:'} {allowedCoursesLabel || '-'}
              </div>
            </div>

            <div className="min-w-0">
              <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{isRtl ? 'عدد الأكواد' : 'Quantity'}</div>
              <input
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value || 0))}
                className="bg-white/70 dark:bg-white/[0.04] mt-2 px-4 py-2 border border-black/10 dark:border-white/10 rounded-2xl w-full text-sm"
              />
            </div>

            {mode === 'discount' ? (
              <div className="lg:col-span-3">
                <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{isRtl ? 'الخصم من (%)' : 'Min %'}</div>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={minPercent}
                      onChange={(e) => setMinPercent(Number(e.target.value || 0))}
                      className="bg-white/70 dark:bg-white/[0.04] mt-2 px-4 py-2 border border-black/10 dark:border-white/10 rounded-2xl w-full text-sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{isRtl ? 'الخصم إلى (%)' : 'Max %'}</div>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={maxPercent}
                      onChange={(e) => setMaxPercent(Number(e.target.value || 0))}
                      className="bg-white/70 dark:bg-white/[0.04] mt-2 px-4 py-2 border border-black/10 dark:border-white/10 rounded-2xl w-full text-sm"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="lg:col-span-3">
              <div className="bg-white/70 dark:bg-white/[0.04] p-4 border border-black/10 dark:border-white/10 rounded-2xl">
                <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                  {isRtl ? 'تصميم الكارت (اختياري)' : 'Card design (optional)'}
                </div>

                <div className="mt-3">
                  <div className={"flex flex-wrap items-center gap-2 " + (isRtl ? 'justify-start' : 'justify-end')}>
                    <label className="inline-flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setCustomDesignName(file.name || '')
                          const reader = new FileReader()
                          reader.onload = () => {
                            const url = String(reader.result || '')
                            if (url) setCustomDesignUrl(url)
                          }
                          reader.readAsDataURL(file)
                        }}
                        className="hidden"
                      />
                      <span className="bg-white/70 hover:bg-white dark:bg-white/[0.04] dark:hover:bg-white/[0.06] px-4 py-2 border border-black/10 dark:border-white/10 rounded-2xl font-semibold text-slate-800 dark:text-slate-100 text-sm cursor-pointer select-none">
                        {isRtl ? 'اختيار ملف' : 'Choose file'}
                      </span>
                    </label>

                    <div className="flex-1 min-w-0">
                      <div className={(isRtl ? 'text-right' : 'text-left') + ' truncate text-slate-600 dark:text-slate-300 text-xs'}>
                        {customDesignName || (isRtl ? 'لم يتم اختيار ملف' : 'No file chosen')}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setCustomDesignUrl('')
                        setCustomDesignName('')
                      }}
                      disabled={!customDesignUrl}
                    >
                      {isRtl ? 'حذف التصميم' : 'Remove design'}
                    </Button>
                  </div>

                  <div className="mt-2 text-slate-600 dark:text-slate-300 text-xs leading-5">
                    {isRtl
                      ? 'ارفع صورة (PNG/JPG). سيتم وضع الكود في المنتصف تلقائيًا.'
                      : 'Upload PNG/JPG. The code will be placed centered automatically.'}
                  </div>

                  <div className="mt-4 bg-slate-50/80 dark:bg-white/[0.03] p-5 rounded-2xl border border-black/5 dark:border-white/10">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm text-center">
                      {isRtl ? 'لون الكود' : 'Code color'}
                    </div>

                    {/* Large color preview - centered */}
                    <div className="flex flex-col items-center mt-4 gap-3">
                      <label className="relative cursor-pointer group">
                        <input
                          type="color"
                          value={codeColor}
                          onChange={(e) => setCodeColor(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div
                          className="w-16 h-16 rounded-2xl shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl"
                          style={{
                            backgroundColor: codeColor,
                            border: codeColor.toLowerCase() === '#ffffff' || codeColor.toLowerCase() === '#fff'
                              ? '2px solid rgba(0,0,0,0.1)'
                              : '2px solid rgba(255,255,255,0.15)',
                          }}
                        />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 text-[9px] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md shadow-sm border border-black/5 dark:border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {isRtl ? 'اضغط للتغيير' : 'Click to change'}
                        </div>
                      </label>

                      {/* Hex input */}
                      <div className="flex items-center bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                        <span className="px-3 py-2.5 text-slate-400 dark:text-slate-500 text-sm font-mono select-none bg-slate-50 dark:bg-white/[0.04] border-e border-black/5 dark:border-white/10">#</span>
                        <input
                          type="text"
                          value={codeColor.replace('#', '')}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
                            setCodeColor('#' + val)
                          }}
                          className="px-3 py-2.5 text-sm font-mono w-24 bg-transparent outline-none text-center text-slate-800 dark:text-slate-100 uppercase tracking-wider"
                          placeholder="ffffff"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mt-5 mb-3">
                      <div className="flex-1 h-px bg-black/5 dark:bg-white/10" />
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 select-none">
                        {isRtl ? 'ألوان سريعة' : 'Quick picks'}
                      </span>
                      <div className="flex-1 h-px bg-black/5 dark:bg-white/10" />
                    </div>

                    {/* Preset swatches grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                      {[
                        { color: '#ffffff', label: isRtl ? 'أبيض' : 'White' },
                        { color: '#000000', label: isRtl ? 'أسود' : 'Black' },
                        { color: '#D4AF37', label: isRtl ? 'ذهبي' : 'Gold' },
                        { color: '#EAB308', label: isRtl ? 'أصفر' : 'Yellow' },
                        { color: '#F43F5E', label: isRtl ? 'وردي' : 'Rose' },
                        { color: '#14B8A6', label: isRtl ? 'تركواز' : 'Teal' },
                        { color: '#60A5FA', label: isRtl ? 'أزرق' : 'Blue' },
                        { color: '#A78BFA', label: isRtl ? 'بنفسجي' : 'Purple' },
                      ].map(({ color: c, label }) => {
                        const isActive = codeColor.toLowerCase() === c.toLowerCase()
                        const isLight = ['#ffffff', '#EAB308', '#D4AF37'].includes(c)
                        return (
                          <button
                            key={c}
                            type="button"
                            className="flex flex-col items-center gap-1.5 group"
                            onClick={() => setCodeColor(c)}
                            title={label}
                          >
                            <div
                              className={"relative w-10 h-10 rounded-full transition-all duration-200 " + (isActive ? 'ring-[3px] ring-offset-2 ring-blue-500 dark:ring-offset-neutral-900 scale-110' : 'group-hover:scale-110 group-hover:shadow-lg')}
                              style={{
                                backgroundColor: c,
                                border: isLight ? '2px solid rgba(0,0,0,0.1)' : '2px solid rgba(255,255,255,0.12)',
                              }}
                            >
                              {isActive ? (
                                <svg className="absolute inset-0 m-auto w-4.5 h-4.5" viewBox="0 0 20 20" fill="none">
                                  <path d="M5 10l3.5 3.5L15 7" stroke={isLight ? '#000' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : null}
                            </div>
                            <span className={"text-[10px] leading-none transition-colors " + (isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400')}>{label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {customDesignUrl ? (
                  <div className="mt-4">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{isRtl ? 'معاينة' : 'Preview'}</div>
                    <div className="mt-2 max-w-md">
                      <CodeCard
                        code={isRtl ? 'مثال1234' : 'DEMO1234'}
                        allowedCourses={selectedCourses.map((c) => ({ id: c._id, title: c.title }))}
                        teacherName={teacherName}
                        isRtl={isRtl}
                        kind={mode === 'discount' ? 'discount' : 'access'}
                        discountPercent={0}
                        customDesignUrl={customDesignUrl}
                        codeColor={codeColor}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="gap-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:col-span-3">
              <Button type="button" className="w-full" onClick={generate} disabled={!selectedCourseIds.length || codesState.status === 'loading'}>
                {isRtl ? 'توليد الأكواد' : 'Generate'}
              </Button>
              <Button type="button" className="w-full" variant="secondary" onClick={loadMine} disabled={codesState.status === 'loading'}>
                {isRtl ? 'عرض الأكواد' : 'Load codes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full no-print"
                onClick={downloadPdf}
                disabled={exportingPdf || codesState.status !== 'success' || printItems.length === 0}
              >
                <Download className="w-4 h-4" />
                {exportingPdf ? (isRtl ? 'جاري تجهيز PDF...' : 'Preparing PDF...') : (isRtl ? 'تنزيل PDF' : 'Download PDF')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full no-print"
                onClick={print}
                disabled={codesState.status !== 'success' || printItems.length === 0}
              >
                <Printer className="w-4 h-4" />
                {isRtl ? 'طباعة' : 'Print'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {codesState.status === 'loading' ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : null}

      {codesState.status === 'error' ? (
        <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm no-print">
          {codesState.error}
        </div>
      ) : null}

      {codesState.status === 'success' ? (
        <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur p-5 border border-black/5 dark:border-white/10 rounded-3xl">
          <div className="flex justify-between items-center gap-3">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {isRtl ? 'عدد الأكواد' : 'Codes'}: {printItems.length}
            </div>
          </div>

          <div className="mt-4">
            <MasonryCodes items={printItems} customDesignUrl={customDesignUrl} codeColor={codeColor} />
          </div>

          <div
            id="codes-pdf-area"
            style={
              showPdfArea
                ? {
                  position: 'fixed',
                  left: '-99999px',
                  top: 0,
                  width: '210mm',
                  background: isDarkNow ? '#0b0b0f' : '#fff',
                  color: isDarkNow ? '#fff' : undefined,
                  overflow: 'hidden'
                }
                : { display: 'none' }
            }
            className={isDarkNow ? 'dark' : ''}
          >
            <PrintableSheet
              title={mode === 'discount'
                ? (isRtl ? `أكواد خصم: ${allowedCoursesLabel}` : `Discount codes: ${allowedCoursesLabel}`)
                : (isRtl ? `أكواد فتح كورسات: ${allowedCoursesLabel}` : `Course codes: ${allowedCoursesLabel}`)}
              items={printItems.map((it) => ({ ...it, customDesignUrl, codeColor }))}
              isRtl={isRtl}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

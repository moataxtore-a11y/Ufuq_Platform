import { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/api.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { Trash2 } from 'lucide-react'

function toStr(v) {
  return typeof v === 'string' ? v : v === null || v === undefined ? '' : String(v)
}

function formatDate(value) {
  const s = toStr(value)
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString()
}

export default function AdminCoursesPage() {
  const { notify } = useToast()
  const { t, isRtl } = useLanguage()

  const [q, setQ] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [deleteCourseId, setDeleteCourseId] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((r) => {
      const title = toStr(r.title).toLowerCase()
      const teacherName = toStr(r.teacherName).toLowerCase()
      return title.includes(query) || teacherName.includes(query)
    })
  }, [q, rows])

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/admin/courses')
      setRows(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      notify({
        title: isRtl ? 'فشل تحميل الكورسات' : 'Failed to load courses',
        description: e?.response?.data?.message || t('common.error'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function runAction(courseId, fn) {
    const id = toStr(courseId)
    if (!id) return
    try {
      setBusyId(id)
      await fn()
      await load()
    } catch (e) {
      notify({
        title: isRtl ? 'حدث خطأ' : 'Error',
        description: e?.response?.data?.message || t('common.error'),
        variant: 'destructive'
      })
    } finally {
      setBusyId('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <Spinner />
        {isRtl ? 'جاري التحميل...' : 'Loading...'}
      </div>
    )
  }

  return (
    <div className="space-y-6 mx-auto w-full max-w-6xl">
      <ConfirmDialog
        open={Boolean(deleteCourseId)}
        onOpenChange={(v) => {
          if (!v) setDeleteCourseId('')
        }}
        title={isRtl ? 'تأكيد الحذف' : 'Confirm delete'}
        description={isRtl ? 'هل أنت متأكد أنك تريد حذف هذا الكورس نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to permanently delete this course? This action cannot be undone.'}
        confirmLabel={isRtl ? 'حذف نهائي' : 'Delete'}
        cancelLabel={isRtl ? 'إلغاء' : 'Cancel'}
        loading={Boolean(deleteCourseId) && busyId === deleteCourseId}
        icon={<Trash2 className="w-6 h-6 text-red-700" />}
        onConfirm={() => {
          const id = deleteCourseId
          if (!id) return
          runAction(id, () => api.delete(`/admin/courses/${id}`)).finally(() => setDeleteCourseId(''))
        }}
      />
      <div className="relative px-5 sm:px-8 py-8 sm:py-10">
        <div className={"flex items-center justify-center " + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
          <div
            className={
              'inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-semibold text-slate-900 ' +
              'dark:border-white/10 dark:bg-white/[0.06] dark:text-white ' +
              (isRtl ? 'flex-row-reverse' : 'flex-row')
            }
          >
            <span className="inline-block bg-emerald-400 rounded-full w-2 h-2" />
            <span>{isRtl ? 'مساحة الأدمن' : 'Admin area'}</span>
          </div>
        </div>

        <div className={"mt-6 text-center text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white " + (isRtl ? 'leading-[1.2]' : 'leading-[1.15]')}>
          {isRtl ? 'إدارة الكورسات' : 'Course Management'}
        </div>
        <div className="mt-2 text-slate-600 dark:text-slate-200/80 text-sm sm:text-base text-center">
          {isRtl ? 'تثبيت / إخفاء للطلاب / حذف نهائي' : 'Pin / hide from students / permanent delete'}
        </div>

        <div className="flex justify-center mt-7 pointer-events-none">
          <div className="bg-gradient-to-r from-transparent via-amber-500/70 dark:via-amber-300/70 to-transparent rounded-full w-[92%] max-w-4xl h-[3px]" />
        </div>

        <div className="flex justify-center mt-6">
          <div className="w-full max-w-xl">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={isRtl ? 'بحث بالعنوان أو اسم المدرس' : 'Search by title or teacher'} />
          </div>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
        <Table>
          <THead>
            <TR>
              <TH>{isRtl ? 'العنوان' : 'Title'}</TH>
              <TH>{isRtl ? 'المدرس' : 'Teacher'}</TH>
              <TH>{isRtl ? 'مخفي عن الطلاب' : 'Hidden'}</TH>
              <TH>{isRtl ? 'مثبّت' : 'Pinned'}</TH>
              <TH>{isRtl ? 'تاريخ الإنشاء' : 'Created'}</TH>
              <TH>{isRtl ? 'إجراءات' : 'Actions'}</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((r) => {
              const id = r.id || r._id
              const isBusy = busyId === id
              const hidden = Boolean(r.isHiddenFromStudents)
              const pinned = Boolean(r.pinnedAt)

              return (
                <TR key={id}>
                  <TD className="max-w-[320px] font-semibold truncate">{toStr(r.title)}</TD>
                  <TD className="max-w-[200px] truncate">{toStr(r.teacherName)}</TD>
                  <TD>{hidden ? (isRtl ? 'نعم' : 'Yes') : (isRtl ? 'لا' : 'No')}</TD>
                  <TD>{pinned ? (isRtl ? 'نعم' : 'Yes') : (isRtl ? 'لا' : 'No')}</TD>
                  <TD>{formatDate(r.createdAt)}</TD>
                  <TD>
                    <div className={"flex flex-wrap gap-2 " + (isRtl ? 'justify-start' : 'justify-start')}>
                      <Button
                        size="sm"
                        variant={pinned ? 'secondary' : 'outline'}
                        disabled={isBusy}
                        onClick={() =>
                          runAction(id, () => api.patch(`/admin/courses/${id}/${pinned ? 'unpin' : 'pin'}`))
                        }
                      >
                        {pinned ? (isRtl ? 'إلغاء تثبيت' : 'Unpin') : (isRtl ? 'تثبيت' : 'Pin')}
                      </Button>

                      <Button
                        size="sm"
                        variant={hidden ? 'secondary' : 'outline'}
                        disabled={isBusy}
                        onClick={() =>
                          runAction(id, () => api.patch(`/admin/courses/${id}/${hidden ? 'unhide' : 'hide'}`))
                        }
                      >
                        {hidden ? (isRtl ? 'إظهار للطلاب' : 'Unhide') : (isRtl ? 'إخفاء عن الطلاب' : 'Hide')}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isBusy}
                        onClick={() => {
                          setDeleteCourseId(String(id || ''))
                        }}
                      >
                        {isRtl ? 'حذف نهائي' : 'Delete'}
                      </Button>
                    </div>
                  </TD>
                </TR>
              )
            })}

            {!filtered.length ? (
              <TR>
                <TD colSpan={6} className={"text-slate-600 dark:text-slate-300 " + (isRtl ? 'text-right' : 'text-left')}>
                  {isRtl ? 'لا توجد كورسات' : 'No courses'}
                </TD>
              </TR>
            ) : null}
          </TBody>
        </Table>
      </div>
    </div>
  )
}

import Button from '../ui/Button.jsx'
import { Modal } from '../ui/Modal.jsx'

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</div>
      <div className="text-right text-sm text-slate-700 dark:text-slate-200">{value}</div>
    </div>
  )
}

export default function QuickPreviewModal({ open, onOpenChange, kind, data, isRTL }) {
  const title =
    kind === 'course'
      ? isRTL
        ? 'معاينة سريعة للكورس'
        : 'Quick course preview'
      : isRTL
        ? 'معاينة سريعة للمدرس'
        : 'Quick teacher preview'

  const primaryName = kind === 'course' ? data?.title : data?.name

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <div className="grid gap-4">
        <div className="rounded-2xl border border-black/5 bg-[rgb(247,244,236)] p-4 dark:border-white/10 dark:bg-[#202020]">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{primaryName || '—'}</div>
          {kind === 'course' && data?.teacherName ? (
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{data.teacherName}</div>
          ) : null}
          {kind === 'teacher' && data?.bio ? (
            <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{data.bio}</div>
          ) : null}
          {kind === 'course' && data?.description ? (
            <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{data.description}</div>
          ) : null}
        </div>

        <div className="grid gap-2">
          {kind === 'course' ? (
            <>
              <Row label={isRTL ? 'العنوان' : 'Title'} value={data?.title} />
              <Row label={isRTL ? 'المدرس' : 'Teacher'} value={data?.teacherName} />
            </>
          ) : (
            <>
              <Row label={isRTL ? 'الاسم' : 'Name'} value={data?.name} />
            </>
          )}
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-slate-200">
          {isRTL
            ? 'دي معاينة سريعة فقط. محتوى الكورس، الدروس، والوحدات بيظهروا بعد تسجيل الدخول.'
            : 'This is a quick preview only. Lessons and full course content are available after login.'}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {isRTL ? 'إغلاق' : 'Close'}
          </Button>
          <Button asChild>
            <a href="/login">{isRTL ? 'تسجيل الدخول' : 'Login'}</a>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

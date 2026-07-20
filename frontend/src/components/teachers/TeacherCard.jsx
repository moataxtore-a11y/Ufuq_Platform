import { useLanguage } from '../../context/LanguageContext.jsx'
import defaultProfileAvatar from '../../cvg/profile.svg'

function PhotoPlaceholder({ name }) {
  return (
    <div className="relative bg-[rgb(247,244,236)] dark:bg-[#202020] shadow-[0_18px_44px_rgba(15,23,42,0.10)] dark:shadow-none border border-black/10 dark:border-white/10 rounded-3xl w-32 sm:w-44 h-32 sm:h-44 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,148,132,0.18),transparent_55%)]" />
      <img src={defaultProfileAvatar} alt={name || 'Teacher'} className="z-10 relative opacity-80 w-full h-full object-cover" />
    </div>
  )
}

function TeacherAvatar({ teacher }) {
  const name = teacher?.name || 'Teacher'
  const updatedAt = teacher?.updatedAt ? new Date(teacher.updatedAt).getTime() : 0
  const avatarRaw = teacher?.avatarUrl || ''
  const avatar = avatarRaw && updatedAt ? `${avatarRaw}${avatarRaw.includes('?') ? '&' : '?'}v=${updatedAt}` : avatarRaw

  if (!avatar) return <PhotoPlaceholder name={name} />

  return (
    <div className="relative bg-[rgb(247,244,236)] dark:bg-[#202020] shadow-[0_18px_44px_rgba(15,23,42,0.10)] dark:shadow-none border border-black/10 dark:border-white/10 rounded-3xl w-32 sm:w-44 h-32 sm:h-44 overflow-hidden">
      <img src={avatar} alt={name} className="w-full h-full object-cover" />
    </div>
  )
}

export default function TeacherCard({ teacher, action }) {
  const { t, isRtl } = useLanguage()

  const gradeYearKey = teacher?.teachingGradeYear || teacher?.gradeYear || ''
  const sectionKeys = Array.isArray(teacher?.teachingSections) && teacher.teachingSections.length
    ? teacher.teachingSections
    : (teacher?.teachingSection || teacher?.section ? [teacher?.teachingSection || teacher?.section] : [])
  const gradeYearKeyPath = gradeYearKey ? `landing.gradeYears.${gradeYearKey}` : ''
  const gradeYearLabelRaw = gradeYearKeyPath ? t(gradeYearKeyPath) : ''
  const gradeYearLabel = gradeYearLabelRaw && gradeYearLabelRaw !== gradeYearKeyPath ? gradeYearLabelRaw : ''

  function sectionLabelFor(key) {
    const safe = String(key || '').trim()
    if (!safe) return ''
    const sectionKeyPath = `landing.chooseTeachers.filters.section_${safe}`
    const sectionLabelRaw = t(sectionKeyPath)
    return sectionLabelRaw && sectionLabelRaw !== sectionKeyPath ? sectionLabelRaw : safe
  }

  const sectionLabels = Array.from(
    new Set((sectionKeys || []).map((k) => sectionLabelFor(k)).filter(Boolean))
  )

  return (
    <div className="bg-white dark:bg-[#1a1a1a] shadow-[0_22px_60px_rgba(15,23,42,0.10)] hover:shadow-[0_30px_78px_rgba(15,23,42,0.14)] dark:shadow-none mx-auto p-4 sm:p-6 border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-[420px] transition-all hover:-translate-y-0.5 duration-200">
      <div className="justify-items-center gap-4 sm:gap-5 grid text-center">
        <TeacherAvatar teacher={teacher} />
        <div>
          <div className="font-extrabold text-primary-900 dark:text-slate-100 text-xl sm:text-3xl tracking-tight">{teacher?.name || '—'}</div>
          {teacher?.teachingSubject ? (
            <div className="mt-2 sm:mt-3 font-semibold text-brand-600 dark:text-brand-300 text-base sm:text-xl">{teacher.teachingSubject}</div>
          ) : null}
          {gradeYearLabel || sectionLabels.length ? (
            <div className={'flex flex-wrap justify-center items-center gap-2 mt-3 ' + (isRtl ? 'flex-row-reverse' : 'flex-row')}>
              {gradeYearLabel ? (
                <span className="inline-flex items-center bg-slate-100/80 dark:bg-white/10 px-3 py-1 border border-black/5 dark:border-white/10 rounded-full font-semibold text-slate-700 dark:text-slate-200 text-xs">
                  {gradeYearLabel}
                </span>
              ) : null}
              {sectionLabels.map((lbl) => (
                <span key={lbl} className="inline-flex items-center bg-brand/10 px-3 py-1 border border-brand/20 rounded-full font-semibold text-brand dark:text-brand-200 text-xs">
                  {lbl}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-2 text-slate-500 dark:text-slate-400 text-xs">{teacher?.email || ''}</div>
        </div>
      </div>
      {typeof teacher?.bio === 'string' && teacher.bio.trim() ? (
        <div className="mt-5 text-slate-600 dark:text-slate-300 text-sm text-center leading-6">{teacher.bio}</div>
      ) : null}
      {action ? <div className="flex justify-center mt-5">{action}</div> : null}
    </div>
  )
}

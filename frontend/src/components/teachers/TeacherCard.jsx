import { useLanguage } from '../../context/LanguageContext.jsx'

function readTeacherValue(teacher, ...keys) {
  const profile = teacher?.profile && typeof teacher.profile === 'object' ? teacher.profile : {}

  for (const key of keys) {
    const direct = teacher?.[key]
    if (direct !== undefined && direct !== null && direct !== '') return direct

    const fromProfile = profile?.[key]
    if (fromProfile !== undefined && fromProfile !== null && fromProfile !== '') return fromProfile
  }

  return ''
}

function withCacheVersion(url, updatedAt) {
  const raw = String(url || '').trim()
  if (!raw) return ''

  const ts = updatedAt ? new Date(updatedAt).getTime() : 0
  if (!ts || Number.isNaN(ts)) return raw

  return `${raw}${raw.includes('?') ? '&' : '?'}v=${ts}`
}

function TeacherFallbackArtwork() {
  return (
    <div className="absolute inset-0 bg-brand">
      <div className="absolute left-1/2 top-[9%] h-[29%] w-[29%] -translate-x-1/2 rounded-full border-[14px] border-white sm:border-[17px]" />
      <div className="absolute left-1/2 top-[44%] h-[31%] w-[70%] -translate-x-1/2 rounded-t-full border-[15px] border-b-0 border-white shadow-[0_0_22px_rgba(255,255,255,0.62)] sm:border-[18px]" />
    </div>
  )
}

function useTeacherCardData(teacher) {
  const { t, isRtl } = useLanguage()

  const name = readTeacherValue(teacher, 'name') || (isRtl ? 'مدرس على المنصة' : 'Teacher')
  const subject = readTeacherValue(teacher, 'teachingSubject', 'subject', 'title') || (isRtl ? 'أستاذ على المنصة' : 'Teacher on the platform')
  const updatedAt = readTeacherValue(teacher, 'updatedAt')
  const avatarRaw = readTeacherValue(teacher, 'avatarUrl', 'photoUrl')
  const avatar = withCacheVersion(avatarRaw, updatedAt)

  const gradeYearKey = readTeacherValue(teacher, 'teachingGradeYear', 'gradeYear')
  const sectionKeysRaw = readTeacherValue(teacher, 'teachingSections')
  const singleSection = readTeacherValue(teacher, 'teachingSection', 'section')
  const sectionKeys = Array.isArray(sectionKeysRaw) && sectionKeysRaw.length
    ? sectionKeysRaw
    : (singleSection ? [singleSection] : [])

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
    new Set(sectionKeys.map((key) => sectionLabelFor(key)).filter(Boolean))
  )

  const experienceRaw = readTeacherValue(teacher, 'experienceYears', 'yearsOfExperience', 'experience')
  const experienceValue = Number.parseInt(experienceRaw, 10)
  const experienceLabel = Number.isFinite(experienceValue) && experienceValue > 0
    ? `${experienceValue}+ ${isRtl ? 'سنوات خبرة' : 'years exp.'}`
    : ''

  const tags = [
    gradeYearLabel,
    ...sectionLabels.slice(0, 2),
    experienceLabel,
  ].filter(Boolean).slice(0, 3)

  return { avatar, isRtl, name, subject, tags }
}

export function TeacherPortraitCard({ teacher, action, className = '' }) {
  const { avatar, isRtl, name, subject, tags } = useTeacherCardData(teacher)

  return (
    <div
      className={
        'group/teacher-card relative mx-auto aspect-[0.86] min-h-[390px] w-full max-w-[420px] overflow-hidden rounded-[34px] border border-brand/15 bg-brand shadow-[0_24px_65px_rgba(6,78,70,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_82px_rgba(6,78,70,0.24)] dark:border-white/10 dark:shadow-none ' +
        className
      }
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover/teacher-card:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <TeacherFallbackArtwork />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/0 from-[34%] via-brand/10 via-[48%] to-[#DDF3ED]/35" />
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#DDF3ED] via-[#C8EDEA]/88 via-[58%] to-transparent backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent,#000_28%,#000_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#E7F8F4] via-[#DDF3ED]/72 to-transparent" />
      <div className="absolute inset-x-0 bottom-[28%] h-16 bg-white/18 blur-2xl" />

      <div className="absolute inset-x-0 bottom-0 z-10 flex min-h-[40%] flex-col justify-end px-5 pb-6 pt-16 text-center sm:px-7 sm:pb-7">
        <h3 className="mx-auto m-0 max-w-full text-balance text-[clamp(26px,6.7vw,38px)] font-black leading-tight text-black">
          {name}
        </h3>
        <p className="mx-auto mt-2 max-w-full truncate text-[clamp(17px,4.5vw,24px)] font-extrabold leading-8 text-black/85">
          {subject}
        </p>

        {tags.length ? (
          <div className={'mt-6 flex flex-wrap items-center justify-center gap-2.5 ' + (isRtl ? 'flex-row-reverse' : '')}>
            {tags.map((label) => (
              <span
                key={label}
                className="inline-flex min-h-9 min-w-[92px] items-center justify-center rounded-full bg-brand px-4 py-1.5 text-center text-xs font-extrabold leading-tight text-white shadow-[0_8px_18px_rgba(6,148,132,0.18)] sm:min-w-[104px] sm:text-sm"
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}

        {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
      </div>
    </div>
  )
}

export default function TeacherCard(props) {
  return <TeacherPortraitCard {...props} />
}

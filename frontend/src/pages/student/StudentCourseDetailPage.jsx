import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../utils/api.js'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import CoursePageHeader from '../../components/courses/CoursePageHeader.jsx'
import InlineMediaViewer from '../../components/preview/InlineMediaViewer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import lecIcon from '../../cvg/lec.svg'
import infoIcon from '../../cvg/i.svg'
import fileIcon from '../../cvg/file.svg'
import vidIcon from '../../cvg/vid.svg'
import imgIcon from '../../cvg/img.svg'
import aPlusIcon from '../../cvg/a+.svg'
import homeworkIcon from '../../cvg/؟.svg'
import xIcon from '../../cvg/X.svg'
import noAttachIcon from '../../cvg/No attach.svg'
import { Inbox } from 'lucide-react'

function isHttpUrl(u) {
  if (!u) return false
  try {
    const url = new URL(String(u))
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function LessonAttachmentsList({ isRtl, lesson, openSigned, openMedia, assessment, onOpenAssessment, disabled = false }) {
  const [expandedId, setExpandedId] = useState('')

  const { videos, pdfs, images } = useMemo(() => {
    const list = Array.isArray(lesson?.contentSections) ? lesson.contentSections : []
    const out = { videos: [], pdfs: [], images: [] }
    for (const s of list) {
      if (s && s.enabled === false) continue
      if (Array.isArray(s?.videos)) out.videos.push(...s.videos)
      if (Array.isArray(s?.pdfs)) out.pdfs.push(...s.pdfs)
      if (Array.isArray(s?.images)) out.images.push(...s.images)
    }
    return out
  }, [lesson])

  function itemTitle(item, fallback) {
    const n = String(item?.name || '').trim()
    return n || fallback
  }

  function itemDesc(item) {
    const d = String(item?.description || '').trim()
    return d
  }

  function toggleExpanded(id) {
    setExpandedId((cur) => (cur === id ? '' : id))
  }

  function AttachmentCard({ id, kindLabel, item, action, endSlotIconSrc }) {
    const title = itemTitle(item, kindLabel)
    const desc = itemDesc(item)
    const isOpen = expandedId === id
    return (
      <div
        role="button"
        tabIndex={0}
        className="bg-white dark:bg-neutral-900 p-3 border border-black/5 dark:border-white/[0.06] rounded-xl w-full"
        onClick={() => {
          if (desc) toggleExpanded(id)
        }}
        onKeyDown={(e) => {
          if (!desc) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleExpanded(id)
          }
        }}
      >
        <div dir="ltr" className="flex justify-between items-center gap-2">
          {isRtl ? (
            <>
              <div
                className="flex justify-center sm:justify-center items-center gap-2 order-1 w-[72px] sm:w-auto shrink-0"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                {action}
              </div>

              <div dir="rtl" className="flex flex-1 justify-end items-center gap-2 order-2 sm:order-1 min-w-0 text-right">
                {endSlotIconSrc ? <img src={endSlotIconSrc} alt="" className="w-6 sm:w-7 h-6 sm:h-7 shrink-0" /> : null}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-slate-800 sm:text-[16px] dark:text-slate-100 break-words leading-snug whitespace-normal">
                    {title}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div dir="ltr" className="flex flex-1 justify-start items-center gap-2 order-2 sm:order-1 min-w-0 text-left">
                {endSlotIconSrc ? <img src={endSlotIconSrc} alt="" className="w-6 sm:w-7 h-6 sm:h-7 shrink-0" /> : null}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-slate-800 sm:text-[16px] dark:text-slate-100 break-words leading-snug whitespace-normal">
                    {title}
                  </div>
                </div>
              </div>

              <div
                className="flex justify-center sm:justify-center items-center gap-2 order-1 w-[72px] sm:w-auto shrink-0"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                {action}
              </div>
            </>
          )}
        </div>

        {isOpen && desc ? (
          <div className={'mt-2 w-full ' + (isRtl ? 'text-right' : 'text-left')}>
            <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-[#f3f4f6] dark:bg-neutral-800 px-3 py-2 rounded-lg w-full">
              {isRtl ? (
                <div className="flex items-center gap-2 w-full text-base leading-7">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={infoIcon} alt="" className="inline-block w-4 h-4 align-middle shrink-0" />
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 shrink-0">الوصف</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 shrink-0">:</span>
                    <span className="min-w-0 text-slate-700 dark:text-slate-200 break-words whitespace-pre-line">{desc}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full text-base leading-7">
                  <img src={infoIcon} alt="" className="inline-block w-4 h-4 align-middle shrink-0" />
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 shrink-0">Description</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 shrink-0">:</span>
                  <span className="min-w-0 text-slate-700 dark:text-slate-200 break-words whitespace-pre-line">{desc}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="gap-2 grid">
      <div className="gap-2 grid">
        {videos.map((v, idx) => (
          <AttachmentCard
            key={'v-' + idx}
            id={'v-' + idx}
            kindLabel={isRtl ? 'فيديو' : 'Video'}
            item={v}
            endSlotIconSrc={vidIcon}
            action={
              !disabled && v?.url ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-brand hover:bg-brand-600 dark:bg-brand dark:hover:bg-brand-600 px-4 sm:px-5 py-1.5 w-full sm:w-auto h-auto min-h-[36px] sm:min-h-[40px] text-white text-sm sm:text-base text-center leading-tight whitespace-normal"
                  onClick={() => openMedia?.({ kind: 'video', url: v.url, title: itemTitle(v, isRtl ? 'فيديو' : 'Video') })}
                >
                  {isRtl ? 'مشاهدة الفيديو' : 'Play'}
                </Button>
              ) : null
            }
          />
        ))}

        {pdfs.map((p, idx) => (
          <AttachmentCard
            key={'p-' + idx}
            id={'p-' + idx}
            kindLabel={'PDF'}
            item={p}
            endSlotIconSrc={fileIcon}
            action={
              !disabled && isHttpUrl(p?.url) ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-[#60A5FA] hover:bg-[#60A5FA]/90 dark:bg-[#60A5FA] dark:hover:bg-[#60A5FA]/90 px-4 sm:px-5 py-1.5 w-full sm:w-auto h-auto min-h-[36px] sm:min-h-[40px] text-white text-sm sm:text-base text-center leading-tight whitespace-normal"
                  onClick={() => {
                    openSigned?.(p.url, itemTitle(p, 'PDF'))
                  }}
                >
                  {isRtl ? 'فتح الملف' : 'Open PDF'}
                </Button>
              ) : null
            }
          />
        ))}

        {images.map((img, idx) => (
          <AttachmentCard
            key={'i-' + idx}
            id={'i-' + idx}
            kindLabel={isRtl ? 'صورة' : 'Image'}
            item={img}
            endSlotIconSrc={imgIcon}
            action={
              !disabled && isHttpUrl(img?.url) ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-brand hover:bg-brand-600 dark:bg-brand dark:hover:bg-brand-600 px-4 sm:px-5 py-1.5 w-full sm:w-auto h-auto min-h-[36px] sm:min-h-[40px] text-white text-sm sm:text-base text-center leading-tight whitespace-normal"
                  onClick={() => openMedia?.({ kind: 'image', url: img.url, title: itemTitle(img, isRtl ? 'صورة' : 'Image') })}
                >
                  {isRtl ? 'فتح الصورة' : 'Open'}
                </Button>
              ) : null
            }
          />
        ))}

        {assessment && assessment?._id ? (
          <AttachmentCard
            key={'a-0'}
            id={'a-0'}
            kindLabel={assessment?.type === 'homework' ? (isRtl ? 'واجب' : 'Homework') : (isRtl ? 'اختبار' : 'Quiz')}
            item={{ name: assessment?.title || (assessment?.type === 'homework' ? (isRtl ? 'واجب' : 'Homework') : (isRtl ? 'اختبار' : 'Quiz')), description: '' }}
            endSlotIconSrc={assessment?.type === 'homework' ? homeworkIcon : aPlusIcon}
            action={
              !disabled ? (
                <Button
                  type="button"
                  variant="secondary"
                  className={(assessment?.type === 'homework' ? 'bg-[#2DD4BF] dark:bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 dark:hover:bg-[#2DD4BF]/90 ' : 'bg-[#F43F5E] dark:bg-[#F43F5E] hover:bg-[#F43F5E]/90 dark:hover:bg-[#F43F5E]/90 ') + 'px-4 sm:px-5 py-1.5 h-auto min-h-[36px] sm:min-h-[40px] text-white text-sm sm:text-base w-full sm:w-auto whitespace-normal text-center leading-tight'}
                  onClick={() => onOpenAssessment?.(assessment)}
                >
                  {isRtl ? 'ابدأ الامتحان' : 'Open'}
                </Button>
              ) : null
            }
          />
        ) : null}

        {!videos.length && !pdfs.length && !images.length && !(assessment && assessment?._id) ? (
          <div className="flex justify-center">
            <div className={'inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 text-lg ' + (isRtl ? 'flex-row text-right' : 'flex-row-reverse text-left')}>
              <img src={noAttachIcon} alt="" aria-hidden="true" className="w-7 h-7 object-contain" />
              <span>{isRtl ? 'سيتم اضافة المحتوى قريبا' : 'Content will be added soon'}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function formatDateTime(value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString()
  } catch {
    return ''
  }
}

export default function StudentCourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { auth } = useAuth()

  const lang = typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'ar' : 'en'
  const isRtl = lang === 'ar'

  const [course, setCourse] = useState(null)
  const [units, setUnits] = useState([])
  const [activeUnitId, setActiveUnitId] = useState('')
  const [lessonsByUnitId, setLessonsByUnitId] = useState({})
  const [activeLessonId, setActiveLessonId] = useState('')
  const [expandedUnitIds, setExpandedUnitIds] = useState(() => new Set())
  const [expandedLessonIds, setExpandedLessonIds] = useState(() => new Set())

  const attachmentsUnit = useMemo(() => {
    return (Array.isArray(units) ? units : []).find((u) => {
      const t = String(u?.title || '').trim()
      return t === 'جزء المرفقات' || t === 'Attachments' || t === 'المرفقات' || t === 'مرفقات'
    })
  }, [units])

  const visibleUnits = useMemo(() => {
    return (Array.isArray(units) ? units : []).filter((u) => {
      const t = String(u?.title || '').trim()
      return !(t === 'جزء المرفقات' || t === 'Attachments' || t === 'المرفقات' || t === 'مرفقات')
    })
  }, [units])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [lockedCourseInfo, setLockedCourseInfo] = useState(null)
  const [courseAssessments, setCourseAssessments] = useState([])

  const [selectedMedia, setSelectedMedia] = useState(null)

  const [autoEnrolling, setAutoEnrolling] = useState(false)
  const [autoEnrolled, setAutoEnrolled] = useState(false)

  const isCourseFree = useMemo(() => {
    return Boolean(course?.isFree) || Number(course?.price || 0) <= 0
  }, [course])

  async function ensureFreeCourseAddedToMine() {
    if (!auth?.token) return
    if (auth?.role === 'admin') return // Admins can see everything
    if (auth?.role !== 'student') return
    if (!courseId) return
    if (!isCourseFree) return
    if (autoEnrolled || autoEnrolling) return
    try {
      setAutoEnrolling(true)
      await api.post(`/courses/${courseId}/self-enroll`)
      setAutoEnrolled(true)
    } catch {
      // ignore
    } finally {
      setAutoEnrolling(false)
    }
  }

  async function openSigned(fileUrl, title) {
    const u = String(fileUrl || '')
    if (!u) return
    try {
      await ensureFreeCourseAddedToMine()
      const res = await api.get('/uploads/signed', { params: { url: u, courseId } })
      const signedUrl = res?.data?.url
      if (!signedUrl) throw new Error('No signed url returned')
      setSelectedMedia({ kind: 'pdf', url: signedUrl, title: title || 'PDF' })
    } catch (e) {
      notify({ title: 'Failed to open PDF', description: e?.response?.data?.message || e?.message || 'Error', variant: 'destructive' })
    }
  }

  function openMedia({ kind, url, title }) {
    const u = String(url || '')
    if (!u) return
    ensureFreeCourseAddedToMine().catch(() => { })
    setSelectedMedia({ kind: String(kind || ''), url: u, title: title || '' })
  }

  async function refresh() {
    try {
      setLoading(true)
      const [courseRes, unitsRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/units`),
        api.get(`/courses/${courseId}/stats`).then((r) => {
          setStats(r.data)
          return r
        }).catch(() => {
          setStats(null)
          return null
        })
      ])
      setCourse(courseRes.data)
      setUnits(unitsRes.data)
      if (!activeUnitId && unitsRes.data?.[0]?._id) setActiveUnitId(unitsRes.data[0]._id)
      setLockedCourseInfo(null)

      try {
        const aRes = await api.get(`/assessments/course/${courseId}`)
        setCourseAssessments(Array.isArray(aRes.data) ? aRes.data : [])
      } catch {
        setCourseAssessments([])
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Error'
      if (String(msg).toLowerCase().includes('locked') || String(msg).toLowerCase().includes('forbidden')) {
        if (auth?.user?.role === 'admin') {
          // Admin shouldn't be locked out, but if they are, they should still see full content
          setLockedCourseInfo(null)
        }
        try {
          const out = await api.get(`/courses/${courseId}/outline`)
          const outlineCourse = out?.data || null
          setLockedCourseInfo(outlineCourse)

          const outlineIsFree = Boolean(outlineCourse?.isFree) || Number(outlineCourse?.price || 0) <= 0
          if (outlineIsFree) {
            setLockedCourseInfo(null)
            const [courseRes2, unitsRes2] = await Promise.all([
              api.get(`/courses/${courseId}`),
              api.get(`/courses/${courseId}/units`)
            ])
            setCourse(courseRes2.data)
            setUnits(unitsRes2.data)
            if (!activeUnitId && unitsRes2.data?.[0]?._id) setActiveUnitId(unitsRes2.data[0]._id)
          }
        } catch {
          setLockedCourseInfo(null)
        }
      } else {
        setLockedCourseInfo(null)
      }
      notify({ title: 'Failed to load course', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function loadLessons(unitId) {
    if (!unitId) return
    try {
      const res = await api.get(`/courses/units/${unitId}/lessons`)
      setLessonsByUnitId((cur) => ({ ...(cur || {}), [String(unitId)]: Array.isArray(res.data) ? res.data : [] }))
    } catch (e) {
      notify({ title: 'Failed to load lessons', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    }
  }

  function toggleUnitExpanded(unitId) {
    const id = String(unitId || '')
    if (!id) return
    setExpandedUnitIds((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleLessonExpanded(lessonId) {
    const id = String(lessonId || '')
    if (!id) return
    setExpandedLessonIds((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function ensureUnitLessonsLoaded(unitId) {
    const id = String(unitId || '')
    if (!id) return
    if (Object.prototype.hasOwnProperty.call(lessonsByUnitId || {}, id)) return
    loadLessons(id).catch(() => { })
  }

  function openIfUnlocked(fn) {
    return (e) => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
      const allLessons = Object.values(lessonsByUnitId || {}).flat()
      const active = allLessons.find((x) => x?._id === activeLessonId) || null
      if (active?.locked) {
        notify({ title: 'Locked', description: 'Complete the exam to unlock the next lessons.', variant: 'destructive' })
        return
      }
      fn(e)
    }
  }

  function openIfUnlockedOrLocked(lesson, fn) {
    return (e) => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
      if (lesson?.locked) {
        notify({ title: 'Locked', description: 'Complete the exam to unlock the next lessons.', variant: 'destructive' })
        return
      }
      fn(e)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  useEffect(() => {
    try {
      if (Array.isArray(units) && units.length === 1) {
        const t = String(units?.[0]?.title || '').trim()
        if (t === 'جزء المرفقات' || t === 'Attachments') {
          ensureUnitLessonsLoaded(units?.[0]?._id)
        }
      }
    } catch {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units])

  const activeUnit = useMemo(() => units.find((u) => u._id === activeUnitId) || null, [units, activeUnitId])

  const lockedUnits = useMemo(() => {
    if (auth?.user?.role === 'admin') return [] // Admins don't see locked view
    const list = Array.isArray(lockedCourseInfo?.units) ? lockedCourseInfo.units : []
    return list.filter((u) => {
      const t = String(u?.title || '').trim()
      // Skip attachments unit in locked view
      if (t === 'جزء المرفقات' || t === 'المرفقات' || t === 'Attachments' || t === 'مرفقات') return false
      // Skip empty units
      if (!(Array.isArray(u?.lessons) && u.lessons.length > 0)) return false
      return true
    })
  }, [lockedCourseInfo])

  const lockedHasContent = useMemo(() => {
    if (auth?.user?.role === 'admin') return true
    if (!lockedCourseInfo || Boolean(lockedCourseInfo?.isFree) || Number(lockedCourseInfo?.price || 0) <= 0) return true
    if (!lockedUnits.length) return false
    for (const u of lockedUnits) {
      if (Array.isArray(u?.lessons) && u.lessons.length) return true
    }
    return false
  }, [lockedCourseInfo, lockedUnits])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <Spinner />
        Loading...
      </div>
    )
  }

  return (
    <div className="gap-4 grid" dir={isRtl ? 'rtl' : 'ltr'}>
      {!selectedMedia?.url ? (
        <CoursePageHeader
          dir={isRtl ? 'rtl' : 'ltr'}
          title={course?.title || lockedCourseInfo?.title || 'الكورس'}
          description={course?.description || lockedCourseInfo?.description || ''}
          thumbnailUrl={course?.thumbnailUrl || lockedCourseInfo?.thumbnailUrl || ''}
          teacherName={course?.teacher?.name || lockedCourseInfo?.teacher?.name || lockedCourseInfo?.teacherName || ''}
          price={course?.price || lockedCourseInfo?.price || 0}
          isFree={Boolean(course?.isFree) || Boolean(lockedCourseInfo?.isFree) || Number(course?.price || lockedCourseInfo?.price || 0) <= 0}
          discountPercent={course?.discountPercent ?? lockedCourseInfo?.discountPercent ?? 0}
          createdAt={course?.createdAt || lockedCourseInfo?.createdAt}
          updatedAt={course?.updatedAt || lockedCourseInfo?.updatedAt}
          status={lockedCourseInfo && !lockedCourseInfo?.isFree ? 'locked' : (Boolean(course?.isFree) ? 'free' : 'available')}
          primaryAction={lockedCourseInfo && !lockedCourseInfo?.isFree ? {
            label: 'الاشتراك والدفع',
            onClick: () => navigate(`/student/checkout/${lockedCourseInfo?.id || courseId}`)
          } : undefined}
          secondaryAction={lockedCourseInfo ? {
            label: 'معاينة الكورس',
            onClick: () => navigate(`/courses/${lockedCourseInfo?.id || courseId}/preview`)
          } : undefined}
        />
      ) : null}

      {selectedMedia?.url ? (
        <InlineMediaViewer
          media={selectedMedia}
          isRtl={isRtl}
          courseId={courseId}
          lessonId={activeLessonId}
          onClose={() => setSelectedMedia(null)}
        />
      ) : null}

      {lockedCourseInfo && !lockedCourseInfo?.isFree && lockedUnits.length > 0 ? (
        <div className="gap-3 grid">
          <Card>
            <CardContent>
              <div className="font-semibold text-slate-900 dark:text-white">{isRtl ? 'المحاضرات' : 'Lectures'}</div>
              <div className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
                {isRtl ? 'المحتوى مقفول. تقدر تشوف التفاصيل والعناوين، والمرفقات هتتفتح بعد الاشتراك.' : 'Content is locked. You can view details and titles; attachments unlock after enrollment.'}
              </div>
            </CardContent>
          </Card>

          {!lockedHasContent ? (
            <div className="flex flex-col justify-center items-center py-10 text-center">
              <div className="flex justify-center items-center bg-[#F43F5E]/10 border border-[#F43F5E]/25 rounded-3xl w-16 h-16">
                <Inbox className="w-8 h-8 text-[#F43F5E]" />
              </div>
              <div className="mt-4 font-extrabold text-[#F43F5E] text-xl">
                {isRtl ? 'مفيش محتوى حالياً' : 'No content yet'}
              </div>
              <div className="mt-2 text-[#F43F5E]/85 text-sm leading-7">
                {isRtl ? 'سيتم اضافه كورسات قريباََ' : 'Courses will be added soon'}
              </div>
            </div>
          ) : (
            <div className="gap-2 grid">
              {lockedUnits.map((u) => {
                const uid = String(u?.id || u?._id || '')
                const isUnitOpen = uid && expandedUnitIds.has(uid)
                return (
                  <div key={uid || u?.title} className="border border-black/5 dark:border-white/[0.06] rounded-2xl">
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 transition-colors bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                      onClick={() => {
                        if (!uid) return
                        toggleUnitExpanded(uid)
                      }}
                      aria-expanded={isUnitOpen}
                    >
                      <img src={lecIcon} alt="" className="w-16 h-16 shrink-0" />
                      <div className={'min-w-0 flex-1 ' + (isRtl ? 'text-right' : 'text-left')}>
                        <div className="font-semibold text-[30px] truncate">
                          {u?.title ? u.title.replace(/^جزء (من )?/, '') : '-'}
                        </div>
                      </div>
                    </button>

                    {isUnitOpen ? (
                      <div className="bg-[#D2EBE1] dark:bg-neutral-800 p-3">
                        {(u?.lessons || []).length === 0 ? (
                          <div className="py-8">
                            <div className={'flex items-center justify-center gap-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                              <img src={xIcon} alt="" className="w-9 h-9 shrink-0" />
                              <div className="font-medium text-[18px] text-center" style={{ color: '#E11D48' }}>سيتم اضافة المحتوى قريبًا</div>
                            </div>
                          </div>
                        ) : (
                          <div className="gap-2 grid">
                            {(u?.lessons || []).map((l) => (
                              <div key={String(l?.id || l?._id)} className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/[0.06] rounded-xl">
                                <div className={`w-full flex items-center justify-between gap-3 px-3 py-3 bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-300 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                  <div className={'min-w-0 flex-1 ' + (isRtl ? 'text-right' : 'text-left')}>
                                    <div className="font-medium truncate">{l?.title || '-'}</div>
                                  </div>
                                </div>
                                <div className="bg-white dark:bg-neutral-900 px-3 py-3 border-black/5 dark:border-white/[0.06] border-t">
                                  <LessonAttachmentsList
                                    isRtl={isRtl}
                                    lesson={l}
                                    disabled
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="gap-3 grid">
          <Card>
            <CardContent>
              {units.length === 0 ? (
                <div className="py-8">
                  <div className={'flex items-center justify-center gap-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                    <img src={xIcon} alt="" className="w-9 h-9 shrink-0" />
                    <div className="font-medium text-[18px] text-center" style={{ color: '#E11D48' }}>سيتم اضافة المحتوى قريبًا</div>
                  </div>
                </div>
              ) : (
                <div className="gap-2 grid">
                  {attachmentsUnit ? (
                    <div className="gap-2 grid">
                      {(() => {
                        const unitId = String(attachmentsUnit?._id || '')
                        const unitLessons = (lessonsByUnitId || {})[unitId] || []
                        return unitLessons.length === 0
                      })() ? null : (
                        <div className="gap-2 grid">
                          {(() => {
                            const unitId = String(attachmentsUnit?._id || '')
                            return ((lessonsByUnitId || {})[unitId] || [])
                          })().map((l) => {
                            const isActive = l._id === activeLessonId
                            const isLocked = Boolean(l.locked)
                            const isExam = l.kind === 'exam'
                            const isExpanded = expandedLessonIds.has(String(l._id))
                            const hasAnyAttachments = (() => {
                              const sections = Array.isArray(l?.contentSections) ? l.contentSections : []
                              for (const s of sections) {
                                if (s && s.enabled === false) continue
                                if (Array.isArray(s?.videos) && s.videos.length) return true
                                if (Array.isArray(s?.pdfs) && s.pdfs.length) return true
                                if (Array.isArray(s?.images) && s.images.length) return true
                              }
                              if (isHttpUrl(l?.videoUrl)) return true
                              if (isHttpUrl(l?.pdfUrl)) return true
                              if (Array.isArray(l?.imageUrls) && l.imageUrls.length) return true
                              return false
                            })()
                            const lessonAssessment = !isExam && l.assessmentId
                              ? (courseAssessments || []).find((a) => String(a?._id) === String(l.assessmentId))
                              : null
                            const linkedAssessment = !isExam && l.assessmentId
                              ? (lessonAssessment || { _id: String(l.assessmentId), title: isRtl ? 'اختبار داخل المحاضرة' : 'Lesson Assessment', type: 'quiz' })
                              : null

                            return (
                              <div key={l._id} className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/[0.06] rounded-xl overflow-hidden">
                                <div
                                  role="button"
                                  tabIndex={isLocked ? -1 : 0}
                                  className={`w-full flex items-center justify-between gap-3 px-3 py-3 transition-colors ${isLocked
                                    ? 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-300 cursor-not-allowed'
                                    : isActive
                                      ? 'bg-[#0AB6C6] text-white'
                                      : 'bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800'
                                    } ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                                  onClick={() => {
                                    if (isLocked) return
                                    setActiveLessonId(l._id)
                                    toggleLessonExpanded(l._id)
                                  }}
                                  onKeyDown={(e) => {
                                    if (isLocked) return
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      setActiveLessonId(l._id)
                                      toggleLessonExpanded(l._id)
                                    }
                                  }}
                                >
                                  <img src={lecIcon} alt="" className="w-10 h-10 shrink-0" />
                                  <div className={'min-w-0 flex-1 ' + (isRtl ? 'text-right' : 'text-left')}>
                                    <div className={`font-medium text-lg sm:text-3xl truncate leading-relaxed arabic-safe ${isLocked
                                      ? 'text-slate-500 dark:text-slate-300'
                                      : isActive
                                        ? 'text-white'
                                        : 'text-slate-800 dark:text-slate-100'
                                      }`}>
                                      <span className={"relative block min-w-0 " + (isRtl ? 'pr-10' : 'pl-10')}>
                                        {!isExam && !hasAnyAttachments ? (
                                          <img
                                            src={noAttachIcon}
                                            alt=""
                                            aria-hidden="true"
                                            className={"pointer-events-none absolute top-1/2 -translate-y-1/2 w-8 h-8 " + (isRtl ? 'right-0' : 'left-0')}
                                          />
                                        ) : null}
                                        <span className="block min-w-0 truncate">{l.title}</span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-row-reverse items-center gap-2 shrink-0">
                                    {isExam && l.assessmentId ? (
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="bg-[#F43F5E] hover:bg-[#F43F5E]/90 px-3 h-8 text-white text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (isLocked && l.lockedByAssessmentId) {
                                            navigate(`/student/assessments/${l.lockedByAssessmentId}/attempt`)
                                            return
                                          }
                                          navigate(`/student/assessments/${l.assessmentId}/attempt`)
                                        }}
                                      >
                                        ابدأ الامتحان
                                      </Button>
                                    ) : null}
                                  </div>
                                </div>

                                {isExpanded && !isExam ? (
                                  <div className="bg-white dark:bg-neutral-900 px-3 py-3 border-black/5 dark:border-white/[0.06] border-t">
                                    <div className="gap-2 grid mt-2">
                                      {Array.isArray(l?.contentSections) && l.contentSections.length ? (
                                        <div onClick={(e) => e.stopPropagation()}>
                                          <LessonAttachmentsList
                                            isRtl={isRtl}
                                            lesson={l}
                                            openSigned={(url) => openIfUnlockedOrLocked(l, () => openSigned(url).catch(() => { }))()}
                                            openMedia={openMedia}
                                            assessment={linkedAssessment}
                                            onOpenAssessment={(a) => {
                                              if (!a?._id) return
                                              ensureFreeCourseAddedToMine().finally(() => {
                                                navigate(`/student/assessments/${a._id}/attempt`)
                                              })
                                            }}
                                          />
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {visibleUnits.map((u) => {
                    const unitId = String(u._id)
                    const isUnitOpen = expandedUnitIds.has(unitId)
                    const unitLessons = (lessonsByUnitId || {})[unitId] || []

                    return (
                      <div key={u._id} className="border border-black/5 dark:border-white/[0.06] rounded-2xl overflow-hidden">
                        <button
                          type="button"
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 transition-colors ${isUnitOpen ? 'bg-[#14B8A6] text-white' : 'bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800'
                            } ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                          onClick={() => {
                            toggleUnitExpanded(unitId)
                            ensureUnitLessonsLoaded(unitId)
                          }}
                          aria-expanded={isUnitOpen}
                        >
                          <img src={lecIcon} alt="" className="w-16 h-16 shrink-0" />

                          <div className={'min-w-0 flex-1 ' + (isRtl ? 'text-right' : 'text-left')}>
                            <div className="font-semibold text-[30px] truncate">
                              {u.title ? u.title.replace(/^جزء (من )?/, '') : '-'}
                            </div>
                          </div>
                        </button>

                        {isUnitOpen ? (
                          <div className="bg-[#D2EBE1] dark:bg-neutral-800 p-3">
                            {unitLessons.length === 0 ? (
                              <div className="py-8">
                                <div className={'flex items-center justify-center gap-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                                  <img src={xIcon} alt="" className="w-9 h-9 shrink-0" />
                                  <div className="font-medium text-[18px] text-center" style={{ color: '#E11D48' }}>سيتم اضافة المحتوى قريبًا</div>
                                </div>
                              </div>
                            ) : (
                              <div className="gap-2 grid">
                                {unitLessons.map((l) => {
                                  const isActive = l._id === activeLessonId
                                  const isLocked = Boolean(l.locked)
                                  const isExam = l.kind === 'exam'
                                  const isExpanded = expandedLessonIds.has(String(l._id))
                                  const hasAnyAttachments = (() => {
                                    const sections = Array.isArray(l?.contentSections) ? l.contentSections : []
                                    for (const s of sections) {
                                      if (s && s.enabled === false) continue
                                      if (Array.isArray(s?.videos) && s.videos.length) return true
                                      if (Array.isArray(s?.pdfs) && s.pdfs.length) return true
                                      if (Array.isArray(s?.images) && s.images.length) return true
                                    }
                                    if (isHttpUrl(l?.videoUrl)) return true
                                    if (isHttpUrl(l?.pdfUrl)) return true
                                    if (Array.isArray(l?.imageUrls) && l.imageUrls.length) return true
                                    return false
                                  })()
                                  const lessonAssessment = !isExam && l.assessmentId
                                    ? (courseAssessments || []).find((a) => String(a?._id) === String(l.assessmentId))
                                    : null
                                  const linkedAssessment = !isExam && l.assessmentId
                                    ? (lessonAssessment || { _id: String(l.assessmentId), title: isRtl ? 'اختبار داخل المحاضرة' : 'Lesson Assessment', type: 'quiz' })
                                    : null

                                  return (
                                    <div key={l._id} className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/[0.06] rounded-xl overflow-hidden">
                                      <div
                                        role="button"
                                        tabIndex={isLocked ? -1 : 0}
                                        className={`w-full flex items-center justify-between gap-3 px-3 py-3 transition-colors ${isLocked
                                          ? 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-300 cursor-not-allowed'
                                          : isActive
                                            ? 'bg-[#0AB6C6] text-white'
                                            : 'bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800'
                                          } ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                                        onClick={() => {
                                          if (isLocked) return
                                          setActiveLessonId(l._id)
                                          toggleLessonExpanded(l._id)
                                        }}
                                        onKeyDown={(e) => {
                                          if (isLocked) return
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            setActiveLessonId(l._id)
                                            toggleLessonExpanded(l._id)
                                          }
                                        }}
                                      >
                                        <div className={'min-w-0 flex-1 ' + (isRtl ? 'text-right' : 'text-left')}>
                                          <div
                                            className={`font-medium text-lg sm:text-3xl truncate leading-relaxed arabic-safe ${isLocked
                                              ? 'text-slate-500 dark:text-slate-300'
                                              : isActive
                                                ? 'text-white'
                                                : 'text-slate-800 dark:text-slate-100'
                                              }`}
                                          >
                                            <span className={"relative block min-w-0 " + (isRtl ? 'pr-10' : 'pl-10')}>
                                              {!isExam && !hasAnyAttachments ? (
                                                <img
                                                  src={noAttachIcon}
                                                  alt=""
                                                  aria-hidden="true"
                                                  className={"pointer-events-none absolute top-1/2 -translate-y-1/2 w-8 h-8 " + (isRtl ? 'right-0' : 'left-0')}
                                                />
                                              ) : null}
                                              <span className="block min-w-0 truncate">{l.title}</span>
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex flex-row-reverse items-center gap-2 shrink-0">
                                          {isExam && l.assessmentId ? (
                                            <Button
                                              type="button"
                                              variant="secondary"
                                              className="bg-[#F43F5E] hover:bg-[#F43F5E]/90 px-3 h-8 text-white text-xs"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                if (isLocked && l.lockedByAssessmentId) {
                                                  navigate(`/student/assessments/${l.lockedByAssessmentId}/attempt`)
                                                  return
                                                }
                                                navigate(`/student/assessments/${l.assessmentId}/attempt`)
                                              }}
                                            >
                                              ابدأ الامتحان
                                            </Button>
                                          ) : null}
                                          {!isExam && isLocked && l.lockedByAssessmentId ? (
                                            <Button
                                              type="button"
                                              variant="secondary"
                                              className="bg-[#F43F5E] hover:bg-[#F43F5E]/90 px-3 h-8 text-white text-xs"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/student/assessments/${l.lockedByAssessmentId}/attempt`)
                                              }}
                                            >
                                              ابدأ الامتحان
                                            </Button>
                                          ) : null}
                                        </div>
                                      </div>

                                      {isExpanded && !isExam ? (
                                        <div className="bg-white dark:bg-neutral-900 px-3 py-3 border-black/5 dark:border-white/[0.06] border-t">
                                          <div className="gap-2 grid mt-2">
                                            {Array.isArray(l?.contentSections) && l.contentSections.length ? (
                                              <div onClick={(e) => e.stopPropagation()}>
                                                <LessonAttachmentsList
                                                  isRtl={isRtl}
                                                  lesson={l}
                                                  openSigned={(url) => openIfUnlockedOrLocked(l, () => openSigned(url).catch(() => { }))()}
                                                  openMedia={openMedia}
                                                  assessment={linkedAssessment}
                                                  onOpenAssessment={(a) => {
                                                    if (!a?._id) return
                                                    ensureFreeCourseAddedToMine().finally(() => {
                                                      navigate(`/student/assessments/${a._id}/attempt`)
                                                    })
                                                  }}
                                                />
                                              </div>
                                            ) : null}
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

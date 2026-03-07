import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SiteLayout from '../../components/layout/SiteLayout.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import { api } from '../../utils/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import CoursePageHeader from '../../components/courses/CoursePageHeader.jsx'
import infoIcon from '../../cvg/i.svg'
import fileIcon from '../../cvg/file.svg'
import vidIcon from '../../cvg/vid.svg'
import lecIcon from '../../cvg/lec.svg'
import xIcon from '../../cvg/X.svg'
import noAttachIcon from '../../cvg/No attach.svg'

export default function CoursePreviewPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { isRtl } = useLanguage()
  const { auth } = useAuth()
  const { notify } = useToast()

  const loggedIn = Boolean(auth?.token)

  const [enrolled, setEnrolled] = useState(false)

  const [expandedUnitId, setExpandedUnitId] = useState('')
  const [expandedLessonId, setExpandedLessonId] = useState('')

  function dashboardHref() {
    if (auth?.role === 'admin') return '/admin'
    if (auth?.role === 'teacher') return '/teacher'
    if (auth?.role === 'team') return '/team'
    if (auth?.role === 'student') return '/student'
    return '/'
  }

  const [state, setState] = useState({ status: 'loading', data: null, error: '' })

  useEffect(() => {
    let alive = true

    async function load() {
      if (!alive) return
      setState({ status: 'loading', data: null, error: '' })
      try {
        const [outlineRes, mineRes] = await Promise.all([
          api.get(`/courses/${courseId}/outline`),
          loggedIn ? api.get('/courses/mine').catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
        ])
        const mine = Array.isArray(mineRes?.data) ? mineRes.data : []
        const isInMine = mine.some((c) => String(c?._id || c?.id) === String(courseId))
        if (alive) setEnrolled(Boolean(isInMine))

        const res = outlineRes
        if (alive) setState({ status: 'success', data: res.data, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Failed to load course'
        if (alive) setState({ status: 'error', data: null, error: msg })
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [courseId, loggedIn])

  const title = state.data?.title || (isRtl ? 'الكورس' : 'Course')
  const thumb = state.data?.thumbnailUrl || ''
  const stats = null
  const courseIsFree = Boolean(state.data?.isFree) || Number(state.data?.price || 0) <= 0

  function enterCourseHref() {
    if (auth?.role === 'teacher') return `/teacher/courses/${courseId}`
    if (auth?.role === 'team') return `/team/courses/${courseId}`
    if (auth?.role === 'student') return `/student/courses/${courseId}`
    return dashboardHref()
  }

  function ensureCanOpenLockedContent() {
    if (!loggedIn) {
      notify({
        title: isRtl ? 'سجل الدخول أولًا' : 'Login required',
        description: isRtl ? 'سجّل دخولك لفتح المحتوى.' : 'Please login to open content.',
        variant: 'destructive'
      })
      navigate('/login')
      return false
    }

    if (!enrolled && !courseIsFree) {
      notify({
        title: isRtl ? 'المحتوى مقفول' : 'Locked content',
        description: isRtl ? 'اشترك في الكورس لفتح المحتوى.' : 'Enroll to unlock content.',
        variant: 'destructive'
      })
      navigate(`/student/checkout/${courseId}`)
      return false
    }

    return true
  }

  const units = useMemo(() => {
    const list = state.data?.units
    return Array.isArray(list) ? list : []
  }, [state.data])

  function isHttpUrl(u) {
    if (!u) return false
    try {
      const url = new URL(String(u))
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  function normalizeLessonForAttachments(lesson) {
    const l = lesson || {}
    const hasSections = Array.isArray(l?.contentSections) && l.contentSections.length
    if (hasSections) return l

    const sections = []
    const videos = isHttpUrl(l?.videoUrl) ? [{ url: l.videoUrl, name: isRtl ? 'فيديو' : 'Video' }] : []
    const pdfs = isHttpUrl(l?.pdfUrl) ? [{ url: l.pdfUrl, name: 'PDF' }] : []
    const images = Array.isArray(l?.imageUrls) ? l.imageUrls.filter(isHttpUrl).map((u) => ({ url: u, name: isRtl ? 'صورة' : 'Image' })) : []
    if (videos.length || pdfs.length || images.length) {
      sections.push({ enabled: true, videos, pdfs, images })
    }
    return { ...l, contentSections: sections }
  }

  function LessonAttachmentsList({ lesson, disabled }) {
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

    function AttachmentRow({ id, kindLabel, item, action, endSlotIconSrc }) {
      const title = itemTitle(item, kindLabel)
      const desc = itemDesc(item)
      const isOpen = expandedId === id

      return (
        <div className={'bg-black/10 dark:bg-white/[0.06] rounded-xl overflow-hidden border border-black/5 dark:border-white/10 ' + (disabled ? 'opacity-70' : '')}>
          <div
            role="button"
            tabIndex={0}
            className={'flex items-center justify-between gap-3 px-3 py-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}
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
            <div className={'flex items-center gap-3 min-w-0 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
              {endSlotIconSrc ? <img src={endSlotIconSrc} alt="" className="w-7 h-7 shrink-0" /> : null}
              <div className={'min-w-0 ' + (isRtl ? 'text-right' : 'text-left')}>
                <div className="font-semibold text-[16px] text-slate-900 dark:text-slate-100 truncate">{title}</div>
              </div>
            </div>

            <div
              className="shrink-0"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {action}
            </div>
          </div>

          {isOpen && desc ? (
            <div className="px-3 pb-3">
              <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-black/10 dark:bg-white/[0.06] px-3 py-2 rounded-lg w-full">
                <div className={'flex items-start gap-2 w-full text-sm leading-6 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                  <img src={infoIcon} alt="" className="inline-block mt-1 w-4 h-4 align-middle shrink-0" />
                  <div className={'min-w-0 ' + (isRtl ? 'text-right' : 'text-left')}>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{isRtl ? 'الوصف' : 'Description'}</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">:</span>{' '}
                    <span className="text-slate-700 dark:text-slate-200 break-words whitespace-pre-line">{desc}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )
    }

    const nothing = !videos.length && !pdfs.length && !images.length

    return (
      <div className="gap-2 grid">
        {videos.map((v, idx) => (
          <AttachmentRow
            key={'v-' + idx}
            id={'v-' + idx}
            kindLabel={isRtl ? 'فيديو' : 'Video'}
            item={v}
            endSlotIconSrc={vidIcon}
            action={
              !disabled && isHttpUrl(v?.url) ? (
                <a
                  href={v.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button type="button" variant="secondary" className="px-3 h-8 text-xs">
                    {isRtl ? 'تشغيل' : 'Play'}
                  </Button>
                </a>
              ) : null
            }
          />
        ))}

        {pdfs.map((p, idx) => (
          <AttachmentRow
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
                  className="px-3 h-8 text-xs"
                  onClick={() => {
                    openSigned?.(p.url)
                  }}
                >
                  {isRtl ? 'فتح PDF' : 'Open PDF'}
                </Button>
              ) : null
            }
          />
        ))}

        {images.map((img, idx) => (
          <AttachmentRow
            key={'i-' + idx}
            id={'i-' + idx}
            kindLabel={isRtl ? 'صورة' : 'Image'}
            item={img}
            action={
              !disabled && isHttpUrl(img?.url) ? (
                <a href={img.url} target="_blank" rel="noreferrer">
                  <Button type="button" variant="secondary" className="px-3 h-8 text-xs">
                    {isRtl ? 'فتح' : 'Open'}
                  </Button>
                </a>
              ) : null
            }
          />
        ))}

        {nothing ? (
          <div className="flex justify-center">
            <div className={'inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 text-lg ' + (isRtl ? 'flex-row text-right' : 'flex-row-reverse text-left')}>
              <img src={noAttachIcon} alt="" aria-hidden="true" className="w-7 h-7 object-contain" />
              <span>{isRtl ? 'سيتم اضافة المحتوى قريبا' : 'Content will be added soon'}</span>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  async function openSigned(fileUrl) {
    const u = String(fileUrl || '')
    if (!u) return

    if (!ensureCanOpenLockedContent()) return

    try {
      const res = await api.get('/uploads/signed', { params: { url: u, courseId } })
      const signedUrl = res?.data?.url
      if (!signedUrl) throw new Error('No signed url returned')
      window.open(signedUrl, '_blank', 'noreferrer')
    } catch (e) {
      notify({
        title: isRtl ? 'فشل فتح الملف' : 'Failed to open file',
        description: e?.response?.data?.message || e?.message || 'Error',
        variant: 'destructive'
      })
    }
  }

  return (
    <SiteLayout>
      <div className="gap-5 grid" dir={isRtl ? 'rtl' : 'ltr'}>
        {state.status === 'success' ? (
          <CoursePageHeader
            dir={isRtl ? 'rtl' : 'ltr'}
            title={title}
            description={state.data?.description || (enrolled
              ? (isRtl ? 'الكورس متاح لك.' : 'Course is available.')
              : (isRtl ? 'معاينة الكورس (المحتوى مقفول).' : 'Course preview (content locked).'))}
            thumbnailUrl={thumb}
            teacherName={state.data?.teacher?.name || ''}
            price={state.data?.price || 0}
            isFree={Boolean(state.data?.isFree) || Number(state.data?.price || 0) <= 0}
            discountPercent={state.data?.discountPercent || 0}
            createdAt={state.data?.createdAt}
            updatedAt={state.data?.updatedAt}
            status={enrolled ? (courseIsFree ? 'free' : 'available') : 'locked'}
            primaryAction={{
              label: loggedIn
                ? (enrolled
                  ? (isRtl ? 'الدخول للكورس' : 'Enter course')
                  : (courseIsFree ? (isRtl ? 'لوحة التحكم' : 'Dashboard') : (isRtl ? 'الاشتراك والدفع' : 'Checkout')))
                : (isRtl ? 'تسجيل الدخول' : 'Login'),
              onClick: () => {
                if (!loggedIn) {
                  navigate('/login')
                  return
                }
                if (enrolled) {
                  navigate(enterCourseHref())
                  return
                }
                if (courseIsFree) {
                  navigate(enterCourseHref())
                  return
                }
                navigate(`/student/checkout/${courseId}`)
              }
            }}
            secondaryAction={{
              label: isRtl ? 'رجوع' : 'Back',
              onClick: () => navigate(-1)
            }}
          />
        ) : null}

        {stats ? (
          <div className="flex flex-wrap items-center gap-3 text-slate-700 dark:text-slate-200 text-sm">
            <div className="bg-[rgb(247,244,236)] dark:bg-[#202020] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full">
              {isRtl ? 'عدد المحاضرات:' : 'Lessons:'} {stats.lessonsCount || 0}
            </div>
            <div className="bg-[rgb(247,244,236)] dark:bg-[#202020] px-3 py-1 border border-black/5 dark:border-white/10 rounded-full">
              {isRtl ? 'عدد الفيديوهات:' : 'Videos:'} {stats.videoLessonsCount || 0}
            </div>
          </div>
        ) : null}

        {state.status === 'loading' ? (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Spinner />
            {isRtl ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : null}

        {state.status === 'error' ? <div className="text-slate-700 dark:text-slate-200 text-sm">{state.error}</div> : null}

        {state.status === 'success' ? (
          <>
            <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl">
              <div className="font-semibold text-slate-900 dark:text-white">
                {isRtl ? 'المحاضرات' : 'Lectures'}
              </div>
            </div>

            <div className="gap-4 grid">
              {units.length === 0 ? (
                <div className="py-10">
                  <div className={'flex items-center justify-center gap-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                    <img src={xIcon} alt="" className="w-9 h-9 shrink-0" />
                    <div className="font-medium text-[18px] text-center" style={{ color: '#E11D48' }}>
                      {isRtl ? 'سيتم اضافة المحتوى قريبًا' : 'Content will be added soon'}
                    </div>
                  </div>
                </div>
              ) : (
                units.map((u) => (
                  <div key={u.id} className="bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 rounded-3xl overflow-hidden">
                    <button
                      type="button"
                      className="relative bg-[#14B8A6] px-5 py-4 w-full text-white"
                      onClick={() => {
                        setExpandedUnitId((cur) => (cur === u.id ? '' : u.id))
                        setExpandedLessonId('')
                      }}
                    >
                      <div
                        className={
                          'absolute top-3 ' +
                          (isRtl ? 'right-3' : 'left-3') +
                          ' text-white'
                        }
                      >
                        <img src={lecIcon} alt="" className="w-10 h-10" />
                      </div>

                      <div className={isRtl ? 'text-right pr-12' : 'text-left pl-12'}>
                        <div className="font-extrabold text-[22px] truncate">{u.title}</div>
                      </div>
                    </button>

                    {expandedUnitId === u.id ? (
                      <div className="gap-2 grid p-5">
                        {(u.lessons || []).length === 0 ? (
                          <div className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'لا يوجد محاضرات داخل هذه الوحدة.' : 'No lectures in this unit.'}</div>
                        ) : (
                          (u.lessons || []).map((raw) => {
                            const l = normalizeLessonForAttachments(raw)
                            const free = Boolean(l?.isFree) || (courseIsFree && loggedIn)
                            const canOpen = enrolled || (loggedIn && free)
                            const hasAnyAttachments = Array.isArray(l?.contentSections) && l.contentSections.length
                            const isLessonOpen = expandedLessonId === l.id

                            return (
                              <div key={l.id} className="bg-black/10 dark:bg-white/[0.06] border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
                                <button
                                  type="button"
                                  className="bg-[#14B8A6] px-4 py-3 w-full text-white"
                                  onClick={() => setExpandedLessonId((cur) => (cur === l.id ? '' : l.id))}
                                >
                                  <div className={'flex items-center justify-between gap-3 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                                    <div className={'flex items-center gap-3 min-w-0 flex-1 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                                      <div className={'min-w-0 ' + (isRtl ? 'text-right' : 'text-left')}>
                                        <div className={'flex items-center gap-2 min-w-0 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                                          <span className="font-extrabold text-[20px] truncate">{l.title}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="opacity-90 text-xs shrink-0">
                                      {free ? (isRtl ? 'الكورس مجاني!' : 'Free') : isRtl ? 'الكورس مقفول' : 'Locked'}
                                    </div>
                                  </div>
                                </button>

                                {isLessonOpen ? (
                                  <div className="p-3">
                                    {hasAnyAttachments ? (
                                      <LessonAttachmentsList
                                        lesson={l}
                                        disabled={!canOpen}
                                        openSigned={(url) => openSigned(url)}
                                      />
                                    ) : (
                                      <div className="flex justify-center">
                                        <div className={'inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 text-lg ' + (isRtl ? 'flex-row text-right' : 'flex-row-reverse text-left')}>
                                          <img src={noAttachIcon} alt="" aria-hidden="true" className="w-7 h-7 object-contain" />
                                          <span>{isRtl ? 'سيتم اضافة المحتوى قريبا' : 'Content will be added soon'}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            )
                          })
                        )}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </div>
    </SiteLayout>
  )
}

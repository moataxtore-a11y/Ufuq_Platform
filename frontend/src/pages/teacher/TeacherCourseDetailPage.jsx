import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../utils/api.js'
import Select from '../../components/ui/Select.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.jsx'
import { uploadFile } from '../../utils/upload.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import CreateAssessmentModal from '../../components/assessments/CreateAssessmentModal.jsx'
import CoursePageHeader from '../../components/courses/CoursePageHeader.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import InlineMediaViewer from '../../components/preview/InlineMediaViewer.jsx'
import infoIcon from '../../cvg/i.svg'
import lecIcon from '../../cvg/lec.svg'
import fileIcon from '../../cvg/file.svg'
import vidIcon from '../../cvg/vid.svg'
import imgIcon from '../../cvg/img.svg'
import aPlusIcon from '../../cvg/a+.svg'
import homeworkIcon from '../../cvg/؟.svg'
import xIcon from '../../cvg/X.svg'
import noAttachIcon from '../../cvg/No attach.svg'

function isHttpUrl(u) {
  if (!u) return false
  try {
    const url = new URL(String(u))
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function LessonAttachmentsList({ isRtl, lesson, openSigned, openMedia, assessment, onOpenAssessment }) {
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
        className="bg-white dark:bg-neutral-900 p-3 border border-black/5 dark:border-white/[0.06] rounded-xl w-full text-left"
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
        <div dir="ltr" className="flex justify-between items-start sm:items-center gap-2">
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

              <div dir="rtl" className="flex flex-1 justify-end items-start gap-2 order-2 sm:order-1 min-w-0 text-right">
                {endSlotIconSrc ? (
                  <img src={endSlotIconSrc} alt="" className="w-6 sm:w-7 h-6 sm:h-7 shrink-0" />
                ) : null}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-slate-800 sm:text-[16px] dark:text-slate-100 break-words leading-snug whitespace-normal">
                    {title}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div dir="ltr" className="flex flex-1 justify-start items-start gap-2 order-2 sm:order-1 min-w-0 text-left">
                {endSlotIconSrc ? (
                  <img src={endSlotIconSrc} alt="" className="w-6 sm:w-7 h-6 sm:h-7 shrink-0" />
                ) : null}
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
                <div className="flex items-center gap-2 w-full text-sm leading-6">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={infoIcon} alt="" className="inline-block w-4 h-4 align-middle shrink-0" />
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 shrink-0">الوصف</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 shrink-0">:</span>
                    <span className="min-w-0 text-slate-700 dark:text-slate-200 break-words whitespace-pre-line">{desc}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full text-sm leading-6">
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
              v?.url ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-[#EAB308] hover:bg-[#EAB308]/90 dark:bg-[#EAB308] dark:hover:bg-[#EAB308]/90 px-3 sm:px-3 h-10 sm:h-10 text-slate-900 text-[10px] sm:text-xs w-full sm:w-auto"
                  onClick={() => openMedia?.({ kind: 'video', url: v.url, title: itemTitle(v, isRtl ? 'فيديو' : 'Video') })}
                >
                  {isRtl ? 'مشاهدة الفيديو' : 'Watch Video'}
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
              isHttpUrl(p?.url) ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-[#60A5FA] hover:bg-[#60A5FA]/90 dark:bg-[#60A5FA] dark:hover:bg-[#60A5FA]/90 px-2 sm:px-3 h-10 sm:h-10 text-white text-[10px] sm:text-xs w-full sm:w-auto"
                  onClick={() => {
                    openSigned?.(p.url, itemTitle(p, 'PDF'))
                  }}
                >
                  {isRtl ? 'فتح الملف' : 'Open File'}
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
              isHttpUrl(img?.url) ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-[#EAB308] hover:bg-[#EAB308]/90 dark:bg-[#EAB308] dark:hover:bg-[#EAB308]/90 px-2 sm:px-3 h-10 sm:h-10 text-slate-900 text-[10px] sm:text-xs w-full sm:w-auto"
                  onClick={() => openMedia?.({ kind: 'image', url: img.url, title: itemTitle(img, isRtl ? 'صورة' : 'Image') })}
                >
                  {isRtl ? 'عرض الصورة' : 'Show Image'}
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
              <Button
                type="button"
                variant="secondary"
                className={(assessment?.type === 'homework' ? 'bg-[#2DD4BF] dark:bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 dark:hover:bg-[#2DD4BF]/90 ' : 'bg-[#F43F5E] dark:bg-[#F43F5E] hover:bg-[#F43F5E]/90 dark:hover:bg-[#F43F5E]/90 ') + 'px-2 sm:px-3 h-7 sm:h-8 text-white text-[10px] sm:text-xs w-full sm:w-auto'}
                onClick={() => onOpenAssessment?.(assessment)}
              >
                {isRtl ? 'فتح' : 'Open'}
              </Button>
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

function EditLessonModal({ open, onOpenChange, lesson, onUpdated }) {
  const { notify } = useToast()
  const [title, setTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [imageUrlsRaw, setImageUrlsRaw] = useState('')
  const [attachments, setAttachments] = useState({ videos: [], pdfs: [], images: [] })
  const [isFree, setIsFree] = useState(false)
  const [showVideoDetails, setShowVideoDetails] = useState(false)
  const [showPdfDetails, setShowPdfDetails] = useState(false)
  const [showImagesDetails, setShowImagesDetails] = useState(false)
  const [videoDurationSec, setVideoDurationSec] = useState(null)
  const [videoDurationStatus, setVideoDurationStatus] = useState('')
  const [lessonAssessmentId, setLessonAssessmentId] = useState('')
  const [gateAssessmentId, setGateAssessmentId] = useState('')
  const [gateNextLessons, setGateNextLessons] = useState(false)
  const [assessments, setAssessments] = useState([])
  const [openCreateAssessment, setOpenCreateAssessment] = useState(false)
  const [loading, setLoading] = useState(false)

  function formatDuration(sec) {
    const s = Number(sec)
    if (!Number.isFinite(s) || s <= 0) return ''
    const mm = Math.floor(s / 60)
    const ss = Math.floor(s % 60)
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }

  function detectVideoProvider(u) {
    const str = String(u || '').trim().toLowerCase()
    if (!str) return ''
    if (str.includes('youtube.com') || str.includes('youtu.be')) return 'YouTube'
    if (str.endsWith('.mp4') || str.includes('.mp4?')) return 'Direct MP4'
    return 'Direct/Other'
  }

  async function loadAssessments(cid) {
    if (!cid) {
      setAssessments([])
      return
    }
    const res = await api.get(`/assessments/course/${cid}`)
    setAssessments(Array.isArray(res.data) ? res.data : [])
  }

  useEffect(() => {
    if (open && lesson) {
      setTitle(lesson.title || '')
      setVideoUrl(lesson.videoUrl || '')
      setPdfUrl(lesson.pdfUrl || '')
      setCoverUrl(lesson.coverImageUrl || '')
      setImageUrlsRaw(Array.isArray(lesson.imageUrls) ? lesson.imageUrls.join('\n') : '')
      {
        const list = Array.isArray(lesson?.contentSections) ? lesson.contentSections : []
        const out = { videos: [], pdfs: [], images: [] }
        for (const s of list) {
          if (s && s.enabled === false) continue
          if (Array.isArray(s?.videos)) out.videos.push(...s.videos)
          if (Array.isArray(s?.pdfs)) out.pdfs.push(...s.pdfs)
          if (Array.isArray(s?.images)) out.images.push(...s.images)
        }
        if (!out.videos.length && lesson.videoUrl) out.videos.push({ name: '', description: '', url: lesson.videoUrl })
        if (!out.pdfs.length && lesson.pdfUrl) out.pdfs.push({ name: '', description: '', url: lesson.pdfUrl })
        if (!out.images.length && Array.isArray(lesson.imageUrls) && lesson.imageUrls.length) {
          out.images.push(...lesson.imageUrls.map((u) => ({ name: '', description: '', url: u })))
        }
        setAttachments(out)
      }
      setIsFree(Boolean(lesson.isFree))
      setShowVideoDetails(false)
      setShowPdfDetails(false)
      setShowImagesDetails(false)
      setVideoDurationSec(null)
      setVideoDurationStatus('')
      setLessonAssessmentId(lesson.assessmentId ? String(lesson.assessmentId) : '')
      setGateAssessmentId(lesson.gateAssessmentId ? String(lesson.gateAssessmentId) : '')
      setGateNextLessons(Boolean(lesson.gateNextLessons))
      loadAssessments(lesson.courseId || '').catch(() => setAssessments([]))
    }
    if (open && !lesson) {
      setTitle('')
      setVideoUrl('')
      setPdfUrl('')
      setCoverUrl('')
      setImageUrlsRaw('')
      setAttachments({ videos: [], pdfs: [], images: [] })
      setIsFree(false)
      setShowVideoDetails(false)
      setShowPdfDetails(false)
      setShowImagesDetails(false)
      setVideoDurationSec(null)
      setVideoDurationStatus('')
      setLessonAssessmentId('')
      setGateAssessmentId('')
      setGateNextLessons(false)
      setAssessments([])
    }
  }, [open, lesson])

  useEffect(() => {
    const u = String(videoUrl || '').trim()
    const provider = detectVideoProvider(u)

    setVideoDurationSec(null)
    setVideoDurationStatus('')

    if (!u) return
    if (provider === 'YouTube') {
      setVideoDurationStatus('Duration not available for YouTube without API')
      return
    }

    let alive = true
    try {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.crossOrigin = 'anonymous'

      const cleanup = () => {
        v.src = ''
      }

      const onLoaded = () => {
        if (!alive) return
        const d = Number(v.duration)
        if (Number.isFinite(d) && d > 0) {
          setVideoDurationSec(d)
          setVideoDurationStatus('')
        } else {
          setVideoDurationStatus('Duration not available')
        }
        v.removeEventListener('loadedmetadata', onLoaded)
        v.removeEventListener('error', onError)
        cleanup()
      }

      const onError = () => {
        if (!alive) return
        setVideoDurationStatus('Duration not available (blocked or invalid link)')
        v.removeEventListener('loadedmetadata', onLoaded)
        v.removeEventListener('error', onError)
        cleanup()
      }

      v.addEventListener('loadedmetadata', onLoaded)
      v.addEventListener('error', onError)
      v.src = u
    } catch {
      setVideoDurationStatus('Duration not available')
    }

    return () => {
      alive = false
    }
  }, [videoUrl])

  async function submit(e) {
    e.preventDefault()
    if (!lesson?._id) return
    try {
      setLoading(true)
      const imageUrls = String(imageUrlsRaw || '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)

      const videos = Array.isArray(attachments?.videos) ? attachments.videos : []
      const pdfs = Array.isArray(attachments?.pdfs) ? attachments.pdfs : []
      const images = Array.isArray(attachments?.images) ? attachments.images : []

      const normItem = (x) => {
        const url = String(x?.url || '').trim()
        if (!url) return null
        const name = String(x?.name || '').trim()
        const description = String(x?.description || '').trim()
        const out = { url }
        if (name) out.name = name
        if (description) out.description = description
        if (x?.durationSec != null) out.durationSec = x.durationSec
        return out
      }

      const videoItems = videos.map(normItem).filter(Boolean)
      const pdfItems = pdfs.map(normItem).filter(Boolean)
      const imageItems = images.map(normItem).filter(Boolean)

      const contentSections = [
        { key: 'explanation', enabled: true, videos: videoItems, pdfs: pdfItems, images: imageItems },
        { key: 'homework', enabled: true, videos: [], pdfs: [], images: [] },
        { key: 'exams', enabled: true, videos: [], pdfs: [], images: [] }
      ]

      const legacyVideoUrl = videoItems[0]?.url || ''
      const legacyPdfUrl = pdfItems[0]?.url || ''
      const legacyImages = imageItems.map((x) => x.url)

      await api.patch(`/courses/lessons/${lesson._id}`, {
        title,
        isFree,
        videoUrl: legacyVideoUrl || videoUrl,
        pdfUrl: legacyPdfUrl || pdfUrl,
        coverImageUrl: coverUrl,
        imageUrls: legacyImages.length ? legacyImages : imageUrls,
        contentSections,
        assessmentId: lessonAssessmentId,
        gateAssessmentId,
        gateNextLessons
      })
      notify({ title: 'تم تحديث المحاضرة' })
      await onUpdated()
    } catch (e2) {
      notify({ title: 'فشل التحديث', description: e2?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function updateAttachment(kind, idx, patch) {
    setAttachments((cur) => {
      const list = Array.isArray(cur?.[kind]) ? cur[kind] : []
      const next = list.map((it, i) => (i === idx ? { ...it, ...patch } : it))
      return { ...cur, [kind]: next }
    })
  }

  function removeAttachment(kind, idx) {
    setAttachments((cur) => {
      const list = Array.isArray(cur?.[kind]) ? cur[kind] : []
      const next = list.filter((_, i) => i !== idx)
      return { ...cur, [kind]: next }
    })
  }

  async function uploadAttachmentFile(kind, idx, file) {
    if (!file) return
    try {
      setLoading(true)
      const label = kind === 'videos' ? 'Uploading video...' : kind === 'pdfs' ? 'Uploading PDF...' : 'Uploading image...'
      const up = await uploadFile(file, '/uploads', { onProgress: onProgress(label) })
      updateAttachment(kind, idx, { url: up?.url || '', fileName: file?.name || '' })
    } catch (e) {
      notify({ title: 'فشل رفع الملف', description: e?.response?.data?.message || e?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function addAttachment(kind) {
    setAttachments((cur) => {
      const list = Array.isArray(cur?.[kind]) ? cur[kind] : []
      return { ...cur, [kind]: [...list, { name: '', description: '', url: '' }] }
    })
  }

  function AttachmentEditor({ kind, label, accept }) {
    const list = Array.isArray(attachments?.[kind]) ? attachments[kind] : []
    return (
      <div className="gap-2 grid">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-slate-700 text-sm">{label}</div>
          <Button type="button" variant="outline" className="px-3 h-8 text-xs" onClick={() => addAttachment(kind)} disabled={loading}>
            إضافة
          </Button>
        </div>

        {list.length ? (
          <div className="gap-2 grid">
            {list.map((it, idx) => (
              <div key={kind + '-' + idx} className="gap-2 grid p-3 border border-black/5 rounded-xl">
                <input
                  type="file"
                  accept={accept}
                  className="hidden"
                  id={`edit-${kind}-${idx}-file`}
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    uploadAttachmentFile(kind, idx, f)
                    if (e.target) e.target.value = ''
                  }}
                  disabled={loading}
                />
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 text-slate-600 text-xs">
                    {kind === 'images' ? <img src={imgIcon} alt="" className="w-5 h-5 shrink-0" /> : null}
                    <span>{label} #{idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-3 h-8 text-xs"
                      onClick={() => {
                        const el = document.getElementById(`edit-${kind}-${idx}-file`)
                        if (el && typeof el.click === 'function') el.click()
                      }}
                      disabled={loading}
                    >
                      اختر ملف
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="px-3 h-8 text-xs"
                      onClick={() => removeAttachment(kind, idx)}
                      disabled={loading}
                    >
                      حذف
                    </Button>
                  </div>
                </div>

                {it?.fileName ? (
                  <div className="text-slate-500 text-xs truncate">{it.fileName}</div>
                ) : null}

                <div className="gap-1 grid">
                  <label className="text-slate-600 text-sm">الاسم</label>
                  <Input
                    value={it?.name || ''}
                    onChange={(e) => updateAttachment(kind, idx, { name: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="gap-1 grid">
                  <label className="text-slate-600 text-sm">الرابط</label>
                  <Input
                    value={it?.url || ''}
                    onChange={(e) => updateAttachment(kind, idx, { url: e.target.value })}
                    placeholder="https://..."
                    disabled={loading}
                  />
                </div>

                <div className="gap-1 grid">
                  <label className="text-slate-600 text-sm">الوصف</label>
                  <textarea
                    value={it?.description || ''}
                    onChange={(e) => updateAttachment(kind, idx, { description: e.target.value })}
                    className="px-3 py-2 border border-black/5 rounded-lg w-full min-h-[90px] text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-600 text-sm">لا يوجد</div>
        )}
      </div>
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="تعديل المحاضرة">
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">العنوان</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <label className="flex flex-row-reverse justify-between items-center gap-3 text-slate-700 text-sm">
          <span>محاضرة مجانية (تظهر في المعاينة وتكون متاحة للجميع)</span>
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} disabled={loading} />
        </label>
        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">رابط الفيديو (قديم)</label>
          <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
          <div className="flex justify-end">
            <Button type="button" variant="outline" className="px-3 h-8 text-xs" onClick={() => setShowVideoDetails((v) => !v)}>
              تفاصيل
            </Button>
          </div>
          {showVideoDetails ? (
            <div className="bg-[#D2EBE1] p-3 border border-black/5 rounded-xl text-slate-700 text-sm">
              <div className="font-semibold text-slate-800 text-xs">تفاصيل الفيديو</div>
              <div className="mt-1 text-xs"><span className="font-medium">المصدر:</span> {detectVideoProvider(videoUrl) || '—'}</div>
              <div className="mt-1 text-xs break-all"><span className="font-medium">الرابط:</span> {String(videoUrl || '').trim() || '—'}</div>
              <div className="mt-1 text-xs">
                <span className="font-medium">المدة:</span>{' '}
                {videoDurationSec ? formatDuration(videoDurationSec) : (videoDurationStatus || '—')}
              </div>
            </div>
          ) : null}
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">رابط PDF (قديم)</label>
          <Input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://..." />
          <div className="flex justify-end">
            <Button type="button" variant="outline" className="px-3 h-8 text-xs" onClick={() => setShowPdfDetails((v) => !v)}>
              تفاصيل
            </Button>
          </div>
          {showPdfDetails ? (
            <div className="bg-[#D2EBE1] p-3 border border-black/5 rounded-xl text-slate-700 text-sm">
              <div className="font-semibold text-slate-800 text-xs">تفاصيل PDF</div>
              <div className="mt-1 text-xs break-all"><span className="font-medium">الرابط:</span> {String(pdfUrl || '').trim() || '—'}</div>
              <div className="mt-1 text-xs"><span className="font-medium">الملف المحدد:</span> —</div>
            </div>
          ) : null}
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">رابط الغلاف</label>
          <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">روابط الصور (قديم) (كل رابط في سطر)</label>
          <textarea
            value={imageUrlsRaw}
            onChange={(e) => setImageUrlsRaw(e.target.value)}
            className="px-3 py-2 border border-black/5 rounded-lg w-full min-h-[120px] text-sm"
          />
          <div className="flex justify-end">
            <Button type="button" variant="outline" className="px-3 h-8 text-xs" onClick={() => setShowImagesDetails((v) => !v)}>
              تفاصيل
            </Button>
          </div>
          {showImagesDetails ? (
            <div className="bg-[#D2EBE1] p-3 border border-black/5 rounded-xl text-slate-700 text-sm">
              <div className="font-semibold text-slate-800 text-xs">تفاصيل الصور</div>
              <div className="mt-1 text-xs"><span className="font-medium">العدد:</span> {String(imageUrlsRaw || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean).length}</div>
            </div>
          ) : null}
        </div>

        <div className="pt-3 border-black/5 border-t">
          <div className="font-bold text-slate-800 text-sm">المرفقات</div>
          <div className="gap-4 grid mt-2">
            <AttachmentEditor kind="videos" label="فيديو" accept="video/*" />
            <AttachmentEditor kind="pdfs" label="PDF" accept="application/pdf" />
            <AttachmentEditor kind="images" label="صور" accept="image/*" />
          </div>
        </div>

        <div className="gap-2 grid pt-3 border-black/5 border-t">
          <div className="font-bold text-slate-800 text-sm">اختبار داخل المحاضرة</div>
          <div className="gap-1 grid">
            <label className="text-slate-600 text-sm">اختر اختبار</label>
            <div className="flex items-center gap-2">
              <Select
                value={lessonAssessmentId}
                onChange={(val) => setLessonAssessmentId(val)}
                options={[{ value: '', label: 'بدون' }, ...assessments.map((a) => ({ value: a._id, label: a.title }))]}
                placeholder="بدون"
                disabled={loading}
                isRtl={true}
                className="flex-1"
              />
              <Button type="button" variant="outline" className="px-3 h-10 text-sm" onClick={() => setOpenCreateAssessment(true)} disabled={loading}>
                إنشاء
              </Button>
              {lessonAssessmentId ? (
                <Button type="button" variant="destructive" className="px-3 h-10 text-sm" onClick={() => setLessonAssessmentId('')} disabled={loading}>
                  إزالة
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">امتحان شرط (اختياري)</label>
          <Select
            value={gateAssessmentId}
            onChange={(val) => setGateAssessmentId(val)}
            options={[{ value: '', label: 'بدون' }, ...assessments.map((a) => ({ value: a._id, label: a.title }))]}
            placeholder="بدون"
            disabled={loading}
            isRtl={true}
          />
        </div>

        <label className="flex flex-row-reverse justify-between items-center gap-3 text-slate-700 text-sm">
          <span>يقفل المحاضرات اللي بعده داخل نفس الوحدة لحد ما الطالب ينجح (50%)</span>
          <input
            type="checkbox"
            checked={gateNextLessons}
            onChange={(e) => setGateNextLessons(e.target.checked)}
            disabled={loading || !gateAssessmentId}
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? 'جارٍ الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </form>

      <CreateAssessmentModal
        open={openCreateAssessment}
        onOpenChange={setOpenCreateAssessment}
        courseId={lesson?.courseId || ''}
        hideCoursePicker
        lessonId={lesson?._id || ''}
        allowLessonLinking
        allowGateOptions={false}
        onCreated={async (assessment) => {
          try {
            const assessmentId = assessment?._id
            if (!assessmentId) return
            await loadAssessments(lesson?.courseId || '')
            setLessonAssessmentId(String(assessmentId))
            if (lesson?._id) {
              await api.patch(`/courses/lessons/${lesson._id}`, {
                assessmentId: String(assessmentId)
              })
              await onUpdated()
            }
          } catch (e3) {
            notify({ title: 'فشل ربط الاختبار بالمحاضرة', description: e3?.response?.data?.message || 'Error', variant: 'destructive' })
          }
        }}
      />
    </Modal>
  )
}

function isDirectVideoUrl(u) {
  if (!isHttpUrl(u)) return false
  const s = String(u).toLowerCase()
  return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg')
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

async function getImageDimensions(file) {
  if (!file || !file.type || !String(file.type).startsWith('image/')) return { width: 0, height: 0 }
  const bitmap = await createImageBitmap(file)
  return { width: bitmap.width || 0, height: bitmap.height || 0 }
}

export default function TeacherCourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { auth } = useAuth()

  const [course, setCourse] = useState(null)
  const [courseSection, setCourseSection] = useState('')
  const [courseGradeYear, setCourseGradeYear] = useState('')
  const [courseIsFree, setCourseIsFree] = useState(false)
  const [coursePrice, setCoursePrice] = useState('')
  const [courseDiscountPercent, setCourseDiscountPercent] = useState('')
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [savingCourseInfo, setSavingCourseInfo] = useState(false)
  const [units, setUnits] = useState([])
  const [activeUnitId, setActiveUnitId] = useState('')
  const [lessonsByUnitId, setLessonsByUnitId] = useState({})
  const [activeLessonId, setActiveLessonId] = useState('')
  const [expandedLessonIds, setExpandedLessonIds] = useState(() => new Set())
  const [showAttachmentsLessonId, setShowAttachmentsLessonId] = useState('')
  const [expandedUnitIds, setExpandedUnitIds] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [assessmentsByLessonId, setAssessmentsByLessonId] = useState({})

  const attachmentsUnit = useMemo(() => {
    return (Array.isArray(units) ? units : []).find((u) => {
      const t = String(u?.title || '').trim()
      return t === 'جزء المرفقات' || t === 'Attachments'
    })
  }, [units])

  const visibleUnits = useMemo(() => {
    return (Array.isArray(units) ? units : []).filter((u) => {
      const t = String(u?.title || '').trim()
      return !(t === 'جزء المرفقات' || t === 'Attachments')
    })
  }, [units])
  const [courseAssessments, setCourseAssessments] = useState([])

  const [stats, setStats] = useState(null)

  const [pinningCourse, setPinningCourse] = useState(false)

  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    function update() {
      try {
        setIsSmallScreen(window.matchMedia('(max-width: 640px)').matches)
      } catch {
        setIsSmallScreen(false)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const [selectedMedia, setSelectedMedia] = useState(null)

  async function openSigned(fileUrl, title) {
    const u = String(fileUrl || '')
    if (!u) return
    try {
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
    setSelectedMedia({ kind: String(kind || ''), url: u, title: title || '' })
  }
  const [updatingThumb, setUpdatingThumb] = useState(false)
  const [thumbPct, setThumbPct] = useState(0)

  const thumbInputRef = useRef(null)

  const [openUnit, setOpenUnit] = useState(false)
  const [openEditUnit, setOpenEditUnit] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  const [openLesson, setOpenLesson] = useState(false)
  const [openQuiz, setOpenQuiz] = useState(false)
  const [quickAddLessonLoading, setQuickAddLessonLoading] = useState(false)
  const [openEnroll, setOpenEnroll] = useState(false)
  const [openEditLesson, setOpenEditLesson] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)

  const [confirmState, setConfirmState] = useState({ open: false, kind: '', id: '', loading: false })

  async function deleteAllLessonsInUnitAction(unitId) {
    if (!unitId) return
    setConfirmState({ open: true, kind: 'unit_lessons', id: String(unitId), loading: false })
  }

  async function deleteUnitAction(unitId) {
    if (!unitId) return
    setConfirmState({ open: true, kind: 'unit', id: String(unitId), loading: false })
  }

  async function loadCourse() {
    const res = await api.get(`/courses/${courseId}`)
    setCourse(res.data)
  }

  async function togglePinnedCourse() {
    if (!courseId) return
    if (!canManageCourses) return
    try {
      setPinningCourse(true)
      const pinned = Boolean(course?.pinnedAt)
      if (pinned) {
        const res = await api.patch(`/courses/${courseId}/unpin`)
        setCourse((c) => ({ ...(c || {}), pinnedAt: null }))
        notify({ title: isRtl ? 'تم إلغاء التثبيت' : 'Unpinned', description: res?.data?.message || '' })
      } else {
        const res = await api.patch(`/courses/${courseId}/pin`)
        const nextPinnedAt = res?.data?.pinnedAt || new Date().toISOString()
        setCourse((c) => ({ ...(c || {}), pinnedAt: nextPinnedAt }))
        notify({ title: isRtl ? 'تم التثبيت' : 'Pinned', description: res?.data?.message || '' })
      }
    } catch (e) {
      notify({
        title: isRtl ? 'فشل تحديث التثبيت' : 'Failed to update pin',
        description: e?.response?.data?.message || e?.message || 'Error',
        variant: 'destructive'
      })
    } finally {
      setPinningCourse(false)
    }
  }

  async function loadCourseAssessments() {
    if (!courseId) {
      setCourseAssessments([])
      return
    }
    const res = await api.get(`/assessments/course/${courseId}`)
    setCourseAssessments(Array.isArray(res.data) ? res.data : [])
  }

  async function loadUnits() {
    const res = await api.get(`/courses/${courseId}/units`)
    setUnits(res.data)
    if (!activeUnitId && res.data?.[0]?._id) setActiveUnitId(res.data[0]._id)
  }

  async function openAddLessonFlow() {
    try {
      if (!courseId) return
      if (quickAddLessonLoading) return
      setQuickAddLessonLoading(true)

      if (activeUnitId) {
        setOpenLesson(true)
        return
      }

      const preferredUnit = (Array.isArray(units) ? units : []).find((u) => {
        const t = String(u?.title || '').trim()
        return t === 'جزء المرفقات' || t === 'Attachments'
      })

      if ((preferredUnit || units?.[0])?._id) {
        setActiveUnitId((preferredUnit || units[0])._id)
        setOpenLesson(true)
        return
      }

      const defaultUnitTitle = isRtl ? 'جزء المرفقات' : 'Attachments'
      await api.post(`/courses/${courseId}/units`, { title: defaultUnitTitle, description: '' })
      await loadUnits()
      setOpenLesson(true)
    } catch (e) {
      notify({ title: isRtl ? 'فشل إضافة المحاضرة' : 'Failed to add lesson', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setQuickAddLessonLoading(false)
    }
  }

  async function loadLessons(unitId) {
    if (!unitId) return
    const res = await api.get(`/courses/units/${unitId}/lessons`)
    setLessonsByUnitId((cur) => ({ ...(cur || {}), [String(unitId)]: Array.isArray(res.data) ? res.data : [] }))
    setAssessmentsByLessonId({})
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

  function ensureUnitLessonsLoaded(unitId) {
    const id = String(unitId || '')
    if (!id) return
    if (Object.prototype.hasOwnProperty.call(lessonsByUnitId || {}, id)) return
    loadLessons(id).catch(() => { })
  }

  async function refresh() {
    try {
      setLoading(true)
      await Promise.all([loadCourse(), loadUnits(), loadStats(), loadCourseAssessments()])
    } catch (e) {
      notify({ title: 'Failed to load course', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const res = await api.get(`/courses/${courseId}/stats`)
      setStats(res.data)
    } catch {
      setStats(null)
    }
  }

  async function updateThumbnail(file) {
    if (!file) return
    try {
      setUpdatingThumb(true)
      setThumbPct(0)

      const up = await uploadFile(file, '/uploads', {
        maxSide: 1920,
        onProgress: (evt) => {
          const total = evt && evt.total ? evt.total : 0
          const loaded = evt && evt.loaded ? evt.loaded : 0
          if (!total) return
          const pct = Math.min(100, Math.max(0, Math.round((loaded / total) * 100)))
          setThumbPct(pct)
        }
      })

      await api.patch(`/courses/${courseId}/thumbnail`, { thumbnailUrl: up.url })
      notify({ title: 'Thumbnail updated' })
      await loadCourse()
    } catch (e) {
      notify({ title: 'Update failed', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setUpdatingThumb(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  useEffect(() => {
    setCourseSection(typeof course?.section === 'string' ? course.section : '')
    setCourseGradeYear(typeof course?.gradeYear === 'string' ? course.gradeYear : '')
    const free = Boolean(course?.isFree) || Number(course?.price || 0) <= 0
    setCourseIsFree(free)
    setCoursePrice(free ? '' : String(course?.price ?? ''))
    setCourseDiscountPercent(String(course?.discountPercent ?? ''))
    setShowEditPanel(false)
  }, [course?._id])

  function resetEditPanelFieldsFromCourse() {
    setCourseSection(typeof course?.section === 'string' ? course.section : '')
    setCourseGradeYear(typeof course?.gradeYear === 'string' ? course.gradeYear : '')
    const free = Boolean(course?.isFree) || Number(course?.price || 0) <= 0
    setCourseIsFree(free)
    setCoursePrice(free ? '' : String(course?.price ?? ''))
    setCourseDiscountPercent(String(course?.discountPercent ?? ''))
  }

  const lang = typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'ar' : 'en'
  const isRtl = lang === 'ar'

  const sectionOptions = [
    { value: '', label: isRtl ? 'كل الشعب' : 'All sections' },
    { value: 'science', label: isRtl ? 'علمي علوم' : 'Science (Biology)' },
    { value: 'math', label: isRtl ? 'علمي رياضة' : 'Science (Math)' },
    { value: 'literature', label: isRtl ? 'أدبي' : 'Literature' }
  ]

  const gradeYearOptions = [
    { value: '', label: isRtl ? 'كل السنوات' : 'All years' },
    { value: '1_secondary', label: isRtl ? 'الصف الأول الثانوي' : '1st Secondary' },
    { value: '2_secondary', label: isRtl ? 'الصف الثاني الثانوي' : '2nd Secondary' },
    { value: '3_secondary', label: isRtl ? 'الصف الثالث الثانوي' : '3rd Secondary' }
  ]

  const priceNumber = useMemo(() => {
    if (courseIsFree) return 0
    const p = coursePrice === '' ? NaN : Number(coursePrice)
    return Number.isFinite(p) && p >= 0 ? p : NaN
  }, [courseIsFree, coursePrice])

  const discountNumber = useMemo(() => {
    if (courseIsFree) return 0
    if (courseDiscountPercent === '' || courseDiscountPercent === null || courseDiscountPercent === undefined) return 0
    const d = Number(courseDiscountPercent)
    return Number.isFinite(d) ? d : NaN
  }, [courseIsFree, courseDiscountPercent])

  const discountedPrice = useMemo(() => {
    if (courseIsFree) return 0
    if (!Number.isFinite(priceNumber)) return NaN
    if (!Number.isFinite(discountNumber)) return NaN
    const d = Math.min(100, Math.max(0, discountNumber))
    const out = priceNumber * (1 - d / 100)
    return Math.round(out * 100) / 100
  }, [courseIsFree, priceNumber, discountNumber])

  async function saveCourseInfo() {
    if (!courseId) return
    try {
      setSavingCourseInfo(true)
      const p = courseIsFree ? 0 : (coursePrice === '' ? NaN : Number(coursePrice))
      if (!courseIsFree && (!Number.isFinite(p) || p < 0)) {
        notify({ title: 'Update failed', description: 'price must be a non-negative number', variant: 'destructive' })
        setSavingCourseInfo(false)
        return
      }

      const dpRaw = courseIsFree ? 0 : (courseDiscountPercent === '' ? 0 : Number(courseDiscountPercent))
      if (!Number.isFinite(dpRaw) || dpRaw < 0 || dpRaw > 100) {
        notify({ title: 'Update failed', description: 'discountPercent must be between 0 and 100', variant: 'destructive' })
        setSavingCourseInfo(false)
        return
      }

      await api.patch(`/courses/${courseId}`, {
        section: courseSection,
        gradeYear: courseGradeYear,
        isFree: courseIsFree,
        price: courseIsFree ? 0 : p,
        discountPercent: courseIsFree ? 0 : dpRaw
      })
      notify({ title: 'Course updated' })
      await refresh()
    } catch (e) {
      notify({ title: 'Update failed', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setSavingCourseInfo(false)
    }
  }

  useEffect(() => {
    loadLessons(activeUnitId).catch(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUnitId])

  const activeUnit = useMemo(() => units.find((u) => u._id === activeUnitId) || null, [units, activeUnitId])

  const perms = auth?.role === 'team' ? (auth?.teamPermissions || []) : null
  const canManageCourses = auth?.role !== 'team' || perms.includes('courses')
  const canManageStudents = auth?.role !== 'team' || perms.includes('students')
  const staffBase = auth?.role === 'team' ? '/team' : '/teacher'

  async function deleteCourseAction() {
    if (!courseId) return
    setConfirmState({ open: true, kind: 'course', id: String(courseId), loading: false })
    return
  }

  async function runConfirmedDelete() {
    const { kind, id } = confirmState
    if (!kind || !id) return
    try {
      setConfirmState((s) => ({ ...s, loading: true }))
      if (kind === 'course') {
        await api.delete(`/courses/${id}`)
        notify({ title: 'Course deleted' })
        setConfirmState({ open: false, kind: '', id: '', loading: false })
        navigate(staffBase)
        return
      }
      if (kind === 'lesson') {
        await api.delete(`/courses/lessons/${id}`)
        notify({ title: 'Lesson deleted' })
        setConfirmState({ open: false, kind: '', id: '', loading: false })
        refresh().catch(() => { })
        return
      }

      if (kind === 'unit') {
        await api.delete(`/courses/units/${id}`)
        notify({ title: isRtl ? 'تم حذف الوحدة' : 'Unit deleted' })
        setConfirmState({ open: false, kind: '', id: '', loading: false })
        setExpandedUnitIds(new Set())
        setActiveLessonId('')
        setExpandedLessonIds(new Set())
        await loadUnits()
        loadStats().catch(() => { })
        return
      }

      if (kind === 'unit_lessons') {
        const unitId = String(id)
        const unitLessons = (lessonsByUnitId || {})[unitId] || []
        await Promise.all((Array.isArray(unitLessons) ? unitLessons : []).map((l) => api.delete(`/courses/lessons/${l._id}`)))
        notify({ title: isRtl ? 'تم حذف كل المحاضرات' : 'All lessons deleted' })
        setConfirmState({ open: false, kind: '', id: '', loading: false })
        setActiveLessonId('')
        setExpandedLessonIds(new Set())
        await loadLessons(unitId)
        loadStats().catch(() => { })
        return
      }

      setConfirmState({ open: false, kind: '', id: '', loading: false })
    } catch (e) {
      notify({ title: 'Delete failed', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
      setConfirmState((s) => ({ ...s, loading: false }))
    }
  }

  async function deleteLessonAction(lessonId) {
    if (!lessonId) return
    setConfirmState({ open: true, kind: 'lesson', id: String(lessonId), loading: false })
    return
  }

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
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(v) => setConfirmState((s) => ({ ...s, open: v }))}
        title={
          confirmState.kind === 'course'
            ? (isRtl ? 'حذف الكورس' : 'Delete course')
            : confirmState.kind === 'unit'
              ? (isRtl ? 'حذف الوحدة' : 'Delete unit')
              : confirmState.kind === 'unit_lessons'
                ? (isRtl ? 'حذف كل المحاضرات' : 'Delete all lessons')
                : (isRtl ? 'حذف المحاضرة' : 'Delete lesson')
        }
        description={
          confirmState.kind === 'course'
            ? (isRtl ? 'هل أنت متأكد إنك عايز تحذف الكورس؟' : 'Delete this course?')
            : confirmState.kind === 'unit'
              ? (isRtl ? 'هل أنت متأكد إنك عايز تحذف الوحدة بكل محتواها؟' : 'Delete this unit and all its lessons?')
              : confirmState.kind === 'unit_lessons'
                ? (isRtl ? 'هل أنت متأكد إنك عايز تحذف كل المحاضرات في هذا الجزء؟' : 'Delete all lessons in this section?')
                : (isRtl ? 'هل أنت متأكد إنك عايز تحذف المحاضرة؟' : 'Delete this lesson?')
        }
        confirmLabel={isRtl ? 'حذف' : 'Delete'}
        cancelLabel={isRtl ? 'إلغاء' : 'Cancel'}
        loading={confirmState.loading}
        onConfirm={() => runConfirmedDelete()}
      />
      {!selectedMedia?.url ? (
        <CoursePageHeader
          dir={isRtl ? 'rtl' : 'ltr'}
          title={course?.title || (isRtl ? 'الكورس' : 'Course')}
          description={course?.description || ''}
          thumbnailUrl={course?.thumbnailUrl || ''}
          teacherName={auth?.name || ''}
          price={course?.price || 0}
          isFree={Boolean(course?.isFree) || Number(course?.price || 0) <= 0}
          discountPercent={course?.discountPercent || 0}
          createdAt={course?.createdAt}
          updatedAt={course?.updatedAt}
          status="available"
          primaryAction={canManageCourses ? {
            label: isRtl ? 'تعديل الصورة' : 'Change image',
            onClick: () => thumbInputRef.current?.click(),
            disabled: updatingThumb
          } : undefined}
        />
      ) : null}

      {selectedMedia?.url ? (
        <InlineMediaViewer
          media={selectedMedia}
          isRtl={isRtl}
          onClose={() => setSelectedMedia(null)}
        />
      ) : null}

      <div className="flex md:flex-row flex-col md:justify-end md:items-start gap-2">
        <div className="flex flex-wrap gap-2">
          {canManageCourses ? (
            <Button
              variant={course?.pinnedAt ? 'secondary' : 'outline'}
              onClick={togglePinnedCourse}
              disabled={pinningCourse}
            >
              {course?.pinnedAt ? (isRtl ? 'إلغاء تثبيت' : 'Unpin') : (isRtl ? 'تثبيت الكورس' : 'Pin course')}
            </Button>
          ) : null}
          {canManageStudents ? (
            <Button variant="secondary" onClick={() => setOpenEnroll(true)}>{isRtl ? 'تسجيل طالب' : 'Enroll student'}</Button>
          ) : null}
          {canManageCourses ? (
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditPanel((cur) => {
                  const next = !cur
                  if (next) resetEditPanelFieldsFromCourse()
                  return next
                })
              }}
            >
              {showEditPanel ? (isRtl ? 'إخفاء التعديل' : 'Hide edit') : (isRtl ? 'تعديل بيانات الكورس' : 'Edit course')}
            </Button>
          ) : null}
          {canManageCourses ? (
            <Button variant="secondary" onClick={() => setOpenQuiz(true)} disabled={!courseId}>
              {isRtl ? 'اختبار' : 'Quiz'}
            </Button>
          ) : null}
          {canManageCourses ? <Button onClick={() => setOpenUnit(true)}>{isRtl ? 'إضافة وحدة' : 'Add unit'}</Button> : null}
          {canManageCourses ? (
            <Button variant="outline" onClick={openAddLessonFlow} disabled={quickAddLessonLoading || !courseId}>
              {isRtl ? 'إضافة محاضرة' : 'Add lesson'}
            </Button>
          ) : null}
          {canManageCourses ? (
            <Button variant="destructive" onClick={deleteCourseAction}>
              {isRtl ? 'حذف الكورس' : 'Delete course'}
            </Button>
          ) : null}
        </div>
      </div>

      {showEditPanel ? (
        <div className="items-start gap-4 grid grid-cols-1 md:grid-cols-2">
          <div className="border border-black/5 dark:border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-neutral-900 aspect-video">
              {course?.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="flex justify-center items-center w-full h-full text-slate-500 dark:text-slate-300 text-sm">
                  {isRtl ? 'لا يوجد صورة' : 'No thumbnail'}
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-50 dark:bg-neutral-900 px-4 py-3 border-black/5 dark:border-white/[0.06] border-t">
              <div className="flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-200 text-sm">
                <div className="bg-white dark:bg-neutral-800 px-3 py-1 border border-black/5 dark:border-white/[0.06] rounded-full">
                  {(isRtl ? 'المحاضرات: ' : 'Lessons: ') + (stats?.lessonsCount ?? 0)}
                </div>
                <div className="bg-white dark:bg-neutral-800 px-3 py-1 border border-black/5 dark:border-white/[0.06] rounded-full">
                  {(isRtl ? 'الفيديوهات: ' : 'Videos: ') + (stats?.videoLessonsCount ?? 0)}
                </div>
              </div>

              {canManageCourses ? (
                <>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => updateThumbnail(e.target.files?.[0] || null)}
                  />
                  <Button type="button" variant="secondary" onClick={() => thumbInputRef.current?.click()} disabled={updatingThumb}>
                    {course?.thumbnailUrl
                      ? (updatingThumb ? (isRtl ? 'جاري التحديث...' : 'Updating...') : (isRtl ? 'تغيير الصورة' : 'Change image'))
                      : (updatingThumb ? (isRtl ? 'جاري الرفع...' : 'Uploading...') : (isRtl ? 'رفع صورة' : 'Upload image'))}
                  </Button>
                </>
              ) : null}
            </div>

            {updatingThumb ? (
              <div className="px-4 pb-4">
                <div className="bg-slate-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#14B8A6] h-2" style={{ width: `${thumbPct}%` }} />
                </div>
                <div className="mt-1 text-slate-500 dark:text-slate-300 text-xs">{thumbPct}%</div>
              </div>
            ) : null}
          </div>

          <div className="p-4 border border-black/5 dark:border-white/[0.06] rounded-2xl">
            <div className="font-semibold text-slate-900 dark:text-slate-100 text-base">{course?.title || (isRtl ? 'الكورس' : 'Course')}</div>
            <div className="mt-1 text-slate-700 dark:text-slate-200 text-sm break-words leading-6 whitespace-pre-line">
              {course?.description || (isRtl ? 'لا يوجد وصف' : 'No description')}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-slate-600 dark:text-slate-300 text-xs">
              <div>{(isRtl ? 'تاريخ الإنشاء: ' : 'Created: ') + (formatDateTime(course?.createdAt) || '-')}</div>
              <div>{(isRtl ? 'آخر تحديث: ' : 'Updated: ') + (formatDateTime(course?.updatedAt) || '-')}</div>
            </div>

            {canManageCourses ? (
              <div className="gap-3 grid mt-4">
                <div className="gap-2 grid">
                  <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'نوع الكورس' : 'Course type'}</label>
                  <div className={'w-full max-w-md rounded-2xl border border-black/5 dark:border-white/[0.06] bg-white dark:bg-neutral-900 p-1 ' + (isRtl ? 'mr-auto' : 'ml-auto')}>
                    <div className="gap-1 grid grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCourseIsFree(true)
                          setCoursePrice('')
                          setCourseDiscountPercent('0')
                        }}
                        disabled={savingCourseInfo}
                        className={
                          'rounded-xl px-4 py-3 text-sm font-bold transition ' +
                          (courseIsFree
                            ? 'bg-[#FDE7B3] text-neutral-950'
                            : 'bg-transparent text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-neutral-800') +
                          (savingCourseInfo ? ' opacity-60 cursor-not-allowed' : ' cursor-pointer')
                        }
                      >
                        {isRtl ? 'كورس مجاني!' : 'Free Course'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCourseIsFree(false)
                          if (!coursePrice) setCoursePrice(String(course?.price ?? ''))
                        }}
                        disabled={savingCourseInfo}
                        className={
                          'rounded-xl px-4 py-3 text-sm font-bold transition ' +
                          (!courseIsFree
                            ? 'bg-[#FDE7B3] text-neutral-950'
                            : 'bg-transparent text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-neutral-800') +
                          (savingCourseInfo ? ' opacity-60 cursor-not-allowed' : ' cursor-pointer')
                        }
                      >
                        {isRtl ? 'مدفوع' : 'Paid'}
                      </button>
                    </div>
                  </div>
                </div>

                {!courseIsFree ? (
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'السعر' : 'Price'}</label>
                    <Input value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)} placeholder="0" />
                  </div>
                ) : null}

                {!courseIsFree ? (
                  <div className="gap-1 grid">
                    <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'نسبة الخصم %' : 'Discount %'}</label>
                    <Input value={courseDiscountPercent} onChange={(e) => setCourseDiscountPercent(e.target.value)} placeholder="0" />
                    {Number.isFinite(priceNumber) ? (
                      <div className="mt-1 text-slate-600 dark:text-slate-300 text-xs">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          <span>{isRtl ? 'قبل الخصم:' : 'Before:'} <span className="font-semibold">{priceNumber.toFixed(2)}</span></span>
                          {Number.isFinite(discountedPrice) ? (
                            <span>{isRtl ? 'بعد الخصم:' : 'After:'} <span className="font-semibold">{discountedPrice.toFixed(2)}</span></span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="gap-1 grid">
                  <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'الشعبة' : 'Section'}</label>
                  <Select value={courseSection} onChange={(e) => setCourseSection(e?.target?.value ?? e)} options={sectionOptions} />
                </div>
                <div className="gap-1 grid">
                  <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'السنة الدراسية' : 'Grade year'}</label>
                  <Select value={courseGradeYear} onChange={(e) => setCourseGradeYear(e?.target?.value ?? e)} options={gradeYearOptions} />
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="secondary" onClick={saveCourseInfo} disabled={savingCourseInfo}>
                    {savingCourseInfo ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ' : 'Save')}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

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
                      return canManageCourses && unitLessons.length
                    })() ? (
                      <div className={'flex items-center gap-2 ' + (isRtl ? 'justify-start flex-row' : 'justify-end flex-row-reverse')}>
                        <Button
                          type="button"
                          variant="destructive"
                          className="px-3 h-9 text-sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            deleteAllLessonsInUnitAction(attachmentsUnit?._id)
                          }}
                        >
                          {isRtl ? 'حذف الكل' : 'Delete all'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="px-3 h-9 text-sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            deleteUnitAction(attachmentsUnit?._id)
                          }}
                        >
                          {isRtl ? 'حذف الجزء' : 'Delete section'}
                        </Button>
                      </div>
                    ) : null}

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
                          const isExpanded = expandedLessonIds.has(String(l._id))
                          const isExam = l.kind === 'exam'
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
                          const firstAssessment = isExam && l.assessmentId ? { _id: String(l.assessmentId), title: l.title, type: 'quiz' } : null
                          const lessonAssessment = !isExam && l.assessmentId
                            ? (courseAssessments || []).find((a) => String(a?._id) === String(l.assessmentId))
                            : null
                          const linkedAssessment = l.assessmentId
                            ? (lessonAssessment || firstAssessment || { _id: String(l.assessmentId), title: isRtl ? 'اختبار داخل المحاضرة' : 'Lesson Assessment', type: 'quiz' })
                            : null

                          return (
                            <div key={l._id} className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/[0.06] rounded-xl overflow-hidden">
                              <div
                                className={`w-full flex items-center justify-between gap-3 px-3 py-3 transition-colors ${isActive ? 'bg-[#14B8A6] text-white' : 'bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800'
                                  } ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                                onClick={() => {
                                  setActiveLessonId((cur) => (cur === l._id ? '' : l._id))
                                  toggleLessonExpanded(l._id)
                                }}
                              >
                                <div className={'min-w-0 flex-1 ' + (isRtl ? 'text-right' : 'text-left')}>
                                  <div className={`font-medium text-[20px] sm:text-[20px] md:text-[23px] truncate leading-relaxed arabic-safe ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
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
                                <div className="shrink-0">
                                  {canManageCourses ? (
                                    <div className={'flex items-center gap-2 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="px-3 h-8 text-xs"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          setEditingLesson(l)
                                          setOpenEditLesson(true)
                                        }}
                                      >
                                        {isRtl ? 'تعديل' : 'Edit'}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        className="px-3 h-8 text-xs"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          deleteLessonAction(l._id)
                                        }}
                                      >
                                        {isRtl ? 'حذف' : 'Delete'}
                                      </Button>
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              {isExpanded ? (
                                <div className="bg-white dark:bg-neutral-900 px-3 py-3 border-black/5 dark:border-white/[0.06] border-t">
                                  <div className="gap-2 grid mt-2">
                                    {Array.isArray(l?.contentSections) && l.contentSections.length ? (
                                      <LessonAttachmentsList
                                        isRtl={isRtl}
                                        lesson={l}
                                        openSigned={openSigned}
                                        openMedia={openMedia}
                                        assessment={linkedAssessment}
                                        onOpenAssessment={(a) => {
                                          if (!a?._id) return
                                          navigate(`${staffBase}/assessments/${a._id}/edit`)
                                        }}
                                      />
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
                      <div
                        role="button"
                        tabIndex={0}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 transition-colors ${isUnitOpen ? 'bg-[#14B8A6] text-white' : 'bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800'
                          } ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                        onClick={() => {
                          toggleUnitExpanded(unitId)
                          ensureUnitLessonsLoaded(unitId)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleUnitExpanded(unitId)
                            ensureUnitLessonsLoaded(unitId)
                          }
                        }}
                        aria-expanded={isUnitOpen}
                      >
                        <img src={lecIcon} alt="" className="w-16 h-16 shrink-0" />

                        <div className={'min-w-0 flex-1 ' + (isRtl ? 'text-right' : 'text-left')}>
                          <div className="font-semibold text-[20px] sm:text-[26px] md:text-[30px] break-words leading-snug">{u.title}</div>
                          {u?.description ? (
                            <div
                              className={`mt-1 text-[12px] sm:text-[13px] leading-snug break-words whitespace-pre-line ${isUnitOpen ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'
                                }`}
                            >
                              {u.description}
                            </div>
                          ) : null}
                        </div>

                        {canManageCourses ? (
                          <div
                            className={'flex items-center gap-2 shrink-0 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                          >
                            <Button
                              type="button"
                              variant="secondary"
                              className="px-3 h-9 text-sm"
                              onClick={() => {
                                setEditingUnit(u)
                                setOpenEditUnit(true)
                              }}
                            >
                              {isRtl ? 'تعديل' : 'Edit'}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              className="px-3 h-9 text-sm"
                              onClick={() => deleteUnitAction(unitId)}
                            >
                              {isRtl ? 'حذف' : 'Delete'}
                            </Button>
                          </div>
                        ) : null}
                      </div>

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
                                const isExpanded = expandedLessonIds.has(String(l._id))
                                const isExam = l.kind === 'exam'
                                const firstAssessment = isExam && l.assessmentId ? { _id: String(l.assessmentId), title: l.title, type: 'quiz' } : null
                                const lessonAssessment = !isExam && l.assessmentId
                                  ? (courseAssessments || []).find((a) => String(a?._id) === String(l.assessmentId))
                                  : null
                                const linkedAssessment = l.assessmentId
                                  ? (lessonAssessment || firstAssessment || { _id: String(l.assessmentId), title: isRtl ? 'اختبار داخل المحاضرة' : 'Lesson Assessment', type: 'quiz' })
                                  : null

                                return (
                                  <div key={l._id} className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/[0.06] rounded-xl overflow-hidden">
                                    <div
                                      className={`w-full flex items-center justify-between gap-3 px-3 py-3 transition-colors ${isActive ? 'bg-[#14B8A6] text-white' : 'bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800'
                                        } ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
                                      onClick={() => {
                                        setActiveLessonId((cur) => (cur === l._id ? '' : l._id))
                                        toggleLessonExpanded(l._id)
                                      }}
                                    >
                                      <div className={'min-w-0 flex-1 ' + (isRtl ? 'text-right' : 'text-left')}>
                                        <div className={`font-medium text-[20px] sm:text-[20px] md:text-[23px] truncate leading-relaxed arabic-safe ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                                          {l.title}
                                        </div>
                                      </div>
                                      <div className="shrink-0">
                                        {canManageCourses ? (
                                          <div className={'flex items-center gap-2 ' + (isRtl ? 'flex-row' : 'flex-row-reverse')}>
                                            <Button
                                              type="button"
                                              variant="secondary"
                                              className="px-3 h-8 text-xs"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setEditingLesson(l)
                                                setOpenEditLesson(true)
                                              }}
                                            >
                                              {isRtl ? 'تعديل' : 'Edit'}
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="destructive"
                                              className="px-3 h-8 text-xs"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                deleteLessonAction(l._id)
                                              }}
                                            >
                                              {isRtl ? 'حذف' : 'Delete'}
                                            </Button>
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>

                                    {isExpanded ? (
                                      <div className="bg-white dark:bg-neutral-900 px-3 py-3 border-black/5 dark:border-white/[0.06] border-t">
                                        <div className="gap-2 grid mt-2">
                                          {Array.isArray(l?.contentSections) && l.contentSections.length ? (
                                            <LessonAttachmentsList
                                              isRtl={isRtl}
                                              lesson={l}
                                              openSigned={openSigned}
                                              openMedia={openMedia}
                                              assessment={linkedAssessment}
                                              onOpenAssessment={(a) => {
                                                if (!a?._id) return
                                                navigate(`${staffBase}/assessments/${a._id}/edit`)
                                              }}
                                            />
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

      <CreateUnitModal
        open={openUnit}
        onOpenChange={setOpenUnit}
        courseId={courseId}
        onCreated={() => {
          setOpenUnit(false)
          loadUnits().catch(() => { })
        }}
      />
      <EditUnitModal
        open={openEditUnit}
        onOpenChange={setOpenEditUnit}
        courseId={courseId}
        unit={editingUnit}
        onUpdated={() => {
          setOpenEditUnit(false)
          setEditingUnit(null)
          loadUnits().catch(() => { })
        }}
      />
      <CreateLessonModal
        open={openLesson}
        onOpenChange={setOpenLesson}
        unitId={activeUnitId}
        units={units}
        courseId={courseId}
        onCreated={(createdUnitId) => {
          setOpenLesson(false)
          const nextUnitId = createdUnitId || activeUnitId
          if (createdUnitId) setActiveUnitId(createdUnitId)
          if (nextUnitId) loadLessons(nextUnitId).catch(() => { })
          loadCourseAssessments().catch(() => { })
          loadStats().catch(() => { })
        }}
      />
      <CreateAssessmentModal
        open={openQuiz}
        onOpenChange={setOpenQuiz}
        courses={[]}
        courseId={courseId}
        onCourseChange={() => { }}
        hideCoursePicker
        fixedType="quiz"
        lessonId={''}
        allowLessonLinking={false}
        allowGateOptions
        onCreated={async (assessment, meta) => {
          try {
            const assessmentId = assessment?._id
            if (assessmentId && activeUnitId) {
              await api.post(`/courses/units/${activeUnitId}/lessons`, {
                title: assessment.title || 'Exam',
                kind: 'exam',
                assessmentId: String(assessmentId),
                gateAssessmentId: String(assessmentId),
                gateNextLessons: Boolean(meta?.gateNextLessons)
              })
            }
            setOpenQuiz(false)
            notify({ title: 'Quiz created' })
            await loadLessons(activeUnitId)
            await loadStats()
          } catch (e) {
            notify({ title: 'Failed to add exam row', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
          }
        }}
      />
      <EnrollModal
        open={openEnroll}
        onOpenChange={setOpenEnroll}
        courseId={courseId}
        onEnrolled={() => {
          setOpenEnroll(false)
          notify({ title: 'Student enrolled' })
        }}
      />
      <EditLessonModal
        open={openEditLesson}
        onOpenChange={setOpenEditLesson}
        lesson={editingLesson}
        onUpdated={async () => {
          setOpenEditLesson(false)
          setEditingLesson(null)
          await loadLessons(activeUnitId)
          await loadCourseAssessments()
          await loadStats()
        }}
      />
    </div>
  )
}

function CreateUnitModal({ open, onOpenChange, courseId, onCreated }) {
  const { notify } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
    }
  }, [open])

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      await api.post(`/courses/${courseId}/units`, { title, description })
      notify({ title: 'تم إنشاء الوحدة' })
      onCreated()
    } catch (e2) {
      notify({ title: 'فشل الإنشاء', description: e2?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="إضافة وحدة">
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">العنوان</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 border border-black/5 rounded-lg w-full min-h-[90px] text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? 'جارٍ الحفظ...' : 'إنشاء'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditUnitModal({ open, onOpenChange, courseId, unit, onUpdated }) {
  const { notify } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && unit) {
      setTitle(unit.title || '')
      setDescription(unit.description || '')
    }
  }, [open, unit])

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      await api.patch(`/courses/units/${unit._id}`, { title, description })
      notify({ title: 'تم تعديل الوحدة بنجاح' })
      onUpdated()
    } catch (e2) {
      notify({ title: 'فشل التعديل', description: e2?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="تعديل وحدة">
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">العنوان</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 text-sm">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 border border-black/5 rounded-lg w-full min-h-[90px] text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? 'جارٍ الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function CreateLessonModal({ open, onOpenChange, unitId, units, courseId, onCreated }) {
  const { notify } = useToast()
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
  const [title, setTitle] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const coverInputRef = useRef(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [imageUrlsRaw, setImageUrlsRaw] = useState('')
  const [videos, setVideos] = useState([])
  const [pdfs, setPdfs] = useState([])
  const [images, setImages] = useState([])
  const [attachments, setAttachments] = useState({ videos: [], pdfs: [], images: [] })
  const [showVideoDetails, setShowVideoDetails] = useState(false)
  const [showPdfDetails, setShowPdfDetails] = useState(false)
  const [showImagesDetails, setShowImagesDetails] = useState(false)
  const [videoDurationSec, setVideoDurationSec] = useState(null)
  const [videoDurationStatus, setVideoDurationStatus] = useState('')
  const [lessonAssessmentId, setLessonAssessmentId] = useState('')
  const [gateAssessmentId, setGateAssessmentId] = useState('')
  const [gateNextLessons, setGateNextLessons] = useState(false)
  const [assessments, setAssessments] = useState([])
  const [openCreateAssessment, setOpenCreateAssessment] = useState(false)
  const [createAssessmentType, setCreateAssessmentType] = useState('quiz')
  const [loading, setLoading] = useState(false)
  const [uploadingLabel, setUploadingLabel] = useState('')
  const [uploadPct, setUploadPct] = useState(0)

  function addVideo() {
    setVideos((cur) => [...(Array.isArray(cur) ? cur : []), { name: '', description: '', url: '', file: null, durationSec: null, durationStatus: '' }])
  }

  function removeVideo(idx) {
    setVideos((cur) => (Array.isArray(cur) ? cur.filter((_, i) => i !== idx) : []))
  }

  function addPdf() {
    setPdfs((cur) => [...(Array.isArray(cur) ? cur : []), { name: '', description: '', url: '', file: null }])
  }

  function removePdf(idx) {
    setPdfs((cur) => (Array.isArray(cur) ? cur.filter((_, i) => i !== idx) : []))
  }

  function addImage() {
    setImages((cur) => [...(Array.isArray(cur) ? cur : []), { name: '', description: '', url: '', file: null }])
  }

  function removeImage(idx) {
    setImages((cur) => (Array.isArray(cur) ? cur.filter((_, i) => i !== idx) : []))
  }

  useEffect(() => {
    if (open) {
      setTitle('')
      const list = Array.isArray(units) ? units : []
      const fallbackUnitId = list.find((u) => u?._id)?._id || ''
      setSelectedUnitId(unitId || fallbackUnitId)
      setIsFree(false)
      setCreateAssessmentType('quiz')
      setCoverFile(null)
      setCoverUrl('')
      setVideos([{ name: '', description: '', url: '', file: null, durationSec: null, durationStatus: '' }])
      setPdfs([{ name: '', description: '', url: '', file: null }])
      setImages([])
      setLessonAssessmentId('')
    }
  }, [open, unitId, units])

  async function loadAssessmentsForUnit() {
    try {
      if (!unitId || !courseId) {
        setAssessments([])
        return
      }
      const res = await api.get(`/assessments/course/${courseId}`)
      const list = Array.isArray(res.data) ? res.data : []
      setAssessments(list)
    } catch {
      setAssessments([])
    }
  }

  useEffect(() => {
    if (open) {
      loadAssessmentsForUnit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, unitId])

  function formatDuration(sec) {
    const s = Number(sec)
    if (!Number.isFinite(s) || s <= 0) return ''
    const mm = Math.floor(s / 60)
    const ss = Math.floor(s % 60)
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }

  function detectVideoProvider(u) {
    const str = String(u || '').trim().toLowerCase()
    if (!str) return ''
    if (str.includes('youtube.com') || str.includes('youtu.be')) return 'YouTube'
    if (str.endsWith('.mp4') || str.includes('.mp4?')) return 'Direct MP4'
    return 'Direct/Other'
  }

  async function setVideoDurationForIndex(idx) {
    const item = (videos || [])[idx]
    if (!item) return

    if (item.file instanceof File) {
      try {
        const url = URL.createObjectURL(item.file)
        const vEl = document.createElement('video')
        vEl.preload = 'metadata'
        const res = await new Promise((resolve) => {
          const onLoaded = () => resolve({ ok: true, duration: Number(vEl.duration) })
          const onError = () => resolve({ ok: false })
          vEl.addEventListener('loadedmetadata', onLoaded, { once: true })
          vEl.addEventListener('error', onError, { once: true })
          vEl.src = url
        })
        URL.revokeObjectURL(url)
        setVideos((cur) => (cur || []).map((v, i) => {
          if (i !== idx) return v
          if (res && res.ok && Number.isFinite(res.duration) && res.duration > 0) return { ...v, durationSec: res.duration, durationStatus: '' }
          return { ...v, durationSec: null, durationStatus: 'Duration not available' }
        }))
      } catch {
        setVideos((cur) => (cur || []).map((v, i) => (i === idx ? { ...v, durationSec: null, durationStatus: 'Duration not available' } : v)))
      }
      return
    }

    const u = String(item.url || '').trim()
    const provider = detectVideoProvider(u)
    if (!u) {
      setVideos((cur) => (cur || []).map((v, i) => (i === idx ? { ...v, durationSec: null, durationStatus: '' } : v)))
      return
    }
    if (provider === 'YouTube') {
      setVideos((cur) => (cur || []).map((v, i) => (i === idx ? { ...v, durationSec: null, durationStatus: 'Duration not available for YouTube without API' } : v)))
      return
    }
    try {
      const vEl = document.createElement('video')
      vEl.preload = 'metadata'
      vEl.crossOrigin = 'anonymous'
      const res = await new Promise((resolve) => {
        const onLoaded = () => resolve({ ok: true, duration: Number(vEl.duration) })
        const onError = () => resolve({ ok: false })
        vEl.addEventListener('loadedmetadata', onLoaded, { once: true })
        vEl.addEventListener('error', onError, { once: true })
        vEl.src = u
      })
      vEl.src = ''
      setVideos((cur) => (cur || []).map((v, i) => {
        if (i !== idx) return v
        if (res && res.ok && Number.isFinite(res.duration) && res.duration > 0) return { ...v, durationSec: res.duration, durationStatus: '' }
        return { ...v, durationSec: null, durationStatus: 'Duration not available' }
      }))
    } catch {
      setVideos((cur) => (cur || []).map((v, i) => (i === idx ? { ...v, durationSec: null, durationStatus: 'Duration not available' } : v)))
    }
  }

  function onProgress(label) {
    return (evt) => {
      try {
        const total = evt && evt.total ? evt.total : 0
        const loaded = evt && evt.loaded ? evt.loaded : 0
        if (!total) {
          setUploadingLabel(label)
          return
        }
        const pct = Math.min(100, Math.max(0, Math.round((loaded / total) * 100)))
        setUploadingLabel(label)
        setUploadPct(pct)
      } catch {
        setUploadingLabel(label)
      }
    }
  }

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      setUploadingLabel('')
      setUploadPct(0)

      let finalCoverUrl = coverUrl
      const imageUrls = []

      if (coverFile) {
        const dims = await getImageDimensions(coverFile)
        if (dims.width !== 1920 || dims.height !== 1080) {
          notify({
            title: 'Invalid cover size',
            description: `Cover image must be 1920x1080. Selected: ${dims.width}x${dims.height}`,
            variant: 'destructive'
          })
          return
        }
        const up = await uploadFile(coverFile, '/uploads', { maxSide: 1920, onProgress: onProgress('Uploading cover...') })
        finalCoverUrl = up.url
      }

      let legacyVideoUrl = ''
      const videoItems = []
      for (let i = 0; i < (videos || []).length; i += 1) {
        const item = videos[i]
        if (!item) continue
        if (item.file) {
          const up = await uploadFile(item.file, '/uploads', { onProgress: onProgress('Uploading video...') })
          if (!legacyVideoUrl) legacyVideoUrl = up.url
          videoItems.push({
            name: String(item.name || ''),
            description: String(item.description || ''),
            url: up.url,
            storageRef: '',
            durationSec: typeof item.durationSec === 'number' && Number.isFinite(item.durationSec) ? item.durationSec : null
          })
          continue
        }
        if (item.url) {
          const u = String(item.url)
          if (!legacyVideoUrl) legacyVideoUrl = u
          videoItems.push({
            name: String(item.name || ''),
            description: String(item.description || ''),
            url: u,
            storageRef: '',
            durationSec: typeof item.durationSec === 'number' && Number.isFinite(item.durationSec) ? item.durationSec : null
          })
        }
      }
      let legacyPdfUrl = ''
      const pdfItems = []
      for (let i = 0; i < (pdfs || []).length; i += 1) {
        const item = pdfs[i]
        if (!item) continue
        if (item.file) {
          const up = await uploadFile(item.file, '/uploads', { onProgress: onProgress('Uploading PDF...') })
          if (!legacyPdfUrl) legacyPdfUrl = up.url
          pdfItems.push({ name: String(item.name || ''), description: String(item.description || ''), url: up.url, storageRef: '' })
          continue
        }
        if (item.url) {
          const u = String(item.url)
          if (!legacyPdfUrl) legacyPdfUrl = u
          pdfItems.push({ name: String(item.name || ''), description: String(item.description || ''), url: u, storageRef: '' })
        }
      }
      const imageItems = []
      for (let i = 0; i < (images || []).length; i += 1) {
        const item = images[i]
        if (!item) continue
        if (item.file) {
          const up = await uploadFile(item.file, '/uploads', { onProgress: onProgress('Uploading image...') })
          imageUrls.push(up.url)
          imageItems.push({ name: String(item.name || ''), description: String(item.description || ''), url: up.url, storageRef: '' })
          continue
        }
        if (item.url) {
          const u = String(item.url)
          imageUrls.push(u)
          imageItems.push({ name: String(item.name || ''), description: String(item.description || ''), url: u, storageRef: '' })
        }
      }

      const contentSections = [
        { key: 'explanation', enabled: true, videos: videoItems, pdfs: pdfItems, images: imageItems },
        { key: 'homework', enabled: true, videos: [], pdfs: [], images: [] },
        { key: 'exams', enabled: true, videos: [], pdfs: [], images: [] }
      ]

      await api.post(`/courses/units/${selectedUnitId}/lessons`, {
        title,
        isFree,
        coverImageUrl: finalCoverUrl,
        videoUrl: legacyVideoUrl,
        pdfUrl: legacyPdfUrl,
        imageUrls,
        contentSections,
        assessmentId: lessonAssessmentId
      })
      notify({ title: 'تم إنشاء المحاضرة' })
      onCreated(selectedUnitId)
    } catch (e2) {
      notify({ title: 'فشل الإنشاء', description: e2?.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="إضافة محاضرة" description="إضافة محاضرة جديدة" showClose={false}>
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">الوحدة</label>
          <Select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            disabled={loading}
            options={(Array.isArray(units) ? units : []).map((u) => ({
              value: String(u?._id),
              label: u?.title || '-'
            }))}
          />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">العنوان</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">صورة الغلاف (اختياري) - لازم تكون 1920×1080</label>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => coverInputRef.current?.click()} disabled={loading}>
              اختر ملف
            </Button>
            <div className="flex-1 text-slate-600 dark:text-slate-300 text-sm truncate">{coverFile?.name || 'لم يتم اختيار ملف'}</div>
            {coverFile ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCoverFile(null)
                  if (coverInputRef.current) coverInputRef.current.value = ''
                }}
                disabled={loading}
              >
                إزالة
              </Button>
            ) : null}
          </div>
        </div>

        <div className="p-3 border border-black/5 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">واجب / كويز داخل المحاضرة</div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="px-3 h-8 text-xs"
                onClick={() => {
                  setCreateAssessmentType('quiz')
                  setOpenCreateAssessment(true)
                }}
                disabled={loading || !courseId}
              >
                إنشاء كويز
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-3 h-8 text-xs"
                onClick={() => {
                  setCreateAssessmentType('homework')
                  setOpenCreateAssessment(true)
                }}
                disabled={loading || !courseId}
              >
                إنشاء واجب
              </Button>
            </div>
          </div>
          <div className="gap-1 grid mt-2">
            <label className="text-slate-600 text-xs">اختر واجب/كويز (اختياري)</label>
            <Select
              value={lessonAssessmentId}
              onChange={(e) => setLessonAssessmentId(e.target.value)}
              disabled={loading}
              options={[
                { value: '', label: 'بدون' },
                ...assessments.map((a) => ({
                  value: a._id,
                  label: (a.type === 'homework' ? 'HW: ' : a.type === 'exam' ? 'Exam: ' : 'Quiz: ') + (a.title || '')
                }))
              ]}
            />
          </div>
        </div>
        <div className="p-3 border border-black/5 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">فيديوهات</div>
            <Button type="button" variant="outline" className="px-3 h-8 text-xs" onClick={addVideo} disabled={loading}>
              + إضافة فيديو
            </Button>
          </div>
          <div className="gap-3 grid mt-3">
            {(videos || []).map((v, idx) => (
              <div key={idx} className="p-3 border border-black/5 rounded-xl">
                <div className="flex justify-between items-center gap-2">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">فيديو {idx + 1}</div>
                  <Button type="button" variant="outline" className="px-3 h-8 text-xs" onClick={() => removeVideo(idx)} disabled={loading}>
                    إزالة
                  </Button>
                </div>
                <div className="gap-2 grid mt-2">
                  <div className="gap-1 grid">
                    <label className="text-slate-600 text-xs">الاسم (يظهر للطالب)</label>
                    <Input value={v.name} onChange={(e) => setVideos((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 text-xs">الوصف</label>
                    <textarea
                      value={v.description}
                      onChange={(e) => setVideos((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))}
                      className="px-3 py-2 border border-black/5 rounded-lg w-full min-h-[72px] text-sm"
                    />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 text-xs">رابط الفيديو (اختياري)</label>
                    <Input
                      value={v.url}
                      onChange={(e) => setVideos((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
                      onBlur={() => setVideoDurationForIndex(idx)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 text-xs">رفع فيديو (اختياري)</label>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      id={`create-lesson-video-${idx}-file`}
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null
                        setVideos((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, file: f } : x)))
                        setTimeout(() => setVideoDurationForIndex(idx), 0)
                        if (e.target) e.target.value = ''
                      }}
                      disabled={loading}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="px-4 h-11 dark:text-slate-200 text-sm"
                        onClick={() => {
                          const el = document.getElementById(`create-lesson-video-${idx}-file`)
                          if (el && typeof el.click === 'function') el.click()
                        }}
                        disabled={loading}
                      >
                        {v.file?.name ? 'تغيير الملف' : 'اختيار ملف'}
                      </Button>
                      <div className="min-w-0 text-slate-700 dark:text-slate-200 text-sm truncate">
                        {v.file?.name ? v.file.name : 'لم يتم اختيار ملف'}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-600 text-xs">
                    <span className="font-medium">المدة:</span>{' '}
                    {v.durationSec ? formatDuration(v.durationSec) : (v.durationStatus || '—')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border border-black/5 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">ملفات PDF</div>
            <Button type="button" variant="outline" className="px-3 h-8 text-xs" onClick={addPdf} disabled={loading}>
              + إضافة PDF
            </Button>
          </div>
          <div className="gap-3 grid mt-3">
            {(pdfs || []).map((p, idx) => (
              <div key={idx} className="p-3 border border-black/5 rounded-xl">
                <div className="flex justify-between items-center gap-2">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">PDF {idx + 1}</div>
                  <Button type="button" variant="outline" className="px-3 h-8 text-xs" onClick={() => removePdf(idx)} disabled={loading}>
                    إزالة
                  </Button>
                </div>
                <div className="gap-2 grid mt-2">
                  <div className="gap-1 grid">
                    <label className="text-slate-600 text-xs">الاسم (يظهر للطالب)</label>
                    <Input value={p.name} onChange={(e) => setPdfs((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))} />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 text-xs">الوصف</label>
                    <textarea
                      value={p.description}
                      onChange={(e) => setPdfs((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))}
                      className="px-3 py-2 border border-black/5 rounded-lg w-full min-h-[72px] text-sm"
                    />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 text-xs">رابط PDF (اختياري)</label>
                    <Input
                      value={p.url}
                      onChange={(e) => setPdfs((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="gap-1 grid">
                    <label className="text-slate-600 text-xs">رفع PDF (اختياري)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      id={`create-lesson-pdf-${idx}-file`}
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null
                        setPdfs((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, file: f } : x)))
                        if (e.target) e.target.value = ''
                      }}
                      disabled={loading}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="px-4 h-11 dark:text-slate-200 text-sm"
                        onClick={() => {
                          const el = document.getElementById(`create-lesson-pdf-${idx}-file`)
                          if (el && typeof el.click === 'function') el.click()
                        }}
                        disabled={loading}
                      >
                        {p.file?.name ? 'تغيير الملف' : 'اختيار ملف'}
                      </Button>
                      <div className="min-w-0 text-slate-700 dark:text-slate-200 text-sm truncate">
                        {p.file?.name ? p.file.name : 'لم يتم اختيار ملف'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border border-black/5 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">الصور</div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="create-lesson-images-file"
              onChange={(e) => {
                addImageFiles(e.target.files)
                if (e.target) e.target.value = ''
              }}
              disabled={loading}
            />
            <Button
              type="button"
              variant="outline"
              className="px-4 h-11 dark:text-slate-200 text-sm"
              onClick={() => {
                const el = document.getElementById('create-lesson-images-file')
                if (el && typeof el.click === 'function') el.click()
              }}
              disabled={loading}
            >
              اختيار صور
            </Button>
          </div>
          {(images || []).length ? (
            <div className="gap-3 grid mt-3">
              {(images || []).map((img, idx) => (
                <div key={idx} className="p-3 border border-black/5 rounded-xl">
                  <div className="flex justify-between items-center gap-2">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">صورة {idx + 1}</div>
                    <Button type="button" variant="outline" className="px-3 h-8 text-xs" onClick={() => removeImage(idx)} disabled={loading}>
                      إزالة
                    </Button>
                  </div>
                  <div className="gap-2 grid mt-2">
                    <div className="gap-1 grid">
                      <label className="text-slate-600 text-xs">الاسم (يظهر للطالب)</label>
                      <Input value={img.name} onChange={(e) => setImages((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))} />
                    </div>
                    <div className="gap-1 grid">
                      <label className="text-slate-600 text-xs">الوصف</label>
                      <textarea
                        value={img.description}
                        onChange={(e) => setImages((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))}
                        className="px-3 py-2 border border-black/5 rounded-lg w-full min-h-[72px] text-sm"
                      />
                    </div>
                    <div className="gap-1 grid">
                      <label className="text-slate-600 text-xs">رابط الصورة (اختياري)</label>
                      <Input value={img.url} onChange={(e) => setImages((cur) => (cur || []).map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))} placeholder="https://..." />
                    </div>
                    <div className="text-slate-600 text-xs truncate">{img.file?.name || ''}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-slate-600 text-sm">لم يتم إضافة صور بعد</div>
          )}
        </div>

        {loading && uploadingLabel ? (
          <div className="gap-2 grid">
            <div className="text-slate-700 dark:text-slate-200 text-sm">{uploadingLabel}</div>
            <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-[#14B8A6] h-2" style={{ width: `${uploadPct}%` }} />
            </div>
            <div className="text-slate-500 text-xs">{uploadPct}%</div>
          </div>
        ) : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? (isRtl ? 'جارٍ الحفظ...' : 'Saving...') : (isRtl ? 'إنشاء' : 'Create')}
          </Button>
        </div>
      </form>

      <CreateAssessmentModal
        open={openCreateAssessment}
        onOpenChange={setOpenCreateAssessment}
        courseId={courseId}
        hideCoursePicker
        allowGateOptions={false}
        fixedType={createAssessmentType === 'homework' ? 'homework' : 'quiz'}
        onCreated={async (assessment) => {
          try {
            const assessmentId = assessment?._id
            if (!assessmentId) return
            await loadAssessmentsForUnit()
            setLessonAssessmentId(String(assessmentId))
          } catch {
            // ignore
          }
        }}
      />
    </Modal>
  )
}

function EnrollModal({ open, onOpenChange, courseId, onEnrolled }) {
  const { notify } = useToast()
  const { isRtl } = useLanguage()
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setStudentId('')
  }, [open])

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      await api.post(`/courses/${courseId}/enroll`, { studentId })
      onEnrolled()
    } catch (e2) {
      notify({
        title: isRtl ? 'فشل تسجيل الطالب' : 'Enroll failed',
        description: e2?.response?.data?.message || (isRtl ? 'حدث خطأ' : 'Error'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isRtl ? 'تسجيل طالب' : 'Enroll student'}>
      <form onSubmit={submit} className="gap-3 grid">
        <div className="gap-1 grid">
          <label className="text-slate-600 dark:text-slate-300 text-sm">{isRtl ? 'رقم الطالب' : 'Student ID'}</label>
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder={isRtl ? 'اكتب رقم الطالب' : ''} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={loading || !studentId.trim()}>
            {loading ? (isRtl ? 'جاري التسجيل...' : 'Enrolling...') : (isRtl ? 'تسجيل' : 'Enroll')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

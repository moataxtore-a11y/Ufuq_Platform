import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api.js'
import Spinner from '../../components/ui/Spinner.jsx'
import { useToast } from '../../components/ui/toast.jsx'
import CourseCard from '../../components/courses/CourseCard.jsx'

export default function StudentCoursesPage() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const lang = typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'ar' : 'en'
  const isRtl = lang === 'ar'

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await api.get('/courses/mine')
        if (mounted) setCourses(res.data)
      } catch (e) {
        notify({ title: 'Failed to load courses', description: e?.response?.data?.message || 'Error', variant: 'destructive' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [notify])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-700">
        <Spinner />
        Loading...
      </div>
    )
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="gap-4 grid">
      <div className={isRtl ? 'text-right' : 'text-left'}>
        <div className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight">My Courses</div>
        <div className="text-slate-700 dark:text-slate-200 text-sm">Courses you are enrolled in.</div>
      </div>

      <div className="app-grid-cards">
        {courses.map((c) => (
          <div key={c._id} className="min-w-0">
            <CourseCard
              course={c}
              isRtl={isRtl}
              badge={isRtl ? 'كورس' : 'Course'}
              ctaLabel={isRtl ? 'الدخول للكورس' : 'Enter course'}
              onOpen={() => navigate(`/student/courses/${c._id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

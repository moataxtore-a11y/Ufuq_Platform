import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../utils/api.js'
import Button from '../ui/Button.jsx'
import SectionWrapper from '../ui/SectionWrapper.jsx'
import Spinner from '../ui/Spinner.jsx'
import TeacherCard from '../teachers/TeacherCard.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function TeachersSection() {
  const { auth } = useAuth()
  const { isRtl, t } = useLanguage()
  const role = auth?.user?.role
  const [state, setState] = useState({ status: 'idle', items: [], error: '' })

  useEffect(() => {
    let alive = true

    async function run() {
      if (!auth?.token || role !== 'teacher') {
        if (alive) setState({ status: 'idle', items: [], error: '' })
        return
      }

      if (alive) setState({ status: 'loading', items: [], error: '' })
      try {
        const res = await api.get('/teachers/me/team')
        const items = Array.isArray(res.data) ? res.data : []
        if (alive) setState({ status: 'success', items, error: '' })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || t('landing.teachers.error_failed')
        if (alive) setState({ status: 'error', items: [], error: msg })
      }
    }

    run()
    return () => {
      alive = false
    }
  }, [auth?.token, role])

  return (
    <SectionWrapper
      id="teachers"
      title={t('landing.teachers.title')}
      subtitle={
        !auth?.token
          ? t('landing.teachers.subtitle_signed_out')
          : role !== 'teacher'
            ? t('landing.teachers.subtitle_not_teacher')
            : t('landing.teachers.subtitle_teacher')
      }
      action={
        !auth?.token ? (
          <Button asChild variant="secondary" size="sm">
            <Link to="/login">{t('landing.teachers.action_login')}</Link>
          </Button>
        ) : role === 'teacher' ? (
          <Button asChild variant="secondary" size="sm">
            <Link to="/teacher/team">{t('landing.teachers.action_manage_team')}</Link>
          </Button>
        ) : null
      }
    >
      {state.status === 'loading' ? (
        <div className="flex justify-center items-center bg-white dark:bg-[#1a1a1a] p-8 border border-black/5 dark:border-white/10 rounded-3xl">
          <Spinner />
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
          {state.error}
        </div>
      ) : null}

      {state.status === 'success' && state.items.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] p-5 border border-black/5 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 text-sm">
          {t('landing.teachers.empty')}
        </div>
      ) : null}

      {state.status === 'success' && state.items.length > 0 ? (
        <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
          {state.items.map((t) => (
            <TeacherCard
              key={t?._id || t?.id || t?.email || t?.name}
              teacher={t}
              action={<Button size="sm">{t('landing.teachers.see_profile')}</Button>}
            />
          ))}
        </div>
      ) : null}
    </SectionWrapper>
  )
}

import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../utils/authStorage.js'

export default function DashboardShell({ title, children }) {
  const navigate = useNavigate()
  const auth = getAuth()

  function logout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center gap-3">
        <h1 className="m-0 font-extrabold text-slate-900 text-xl tracking-tight">{title} Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="text-slate-700/80 text-sm">{auth?.email}</div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center bg-brand hover:bg-brand-600 px-4 py-2 rounded-xl font-semibold text-white text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  )
}

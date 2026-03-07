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
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>{title} Dashboard</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ opacity: 0.8 }}>{auth?.email}</div>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>{children}</div>
    </div>
  )
}

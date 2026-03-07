import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ roles, children }) {
  const location = useLocation()
  const { auth } = useAuth()

  if (!auth?.token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (auth.mustChangePassword) {
    return <Navigate to="/change-password" replace />
  }

  if (roles && roles.length > 0 && !roles.includes(auth.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}

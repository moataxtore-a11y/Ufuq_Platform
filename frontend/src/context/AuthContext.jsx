import * as React from 'react'
import { getAuth, setAuth as persistAuth, clearAuth as clearPersisted } from '../utils/authStorage.js'
import { api } from '../utils/api.js'

const AuthContext = React.createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuthState] = React.useState(() => getAuth())

  const setAuth = React.useCallback((payload) => {
    if (typeof payload === 'function') {
      setAuthState((prev) => {
        const next = payload(prev)
        if (next) persistAuth(next)
        else clearPersisted()
        return next
      })
      return
    }

    setAuthState(payload)
    if (payload) persistAuth(payload)
    else clearPersisted()
  }, [])

  const logout = React.useCallback(() => {
    setAuth(null)
  }, [setAuth])

  React.useEffect(() => {
    let alive = true

    async function refreshMe() {
      if (!auth?.token) return
      try {
        const res = await api.get('/auth/me')
        if (!alive) return
        const me = res?.data || {}
        setAuth((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            role: me.role ?? prev.role,
            email: me.email ?? prev.email,
            name: me.name ?? prev.name,
            teamId: me.teamId ?? prev.teamId,
            teamPermissions: Array.isArray(me.teamPermissions) ? me.teamPermissions : prev.teamPermissions,
            studentId: me.studentId ?? prev.studentId,
            mustChangePassword: typeof me.mustChangePassword === 'boolean' ? me.mustChangePassword : prev.mustChangePassword
          }
        })
      } catch {
        // ignore
      }
    }

    refreshMe()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token])

  return <AuthContext.Provider value={{ auth, setAuth, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

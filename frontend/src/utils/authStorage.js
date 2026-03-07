const KEY = 'edu_auth'

export function setAuth(payload) {
  localStorage.setItem(KEY, JSON.stringify(payload))
}

export function clearAuth() {
  localStorage.removeItem(KEY)
}

export function getAuth() {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

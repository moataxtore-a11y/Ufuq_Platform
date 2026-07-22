import axios from 'axios'
import { getAuth, clearAuth } from './authStorage.js'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')
})

api.interceptors.request.use((config) => {
    const auth = getAuth()
    if (auth && auth.token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${auth.token}`
    }
    return config
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err && err.response && err.response.status === 401) {
            clearAuth()
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.assign('/login')
            }
        }
        return Promise.reject(err)
    }
)
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

// export const API_BASE = 'http://localhost:5000/api/'
export const API_BASE = 'https://twitter-scheduler-backend.onrender.com'
export const BACKEND_BASE = API_BASE
export const API_DOCS = API_BASE.replace(/\/?api\/?$/, '')

export const client = axios.create({ baseURL: API_BASE })

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)



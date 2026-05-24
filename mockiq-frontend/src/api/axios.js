import axios from 'axios'
import { TOKEN_KEY, API_BASE_URL, API_TIMEOUT } from '@/utils/constants'

/**
 * axiosInstance — the single Axios instance used by every API module.
 *
 * baseURL  → /api (proxied to http://localhost:8080 in dev via vite.config.js)
 * timeout  → 30 seconds (AI endpoints can be slow — interviews, ATS, skill gap)
 * headers  → Content-Type: application/json by default
 *            (overridden to multipart/form-data for file uploads in resume.api.js)
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* ── Request Interceptor ──────────────────────────────────────
   Runs before every outgoing request.
   Reads the JWT from localStorage and attaches it to the
   Authorization header automatically.
   Every API module benefits — no manual token attachment needed.
   ─────────────────────────────────────────────────────────── */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response Interceptor ─────────────────────────────────────
   Runs after every response (success or error).

   On 401 Unauthorized:
     → Token is expired or invalid
     → Clear all stored auth data
     → Hard-redirect to /login?session=expired
     → Skip if already on an auth page (prevents redirect loop)

   On all other errors:
     → Pass through to the calling API module
     → Each module handles display (toast, error state, etc.)
   ─────────────────────────────────────────────────────────── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register')

      if (!isAuthPage) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('mockiq_user')
        window.location.href = '/login?session=expired'
      }
    }
    return Promise.reject(error)
  }
)

/**
 * extractErrorMessage
 * Reads the backend's { success: false, message: '...' } shape.
 * Falls back to a generic message if the response has no message.
 *
 * @param {unknown} error    — the Axios error object
 * @param {string}  fallback — shown when no message is found
 * @returns {string}
 */
export function extractErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.'
) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  )
}

/**
 * extractValidationErrors
 * Reads per-field validation errors from the backend response.
 * Backend shape on 400:
 *   { success: false, message: 'Validation failed', data: { field: 'message' } }
 *
 * Used with React Hook Form's setError() to highlight individual fields.
 *
 * @param {unknown} error
 * @returns {Record<string, string> | null}
 */
export function extractValidationErrors(error) {
  const data = error?.response?.data?.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data
  }
  return null
}

export default axiosInstance
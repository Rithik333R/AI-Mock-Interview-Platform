import { create } from 'zustand'
import { TOKEN_KEY, USER_KEY } from '@/utils/constants'
import { login as loginApi, register as registerApi } from '@/api/auth.api'
import { extractErrorMessage } from '@/api/axios'

/**
 * authStore — single source of truth for authentication state.
 *
 * State:
 *   user           → { fullName, email, role } | null
 *   token          → JWT string | null
 *   isLoading      → true while a login/register request is in flight
 *   error          → last auth error message | null
 *   isInitialised  → true once localStorage hydration is complete
 *
 * Actions:
 *   login()        → authenticate, persist token + user
 *   register()     → create account, persist token + user
 *   logout()       → clear all auth state + localStorage
 *   setUser()      → sync updated profile after PUT /users/me
 *   clearError()   → reset error (call when user starts typing again)
 *   hydrate()      → restore state from localStorage on app boot
 *
 * Persistence strategy:
 *   Token and user stored in localStorage directly via TOKEN_KEY / USER_KEY.
 *   We do NOT use zustand/middleware persist because we need the
 *   isInitialised flag to know exactly when hydration is done —
 *   the persist middleware does not expose this cleanly.
 *
 * isInitialised is critical:
 *   ProtectedRoute renders a spinner until this is true.
 *   Without it, users get a flash of the login page on hard refresh
 *   even when they have a valid token stored.
 */
const useAuthStore = create((set, get) => ({

  // ── State ────────────────────────────────────────────────
  user:          null,
  token:         null,
  isLoading:     false,
  error:         null,
  isInitialised: false,

  // ── Actions ──────────────────────────────────────────────

  /**
   * login — authenticate with email + password.
   *
   * On success:
   *   → saves token + user to state and localStorage
   *   → returns { success: true }
   *
   * On failure:
   *   → sets error message in state
   *   → returns { success: false, message }
   *
   * The caller (LoginPage) uses the return value to decide
   * whether to navigate to /dashboard or show the error inline.
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null })

    try {
      const response = await loginApi({ email, password })
      const { accessToken, fullName, role, email: userEmail } =
        response.data.data

      const user = { fullName, email: userEmail, role }

      localStorage.setItem(TOKEN_KEY, accessToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      set({ token: accessToken, user, isLoading: false, error: null })
      return { success: true }

    } catch (error) {
      const message = extractErrorMessage(
        error,
        'Login failed. Please check your credentials.'
      )
      set({ isLoading: false, error: message })
      return { success: false, message }
    }
  },

  /**
   * register — create a new account.
   * The backend returns a token immediately on registration,
   * so the user is logged in straight away — no separate login needed.
   *
   * On success:
   *   → saves token + user to state and localStorage
   *   → returns { success: true }
   *
   * On failure:
   *   → sets error message in state
   *   → returns { success: false, message }
   */
  register: async (fullName, email, password) => {
    set({ isLoading: true, error: null })

    try {
      const response = await registerApi({ fullName, email, password })
      const {
        accessToken,
        fullName: name,
        role,
        email: userEmail,
      } = response.data.data

      const user = { fullName: name, email: userEmail, role }

      localStorage.setItem(TOKEN_KEY, accessToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      set({ token: accessToken, user, isLoading: false, error: null })
      return { success: true }

    } catch (error) {
      const message = extractErrorMessage(
        error,
        'Registration failed. Please try again.'
      )
      set({ isLoading: false, error: message })
      return { success: false, message }
    }
  },

  /**
   * logout — clear everything.
   * Called from the sidebar logout button and from the
   * Axios 401 interceptor (via direct localStorage clear + redirect).
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({
      token:     null,
      user:      null,
      isLoading: false,
      error:     null,
    })
  },

  /**
   * setUser — update user profile in state + localStorage.
   * Called after a successful PUT /api/users/me so the
   * sidebar name and topbar avatar update immediately.
   *
   * @param {{ fullName?: string, email?: string, role?: string }} updatedFields
   */
  setUser: (updatedFields) => {
    const merged = { ...get().user, ...updatedFields }
    localStorage.setItem(USER_KEY, JSON.stringify(merged))
    set({ user: merged })
  },

  /**
   * clearError — reset the error field.
   * Call this when the user starts typing in the form again
   * so the error message disappears reactively.
   */
  clearError: () => set({ error: null }),

  /**
   * hydrate — restore auth state from localStorage on app boot.
   * Called once in App.jsx inside a useEffect on mount.
   *
   * Sets isInitialised = true when done regardless of outcome.
   * ProtectedRoute waits for this before making any redirect decision.
   *
   * If localStorage is corrupted, we clear it and start fresh
   * rather than crashing the app.
   */
  hydrate: () => {
    try {
      const token   = localStorage.getItem(TOKEN_KEY)
      const userRaw = localStorage.getItem(USER_KEY)
      const user    = userRaw ? JSON.parse(userRaw) : null

      if (token && user) {
        set({ token, user, isInitialised: true })
      } else {
        set({ isInitialised: true })
      }
    } catch {
      // Corrupted data — wipe and start clean
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      set({ isInitialised: true })
    }
  },
}))

// ── Selectors ────────────────────────────────────────────────
// Pre-built selectors prevent inline arrow functions in components,
// which would cause unnecessary re-renders on every store update.
//
// Usage:
//   const user       = useAuthStore(selectUser)
//   const isLoggedIn = useAuthStore(selectIsLoggedIn)

export const selectUser          = (s) => s.user
export const selectToken         = (s) => s.token
export const selectIsLoggedIn    = (s) => !!s.token && !!s.user
export const selectIsLoading     = (s) => s.isLoading
export const selectError         = (s) => s.error
export const selectIsInitialised = (s) => s.isInitialised

export default useAuthStore
import useAuthStore, {
  selectUser,
  selectToken,
  selectIsLoggedIn,
  selectIsLoading,
  selectError,
  selectIsInitialised,
} from '@/store/authStore'

/**
 * useAuth — clean, ergonomic wrapper around authStore.
 *
 * Why this hook exists:
 *   Components could import useAuthStore and selectors directly,
 *   but that requires two imports and knowledge of the store's
 *   internal selector names everywhere it's used.
 *
 *   This hook provides a single import that returns everything
 *   a component needs from auth state, with clear names.
 *
 * Usage:
 *   const { user, isLoggedIn, login, logout } = useAuth()
 *
 *   // Read state
 *   const { user, isLoggedIn, isLoading, error } = useAuth()
 *
 *   // Trigger actions
 *   const { login, logout, register, setUser, clearError } = useAuth()
 *
 *   // Guard checks
 *   const { isInitialised } = useAuth()
 *
 * Performance:
 *   Each selector call creates its own Zustand subscription.
 *   Only the slice of state the component uses triggers a re-render.
 *   This is more efficient than returning the entire store object.
 */
export default function useAuth() {
  // ── State slices ─────────────────────────────────────────
  const user          = useAuthStore(selectUser)
  const token         = useAuthStore(selectToken)
  const isLoggedIn    = useAuthStore(selectIsLoggedIn)
  const isLoading     = useAuthStore(selectIsLoading)
  const error         = useAuthStore(selectError)
  const isInitialised = useAuthStore(selectIsInitialised)

  // ── Actions ──────────────────────────────────────────────
  // Read directly from store (actions never change reference)
  const login      = useAuthStore((s) => s.login)
  const register   = useAuthStore((s) => s.register)
  const logout     = useAuthStore((s) => s.logout)
  const setUser    = useAuthStore((s) => s.setUser)
  const clearError = useAuthStore((s) => s.clearError)

  return {
    // State
    user,
    token,
    isLoggedIn,
    isLoading,
    error,
    isInitialised,

    // Derived helpers
    isAdmin: user?.role === 'ADMIN',
    fullName: user?.fullName ?? '',
    email:    user?.email    ?? '',
    initials: getInitials(user?.fullName),

    // Actions
    login,
    register,
    logout,
    setUser,
    clearError,
  }
}

/**
 * getInitials — extract up to 2 initials from a full name.
 * Used by the avatar component in the sidebar and topbar.
 *
 * 'John Doe'   → 'JD'
 * 'Alice'      → 'A'
 * null/''      → '?'
 *
 * @param {string | undefined} fullName
 * @returns {string}
 */
function getInitials(fullName) {
  if (!fullName) return '?'
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
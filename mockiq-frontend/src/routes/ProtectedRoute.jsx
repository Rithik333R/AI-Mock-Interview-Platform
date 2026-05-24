import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore, {
  selectIsLoggedIn,
  selectIsInitialised,
} from '@/store/authStore'

/**
 * ProtectedRoute — guards all authenticated pages.
 *
 * Render logic (three states):
 *
 *   1. !isInitialised
 *      → localStorage hydration not done yet
 *      → show full-screen spinner
 *      → prevents flash of /login on hard refresh for logged-in users
 *
 *   2. isInitialised && !isLoggedIn
 *      → no valid token found after hydration
 *      → redirect to /login
 *      → preserve the intended path in location.state.from
 *        so LoginPage can navigate back after successful login
 *
 *   3. isInitialised && isLoggedIn
 *      → render <Outlet /> — the matched child route
 *
 * Usage in AppRouter.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<DashboardLayout />}>
 *       <Route path="/dashboard" element={<DashboardPage />} />
 *       ...
 *     </Route>
 *   </Route>
 */
export default function ProtectedRoute() {
  const isLoggedIn    = useAuthStore(selectIsLoggedIn)
  const isInitialised = useAuthStore(selectIsInitialised)
  const location      = useLocation()

  // ── State 1: hydrating ─────────────────────────────────
  if (!isInitialised) {
    return (
      <div
        style={{
          minHeight:      '100vh',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'var(--color-base)',
          flexDirection:  'column',
          gap:            '1rem',
        }}
      >
        {/* Spinning ring — no component dependency at this stage */}
        <div
          style={{
            width:       44,
            height:      44,
            borderRadius: '50%',
            border:      '2px solid rgba(99, 102, 241, 0.15)',
            borderTopColor: 'var(--color-indigo)',
            animation:   'spin-slow 0.9s linear infinite',
          }}
        />
        <span
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize:   '0.8125rem',
            color:      'var(--color-text-muted)',
            letterSpacing: '0.02em',
          }}
        >
          Loading…
        </span>
      </div>
    )
  }

  // ── State 2: not authenticated ─────────────────────────
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // ── State 3: authenticated — render child route ────────
  return <Outlet />
}
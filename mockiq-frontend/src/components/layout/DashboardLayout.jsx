import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import useUiStore from '@/store/uiStore'

/**
 * DashboardLayout — authenticated app shell.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────┐
 *   │ Sidebar (fixed left)  │ Topbar (fixed top)  │
 *   │ 260px or 72px         ├─────────────────────│
 *   │                       │  <Outlet />          │
 *   │                       │  (scrollable)        │
 *   └───────────────────────┴─────────────────────┘
 *
 * Key fixes in F15:
 *   - Removed overflow:hidden from root (was clipping dropdowns/modals)
 *   - Motion.main marginLeft drives spacing; CSS overrides mobile cleanly
 *   - BackgroundGlow is pointer-events:none and overflow:hidden scoped
 *   - Close mobile sidebar on route change
 *   - Auto-collapse sidebar on screens < 768px
 */

const SIDEBAR_EXPANDED  = 260
const SIDEBAR_COLLAPSED = 72
const TOPBAR_HEIGHT     = 64

export default function DashboardLayout() {
  const collapsed          = useUiStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed= useUiStore((s) => s.setSidebarCollapsed)
  const closeMobileSidebar = useUiStore((s) => s.closeMobileSidebar)
  const location           = useLocation()

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  // Close mobile drawer on every route change
  useEffect(() => {
    closeMobileSidebar()
  }, [location.pathname, closeMobileSidebar])

  // Auto-collapse sidebar below md breakpoint
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [setSidebarCollapsed])

  return (
    <div
      style={{
        minHeight:   '100vh',
        background:  'var(--color-base)',
        color:       'var(--color-text-primary)',
        position:    'relative',
        // Do NOT set overflow:hidden here — it clips fixed children
        // and prevents modals/dropdowns from rendering correctly
      }}
    >
      {/* Ambient background glow — fixed, behind everything */}
      <BackgroundGlow />

      {/* Fixed sidebar */}
      <Sidebar />

      {/* Fixed topbar */}
      <Topbar />

      {/*
        Main content area.
        motion.animate drives the left margin in sync with sidebar width.
        The injected <style> tag handles the mobile override cleanly
        without fighting specificity wars.
      */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          minHeight:    '100vh',
          paddingTop:   TOPBAR_HEIGHT,
          position:     'relative',
          zIndex:       10,
          // Prevent horizontal overflow on any page
          overflowX:    'hidden',
        }}
      >
        <Outlet />
      </motion.main>

      {/* Mobile: override marginLeft to 0 (sidebar is a drawer overlay) */}
      <style>{`
        @media (max-width: 767px) {
          main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * BackgroundGlow — decorative ambient light blobs.
 * Fixed position, pointer-events: none, z-index: 0.
 * overflow:hidden scoped to THIS element only so it
 * doesn't affect the layout above.
 */
function BackgroundGlow() {
  return (
    <div
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        0,
        pointerEvents: 'none',
        overflow:      'hidden',  // clip glows inside this layer only
      }}
    >
      {/* Top-left indigo orb */}
      <div
        style={{
          position:     'absolute',
          top:          -160,
          left:         '20%',
          width:        480,
          height:       480,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.13) 0%, rgba(99,102,241,0.04) 40%, transparent 70%)',
          filter:       'blur(20px)',
        }}
      />

      {/* Bottom-right cyan orb */}
      <div
        style={{
          position:     'absolute',
          right:        -160,
          bottom:       '10%',
          width:        420,
          height:       420,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(34,211,238,0.09) 0%, rgba(34,211,238,0.03) 44%, transparent 72%)',
          filter:       'blur(24px)',
        }}
      />
    </div>
  )
}
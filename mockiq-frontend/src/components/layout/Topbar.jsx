import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, Bell, Sparkles } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import useUiStore from '@/store/uiStore'

/**
 * Topbar — the horizontal header bar above page content.
 *
 * Responsibilities:
 *   - Hamburger button (mobile only) → opens mobile sidebar drawer
 *   - Current page name (derived from route path)
 *   - Greeting message on dashboard
 *   - User avatar + name (right side)
 *   - AI badge — subtle "Powered by Gemini" indicator
 *
 * Position:
 *   Fixed to top, left offset matches sidebar width.
 *   Width and left position animate with sidebar collapse state.
 *
 * Props: none — reads everything from stores and router.
 */

/**
 * Map route paths to human-readable page titles.
 * Used to show the current section name in the topbar.
 */
const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/interviews': 'Mock Interviews',
  '/resume':     'Resume',
  '/skill-gap':  'Skill Gap Analysis',
  '/roadmap':    'Learning Roadmap',
  '/profile':    'Profile',
}

/**
 * getPageTitle — derive the page title from the current pathname.
 * Handles dynamic segments like /interviews/:id/session.
 */
function getPageTitle(pathname) {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]

  // Partial match for nested routes
  const base = '/' + pathname.split('/')[1]
  return PAGE_TITLES[base] ?? 'MockIQ'
}

/**
 * getGreeting — time-based greeting for the dashboard topbar.
 */
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Topbar() {
  const location           = useLocation()
  const { fullName, initials } = useAuth()
  const collapsed          = useUiStore((s) => s.sidebarCollapsed)
  const toggleMobileSidebar= useUiStore((s) => s.toggleMobileSidebar)

  const pageTitle    = getPageTitle(location.pathname)
  const isDashboard  = location.pathname === '/dashboard'

  // Sidebar width — matches Sidebar.jsx motion.aside animate values
  const sidebarWidth = collapsed ? 72 : 260

  return (
    <motion.header
      animate={{ left: sidebarWidth }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position:   'fixed',
        top:        0,
        right:      0,
        height:     64,
        zIndex:     30,
        display:    'flex',
        alignItems: 'center',
        padding:    '0 1.5rem',
        background: 'rgba(8,8,15,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >

      {/* ── Left side ──────────────────────────────────────── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.875rem',
          flex:       1,
          minWidth:   0,
        }}
      >

        {/* Hamburger — mobile only */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden"
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          36,
            height:         36,
            borderRadius:   '0.5rem',
            background:     'transparent',
            border:         '1px solid var(--color-border)',
            cursor:         'pointer',
            color:          'var(--color-text-secondary)',
            flexShrink:     0,
            transition:     'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background   = 'var(--color-surface-alt)'
            e.currentTarget.style.borderColor  = 'var(--color-border-alt)'
            e.currentTarget.style.color        = 'var(--color-text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background   = 'transparent'
            e.currentTarget.style.borderColor  = 'var(--color-border)'
            e.currentTarget.style.color        = 'var(--color-text-secondary)'
          }}
          aria-label="Open menu"
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        {/* Page title / greeting */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ minWidth: 0 }}
        >
          {isDashboard ? (
            // Dashboard shows personalised greeting
            <div>
              <p
                style={{
                  fontFamily:    'Syne, sans-serif',
                  fontSize:      '1rem',
                  fontWeight:    700,
                  color:         'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight:    1.2,
                  whiteSpace:    'nowrap',
                  overflow:      'hidden',
                  textOverflow:  'ellipsis',
                }}
              >
                {getGreeting()}, {fullName?.split(' ')[0] || 'there'} 👋
              </p>
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize:   '0.75rem',
                  color:      'var(--color-text-muted)',
                  lineHeight: 1,
                  marginTop:  '0.15rem',
                }}
              >
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month:   'long',
                  day:     'numeric',
                })}
              </p>
            </div>
          ) : (
            // All other pages show the section name
            <p
              style={{
                fontFamily:    'Syne, sans-serif',
                fontSize:      '1rem',
                fontWeight:    700,
                color:         'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                whiteSpace:    'nowrap',
                overflow:      'hidden',
                textOverflow:  'ellipsis',
              }}
            >
              {pageTitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Right side ─────────────────────────────────────── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.625rem',
          flexShrink: 0,
        }}
      >

        {/* AI badge — subtle Gemini indicator */}
        <div
          className="hidden sm:flex"
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '0.375rem',
            padding:      '0.3rem 0.625rem',
            borderRadius: '999px',
            background:   'rgba(99,102,241,0.08)',
            border:       '1px solid rgba(99,102,241,0.18)',
          }}
        >
          <Sparkles
            size={11}
            style={{
              color: 'var(--color-indigo-light)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily:    'DM Sans, sans-serif',
              fontSize:      '0.6875rem',
              fontWeight:    500,
              color:         'var(--color-indigo-light)',
              letterSpacing: '0.02em',
              whiteSpace:    'nowrap',
            }}
          >
            Powered by Gemini
          </span>
        </div>

        {/* Notification bell — placeholder for future */}
        <button
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          36,
            height:         36,
            borderRadius:   '0.5rem',
            background:     'transparent',
            border:         '1px solid var(--color-border)',
            cursor:         'pointer',
            color:          'var(--color-text-muted)',
            position:       'relative',
            transition:     'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background  = 'var(--color-surface-alt)'
            e.currentTarget.style.borderColor = 'var(--color-border-alt)'
            e.currentTarget.style.color       = 'var(--color-text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background  = 'transparent'
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.color       = 'var(--color-text-muted)'
          }}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={16} strokeWidth={1.8} />
        </button>

        {/* User avatar */}
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '0.5rem',
            padding:    '0.3rem 0.5rem 0.3rem 0.3rem',
            borderRadius: '2rem',
            background:   'var(--color-surface-alt)',
            border:       '1px solid var(--color-border)',
            cursor:       'default',
          }}
        >
          {/* Avatar circle */}
          <div
            style={{
              width:          30,
              height:         30,
              borderRadius:   '50%',
              background:     'linear-gradient(135deg, var(--color-indigo), var(--color-violet))',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       '0.6875rem',
              fontWeight:     700,
              color:          '#fff',
              fontFamily:     'Syne, sans-serif',
              letterSpacing:  '0.02em',
              flexShrink:     0,
            }}
          >
            {initials}
          </div>

          {/* Name — hidden on small screens */}
          <span
            className="hidden sm:block"
            style={{
              fontFamily:  'DM Sans, sans-serif',
              fontSize:    '0.8125rem',
              fontWeight:  500,
              color:       'var(--color-text-primary)',
              whiteSpace:  'nowrap',
              paddingRight: '0.125rem',
            }}
          >
            {fullName?.split(' ')[0] || 'User'}
          </span>
        </div>

      </div>
    </motion.header>
  )
}
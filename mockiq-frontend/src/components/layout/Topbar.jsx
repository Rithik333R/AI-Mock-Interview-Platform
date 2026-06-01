import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, Bell, Sparkles } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import useUiStore from '@/store/uiStore'

/**
 * Topbar — fixed horizontal header above all page content.
 *
 * F15 mobile fixes:
 *   - On mobile (< 768px): left is always 0, no animation
 *   - On desktop (>= 768px): left animates with sidebar width
 *   - Removed Bell icon on mobile to prevent overflow
 *   - Gemini badge hidden below sm (was causing overflow)
 *   - Avatar pill shrinks on mobile (no name, icon only)
 *   - Added maxWidth: 100vw safety guard
 */

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/interviews': 'Mock Interviews',
  '/resume':     'Resume',
  '/skill-gap':  'Skill Gap Analysis',
  '/roadmap':    'Learning Roadmap',
  '/profile':    'Profile',
}

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const base = '/' + pathname.split('/')[1]
  return PAGE_TITLES[base] ?? 'MockIQ'
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Topbar() {
  const location            = useLocation()
  const { fullName, initials } = useAuth()
  const collapsed           = useUiStore((s) => s.sidebarCollapsed)
  const toggleMobileSidebar = useUiStore((s) => s.toggleMobileSidebar)

  const pageTitle   = getPageTitle(location.pathname)
  const isDashboard = location.pathname === '/dashboard'

  // Desktop sidebar widths
  const SIDEBAR_EXPANDED  = 260
  const SIDEBAR_COLLAPSED = 72
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  // On mobile the sidebar is a drawer overlay — topbar spans full width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <motion.header
      // Mobile: always left:0, no animation
      // Desktop: animate left to match sidebar width
      animate={{ left: isMobile ? 0 : sidebarWidth }}
      initial={{ left: isMobile ? 0 : sidebarWidth }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position:             'fixed',
        top:                  0,
        right:                0,
        height:               64,
        zIndex:               30,
        display:              'flex',
        alignItems:           'center',
        padding:              '0 1rem',
        background:           'rgba(8,8,15,0.90)',
        backdropFilter:       'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom:         '1px solid var(--color-border)',
        // Prevent topbar from ever exceeding viewport width
        maxWidth:             '100vw',
        overflow:             'hidden',
      }}
    >

      {/* ── Left side ──────────────────────────────────────── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.75rem',
          flex:       1,
          minWidth:   0,
          overflow:   'hidden',
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
            minWidth:       36,   // prevent shrink
            borderRadius:   '0.5rem',
            background:     'transparent',
            border:         '1px solid var(--color-border)',
            cursor:         'pointer',
            color:          'var(--color-text-secondary)',
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
            e.currentTarget.style.color       = 'var(--color-text-secondary)'
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
          style={{
            minWidth:  0,
            overflow:  'hidden',
          }}
        >
          {isDashboard ? (
            <div>
              <p
                style={{
                  fontFamily:   'Syne, sans-serif',
                  fontSize:     '0.9375rem',
                  fontWeight:   700,
                  color:        'var(--color-text-primary)',
                  letterSpacing:'-0.02em',
                  lineHeight:   1.2,
                  whiteSpace:   'nowrap',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {getGreeting()}, {fullName?.split(' ')[0] || 'there'} 👋
              </p>
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize:   '0.6875rem',
                  color:      'var(--color-text-muted)',
                  lineHeight: 1,
                  marginTop:  '0.15rem',
                  whiteSpace: 'nowrap',
                  overflow:   'hidden',
                  textOverflow: 'ellipsis',
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
            <p
              style={{
                fontFamily:   'Syne, sans-serif',
                fontSize:     '0.9375rem',
                fontWeight:   700,
                color:        'var(--color-text-primary)',
                letterSpacing:'-0.02em',
                whiteSpace:   'nowrap',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
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
          gap:        '0.5rem',
          flexShrink: 0,
        }}
      >
        {/* Gemini badge — hidden on mobile, visible sm+ */}
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
            whiteSpace:   'nowrap',
          }}
        >
          <Sparkles size={11} style={{ color: 'var(--color-indigo-light)', flexShrink: 0 }} />
          <span
            style={{
              fontFamily:    'DM Sans, sans-serif',
              fontSize:      '0.6875rem',
              fontWeight:    500,
              color:         'var(--color-indigo-light)',
              letterSpacing: '0.02em',
            }}
          >
            Powered by Gemini
          </span>
        </div>

        {/* Bell — hidden on mobile to save space */}
        <button
          className="hidden sm:flex"
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
        >
          <Bell size={16} strokeWidth={1.8} />
        </button>

        {/* User avatar pill */}
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '0.375rem',
            padding:      '0.25rem 0.5rem 0.25rem 0.25rem',
            borderRadius: '2rem',
            background:   'var(--color-surface-alt)',
            border:       '1px solid var(--color-border)',
            flexShrink:   0,
          }}
        >
          {/* Avatar circle */}
          <div
            style={{
              width:          30,
              height:         30,
              minWidth:       30,
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
            }}
          >
            {initials}
          </div>

          {/* Name — hidden on mobile */}
          <span
            className="hidden sm:block"
            style={{
              fontFamily:   'DM Sans, sans-serif',
              fontSize:     '0.8125rem',
              fontWeight:   500,
              color:        'var(--color-text-primary)',
              whiteSpace:   'nowrap',
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
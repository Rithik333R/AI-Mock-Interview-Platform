import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  TrendingUp,
  Map,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import useUiStore, {
  selectSidebarCollapsed,
  selectMobileSidebarOpen,
} from '@/store/uiStore'

/**
 * Sidebar — the primary navigation shell.
 *
 * Desktop behaviour:
 *   Expanded  → 260px wide, icon + label visible
 *   Collapsed → 72px wide,  icon only, label hidden
 *   Toggle button sits at the bottom
 *
 * Mobile behaviour:
 *   Hidden by default
 *   Slides in as a full-height drawer when mobileSidebarOpen = true
 *   Backdrop overlay closes it on click
 *
 * Active nav item:
 *   NavLink applies 'active' class automatically when route matches.
 *   We use that class to apply the indigo accent + glow background.
 *
 * Animations:
 *   Width transition    → Framer Motion layout animation
 *   Label fade          → opacity + x translate on collapse
 *   Mobile drawer       → x slide from left
 *   Active indicator    → layoutId shared element transition
 */

const NAV_ITEMS = [
  { label: 'Dashboard',  path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Interviews', path: '/interviews', icon: MessageSquare   },
  { label: 'Resume',     path: '/resume',     icon: FileText        },
  { label: 'Skill Gap',  path: '/skill-gap',  icon: TrendingUp      },
  { label: 'Roadmap',    path: '/roadmap',    icon: Map             },
  { label: 'Profile',    path: '/profile',    icon: User            },
]

export default function Sidebar() {
  const collapsed         = useUiStore(selectSidebarCollapsed)
  const mobileSidebarOpen = useUiStore(selectMobileSidebarOpen)
  const toggleSidebar     = useUiStore((s) => s.toggleSidebar)
  const closeMobileSidebar= useUiStore((s) => s.closeMobileSidebar)
  const { initials, fullName, email, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // ── Shared sidebar content ───────────────────────────────
  // Used by both desktop and mobile renderers
  const SidebarContent = ({ isMobile = false }) => (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        height:         '100%',
        padding:        '1rem 0',
        overflow:       'hidden',
      }}
    >

      {/* ── Logo / Wordmark ───────────────────────────────── */}
      <div
        style={{
          padding:      collapsed && !isMobile ? '0 0 1.5rem' : '0 1rem 1.5rem',
          display:      'flex',
          alignItems:   'center',
          gap:          '0.625rem',
          overflow:     'hidden',
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width:          32,
            height:         32,
            borderRadius:   '8px',
            background:     'linear-gradient(135deg, var(--color-indigo), var(--color-cyan))',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            boxShadow:      '0 0 16px rgba(99,102,241,0.4)',
          }}
        >
          <Sparkles size={16} color="#fff" />
        </div>

        {/* Wordmark — hidden when collapsed on desktop */}
        <AnimatePresence initial={false}>
          {(!collapsed || isMobile) && (
            <motion.span
              key="wordmark"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x:  0 }}
              exit={{    opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{
                fontFamily:    'Syne, sans-serif',
                fontSize:      '1.125rem',
                fontWeight:    800,
                letterSpacing: '-0.03em',
                background:    'linear-gradient(135deg, var(--color-indigo-light), var(--color-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                whiteSpace:    'nowrap',
                lineHeight:    1,
              }}
            >
              MockIQ
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Divider ───────────────────────────────────────── */}
      <div className="divider" style={{ marginBottom: '0.75rem' }} />

      {/* ── Nav items ─────────────────────────────────────── */}
      <nav
        style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          gap:           '0.25rem',
          padding:       '0 0.625rem',
          overflowY:     'auto',
          overflowX:     'hidden',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed && !isMobile}
            onClick={isMobile ? closeMobileSidebar : undefined}
          />
        ))}
      </nav>

      {/* ── Divider ───────────────────────────────────────── */}
      <div className="divider" style={{ margin: '0.75rem 0' }} />

      {/* ── User block ────────────────────────────────────── */}
      <div
        style={{
          padding:  '0 0.625rem',
          display:  'flex',
          flexDirection: 'column',
          gap:      '0.25rem',
        }}
      >
        {/* User avatar row */}
        <div
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '0.625rem',
            padding:     collapsed && !isMobile ? '0.5rem' : '0.5rem 0.625rem',
            borderRadius: '0.625rem',
            overflow:    'hidden',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          }}
        >
          {/* Avatar circle */}
          <div
            style={{
              width:          34,
              height:         34,
              borderRadius:   '50%',
              background:     'linear-gradient(135deg, var(--color-indigo), var(--color-violet))',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
              fontSize:       '0.75rem',
              fontWeight:     700,
              color:          '#fff',
              fontFamily:     'Syne, sans-serif',
              letterSpacing:  '0.02em',
            }}
          >
            {initials}
          </div>

          {/* Name + email — hidden when collapsed */}
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x:  0 }}
                exit={{    opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden', minWidth: 0 }}
              >
                <p
                  style={{
                    fontFamily:   'DM Sans, sans-serif',
                    fontSize:     '0.8125rem',
                    fontWeight:   600,
                    color:        'var(--color-text-primary)',
                    whiteSpace:   'nowrap',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight:   1.2,
                  }}
                >
                  {fullName || 'User'}
                </p>
                <p
                  style={{
                    fontFamily:   'DM Sans, sans-serif',
                    fontSize:     '0.6875rem',
                    color:        'var(--color-text-muted)',
                    whiteSpace:   'nowrap',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight:   1.2,
                    marginTop:    '0.1rem',
                  }}
                >
                  {email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            '0.625rem',
            padding:        collapsed && !isMobile ? '0.5rem' : '0.5rem 0.625rem',
            borderRadius:   '0.625rem',
            background:     'transparent',
            border:         'none',
            cursor:         'pointer',
            color:          'var(--color-text-muted)',
            width:          '100%',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            transition:     'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            e.currentTarget.style.color      = 'var(--color-error)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color      = 'var(--color-text-muted)'
          }}
          title="Logout"
        >
          <LogOut size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x:  0 }}
                exit={{    opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize:   '0.875rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Collapse toggle (desktop only) ────────────────── */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0.75rem 0.625rem 0',
            padding:        '0.5rem',
            borderRadius:   '0.625rem',
            background:     'var(--color-surface-alt)',
            border:         '1px solid var(--color-border)',
            cursor:         'pointer',
            color:          'var(--color-text-muted)',
            transition:     'all 0.15s ease',
            width:          collapsed ? '40px' : '100%',
            alignSelf:      collapsed ? 'center' : 'stretch',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-alt)'
            e.currentTarget.style.color       = 'var(--color-text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.color       = 'var(--color-text-muted)'
          }}
        >
          {collapsed
            ? <ChevronRight size={15} strokeWidth={2} />
            : <ChevronLeft  size={15} strokeWidth={2} />
          }
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x:  0 }}
                exit={{    opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize:   '0.8125rem',
                  fontWeight: 500,
                  marginLeft: '0.375rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}

    </div>
  )

  return (
    <>
      {/* ══ DESKTOP SIDEBAR ════════════════════════════════ */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          height:          '100vh',
          background:      'var(--color-surface)',
          borderRight:     '1px solid var(--color-border)',
          zIndex:          40,
          overflow:        'hidden',
          display:         'flex',
          flexDirection:   'column',
          // Hidden on mobile — shown on md+
          display:         window.innerWidth < 768 ? 'none' : 'flex',
        }}
        className="hidden md:flex"
      >
        <SidebarContent isMobile={false} />
      </motion.aside>

      {/* ══ MOBILE DRAWER ══════════════════════════════════ */}

      {/* Backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileSidebar}
            style={{
              position:   'fixed',
              inset:      0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex:     50,
            }}
            className="md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Drawer panel */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0    }}
            exit={{    x: -280 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position:      'fixed',
              top:           0,
              left:          0,
              height:        '100vh',
              width:         260,
              background:    'var(--color-surface)',
              borderRight:   '1px solid var(--color-border)',
              zIndex:        60,
              display:       'flex',
              flexDirection: 'column',
            }}
            className="md:hidden"
          >
            <SidebarContent isMobile={true} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * NavItem — individual navigation link.
 *
 * Uses React Router's NavLink which automatically applies
 * the 'active' class when the current route matches.
 * We use that to drive the active indicator styles.
 */
function NavItem({ item, collapsed, onClick }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      {({ isActive }) => (
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            '0.625rem',
            padding:        '0.5625rem 0.75rem',
            borderRadius:   '0.625rem',
            cursor:         'pointer',
            position:       'relative',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: isActive
              ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.06))'
              : 'transparent',
            border: isActive
              ? '1px solid rgba(99,102,241,0.20)'
              : '1px solid transparent',
            transition: 'all 0.15s ease',
            boxShadow: isActive
              ? '0 0 16px rgba(99,102,241,0.08)'
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
              e.currentTarget.style.border     = '1px solid var(--color-border)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.border     = '1px solid transparent'
            }
          }}
        >
          {/* Active left accent bar */}
          {isActive && (
            <motion.div
              layoutId="nav-active-bar"
              style={{
                position:     'absolute',
                left:         0,
                top:          '20%',
                bottom:       '20%',
                width:        3,
                borderRadius: '0 2px 2px 0',
                background:   'linear-gradient(180deg, var(--color-indigo), var(--color-cyan))',
                boxShadow:    '0 0 8px var(--color-indigo)',
              }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            />
          )}

          {/* Icon */}
          <Icon
            size={18}
            strokeWidth={isActive ? 2.2 : 1.8}
            style={{
              flexShrink: 0,
              color: isActive
                ? 'var(--color-indigo-light)'
                : 'var(--color-text-muted)',
              transition: 'color 0.15s ease',
            }}
          />

          {/* Label — hidden when collapsed */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key={`label-${item.path}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x:  0 }}
                exit={{    opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  fontFamily:  'DM Sans, sans-serif',
                  fontSize:    '0.9rem',
                  fontWeight:  isActive ? 600 : 500,
                  color: isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                  whiteSpace:  'nowrap',
                  lineHeight:  1,
                  transition:  'color 0.15s ease',
                }}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
    </NavLink>
  )
}
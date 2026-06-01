import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquare,
  Sparkles,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import useUiStore, {
  selectMobileSidebarOpen,
  selectSidebarCollapsed,
} from '@/store/uiStore'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Interviews', path: '/interviews', icon: MessageSquare },
  { label: 'Resume', path: '/resume', icon: FileText },
  { label: 'Skill Gap', path: '/skill-gap', icon: TrendingUp },
  { label: 'Roadmap', path: '/roadmap', icon: Map },
  { label: 'Profile', path: '/profile', icon: User },
]

export default function Sidebar() {
  const collapsed = useUiStore(selectSidebarCollapsed)
  const mobileSidebarOpen = useUiStore(selectMobileSidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar)

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 z-40 hidden h-screen overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex"
      >
        <SidebarContent
          collapsed={collapsed}
          isMobile={false}
          onToggleSidebar={toggleSidebar}
        />
      </motion.aside>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              key="mobile-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              key="mobile-sidebar-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 z-[60] h-screen overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_80px_rgba(0,0,0,0.55)] md:hidden"
              style={{
                width: 'min(84vw, 320px)',
              }}
            >
              <SidebarContent
                collapsed={false}
                isMobile
                onCloseMobile={closeMobileSidebar}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function SidebarContent({
  collapsed,
  isMobile,
  onToggleSidebar,
  onCloseMobile,
}) {
  const navigate = useNavigate()
  const { initials, fullName, email, logout } = useAuth()

  const compact = collapsed && !isMobile

  const handleLogout = () => {
    logout()
    onCloseMobile?.()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex h-20 shrink-0 items-center justify-between px-5">
        <div
          className="flex min-w-0 items-center gap-3"
          style={{ justifyContent: compact ? 'center' : 'flex-start' }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background:
                'linear-gradient(135deg, var(--color-indigo), var(--color-cyan))',
              boxShadow: '0 0 18px rgba(99,102,241,0.35)',
            }}
          >
            <Sparkles size={20} color="#fff" strokeWidth={2} />
          </div>

          <AnimatePresence initial={false}>
            {!compact && (
              <motion.span
                key="sidebar-wordmark"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="truncate font-display text-[1.35rem] font-extrabold tracking-tight"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-indigo-light), var(--color-cyan))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                MockIQ
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-alt)] hover:text-[var(--color-text-primary)]"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="divider" />

      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-4 py-5">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            compact={compact}
            onClick={onCloseMobile}
          />
        ))}
      </nav>

      <div className="divider" />

      <div className="shrink-0 space-y-3 p-4">
        <div
          className="flex items-center gap-3 rounded-2xl px-3 py-3"
          style={{
            justifyContent: compact ? 'center' : 'flex-start',
            background: compact ? 'transparent' : 'rgba(99,102,241,0.035)',
          }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
            style={{
              background:
                'linear-gradient(135deg, var(--color-indigo), var(--color-violet))',
            }}
          >
            {initials}
          </div>

          <AnimatePresence initial={false}>
            {!compact && (
              <motion.div
                key="sidebar-user-info"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="min-w-0"
              >
                <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                  {fullName || 'User'}
                </p>
                <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                  {email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-all hover:bg-[rgba(239,68,68,0.08)] hover:text-[var(--color-error)]"
          style={{ justifyContent: compact ? 'center' : 'flex-start' }}
          title="Log out"
        >
          <LogOut size={18} strokeWidth={1.9} className="shrink-0" />

          <AnimatePresence initial={false}>
            {!compact && (
              <motion.span
                key="sidebar-logout-label"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="whitespace-nowrap"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {!isMobile && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-all hover:border-[var(--color-border-alt)] hover:text-[var(--color-text-primary)]"
            title={compact ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {compact ? (
              <ChevronRight size={18} strokeWidth={2} />
            ) : (
              <>
                <ChevronLeft size={18} strokeWidth={2} />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function SidebarNavItem({ item, compact, onClick }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      title={compact ? item.label : undefined}
      className="block no-underline"
    >
      {({ isActive }) => (
        <div
          className="relative flex min-h-12 items-center gap-4 rounded-2xl border px-4 py-3 transition-all active:scale-[0.99]"
          style={{
            justifyContent: compact ? 'center' : 'flex-start',
            background: isActive
              ? 'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(34,211,238,0.06))'
              : 'transparent',
            borderColor: isActive
              ? 'rgba(99,102,241,0.24)'
              : 'transparent',
            boxShadow: isActive
              ? '0 0 18px rgba(99,102,241,0.08)'
              : 'none',
          }}
        >
          {isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full"
              style={{
                background:
                  'linear-gradient(180deg, var(--color-indigo), var(--color-cyan))',
                boxShadow: '0 0 10px var(--color-indigo)',
              }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            />
          )}

          <Icon
            size={21}
            strokeWidth={isActive ? 2.2 : 1.8}
            className="shrink-0"
            style={{
              color: isActive
                ? 'var(--color-indigo-light)'
                : 'var(--color-text-muted)',
            }}
          />

          <AnimatePresence initial={false}>
            {!compact && (
              <motion.span
                key={`nav-label-${item.path}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="truncate text-[1rem] font-semibold"
                style={{
                  color: isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
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
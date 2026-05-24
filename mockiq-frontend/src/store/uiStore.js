import { create } from 'zustand'

/**
 * uiStore — global UI state.
 *
 * State:
 *   sidebarCollapsed → whether the sidebar is in icon-only mode
 *   mobileSidebarOpen → whether the mobile drawer is open
 *
 * Actions:
 *   toggleSidebar()        → flip collapsed state (desktop)
 *   setSidebarCollapsed()  → set explicitly (e.g. on window resize)
 *   openMobileSidebar()    → open mobile drawer
 *   closeMobileSidebar()   → close mobile drawer
 *   toggleMobileSidebar()  → flip mobile drawer
 *
 * Persistence:
 *   sidebarCollapsed is persisted to localStorage so the user's
 *   preference is remembered across sessions.
 */

const SIDEBAR_KEY = 'mockiq_sidebar_collapsed'

const useUiStore = create((set) => ({

  // ── State ────────────────────────────────────────────────
  sidebarCollapsed:  localStorage.getItem(SIDEBAR_KEY) === 'true',
  mobileSidebarOpen: false,

  // ── Actions ──────────────────────────────────────────────

  /**
   * toggleSidebar — flip the desktop sidebar between
   * expanded (260px) and collapsed (72px — icons only).
   * Persists preference to localStorage.
   */
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return { sidebarCollapsed: next }
    }),

  /**
   * setSidebarCollapsed — set explicitly.
   * Used when viewport drops below md breakpoint to
   * auto-collapse the sidebar.
   */
  setSidebarCollapsed: (value) => {
    localStorage.setItem(SIDEBAR_KEY, String(value))
    set({ sidebarCollapsed: value })
  },

  /** openMobileSidebar — show the mobile drawer overlay */
  openMobileSidebar:  () => set({ mobileSidebarOpen: true  }),

  /** closeMobileSidebar — hide the mobile drawer overlay */
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

  /** toggleMobileSidebar — flip mobile drawer */
  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

}))

// ── Selectors ────────────────────────────────────────────────
export const selectSidebarCollapsed  = (s) => s.sidebarCollapsed
export const selectMobileSidebarOpen = (s) => s.mobileSidebarOpen

export default useUiStore
/**
 * constants.js — Application-wide constants.
 *
 * All magic strings, config values, and enums in one place.
 * Import from here rather than hardcoding values in components.
 */

/* ── API ────────────────────────────────────────────── */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const API_TIMEOUT  = 120_000   // 30 seconds

/* ── Auth ───────────────────────────────────────────── */
export const TOKEN_KEY        = 'mockiq_access_token'
export const USER_KEY         = 'mockiq_user'
export const TOKEN_EXPIRY_KEY = 'mockiq_token_expiry'

/* ── Interview ──────────────────────────────────────── */
export const DIFFICULTY = {
  EASY:   'EASY',
  MEDIUM: 'MEDIUM',
  HARD:   'HARD',
}

export const DIFFICULTY_LABELS = {
  EASY:   'Easy',
  MEDIUM: 'Medium',
  HARD:   'Hard',
}

export const DIFFICULTY_COLORS = {
  EASY:   'var(--color-success)',
  MEDIUM: 'var(--color-warning)',
  HARD:   'var(--color-error)',
}

export const INTERVIEW_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED:   'COMPLETED',
}

/* ── Question categories ────────────────────────────── */
export const QUESTION_CATEGORY = {
  TECHNICAL:    'TECHNICAL',
  BEHAVIOURAL:  'BEHAVIOURAL',
  SITUATIONAL:  'SITUATIONAL',
  HR:           'HR',
}

export const CATEGORY_COLORS = {
  TECHNICAL:   'var(--color-indigo)',
  BEHAVIOURAL: 'var(--color-cyan)',
  SITUATIONAL: 'var(--color-violet-light)',
  HR:          'var(--color-warning)',
}

/* ── Trend directions ───────────────────────────────── */
export const TREND = {
  IMPROVING:         'IMPROVING',
  DECLINING:         'DECLINING',
  STABLE:            'STABLE',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
}

/* ── User roles ─────────────────────────────────────── */
export const ROLE = {
  USER:  'USER',
  ADMIN: 'ADMIN',
}

/* ── Pagination ─────────────────────────────────────── */
export const DEFAULT_PAGE_SIZE = 10

/* ── File upload ────────────────────────────────────── */
export const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
export const MAX_RESUME_SIZE_MB = 10
export const MAX_RESUME_SIZE_BYTES = MAX_RESUME_SIZE_MB * 1024 * 1024

/* ── Animation presets (for Framer Motion) ──────────── */
export const MOTION = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },

  slideUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0  },
    exit:    { opacity: 0, y: 8  },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },

  slideLeft: {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0   },
    exit:    { opacity: 0, x: -8  },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1    },
    exit:    { opacity: 0, scale: 0.97 },
    transition: { duration: 0.25, ease: [0.175, 0.885, 0.32, 1.275] },
  },

  staggerContainer: {
    animate: { transition: { staggerChildren: 0.06 } },
  },

  staggerItem: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0  },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
}

/* ── Nav items ──────────────────────────────────────── */
// Will be used by the Sidebar component in Phase F2
export const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/dashboard',  icon: 'LayoutDashboard' },
  { label: 'Interviews',  path: '/interviews', icon: 'MessageSquare'   },
  { label: 'Resume',      path: '/resume',     icon: 'FileText'        },
  { label: 'Skill Gap',   path: '/skill-gap',  icon: 'TrendingUp'      },
  { label: 'Roadmap',     path: '/roadmap',    icon: 'Map'             },
]
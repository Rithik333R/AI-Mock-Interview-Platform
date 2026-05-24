/**
 * formatters.js — Data formatting utilities.
 *
 * Pure functions — no side effects, no imports.
 * Used across pages and components to display data consistently.
 */

/**
 * Format a score (0–10 scale) as a display string with color class.
 * @param {number} score - Score between 0 and 10
 * @returns {{ label: string, color: string }}
 */
export function formatScore(score) {
  if (score == null) return { label: '—', color: 'var(--color-text-muted)' }
  const n = Number(score)
  if (n >= 8.5)  return { label: n.toFixed(1), color: 'var(--color-success)' }
  if (n >= 6.5)  return { label: n.toFixed(1), color: 'var(--color-cyan)' }
  if (n >= 4.5)  return { label: n.toFixed(1), color: 'var(--color-warning)' }
  return           { label: n.toFixed(1), color: 'var(--color-error)' }
}

/**
 * Format an ATS score (0–100) with color.
 * @param {number} score
 * @returns {{ label: string, color: string }}
 */
export function formatAtsScore(score) {
  if (score == null) return { label: '—', color: 'var(--color-text-muted)' }
  const n = Number(score)
  if (n >= 80) return { label: `${n}%`, color: 'var(--color-success)' }
  if (n >= 60) return { label: `${n}%`, color: 'var(--color-cyan)' }
  if (n >= 40) return { label: `${n}%`, color: 'var(--color-warning)' }
  return         { label: `${n}%`, color: 'var(--color-error)' }
}

/**
 * Format a LocalDateTime string from the backend.
 * @param {string} dateString - ISO datetime string
 * @param {'short'|'long'|'relative'} format
 * @returns {string}
 */
export function formatDate(dateString, format = 'short') {
  if (!dateString) return '—'
  const date = new Date(dateString)

  if (format === 'relative') return formatRelative(date)

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // short (default)
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

/**
 * Format as relative time: "2 hours ago", "3 days ago"
 * @param {Date} date
 * @returns {string}
 */
function formatRelative(date) {
  const now   = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr  = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr  / 24)

  if (diffSec < 60)   return 'just now'
  if (diffMin < 60)   return `${diffMin}m ago`
  if (diffHr  < 24)   return `${diffHr}h ago`
  if (diffDay < 7)    return `${diffDay}d ago`
  if (diffDay < 30)   return `${Math.floor(diffDay / 7)}w ago`
  return formatDate(date.toISOString(), 'short')
}

/**
 * Truncate a string to a maximum length.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 80) {
  if (!str) return ''
  return str.length <= maxLength ? str : `${str.slice(0, maxLength)}…`
}

/**
 * Capitalise first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalise(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format a file size in bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

/**
 * Format a percentage with 1 decimal place.
 * @param {number} value - 0 to 100
 * @returns {string}
 */
export function formatPercent(value) {
  if (value == null) return '0%'
  return `${Number(value).toFixed(1)}%`
}

/**
 * Get initials from a full name (max 2 chars).
 * @param {string} fullName
 * @returns {string}
 */
export function getInitials(fullName) {
  if (!fullName) return '?'
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('')
}
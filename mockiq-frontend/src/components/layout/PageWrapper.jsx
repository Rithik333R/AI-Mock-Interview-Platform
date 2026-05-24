import { motion } from 'framer-motion'

/**
 * PageWrapper — wraps every protected page with:
 *   1. Framer Motion entry animation (slide up + fade in)
 *   2. Consistent padding and max-width
 *   3. Optional page title + subtitle header block
 *
 * Every page inside DashboardLayout uses this as its root element.
 * This gives all pages the same entry animation and spacing rhythm
 * without repeating motion config in each page file.
 *
 * Usage — basic:
 *   <PageWrapper>
 *     <YourContent />
 *   </PageWrapper>
 *
 * Usage — with header:
 *   <PageWrapper
 *     title="Resume"
 *     subtitle="Upload and manage your resumes"
 *     action={<Button>Upload</Button>}
 *   >
 *     <YourContent />
 *   </PageWrapper>
 *
 * Props:
 *   title      → page heading (Syne font, large)
 *   subtitle   → muted description below the title
 *   action     → optional JSX rendered top-right (e.g. a button)
 *   children   → page content
 *   className  → additional classes on the content area
 *   noPadding  → skip default padding (for full-bleed layouts)
 */
export default function PageWrapper({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{    opacity: 0, y: 6  }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],   // ease-out-expo — snappy but smooth
      }}
      style={{ width: '100%', minHeight: '100%' }}
    >
      <div
        className={noPadding ? className : `p-6 md:p-8 ${className}`}
        style={{ width: '100%' }}
      >

        {/* ── Page header ──────────────────────────────────
            Rendered only when title is provided.
            action slot sits top-right for primary CTAs.
            ─────────────────────────────────────────────── */}
        {title && (
          <div
            style={{
              display:        'flex',
              alignItems:     'flex-start',
              justifyContent: 'space-between',
              gap:            '1rem',
              marginBottom:   '2rem',
              flexWrap:       'wrap',
            }}
          >
            {/* Title + subtitle */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0  }}
              transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1
                style={{
                  fontFamily:    'Syne, sans-serif',
                  fontSize:      '1.625rem',
                  fontWeight:    700,
                  letterSpacing: '-0.025em',
                  color:         'var(--color-text-primary)',
                  lineHeight:    1.2,
                  marginBottom:  subtitle ? '0.375rem' : 0,
                }}
              >
                {title}
              </h1>

              {subtitle && (
                <p
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize:   '0.9375rem',
                    color:      'var(--color-text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </motion.div>

            {/* Action slot */}
            {action && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                style={{ flexShrink: 0 }}
              >
                {action}
              </motion.div>
            )}
          </div>
        )}

        {/* ── Page content ─────────────────────────────────
            Staggered entry — appears slightly after header
            to create a cascading reveal effect.
            ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {children}
        </motion.div>

      </div>
    </motion.div>
  )
}
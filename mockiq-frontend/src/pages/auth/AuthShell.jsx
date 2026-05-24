import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-base)] px-4 py-10">
      <AuthBackground />

      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(99,102,241,0.26)] bg-[rgba(99,102,241,0.12)]"
            style={{
              boxShadow: '0 0 34px rgba(99,102,241,0.22)',
            }}
          >
            <Sparkles
              size={22}
              className="text-[var(--color-indigo-light)]"
              strokeWidth={2}
            />
          </div>

          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cyan)]">
              {eyebrow}
            </p>
          )}

          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="glass rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          {children}
        </div>

        {footerText && footerLinkText && footerLinkTo && (
          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            {footerText}{' '}
            <Link
              to={footerLinkTo}
              className="font-semibold text-[var(--color-indigo-light)] transition-colors hover:text-[var(--color-cyan)]"
            >
              {footerLinkText}
            </Link>
          </p>
        )}
      </motion.section>
    </main>
  )
}

function AuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(34,211,238,0.08) 38%, transparent 70%)',
          filter: 'blur(22px)',
        }}
      />

      <div
        className="absolute bottom-[-240px] right-[-160px] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(34,211,238,0.12) 0%, rgba(99,102,241,0.05) 42%, transparent 72%)',
          filter: 'blur(28px)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,8,15,0.22) 0%, rgba(8,8,15,0.88) 100%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.16) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(circle at center, black 0%, transparent 72%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 0%, transparent 72%)',
        }}
      />
    </div>
  )
}
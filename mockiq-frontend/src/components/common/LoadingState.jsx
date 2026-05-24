import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function LoadingState({
  title = 'Loading',
  description = 'Preparing your workspace...',
  fullScreen = false,
}) {
  return (
    <div
      className={
        fullScreen
          ? 'flex min-h-screen items-center justify-center bg-[var(--color-base)]'
          : 'flex min-h-[320px] items-center justify-center'
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center"
      >
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(99,102,241,0.22)] bg-[rgba(99,102,241,0.10)]"
          style={{
            boxShadow: '0 0 28px rgba(99,102,241,0.14)',
          }}
        >
          <Loader2
            size={24}
            className="animate-spin text-[var(--color-indigo-light)]"
            strokeWidth={2}
          />
        </div>

        <h2 className="font-display text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </motion.div>
    </div>
  )
}
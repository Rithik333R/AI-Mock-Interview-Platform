import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[rgba(13,13,26,0.48)] p-8 text-center"
    >
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(99,102,241,0.22)] bg-[rgba(99,102,241,0.10)]"
        style={{
          boxShadow: '0 0 28px rgba(99,102,241,0.14)',
        }}
      >
        <Icon size={24} className="text-[var(--color-indigo-light)]" />
      </div>

      <h2 className="font-display text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          className="mt-6"
          icon={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
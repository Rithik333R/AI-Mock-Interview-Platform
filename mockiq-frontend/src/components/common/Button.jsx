import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const VARIANTS = {
  primary:
    'border-transparent text-white shadow-[0_0_24px_rgba(99,102,241,0.22)]',
  secondary:
    'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] hover:border-[var(--color-border-alt)] hover:bg-[var(--color-surface-high)]',
  ghost:
    'border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[rgba(99,102,241,0.08)] hover:text-[var(--color-text-primary)]',
  danger:
    'border-transparent bg-[rgba(239,68,68,0.12)] text-[var(--color-error)] hover:bg-[rgba(239,68,68,0.18)]',
}

const SIZES = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'h-10 w-10 p-0',
}

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading
  const showIcon = Icon && !loading

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      whileHover={isDisabled ? undefined : { y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-lg border font-body font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-indigo)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-base)]',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55',
        VARIANTS[variant],
        SIZES[size],
        variant === 'primary' &&
          'bg-[linear-gradient(135deg,var(--color-indigo),var(--color-violet))] hover:shadow-[0_0_34px_rgba(99,102,241,0.34)]',
        className
      )}
      {...props}
    >
      {variant === 'primary' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 hover:opacity-100"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.16), transparent 42%)',
          }}
        />
      )}

      {loading && (
        <Loader2
          size={16}
          className="relative z-10 animate-spin"
          strokeWidth={2}
        />
      )}

      {showIcon && iconPosition === 'left' && (
        <Icon size={16} className="relative z-10" strokeWidth={2} />
      )}

      {children && (
        <span className="relative z-10 whitespace-nowrap">{children}</span>
      )}

      {showIcon && iconPosition === 'right' && (
        <Icon size={16} className="relative z-10" strokeWidth={2} />
      )}
    </motion.button>
  )
}
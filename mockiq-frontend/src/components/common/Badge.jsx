import { cn } from '@/utils/cn'

const VARIANTS = {
  default:
    'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]',
  indigo:
    'border-[rgba(99,102,241,0.24)] bg-[rgba(99,102,241,0.10)] text-[var(--color-indigo-light)]',
  cyan:
    'border-[rgba(34,211,238,0.22)] bg-[rgba(34,211,238,0.08)] text-[var(--color-cyan-light)]',
  success:
    'border-[rgba(16,185,129,0.22)] bg-[var(--color-success-dim)] text-[var(--color-success)]',
  warning:
    'border-[rgba(245,158,11,0.24)] bg-[var(--color-warning-dim)] text-[var(--color-warning)]',
  error:
    'border-[rgba(239,68,68,0.24)] bg-[var(--color-error-dim)] text-[var(--color-error)]',
}

const SIZES = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-2.5 py-1 text-xs',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border font-body font-semibold leading-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background:
              variant === 'success'
                ? 'var(--color-success)'
                : variant === 'warning'
                  ? 'var(--color-warning)'
                  : variant === 'error'
                    ? 'var(--color-error)'
                    : variant === 'cyan'
                      ? 'var(--color-cyan)'
                      : 'var(--color-indigo)',
          }}
        />
      )}

      {Icon && <Icon size={12} strokeWidth={2} />}

      {children}
    </span>
  )
}
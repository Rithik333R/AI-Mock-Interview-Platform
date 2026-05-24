import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const VARIANTS = {
  default:
    'border-[var(--color-border)] bg-[var(--color-surface)]',
  elevated:
    'border-[var(--color-border-alt)] bg-[var(--color-surface-alt)] shadow-[var(--shadow-md)]',
  glass:
    'glass border-[var(--color-border)]',
  accent:
    'gradient-border bg-[var(--color-surface)]',
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  className = '',
  ...props
}) {
  const Component = interactive ? motion.div : 'div'

  const motionProps = interactive
    ? {
        whileHover: { y: -2 },
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      }
    : {}

  return (
    <Component
      className={cn(
        'relative overflow-hidden rounded-xl border',
        'transition-all duration-200',
        VARIANTS[variant],
        PADDING[padding],
        interactive &&
          'cursor-pointer hover:border-[var(--color-border-bright)] hover:shadow-[var(--shadow-glow)]',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}) {
  return (
    <div
      className={cn(
        'mb-5 flex items-start justify-between gap-4',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        {title && (
          <div
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '1.05rem',
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}
          >
            {title}
          </div>
        )}

        {subtitle && (
          <p
            style={{
              marginTop: '0.35rem',
              fontSize: '0.875rem',
              lineHeight: 1.55,
              color: 'var(--color-text-secondary)',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div
      className={cn(
        'text-sm text-[var(--color-text-secondary)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={cn(
        'mt-5 border-t border-[var(--color-border)] pt-4',
        className
      )}
    >
      {children}
    </div>
  )
}
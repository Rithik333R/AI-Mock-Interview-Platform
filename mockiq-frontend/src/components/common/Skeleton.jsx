import { cn } from '@/utils/cn'

export default function Skeleton({
  className = '',
  rounded = 'md',
  ...props
}) {
  const radiusClass = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  }[rounded]

  return (
    <div
      aria-hidden="true"
      className={cn(
        'shimmer bg-[var(--color-surface-alt)]',
        radiusClass,
        className
      )}
      {...props}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-3',
            index === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5',
        className
      )}
      aria-hidden="true"
    >
      <div className="mb-5 flex items-center gap-3">
        <Skeleton rounded="full" className="h-10 w-10" />

        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>

      <SkeletonText lines={4} />
    </div>
  )
}
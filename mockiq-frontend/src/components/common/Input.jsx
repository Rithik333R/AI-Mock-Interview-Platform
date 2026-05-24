import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    className = '',
    inputClassName = '',
    id,
    type = 'text',
    style,
    ...props
  },
  ref
) {
  const inputId = id || props.name
  const hasIcon = Boolean(Icon)

  return (
    <div className={cn('w-full', className)} style={{ marginBottom: '1rem' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: 1.2,
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.8}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : hint
                ? `${inputId}-hint`
                : undefined
          }
          className={cn(
            'w-full rounded-lg border text-sm transition-all duration-200',
            'placeholder:text-[var(--color-text-muted)]',
            'focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-55',
            error
              ? 'border-[var(--color-error)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-alt)]',
            inputClassName
          )}
          style={{
            height: '3.25rem',
            paddingLeft: hasIcon ? '3.25rem' : '1rem',
            paddingRight: '1rem',
            background: 'var(--color-surface-alt)',
            color: 'var(--color-text-primary)',
            borderColor: error
              ? 'var(--color-error)'
              : 'var(--color-border)',
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: 1.2,
            boxSizing: 'border-box',
            ...style,
          }}
          onFocus={(event) => {
            event.currentTarget.style.borderColor = error
              ? 'var(--color-error)'
              : 'var(--color-indigo)'
            event.currentTarget.style.boxShadow = error
              ? '0 0 0 4px rgba(239,68,68,0.12)'
              : '0 0 0 4px rgba(99,102,241,0.12)'
            props.onFocus?.(event)
          }}
          onBlur={(event) => {
            event.currentTarget.style.borderColor = error
              ? 'var(--color-error)'
              : 'var(--color-border)'
            event.currentTarget.style.boxShadow = 'none'
            props.onBlur?.(event)
          }}
          {...props}
        />
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--color-error)',
          }}
        >
          <AlertCircle size={13} strokeWidth={2} />
          <span>{error}</span>
        </p>
      )}

      {!error && hint && (
        <p
          id={`${inputId}-hint`}
          style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
          }}
        >
          {hint}
        </p>
      )}
    </div>
  )
})

export default Input
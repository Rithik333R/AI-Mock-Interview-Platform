import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import useAuth from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { login, isLoading, error, clearError, isLoggedIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const sessionExpired = searchParams.get('session') === 'expired'
  const redirectTo = location.state?.from || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (sessionExpired) {
      toast.error('Your session expired. Please log in again.')
    }
  }, [sessionExpired])

  const onSubmit = async (values) => {
    clearError()

    const result = await login(values.email, values.password)

    if (result.success) {
      toast.success('Welcome back to MockIQ')
      navigate(redirectTo, { replace: true })
    } else {
      toast.error(result.message || 'Login failed. Please try again.')
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to MockIQ"
      subtitle="Continue improving your resume, interviews, and AI-powered career roadmap."
      footerText="New to MockIQ?"
      footerLinkText="Create an account"
      footerLinkTo="/register"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-[rgba(239,68,68,0.24)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: 'Enter a valid email address',
            },
            onChange: clearError,
          })}
        />

        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            icon={Lock}
            autoComplete="current-password"
            error={errors.password?.message}
            style={{ paddingRight: '3rem' }}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              onChange: clearError,
            })}
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="transition-colors hover:text-[var(--color-text-primary)]"
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '2.35rem',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.5rem',
              color: 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 5,
            }}
          >
            {showPassword ? (
              <EyeOff size={17} strokeWidth={1.8} />
            ) : (
              <Eye size={17} strokeWidth={1.8} />
            )}
          </button>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          Log in
        </Button>
      </form>
    </AuthShell>
  )
}
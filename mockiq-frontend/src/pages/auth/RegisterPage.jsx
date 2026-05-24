import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import useAuth from '@/hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearError, isLoggedIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoggedIn, navigate])

  const onSubmit = async (values) => {
    clearError()

    const result = await registerUser(
      values.fullName,
      values.email,
      values.password
    )

    if (result.success) {
      toast.success('Your MockIQ account is ready')
      navigate('/dashboard', { replace: true })
    } else {
      toast.error(result.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <AuthShell
      eyebrow="Start smarter"
      title="Create your account"
      subtitle="Build better resumes, practice AI interviews, and get a personalized career roadmap."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-[rgba(239,68,68,0.24)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
            {error}
          </div>
        )}

        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          icon={User}
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName', {
            required: 'Full name is required',
            minLength: {
              value: 2,
              message: 'Full name must be at least 2 characters',
            },
            onChange: clearError,
          })}
        />

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
            placeholder="Create a password"
            icon={Lock}
            autoComplete="new-password"
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

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          icon={Lock}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Confirm your password',
            validate: (value) =>
              value === password || 'Passwords do not match',
            onChange: clearError,
          })}
        />

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          Create account
        </Button>
      </form>
    </AuthShell>
  )
}
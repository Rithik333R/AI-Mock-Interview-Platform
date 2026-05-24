import { useCallback, useEffect, useState } from 'react'
import { LogOut, Mail, Save, Shield, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/layout/PageWrapper'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  SkeletonCard,
} from '@/components/common'
import { getMyProfile, updateMyProfile } from '@/api/user.api'
import { extractErrorMessage } from '@/api/axios'
import useAuth from '@/hooks/useAuth'
import { formatDate } from '@/utils/formatters'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { logout, setUser, initials } = useAuth()
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)

    try {
      const response = await getMyProfile()
      const data = response.data?.data ?? null
      setProfile(data)
      setFullName(data?.fullName ?? '')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to load profile'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async (event) => {
    event.preventDefault()

    if (fullName.trim().length < 2) {
      toast.error('Full name must be at least 2 characters.')
      return
    }

    setSaving(true)

    try {
      const response = await updateMyProfile({
        fullName: fullName.trim(),
      })

      const updated = response.data?.data

      setProfile(updated)
      setUser({
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
      })

      toast.success('Profile updated')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to update profile'))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <PageWrapper noPadding>
      <main className="mx-auto w-full max-w-[1100px] px-6 py-10 md:px-8 lg:px-10">
        <header className="mb-10 flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cyan)]">
              Account
            </p>

            <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-[var(--color-text-primary)] md:text-[2.35rem]">
              Profile
            </h1>

            <p className="mt-3 max-w-xl text-[0.95rem] leading-7 text-[var(--color-text-secondary)]">
              Manage your identity and account details used across MockIQ.
            </p>
          </div>

          <Button variant="secondary" icon={LogOut} onClick={handleLogout}>
            Log out
          </Button>
        </header>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <section className="grid gap-7 lg:grid-cols-[360px_minmax(0,1fr)]">
            <ProfileSummary
              profile={profile}
              initials={initials}
            />

            <div className="space-y-7">
              <EditProfileCard
                fullName={fullName}
                setFullName={setFullName}
                profile={profile}
                saving={saving}
                onSubmit={handleSave}
              />

              <AccountDetailsCard profile={profile} />

              <DangerZone onLogout={handleLogout} />
            </div>
          </section>
        )}
      </main>
    </PageWrapper>
  )
}

function ProfileSummary({ profile, initials }) {
  return (
    <Card padding="none" className="h-fit">
      <div className="p-6 text-center">
        <div
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-[rgba(99,102,241,0.26)] bg-[linear-gradient(135deg,var(--color-indigo),var(--color-violet))] font-display text-3xl font-bold text-white"
          style={{ boxShadow: '0 0 34px rgba(99,102,241,0.22)' }}
        >
          {initials}
        </div>

        <h2 className="mt-5 font-display text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
          {profile?.fullName}
        </h2>

        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {profile?.email}
        </p>

        <div className="mt-5 flex justify-center">
          <Badge variant={profile?.role === 'ADMIN' ? 'warning' : 'indigo'}>
            {profile?.role}
          </Badge>
        </div>
      </div>
    </Card>
  )
}

function EditProfileCard({
  fullName,
  setFullName,
  profile,
  saving,
  onSubmit,
}) {
  return (
    <Card padding="none">
      <form onSubmit={onSubmit} className="p-6">
        <CardHeader
          title="Edit profile"
          subtitle="Update the name displayed in your workspace."
          action={<Badge variant="cyan">Editable</Badge>}
        />

        <CardContent>
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Full name"
              icon={User}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />

            <Input
              label="Email"
              icon={Mail}
              value={profile?.email ?? ''}
              disabled
              hint="Email changes are not available in this version."
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              icon={Save}
              loading={saving}
              disabled={saving}
            >
              Save changes
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}

function AccountDetailsCard({ profile }) {
  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title="Account details"
          subtitle="Read-only metadata from your MockIQ account."
          action={<Shield size={18} className="text-[var(--color-indigo-light)]" />}
        />

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <DetailTile label="User ID" value={profile?.id} />
            <DetailTile label="Role" value={profile?.role} />
            <DetailTile label="Status" value={profile?.active === false ? 'Inactive' : 'Active'} />
            <DetailTile label="Created" value={formatDate(profile?.createdAt, 'long')} />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function DetailTile({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-[var(--color-text-primary)]">
        {value ?? '--'}
      </p>
    </div>
  )
}

function DangerZone({ onLogout }) {
  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title="Session"
          subtitle="End the current authenticated browser session."
          action={<Badge variant="error">Auth</Badge>}
        />

        <CardContent>
          <Button variant="danger" icon={LogOut} onClick={onLogout}>
            Log out
          </Button>
        </CardContent>
      </div>
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <section className="grid gap-7 lg:grid-cols-[360px_minmax(0,1fr)]">
      <SkeletonCard className="min-h-[300px]" />
      <div className="space-y-7">
        <SkeletonCard className="min-h-[240px]" />
        <SkeletonCard className="min-h-[240px]" />
        <SkeletonCard className="min-h-[160px]" />
      </div>
    </section>
  )
}
import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  BarChart3,
  FileText,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/layout/PageWrapper'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  SkeletonCard,
} from '@/components/common'
import {
  getDashboardSummary,
  getInterviewStats,
  getScoreTrend,
  getSkillSummary,
} from '@/api/dashboard.api'
import { extractErrorMessage } from '@/api/axios'
import { formatAtsScore, formatScore } from '@/utils/formatters'

const EMPTY_SUMMARY = {
  totalInterviews: 0,
  completedInterviews: 0,
  averageScore: 0,
  bestScore: 0,
  totalResumes: 0,
  bestAtsScore: 0,
  completionRate: 0,
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState(null)
  const [skills, setSkills] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [summaryRes, statsRes, trendRes, skillsRes] = await Promise.all([
        getDashboardSummary(),
        getInterviewStats(),
        getScoreTrend(),
        getSkillSummary(),
      ])

      setSummary(summaryRes.data?.data ?? EMPTY_SUMMARY)
      setStats(statsRes.data?.data ?? null)
      setTrend(trendRes.data?.data ?? null)
      setSkills(skillsRes.data?.data ?? null)

      if (silent) {
        toast.success('Dashboard refreshed')
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to load dashboard'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const score = formatScore(summary.averageScore)
  const bestScore = formatScore(summary.bestScore)
  const bestAts = formatAtsScore(summary.bestAtsScore)

  return (
    <PageWrapper
      title="Dashboard"
      subtitle="Your interview progress, resume intelligence, and AI readiness in one place."
      action={
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={refreshing}
          onClick={() => loadDashboard({ silent: true })}
        >
          Refresh
        </Button>
      }
    >
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Activity}
              label="Total interviews"
              value={summary.totalInterviews}
              helper={`${summary.completedInterviews} completed`}
              badge={`${Number(summary.completionRate || 0).toFixed(1)}% done`}
              badgeVariant="indigo"
            />

            <StatCard
              icon={TrendingUp}
              label="Average score"
              value={score.label}
              valueColor={score.color}
              helper="Across completed sessions"
              badge={`Best ${bestScore.label}`}
              badgeVariant="success"
            />

            <StatCard
              icon={FileText}
              label="Resumes"
              value={summary.totalResumes}
              helper="Uploaded and parsed"
              badge={`Best ATS ${bestAts.label}`}
              badgeVariant="cyan"
            />

            <StatCard
              icon={Target}
              label="ATS strength"
              value={bestAts.label}
              valueColor={bestAts.color}
              helper="Highest resume match"
              badge="Resume AI"
              badgeVariant="warning"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <ScoreTrendCard trend={trend} />
            <DifficultyCard stats={stats} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <RolePracticeCard skills={skills} />
            <ResumeAtsCard skills={skills} />
          </section>
        </div>
      )}
    </PageWrapper>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueColor = 'var(--color-text-primary)',
  helper,
  badge,
  badgeVariant = 'default',
}) {
  return (
    <Card interactive>
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(99,102,241,0.22)] bg-[rgba(99,102,241,0.10)]"
          style={{ boxShadow: '0 0 24px rgba(99,102,241,0.12)' }}
        >
          <Icon size={20} className="text-[var(--color-indigo-light)]" />
        </div>

        <Badge variant={badgeVariant} size="sm">
          {badge}
        </Badge>
      </div>

      <div className="mt-5">
        <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
        <p
          className="mt-1 font-display text-3xl font-bold tracking-tight"
          style={{ color: valueColor }}
        >
          {value}
        </p>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{helper}</p>
      </div>
    </Card>
  )
}

function ScoreTrendCard({ trend }) {
  const points = trend?.trend ?? []
  const direction = trend?.trendDirection ?? 'INSUFFICIENT_DATA'

  const chartData = points.map((item) => ({
    name: item.targetRole || `#${item.interviewId}`,
    score: Number(item.score || 0),
  }))

  return (
    <Card>
      <CardHeader
        title="Score trend"
        subtitle="Your last completed mock interview scores."
        action={<TrendBadge direction={direction} />}
      />

      <CardContent>
        {chartData.length === 0 ? (
          <EmptyChartState />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -18 }}>
                <CartesianGrid stroke="rgba(99,102,241,0.10)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border-alt)',
                    borderRadius: '0.75rem',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-cyan)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--color-indigo)', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'var(--color-cyan)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DifficultyCard({ stats }) {
  const rows = stats?.byDifficulty ?? []

  return (
    <Card>
      <CardHeader
        title="Difficulty breakdown"
        subtitle="Performance by interview difficulty."
        action={<Badge variant="indigo">{stats?.totalAnswered ?? 0} answers</Badge>}
      />

      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Complete an interview to see difficulty analytics.
          </p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const score = formatScore(row.averageScore)
              return (
                <div key={row.difficulty}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {row.difficulty}
                    </span>
                    <span className="text-sm" style={{ color: score.color }}>
                      {score.label}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-indigo),var(--color-cyan))]"
                      style={{
                        width: `${Math.min(Number(row.averageScore || 0) * 10, 100)}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {row.completedSessions} completed of {row.totalSessions} sessions
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RolePracticeCard({ skills }) {
  const rows = skills?.rolePracticeFrequency ?? []

  return (
    <Card>
      <CardHeader
        title="Role practice"
        subtitle="Roles you have practiced most often."
        action={<BarChart3 size={18} className="text-[var(--color-indigo-light)]" />}
      />

      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Start a mock interview to build role analytics.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.slice(0, 5).map((role) => {
              const score = formatScore(role.averageScore)
              return (
                <div
                  key={role.targetRole}
                  className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[rgba(99,102,241,0.04)] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                      {role.targetRole}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {role.sessionCount} sessions
                    </p>
                  </div>

                  <Badge variant="cyan">{score.label}</Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ResumeAtsCard({ skills }) {
  const rows = skills?.resumeAtsSummary ?? []

  return (
    <Card>
      <CardHeader
        title="Resume ATS"
        subtitle="Recent resume scoring results."
        action={<FileText size={18} className="text-[var(--color-cyan)]" />}
      />

      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Upload a resume and generate an ATS score to see results here.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.slice(0, 5).map((resume) => {
              const ats = formatAtsScore(resume.atsScore)
              return (
                <div
                  key={resume.resumeId}
                  className="rounded-lg border border-[var(--color-border)] bg-[rgba(34,211,238,0.035)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                      {resume.fileName}
                    </p>
                    <Badge variant="success">{ats.label}</Badge>
                  </div>

                  {resume.jobDescriptionPreview && (
                    <p className="mt-2 line-clamp-2 text-xs text-[var(--color-text-muted)]">
                      {resume.jobDescriptionPreview}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TrendBadge({ direction }) {
  const variant =
    direction === 'IMPROVING'
      ? 'success'
      : direction === 'DECLINING'
        ? 'error'
        : direction === 'STABLE'
          ? 'warning'
          : 'default'

  const label = direction
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase())

  return <Badge variant={variant}>{label}</Badge>
}

function EmptyChartState() {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] text-center">
      <TrendingUp size={26} className="mb-3 text-[var(--color-text-muted)]" />
      <p className="font-medium text-[var(--color-text-primary)]">No trend data yet</p>
      <p className="mt-1 max-w-xs text-sm text-[var(--color-text-muted)]">
        Complete at least two interviews to see progress over time.
      </p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <SkeletonCard className="min-h-[360px]" />
        <SkeletonCard className="min-h-[360px]" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </section>
    </div>
  )
}
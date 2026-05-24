import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BriefcaseBusiness,
  MessageSquare,
  Play,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/layout/PageWrapper'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  Input,
  SkeletonCard,
} from '@/components/common'
import {
  getMyInterviews,
  startInterview,
} from '@/api/interview.api'
import { extractErrorMessage } from '@/api/axios'
import {
  DIFFICULTY,
  DIFFICULTY_LABELS,
  INTERVIEW_STATUS,
} from '@/utils/constants'
import { formatDate, formatScore } from '@/utils/formatters'

const DIFFICULTY_OPTIONS = [
  DIFFICULTY.EASY,
  DIFFICULTY.MEDIUM,
  DIFFICULTY.HARD,
]

export default function InterviewsPage() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [targetRole, setTargetRole] = useState('')
  const [difficulty, setDifficulty] = useState(DIFFICULTY.MEDIUM)

  const loadInterviews = useCallback(async () => {
    setLoading(true)

    try {
      const response = await getMyInterviews()
      setInterviews(response.data?.data ?? [])
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to load interviews'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInterviews()
  }, [loadInterviews])

  const handleStartInterview = async (event) => {
    event.preventDefault()

    if (targetRole.trim().length < 3) {
      toast.error('Enter a target role first.')
      return
    }

    setStarting(true)

    try {
      const response = await startInterview({
        targetRole: targetRole.trim(),
        difficulty,
      })

      const created = response.data?.data

      if (created) {
        setInterviews((current) => [created, ...current])
        setTargetRole('')
        toast.success('Interview questions generated')
        navigate(`/interviews/${created.id}/session`)
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to start interview'))
    } finally {
      setStarting(false)
    }
  }

  return (
    <PageWrapper noPadding>
      <main className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-8 lg:px-10">
        <header className="mb-10 flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cyan)]">
              AI Mock Interviews
            </p>

            <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-[var(--color-text-primary)] md:text-[2.35rem]">
              Interviews
            </h1>

            <p className="mt-3 max-w-xl text-[0.95rem] leading-7 text-[var(--color-text-secondary)]">
              Practice role-specific interviews, receive AI feedback, and track your progress over time.
            </p>
          </div>

          <Badge variant="indigo" className="w-fit">
            {interviews.length} sessions
          </Badge>
        </header>

        <section className="grid gap-7 xl:grid-cols-[minmax(380px,0.78fr)_minmax(0,1.22fr)]">
          <StartInterviewCard
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            starting={starting}
            onSubmit={handleStartInterview}
          />

          {loading ? (
            <InterviewHistorySkeleton />
          ) : interviews.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No interviews yet"
              description="Start your first AI mock interview and build a performance history."
              actionLabel="Focus target role"
              actionIcon={BriefcaseBusiness}
              onAction={() => {
                const input = document.querySelector('#targetRole')
                input?.focus()
              }}
            />
          ) : (
            <InterviewHistory
              interviews={interviews}
              onOpenSession={(id) => navigate(`/interviews/${id}/session`)}
              onOpenReport={(id) => navigate(`/interviews/${id}/report`)}
            />
          )}
        </section>
      </main>
    </PageWrapper>
  )
}

function StartInterviewCard({
  targetRole,
  setTargetRole,
  difficulty,
  setDifficulty,
  starting,
  onSubmit,
}) {
  return (
    <Card padding="none" className="h-fit">
      <form onSubmit={onSubmit} className="p-6">
        <CardHeader
          title="Start interview"
          subtitle="Choose a role and difficulty. Gemini will generate tailored questions."
          action={<Sparkles size={18} className="text-[var(--color-indigo-light)]" />}
        />

        <CardContent>
          <div className="space-y-6">
            <Input
              id="targetRole"
              label="Target role"
              placeholder="Java Backend Developer"
              icon={BriefcaseBusiness}
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
            />

            <div>
              <label className="mb-3 block text-sm font-semibold text-[var(--color-text-primary)]">
                Difficulty
              </label>

              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTY_OPTIONS.map((option) => {
                  const selected = difficulty === option

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDifficulty(option)}
                      className="rounded-xl border px-3 py-3 text-sm font-semibold transition-all"
                      style={{
                        background: selected
                          ? 'rgba(99,102,241,0.14)'
                          : 'rgba(99,102,241,0.035)',
                        borderColor: selected
                          ? 'var(--color-border-bright)'
                          : 'var(--color-border)',
                        color: selected
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-secondary)',
                      }}
                    >
                      {DIFFICULTY_LABELS[option]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(34,211,238,0.035)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                What happens next?
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                The backend creates a session and Gemini generates role-specific questions.
                This can take a few seconds.
              </p>
            </div>

            <Button
              type="submit"
              icon={Play}
              loading={starting}
              disabled={starting}
              className="w-full"
              size="lg"
            >
              Start interview
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}

function InterviewHistory({ interviews, onOpenSession, onOpenReport }) {
  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title="Interview history"
          subtitle="Review active and completed sessions."
          action={<Badge variant="cyan">{interviews.length} total</Badge>}
        />

        <CardContent>
          <div className="space-y-3">
            {interviews.map((interview) => (
              <InterviewRow
                key={interview.id}
                interview={interview}
                onOpenSession={onOpenSession}
                onOpenReport={onOpenReport}
              />
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function InterviewRow({ interview, onOpenSession, onOpenReport }) {
  const completed = interview.status === INTERVIEW_STATUS.COMPLETED
  const score = formatScore(interview.overallScore)

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
              {interview.targetRole}
            </p>

            <Badge variant={completed ? 'success' : 'warning'} size="sm">
              {interview.status}
            </Badge>

            <Badge variant="indigo" size="sm">
              {interview.difficulty}
            </Badge>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            Created {formatDate(interview.createdAt, 'short')}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end">
          <div className="text-right">
            <p
              className="font-display text-lg font-bold leading-none"
              style={{ color: completed ? score.color : 'var(--color-text-muted)' }}
            >
              {completed ? score.label : '--'}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              score
            </p>
          </div>

          <Button
            variant={completed ? 'secondary' : 'primary'}
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() =>
              completed
                ? onOpenReport(interview.id)
                : onOpenSession(interview.id)
            }
          >
            {completed ? 'Report' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function InterviewHistorySkeleton() {
  return (
    <Card padding="none">
      <div className="space-y-4 p-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </Card>
  )
}
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Map,
  Sparkles,
  Target,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/layout/PageWrapper'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  SkeletonCard,
} from '@/components/common'
import { getLatestSkillGap } from '@/api/skillgap.api'
import {
  completeMilestone,
  generateRoadmap,
  getActiveRoadmap,
} from '@/api/roadmap.api'
import { extractErrorMessage } from '@/api/axios'
import { formatDate, formatPercent } from '@/utils/formatters'

export default function RoadmapPage() {
  const navigate = useNavigate()
  const [latestGap, setLatestGap] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [completingMilestoneId, setCompletingMilestoneId] = useState(null)

  const completedCount = useMemo(
    () => roadmap?.milestones?.filter((milestone) => milestone.completed).length ?? 0,
    [roadmap]
  )

  const totalMilestones = roadmap?.milestones?.length ?? 0

  const loadPageData = useCallback(async () => {
    setLoading(true)

    const [gapRes, roadmapRes] = await Promise.allSettled([
      getLatestSkillGap(),
      getActiveRoadmap(),
    ])

    if (gapRes.status === 'fulfilled') {
      setLatestGap(gapRes.value.data?.data ?? null)
    }

    if (roadmapRes.status === 'fulfilled') {
      setRoadmap(roadmapRes.value.data?.data ?? null)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadPageData()
  }, [loadPageData])

  const handleGenerateRoadmap = async () => {
    if (!latestGap?.id) {
      toast.error('Run a skill gap analysis first.')
      return
    }

    setGenerating(true)

    try {
      const response = await generateRoadmap({
        skillGapId: latestGap.id,
      })

      setRoadmap(response.data?.data ?? null)
      toast.success('Roadmap generated')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to generate roadmap'))
    } finally {
      setGenerating(false)
    }
  }

  const handleCompleteMilestone = async (milestoneId) => {
    if (!roadmap) return

    const previous = roadmap

    setCompletingMilestoneId(milestoneId)

    setRoadmap((current) => ({
      ...current,
      milestones: current.milestones.map((milestone) =>
        milestone.id === milestoneId
          ? { ...milestone, completed: true }
          : milestone
      ),
    }))

    try {
      const response = await completeMilestone(roadmap.id, milestoneId)
      setRoadmap(response.data?.data ?? previous)
      toast.success('Milestone completed')
    } catch (error) {
      setRoadmap(previous)
      toast.error(extractErrorMessage(error, 'Failed to complete milestone'))
    } finally {
      setCompletingMilestoneId(null)
    }
  }

  return (
    <PageWrapper noPadding>
      <main className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-8 lg:px-10">
        <header className="mb-10 flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cyan)]">
              Learning Plan
            </p>

            <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-[var(--color-text-primary)] md:text-[2.35rem]">
              Roadmap
            </h1>

            <p className="mt-3 max-w-xl text-[0.95rem] leading-7 text-[var(--color-text-secondary)]">
              Turn your skill gaps into a structured, week-by-week learning path.
            </p>
          </div>

          <Button
            icon={Sparkles}
            loading={generating}
            disabled={generating || !latestGap}
            onClick={handleGenerateRoadmap}
          >
            {roadmap ? 'Regenerate roadmap' : 'Generate roadmap'}
          </Button>
        </header>

        {loading ? (
          <RoadmapSkeleton />
        ) : !latestGap ? (
          <EmptyState
            icon={Target}
            title="Run skill gap analysis first"
            description="A roadmap needs a skill gap result before it can generate a personalized learning plan."
            actionLabel="Go to skill gap"
            actionIcon={ArrowRight}
            onAction={() => navigate('/skill-gap')}
          />
        ) : !roadmap ? (
          <EmptyState
            icon={Map}
            title="No active roadmap yet"
            description="Generate a roadmap from your latest skill gap analysis to get a structured learning plan."
            actionLabel="Generate roadmap"
            actionIcon={Sparkles}
            onAction={handleGenerateRoadmap}
          />
        ) : (
          <section className="grid gap-7 xl:grid-cols-[minmax(340px,0.78fr)_minmax(0,1.22fr)]">
            <RoadmapSummary
              roadmap={roadmap}
              latestGap={latestGap}
              completedCount={completedCount}
              totalMilestones={totalMilestones}
            />

            <MilestoneTimeline
              milestones={roadmap.milestones ?? []}
              completingMilestoneId={completingMilestoneId}
              onComplete={handleCompleteMilestone}
            />
          </section>
        )}
      </main>
    </PageWrapper>
  )
}

function RoadmapSummary({
  roadmap,
  latestGap,
  completedCount,
  totalMilestones,
}) {
  return (
    <div className="space-y-7">
      <Card padding="none">
        <div className="p-6">
          <CardHeader
            title="Progress"
            subtitle={roadmap.targetRole}
            action={<Badge variant="success">{formatPercent(roadmap.completionPercentage)}</Badge>}
          />

          <CardContent>
            <div className="mb-5 h-3 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-indigo),var(--color-cyan))]"
                style={{
                  width: `${Math.min(Number(roadmap.completionPercentage || 0), 100)}%`,
                }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile label="Milestones" value={`${completedCount}/${totalMilestones}`} />
              <SummaryTile label="Total weeks" value={roadmap.totalWeeks ?? roadmap.weeksToGoal ?? '--'} />
              <SummaryTile label="Readiness" value={`${latestGap.readinessScore ?? 0}%`} />
              <SummaryTile label="Created" value={formatDate(roadmap.createdAt, 'short')} />
            </div>
          </CardContent>
        </div>
      </Card>

      <Card padding="none">
        <div className="p-6">
          <CardHeader
            title="Source analysis"
            subtitle="This roadmap is based on your latest skill gap result."
            action={<Badge variant="indigo">Skill gap</Badge>}
          />

          <CardContent>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              Target role: <span className="text-[var(--color-text-primary)]">{latestGap.targetRole}</span>
            </p>

            <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
              Missing skills prioritized:
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {(latestGap.missingSkills ?? []).slice(0, 8).map((skill) => (
                <Badge key={skill} variant="warning">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-2 font-display text-lg font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  )
}

function MilestoneTimeline({
  milestones,
  completingMilestoneId,
  onComplete,
}) {
  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title="Milestone timeline"
          subtitle="Complete each milestone as you progress through the plan."
          action={<Badge variant="cyan">{milestones.length} steps</Badge>}
        />

        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                index={index}
                completing={completingMilestoneId === milestone.id}
                onComplete={onComplete}
              />
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function MilestoneCard({
  milestone,
  index,
  completing,
  onComplete,
}) {
  const completed = milestone.completed

  return (
    <div className="relative rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={completed ? 'success' : 'indigo'}>
              Week {milestone.weekNumber ?? index + 1}
            </Badge>

            {completed && (
              <Badge variant="success">Completed</Badge>
            )}
          </div>

          <h3 className="font-display text-base font-semibold leading-6 text-[var(--color-text-primary)]">
            {milestone.title}
          </h3>

          {milestone.description && (
            <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
              {milestone.description}
            </p>
          )}

          {milestone.skills?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {milestone.skills.map((skill) => (
                <Badge key={skill} variant="cyan">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {milestone.resources?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
                Resources
              </p>
              <ul className="space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {milestone.resources.map((resource) => (
                  <li key={resource}>- {resource}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button
          variant={completed ? 'secondary' : 'primary'}
          icon={completed ? CheckCircle2 : Circle}
          loading={completing}
          disabled={completed || completing}
          onClick={() => onComplete(milestone.id)}
          className="shrink-0"
        >
          {completed ? 'Done' : 'Complete'}
        </Button>
      </div>
    </div>
  )
}

function RoadmapSkeleton() {
  return (
    <section className="grid gap-7 xl:grid-cols-[minmax(340px,0.78fr)_minmax(0,1.22fr)]">
      <div className="space-y-7">
        <SkeletonCard className="min-h-[280px]" />
        <SkeletonCard className="min-h-[240px]" />
      </div>
      <SkeletonCard className="min-h-[680px]" />
    </section>
  )
}
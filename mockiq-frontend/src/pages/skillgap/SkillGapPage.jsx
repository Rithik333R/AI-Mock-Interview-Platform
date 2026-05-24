import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
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

import { getMyResumes } from '@/api/resume.api'

import {
  analyzeSkillGap,
  getLatestSkillGap,
} from '@/api/skillgap.api'

import { extractErrorMessage } from '@/api/axios'

export default function SkillGapPage() {
  const navigate = useNavigate()

  const [resumes, setResumes] = useState([])
  const [latestGap, setLatestGap] = useState(null)

  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [targetRole, setTargetRole] = useState('')

  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  const selectedResume = useMemo(
    () =>
      resumes.find(
        (resume) =>
          String(resume.id) === String(selectedResumeId)
      ),
    [resumes, selectedResumeId]
  )

  const loadPageData = useCallback(async () => {
    setLoading(true)

    try {
      const [resumeRes, latestRes] =
        await Promise.allSettled([
          getMyResumes(),
          getLatestSkillGap(),
        ])

      // ─────────────────────────────────────────────
      // Resumes
      // ─────────────────────────────────────────────
      if (resumeRes.status === 'fulfilled') {
        const data =
          resumeRes.value.data?.data ?? []

        console.log('Resumes:', data)

        setResumes(data)

        if (data.length > 0) {
          setSelectedResumeId(
            String(data[0].id)
          )
        }
      }

      // ─────────────────────────────────────────────
      // Latest Skill Gap
      // ─────────────────────────────────────────────
      if (latestRes.status === 'fulfilled') {
        setLatestGap(
          latestRes.value.data?.data ?? null
        )
      }
    } catch (error) {
      toast.error(
        extractErrorMessage(
          error,
          'Failed to load skill gap page'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPageData()
  }, [loadPageData])

  const handleAnalyze = async (event) => {
    event.preventDefault()

    if (!selectedResumeId) {
      toast.error('Select a resume first.')
      return
    }

    if (targetRole.trim().length < 3) {
      toast.error('Enter a target role first.')
      return
    }

    setAnalyzing(true)

    try {
      const response = await analyzeSkillGap({
        resumeId: Number(selectedResumeId),
        targetRole: targetRole.trim(),
      })

      const result = response.data?.data

      setLatestGap(result)

      toast.success(
        'Skill gap analysis completed'
      )
    } catch (error) {
      toast.error(
        extractErrorMessage(
          error,
          'Failed to analyze skill gap'
        )
      )
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <PageWrapper noPadding>
      <main className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-8 lg:px-10">

        {/* Header */}
        <header className="mb-10 flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 lg:flex-row lg:items-end">

          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cyan)]">
              Skill Intelligence
            </p>

            <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-[var(--color-text-primary)] md:text-[2.35rem]">
              Skill Gap
            </h1>

            <p className="mt-3 max-w-xl text-[0.95rem] leading-7 text-[var(--color-text-secondary)]">
              Compare your resume against a target role and identify the skills you need next.
            </p>
          </div>

          {latestGap && (
            <Button
              icon={ArrowRight}
              iconPosition="right"
              onClick={() =>
                navigate('/roadmap')
              }
            >
              Build roadmap
            </Button>
          )}
        </header>

        {/* Loading */}
        {loading ? (
          <SkillGapSkeleton />
        ) : resumes.length === 0 ? (

          /* No Resume State */
          <EmptyState
            icon={FileText}
            title="Upload a resume first"
            description="Skill gap analysis needs a parsed resume before it can compare your skills against a target role."
            actionLabel="Upload Resume"
            actionIcon={ArrowRight}
            onAction={() =>
              navigate('/resume')
            }
          />

        ) : (

          /* Main Layout */
          <section className="grid gap-7 xl:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)]">

            <AnalyzeCard
              resumes={resumes}
              selectedResumeId={
                selectedResumeId
              }
              setSelectedResumeId={
                setSelectedResumeId
              }
              selectedResume={
                selectedResume
              }
              targetRole={targetRole}
              setTargetRole={
                setTargetRole
              }
              analyzing={analyzing}
              onSubmit={handleAnalyze}
              navigate={navigate}
            />

            {latestGap ? (
              <SkillGapResult
                gap={latestGap}
              />
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No analysis yet"
                description="Select a resume, enter a target role, and run your first AI skill gap analysis."
              />
            )}
          </section>
        )}
      </main>
    </PageWrapper>
  )
}

/* =========================================================
   Analyze Card
========================================================= */

function AnalyzeCard({
  resumes,
  selectedResumeId,
  setSelectedResumeId,
  selectedResume,
  targetRole,
  setTargetRole,
  analyzing,
  onSubmit,
  navigate,
}) {
  return (
    <Card padding="none" className="h-fit">
      <form
        onSubmit={onSubmit}
        className="p-6"
      >
        <CardHeader
          title="Analyze gap"
          subtitle="Choose a resume and target role for AI comparison."
          action={
            <Sparkles
              size={18}
              className="text-[var(--color-indigo-light)]"
            />
          }
        />

        <CardContent>
          <div className="space-y-6">

            {/* Resume Dropdown */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                Resume
              </label>

              <select
                value={selectedResumeId}
                onChange={(event) =>
                  setSelectedResumeId(
                    event.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-[var(--color-border)]
                  bg-[var(--color-surface-alt)]
                  px-4
                  text-sm
                  text-[var(--color-text-primary)]
                  shadow-sm
                  transition-all
                  duration-200
                  focus:border-[var(--color-indigo)]
                  focus:outline-none
                  focus:ring-4
                  focus:ring-[rgba(99,102,241,0.12)]
                  hover:border-[var(--color-indigo-light)]
                  cursor-pointer
                "
              >
                {resumes.length === 0 ? (
                  <option value="">
                    No resumes available
                  </option>
                ) : (
                  resumes.map((resume) => (
                    <option
                      key={resume.id}
                      value={String(
                        resume.id
                      )}
                      style={{
                        backgroundColor:
                          '#111827',
                        color: 'white',
                      }}
                    >
                      {
                        resume.fileName ||
                        resume.originalFileName ||
                        resume.name ||
                        'Resume'
                      }
                    </option>
                  ))
                )}
              </select>

              {/* Selected Resume Preview */}
              {selectedResume && (
                <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[rgba(99,102,241,0.04)] px-3 py-2">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Selected resume
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {
                      selectedResume.fileName ||
                      selectedResume.originalFileName ||
                      selectedResume.name ||
                      'Resume'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Upload Resume Button */}
            <Button
              type="button"
              variant="secondary"
              icon={Upload}
              className="w-full"
              onClick={() =>
                navigate('/resume')
              }
            >
              Upload new resume
            </Button>

            {/* Target Role */}
            <Input
              label="Target role"
              placeholder="Senior Java Backend Developer"
              icon={Target}
              value={targetRole}
              onChange={(event) =>
                setTargetRole(
                  event.target.value
                )
              }
            />

            {/* AI Info */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(34,211,238,0.035)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                AI analysis
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Gemini reads your resume
                text and compares it
                against the expectations
                of your target role.
              </p>
            </div>

            {/* Analyze Button */}
            <Button
              type="submit"
              icon={Search}
              loading={analyzing}
              disabled={analyzing}
              className="w-full"
              size="lg"
            >
              Analyze skill gap
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}

/* =========================================================
   Skill Gap Result
========================================================= */

function SkillGapResult({ gap }) {
  const readiness = Number(
    gap.readinessScore ?? 0
  )

  return (
    <div className="space-y-7">

      {/* Readiness */}
      <Card padding="none">
        <div className="p-6">
          <CardHeader
            title="Readiness score"
            subtitle={`Target role: ${gap.targetRole}`}
            action={
              <Badge
                variant={
                  readiness >= 70
                    ? 'success'
                    : readiness >= 45
                    ? 'warning'
                    : 'error'
                }
              >
                {readiness}%
              </Badge>
            }
          />

          <CardContent>
            <div className="mb-5 h-3 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-indigo),var(--color-cyan))]"
                style={{
                  width: `${Math.min(
                    readiness,
                    100
                  )}%`,
                }}
              />
            </div>

            {gap.summary && (
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                {gap.summary}
              </p>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Skills */}
      <section className="grid gap-7 lg:grid-cols-2">

        <SkillListCard
          title="Current skills"
          subtitle="Skills detected from your resume."
          items={gap.currentSkills}
          variant="success"
        />

        <SkillListCard
          title="Missing skills"
          subtitle="Skills to prioritize for the target role."
          items={gap.missingSkills}
          variant="warning"
        />
      </section>

      {/* Proficiency */}
      <ProficiencyCard
        proficiencyMap={
          gap.proficiencyMap
        }
      />
    </div>
  )
}

function SkillListCard({
  title,
  subtitle,
  items = [],
  variant,
}) {
  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title={title}
          subtitle={subtitle}
          action={
            <Badge variant={variant}>
              {items.length}
            </Badge>
          }
        />

        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No skills returned.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <Badge
                  key={skill}
                  variant={variant}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

function ProficiencyCard({
  proficiencyMap = {},
}) {
  const entries = Object.entries(
    proficiencyMap
  )

  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title="Proficiency map"
          subtitle="AI-estimated skill level by topic."
          action={
            <Badge variant="indigo">
              {entries.length} skills
            </Badge>
          }
        />

        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No proficiency data
              returned.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {entries.map(
                ([skill, level]) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] px-4 py-3"
                  >
                    <span className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                      {skill}
                    </span>

                    <Badge
                      variant={
                        level ===
                        'ADVANCED'
                          ? 'success'
                          : level ===
                            'INTERMEDIATE'
                          ? 'cyan'
                          : 'default'
                      }
                    >
                      {level}
                    </Badge>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

/* =========================================================
   Skeleton
========================================================= */

function SkillGapSkeleton() {
  return (
    <section className="grid gap-7 xl:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)]">
      <SkeletonCard className="min-h-[420px]" />

      <div className="space-y-7">
        <SkeletonCard className="min-h-[220px]" />

        <section className="grid gap-7 lg:grid-cols-2">
          <SkeletonCard className="min-h-[220px]" />
          <SkeletonCard className="min-h-[220px]" />
        </section>

        <SkeletonCard className="min-h-[320px]" />
      </div>
    </section>
  )
}
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Target,
  TrendingUp,
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
  SkeletonCard,
} from '@/components/common'
import { getInterviewReport } from '@/api/interview.api'
import { extractErrorMessage } from '@/api/axios'
import { INTERVIEW_STATUS } from '@/utils/constants'
import { formatDate, formatScore } from '@/utils/formatters'

export default function InterviewReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const interviewId = Number(id)

  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadReport = useCallback(async () => {
    setLoading(true)

    try {
      const response = await getInterviewReport(interviewId)
      setInterview(response.data?.data ?? null)
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to load report'))
      navigate('/interviews', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [interviewId, navigate])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const answeredQuestions = useMemo(
    () => interview?.questions?.filter((question) => question.response) ?? [],
    [interview]
  )

  if (loading) {
    return (
      <PageWrapper noPadding>
        <main className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-8 lg:px-10">
          <ReportSkeleton />
        </main>
      </PageWrapper>
    )
  }

  if (!interview) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Report not found"
        description="We could not load this interview report."
        actionLabel="Back to interviews"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/interviews')}
      />
    )
  }

  const isCompleted = interview.status === INTERVIEW_STATUS.COMPLETED
  const overallScore = formatScore(interview.overallScore)

  return (
    <PageWrapper noPadding>
      <main className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-8 lg:px-10">
        <header className="mb-10 border-b border-[var(--color-border)] pb-8">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/interviews')}
            className="mb-6"
          >
            Back to interviews
          </Button>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cyan)]">
                Interview Report
              </p>

              <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-[var(--color-text-primary)] md:text-[2.35rem]">
                {interview.targetRole}
              </h1>

              <p className="mt-3 max-w-xl text-[0.95rem] leading-7 text-[var(--color-text-secondary)]">
                Review your answers, AI feedback, and performance breakdown.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="indigo">{interview.difficulty}</Badge>
                <Badge variant={isCompleted ? 'success' : 'warning'}>
                  {interview.status}
                </Badge>
                <Badge variant="cyan">
                  {answeredQuestions.length}/{interview.questions?.length ?? 0} answered
                </Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.06)] px-6 py-5 text-right">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                Overall score
              </p>
              <p
                className="mt-2 font-display text-[2.1rem] font-bold leading-none"
                style={{ color: overallScore.color }}
              >
                {overallScore.label}
              </p>
            </div>
          </div>
        </header>

        {!isCompleted && (
          <Card padding="none" className="mb-7">
            <div className="p-5">
              <p className="text-sm font-semibold text-[var(--color-warning)]">
                This interview is still in progress.
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Complete the session to finalize your overall score.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate(`/interviews/${interview.id}/session`)}
              >
                Continue session
              </Button>
            </div>
          </Card>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          <ReportMetric
            icon={Target}
            label="Questions answered"
            value={`${answeredQuestions.length}/${interview.questions?.length ?? 0}`}
            helper="Submitted responses"
          />

          <ReportMetric
            icon={TrendingUp}
            label="Average score"
            value={overallScore.label}
            valueColor={overallScore.color}
            helper="Overall interview performance"
          />

          <ReportMetric
            icon={CheckCircle2}
            label="Completed on"
            value={formatDate(interview.updatedAt || interview.createdAt, 'short')}
            helper="Latest session update"
          />
        </section>

        <section className="mt-8 space-y-5">
          {interview.questions?.map((question, index) => (
            <QuestionReportCard
              key={question.id}
              question={question}
              index={index}
            />
          ))}
        </section>
      </main>
    </PageWrapper>
  )
}

function ReportMetric({
  icon: Icon,
  label,
  value,
  valueColor = 'var(--color-text-primary)',
  helper,
}) {
  return (
    <Card padding="none">
      <div className="p-6">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(99,102,241,0.22)] bg-[rgba(99,102,241,0.10)]">
          <Icon size={20} className="text-[var(--color-indigo-light)]" />
        </div>

        <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>

        <p
          className="mt-2 font-display text-[1.65rem] font-bold leading-tight"
          style={{ color: valueColor }}
        >
          {value}
        </p>

        <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
          {helper}
        </p>
      </div>
    </Card>
  )
}

function QuestionReportCard({ question, index }) {
  const response = question.response

  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title={`Question ${index + 1}`}
          subtitle={question.category}
          action={
            response ? (
              <Badge variant="success">Answered</Badge>
            ) : (
              <Badge variant="warning">Skipped</Badge>
            )
          }
        />

        <CardContent>
          <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] p-5">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Prompt
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
              {question.questionText}
            </p>
          </div>

          {!response ? (
            <p className="mt-5 text-sm text-[var(--color-text-muted)]">
              No answer was submitted for this question.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(34,211,238,0.03)] p-5">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Your answer
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-text-secondary)]">
                  {response.answerText}
                </p>
              </div>

              <ScoreGrid response={response} />

              <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(16,185,129,0.035)] p-5">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  AI feedback
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {response.aiFeedback}
                </p>
              </div>

              {response.improvementTips && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] p-5">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Improvement tips
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                    {response.improvementTips}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

function ScoreGrid({ response }) {
  const clarity = formatScore(response.clarityScore)
  const relevance = formatScore(response.relevanceScore)
  const depth = formatScore(response.depthScore)
  const overall = formatScore(response.overallScore)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <ScoreTile label="Overall" score={overall} />
      <ScoreTile label="Clarity" score={clarity} />
      <ScoreTile label="Relevance" score={relevance} />
      <ScoreTile label="Depth" score={depth} />
    </div>
  )
}

function ScoreTile({ label, score }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p
        className="mt-2 font-display text-lg font-bold"
        style={{ color: score.color }}
      >
        {score.label}
      </p>
    </div>
  )
}

function ReportSkeleton() {
  return (
    <div className="space-y-7">
      <SkeletonCard className="min-h-[220px]" />
      <section className="grid gap-6 lg:grid-cols-3">
        <SkeletonCard className="min-h-[170px]" />
        <SkeletonCard className="min-h-[170px]" />
        <SkeletonCard className="min-h-[170px]" />
      </section>
      <SkeletonCard className="min-h-[420px]" />
      <SkeletonCard className="min-h-[420px]" />
    </div>
  )
}
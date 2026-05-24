import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageWrapper from '@/components/layout/PageWrapper'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  LoadingState,
  SkeletonCard,
} from '@/components/common'
import {
  completeInterview,
  getInterviewReport,
  submitAnswer,
} from '@/api/interview.api'
import { extractErrorMessage } from '@/api/axios'
import { INTERVIEW_STATUS } from '@/utils/constants'
import { formatScore } from '@/utils/formatters'

export default function InterviewSessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const interviewId = Number(id)

  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)

  const loadInterview = useCallback(async () => {
    setLoading(true)

    try {
      const response = await getInterviewReport(interviewId)
      const data = response.data?.data
      setInterview(data)

      const firstUnansweredIndex =
        data?.questions?.findIndex((question) => !question.response) ?? 0

      setActiveIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0)
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to load interview'))
      navigate('/interviews', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [interviewId, navigate])

  useEffect(() => {
    loadInterview()
  }, [loadInterview])

  const questions = interview?.questions ?? []
  const activeQuestion = questions[activeIndex]

  const answeredCount = useMemo(
    () => questions.filter((question) => question.response).length,
    [questions]
  )

  const progress =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0

  useEffect(() => {
    setAnswerText('')
  }, [activeQuestion?.id])

  const handleSubmitAnswer = async () => {
    if (!activeQuestion) return

    if (activeQuestion.response) {
      toast.error('This question is already answered.')
      return
    }

    if (answerText.trim().length < 20) {
      toast.error('Write at least 20 characters before submitting.')
      return
    }

    setSubmitting(true)

    try {
      const response = await submitAnswer(interviewId, {
        questionId: activeQuestion.id,
        answerText: answerText.trim(),
      })

      const updatedQuestion = response.data?.data

      setInterview((current) => ({
        ...current,
        questions: current.questions.map((question) =>
          question.id === updatedQuestion.id ? updatedQuestion : question
        ),
        answeredQuestions: answeredCount + 1,
      }))

      toast.success('AI feedback generated')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to submit answer'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteInterview = async () => {
    if (!interview) return

    if (answeredCount === 0) {
      toast.error('Answer at least one question before completing.')
      return
    }

    setCompleting(true)

    try {
      await completeInterview(interviewId)
      toast.success('Interview completed')
      navigate(`/interviews/${interviewId}/report`, { replace: true })
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to complete interview'))
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper noPadding>
        <main className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-8 lg:px-10">
          <SessionSkeleton />
        </main>
      </PageWrapper>
    )
  }

  if (!interview || !activeQuestion) {
    return (
      <LoadingState
        title="Interview not found"
        description="Returning to your interviews..."
      />
    )
  }

  const completed = interview.status === INTERVIEW_STATUS.COMPLETED

  return (
    <PageWrapper noPadding>
      <main className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-8 lg:px-10">
        <SessionHeader
          interview={interview}
          answeredCount={answeredCount}
          totalQuestions={questions.length}
          progress={progress}
          completing={completing}
          completed={completed}
          onBack={() => navigate('/interviews')}
          onComplete={handleCompleteInterview}
        />

        <section className="grid gap-7 xl:grid-cols-[320px_minmax(0,1fr)]">
          <QuestionNavigator
            questions={questions}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />

          <QuestionPanel
            question={activeQuestion}
            answerText={answerText}
            setAnswerText={setAnswerText}
            submitting={submitting}
            onSubmit={handleSubmitAnswer}
            onPrev={() => setActiveIndex((index) => Math.max(index - 1, 0))}
            onNext={() =>
              setActiveIndex((index) =>
                Math.min(index + 1, questions.length - 1)
              )
            }
            hasPrev={activeIndex > 0}
            hasNext={activeIndex < questions.length - 1}
          />
        </section>
      </main>
    </PageWrapper>
  )
}

function SessionHeader({
  interview,
  answeredCount,
  totalQuestions,
  progress,
  completing,
  completed,
  onBack,
  onComplete,
}) {
  return (
    <header className="mb-10 border-b border-[var(--color-border)] pb-8">
      <Button
        variant="ghost"
        icon={ArrowLeft}
        onClick={onBack}
        className="mb-6"
      >
        Back to interviews
      </Button>

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cyan)]">
            Interview Session
          </p>

          <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-[var(--color-text-primary)] md:text-[2.35rem]">
            {interview.targetRole}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="indigo">{interview.difficulty}</Badge>
            <Badge variant={completed ? 'success' : 'warning'}>
              {interview.status}
            </Badge>
            <Badge variant="cyan">
              {answeredCount}/{totalQuestions} answered
            </Badge>
          </div>
        </div>

        <Button
          icon={CheckCircle2}
          variant={completed ? 'secondary' : 'primary'}
          loading={completing}
          disabled={completed || completing}
          onClick={onComplete}
        >
          {completed ? 'Completed' : 'Complete interview'}
        </Button>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-indigo),var(--color-cyan))]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </header>
  )
}

function QuestionNavigator({ questions, activeIndex, setActiveIndex }) {
  return (
    <Card padding="none" className="h-fit">
      <div className="p-5">
        <CardHeader
          title="Questions"
          subtitle="Move through the generated set."
          action={<Badge variant="indigo">{questions.length}</Badge>}
        />

        <CardContent>
          <div className="space-y-2">
            {questions.map((question, index) => {
              const active = index === activeIndex
              const answered = Boolean(question.response)

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="w-full rounded-xl border p-3 text-left transition-all"
                  style={{
                    background: active
                      ? 'rgba(99,102,241,0.12)'
                      : 'rgba(99,102,241,0.035)',
                    borderColor: active
                      ? 'var(--color-border-bright)'
                      : 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Question {index + 1}
                    </span>

                    {answered ? (
                      <CheckCircle2 size={16} className="text-[var(--color-success)]" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]" />
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--color-text-muted)]">
                    {question.questionText}
                  </p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function QuestionPanel({
  question,
  answerText,
  setAnswerText,
  submitting,
  onSubmit,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) {
  const hasResponse = Boolean(question.response)

  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title={`Question ${question.sequenceNumber ?? ''}`}
          subtitle={question.category}
          action={
            <Badge variant={hasResponse ? 'success' : 'warning'}>
              {hasResponse ? 'Answered' : 'Pending'}
            </Badge>
          }
        />

        <CardContent>
          <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] p-5">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare
                size={18}
                className="text-[var(--color-indigo-light)]"
              />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Prompt
              </p>
            </div>

            <p className="text-base leading-8 text-[var(--color-text-primary)]">
              {question.questionText}
            </p>
          </div>

          {question.expectedAnswer && (
            <details className="mt-5 rounded-xl border border-[var(--color-border)] bg-[rgba(34,211,238,0.03)] p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--color-cyan)]">
                Expected answer outline
              </summary>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                {question.expectedAnswer}
              </p>
            </details>
          )}

          {hasResponse ? (
            <FeedbackPanel response={question.response} />
          ) : (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                Your answer
              </label>

              <textarea
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                placeholder="Write your answer as if you were speaking in a real interview..."
                className="min-h-[220px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4 text-sm leading-7 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-indigo)] focus:outline-none focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
              />

              <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-xs leading-5 text-[var(--color-text-muted)]">
                  Minimum 20 characters. Clear, structured answers get better feedback.
                </p>

                <Button
                  icon={submitting ? Loader2 : Send}
                  loading={submitting}
                  disabled={submitting}
                  onClick={onSubmit}
                >
                  Submit answer
                </Button>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              disabled={!hasPrev}
              onClick={onPrev}
            >
              Previous
            </Button>

            <Button
              variant="secondary"
              icon={ArrowRight}
              iconPosition="right"
              disabled={!hasNext}
              onClick={onNext}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function FeedbackPanel({ response }) {
  const clarity = formatScore(response.clarityScore)
  const relevance = formatScore(response.relevanceScore)
  const depth = formatScore(response.depthScore)
  const overall = formatScore(response.overallScore)

  return (
    <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[rgba(16,185,129,0.035)] p-5">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-base font-semibold text-[var(--color-text-primary)]">
            AI feedback
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Your submitted answer has been evaluated.
          </p>
        </div>

        <Badge variant="success">Overall {overall.label}</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ScorePill label="Clarity" score={clarity} />
        <ScorePill label="Relevance" score={relevance} />
        <ScorePill label="Depth" score={depth} />
      </div>

      {response.aiFeedback && (
        <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)]">
          {response.aiFeedback}
        </p>
      )}

      {response.improvementTips && (
        <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] p-4">
          <p className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
            Improvement tips
          </p>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            {response.improvementTips}
          </p>
        </div>
      )}
    </div>
  )
}

function ScorePill({ label, score }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p
        className="mt-1 font-display text-lg font-bold"
        style={{ color: score.color }}
      >
        {score.label}
      </p>
    </div>
  )
}

function SessionSkeleton() {
  return (
    <div className="space-y-7">
      <SkeletonCard className="min-h-[180px]" />
      <section className="grid gap-7 xl:grid-cols-[320px_minmax(0,1fr)]">
        <SkeletonCard className="min-h-[520px]" />
        <SkeletonCard className="min-h-[620px]" />
      </section>
    </div>
  )
}
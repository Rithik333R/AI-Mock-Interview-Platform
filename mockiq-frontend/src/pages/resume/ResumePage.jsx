import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FileText,
  Sparkles,
  Trash2,
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
  SkeletonCard,
} from '@/components/common'
import {
  deleteResume,
  generateAtsScore,
  getMyResumes,
  uploadResume,
} from '@/api/resume.api'
import { extractErrorMessage } from '@/api/axios'
import {
  ALLOWED_RESUME_TYPES,
  MAX_RESUME_SIZE_BYTES,
  MAX_RESUME_SIZE_MB,
} from '@/utils/constants'
import { formatAtsScore, formatDate, formatFileSize } from '@/utils/formatters'

export default function ResumePage() {
  const fileInputRef = useRef(null)
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedResumeId, setSelectedResumeId] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [scoringResumeId, setScoringResumeId] = useState(null)
  const [deletingResumeId, setDeletingResumeId] = useState(null)

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.id === selectedResumeId) ?? resumes[0],
    [resumes, selectedResumeId]
  )

  const loadResumes = useCallback(async () => {
    setLoading(true)

    try {
      const response = await getMyResumes()
      const data = response.data?.data ?? []
      setResumes(data)

      if (data.length > 0 && !selectedResumeId) {
        setSelectedResumeId(data[0].id)
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to load resumes'))
    } finally {
      setLoading(false)
    }
  }, [selectedResumeId])

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const handleFilePick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      toast.error('Upload a PDF or DOCX resume only.')
      return
    }

    if (file.size > MAX_RESUME_SIZE_BYTES) {
      toast.error(`Resume must be smaller than ${MAX_RESUME_SIZE_MB}MB.`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const response = await uploadResume(file, (progressEvent) => {
        if (!progressEvent.total) return
        const percent = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        )
        setUploadProgress(percent)
      })

      const created = response.data?.data

      if (created) {
        setResumes((current) => [created, ...current])
        setSelectedResumeId(created.id)
      }

      toast.success('Resume uploaded successfully')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Resume upload failed'))
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (resumeId) => {
    const confirmed = window.confirm('Delete this resume from your list?')
    if (!confirmed) return

    setDeletingResumeId(resumeId)

    try {
      await deleteResume(resumeId)

      setResumes((current) =>
        current.filter((resume) => resume.id !== resumeId)
      )

      if (selectedResumeId === resumeId) {
        setSelectedResumeId(null)
      }

      toast.success('Resume deleted')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to delete resume'))
    } finally {
      setDeletingResumeId(null)
    }
  }

  const handleGenerateAts = async () => {
    if (!selectedResume) {
      toast.error('Upload a resume first')
      return
    }

    if (jobDescription.trim().length < 50) {
      toast.error('Paste a job description with at least 50 characters.')
      return
    }

    setScoringResumeId(selectedResume.id)

    try {
      const response = await generateAtsScore(selectedResume.id, {
        jobDescription,
      })

      const atsResult = response.data?.data

      setResumes((current) =>
        current.map((resume) =>
          resume.id === selectedResume.id
            ? {
                ...resume,
                atsScore: atsResult?.score,
                atsFeedback: atsResult,
                jobDescription,
              }
            : resume
        )
      )

      toast.success('ATS score generated')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to generate ATS score'))
    } finally {
      setScoringResumeId(null)
    }
  }

  return (
    <PageWrapper noPadding>
      <main className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-8 lg:px-10">
        <header className="mb-10 flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cyan)]">
              Resume Intelligence
            </p>

            <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-[var(--color-text-primary)] md:text-[2.35rem]">
              Resume
            </h1>

            <p className="mt-3 max-w-xl text-[0.95rem] leading-7 text-[var(--color-text-secondary)]">
              Upload your resume, extract insights, and score it against real job descriptions.
            </p>
          </div>

          <Button
            icon={Upload}
            onClick={handleFilePick}
            loading={uploading}
            disabled={uploading}
          >
            Upload resume
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleUpload}
          />
        </header>

        {uploading && (
          <UploadProgress progress={uploadProgress} />
        )}

        {loading ? (
          <ResumeSkeleton />
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No resumes uploaded yet"
            description="Upload a PDF or DOCX resume to unlock parsing, ATS scoring, and skill gap analysis."
            actionLabel="Upload resume"
            actionIcon={Upload}
            onAction={handleFilePick}
          />
        ) : (
          <section className="grid gap-7 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
            <ResumeList
              resumes={resumes}
              selectedResumeId={selectedResume?.id}
              deletingResumeId={deletingResumeId}
              onSelect={setSelectedResumeId}
              onDelete={handleDelete}
            />

            <AtsPanel
              resume={selectedResume}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              scoring={scoringResumeId === selectedResume?.id}
              onGenerate={handleGenerateAts}
            />
          </section>
        )}
      </main>
    </PageWrapper>
  )
}

function UploadProgress({ progress }) {
  return (
    <Card padding="none" className="mb-8">
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Uploading resume
          </p>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {progress}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-indigo),var(--color-cyan))]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  )
}

function ResumeList({
  resumes,
  selectedResumeId,
  deletingResumeId,
  onSelect,
  onDelete,
}) {
  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title="Uploaded resumes"
          subtitle="Select a resume to inspect or score."
          action={<Badge variant="indigo">{resumes.length} total</Badge>}
        />

        <CardContent>
          <div className="space-y-3">
            {resumes.map((resume) => {
              const selected = resume.id === selectedResumeId
              const ats = formatAtsScore(resume.atsScore)

              return (
                <div
                  key={resume.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(resume.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(resume.id)
                    }
                  }}
                  className="w-full rounded-xl border p-4 text-left transition-all"
                  style={{
                    background: selected
                      ? 'rgba(99,102,241,0.10)'
                      : 'rgba(99,102,241,0.035)',
                    borderColor: selected
                      ? 'var(--color-border-bright)'
                      : 'var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText
                          size={17}
                          className="shrink-0 text-[var(--color-indigo-light)]"
                        />
                        <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                          {resume.fileName}
                        </p>
                      </div>

                      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                        Uploaded {formatDate(resume.createdAt, 'short')}
                      </p>
                    </div>

                    <Badge variant={resume.atsScore == null ? 'default' : 'success'}>
                      {resume.atsScore == null ? 'No ATS' : ats.label}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {resume.fileSize ? formatFileSize(resume.fileSize) : 'Parsed resume'}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      loading={deletingResumeId === resume.id}
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(resume.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function AtsPanel({
  resume,
  jobDescription,
  setJobDescription,
  scoring,
  onGenerate,
}) {
  const ats = formatAtsScore(resume?.atsScore)

  return (
    <Card padding="none">
      <div className="p-6">
        <CardHeader
          title="ATS scoring"
          subtitle="Paste a job description to compare against the selected resume."
          action={
            resume?.atsScore == null ? (
              <Badge variant="default">Not scored</Badge>
            ) : (
              <Badge variant="success">{ats.label}</Badge>
            )
          }
        />

        <CardContent>
          <div className="mb-5 rounded-xl border border-[var(--color-border)] bg-[rgba(99,102,241,0.035)] p-4">
            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
              {resume?.fileName}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Selected resume
            </p>
          </div>

          <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
            Job description
          </label>

          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the job description here..."
            className="min-h-[220px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4 text-sm leading-6 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-indigo)] focus:outline-none focus:ring-4 focus:ring-[rgba(99,102,241,0.12)]"
          />

          <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-[var(--color-text-muted)]">
              Minimum 50 characters. Longer descriptions produce better scoring.
            </p>

            <Button
              icon={Sparkles}
              loading={scoring}
              disabled={scoring}
              onClick={onGenerate}
            >
              Generate ATS
            </Button>
          </div>

          {resume?.atsFeedback && (
            <AtsFeedback feedback={resume.atsFeedback} />
          )}
        </CardContent>
      </div>
    </Card>
  )
}

function AtsFeedback({ feedback }) {
  return (
    <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[rgba(34,211,238,0.035)] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="font-display text-base font-semibold text-[var(--color-text-primary)]">
          AI feedback
        </p>
        <Badge variant="cyan">{feedback.score}%</Badge>
      </div>

      {feedback.summary && (
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          {feedback.summary}
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SkillList title="Matched skills" items={feedback.matchedSkills} variant="success" />
        <SkillList title="Missing skills" items={feedback.missingSkills} variant="warning" />
      </div>

      {feedback.suggestions?.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
            Suggestions
          </p>
          <ul className="space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            {feedback.suggestions.map((suggestion) => (
              <li key={suggestion}>- {suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function SkillList({ title, items = [], variant }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">No data</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.slice(0, 8).map((item) => (
            <Badge key={item} variant={variant}>
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function ResumeSkeleton() {
  return (
    <section className="grid gap-7 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
      <SkeletonCard className="min-h-[420px]" />
      <SkeletonCard className="min-h-[520px]" />
    </section>
  )
}
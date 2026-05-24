import api from './axios'

/**
 * resume.api.js — Resume management endpoints.
 *
 * All endpoints are PROTECTED — JWT attached automatically
 * by the Axios request interceptor.
 *
 * Upload note:
 *   File uploads must use multipart/form-data.
 *   We override Content-Type here — Axios then sets the correct
 *   multipart boundary automatically when it sees a FormData body.
 *   Never manually set the boundary string yourself.
 */

/**
 * uploadResume — upload a PDF or DOCX resume file.
 * Backend extracts text and uploads to Cloudinary automatically.
 *
 * POST /api/resumes/upload
 * @param {File}     file               — the File object from input/drop
 * @param {Function} onUploadProgress   — optional Axios progress callback
 *   e.g. (e) => setProgress(Math.round((e.loaded / e.total) * 100))
 * @returns {Promise<AxiosResponse>}
 */
export const uploadResume = (file, onUploadProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
}

/**
 * getMyResumes — fetch all active resumes for the current user.
 * Returns newest first.
 *
 * GET /api/resumes
 * @returns {Promise<AxiosResponse>}
 */
export const getMyResumes = () =>
  api.get('/resumes')

/**
 * getResumeById — fetch a single resume by ID.
 * Only accessible by the owning user (enforced on backend).
 *
 * GET /api/resumes/:id
 * @param {number} id
 * @returns {Promise<AxiosResponse>}
 */
export const getResumeById = (id) =>
  api.get(`/resumes/${id}`)

/**
 * deleteResume — soft-delete a resume (sets isActive = false).
 * The file is retained in Cloudinary but hidden from all queries.
 *
 * DELETE /api/resumes/:id
 * @param {number} id
 * @returns {Promise<AxiosResponse>}
 */
export const deleteResume = (id) =>
  api.delete(`/resumes/${id}`)

/**
 * generateAtsScore — score a resume against a job description via Gemini AI.
 * This call is slow (3–8 seconds) — show a loading state in the UI.
 *
 * POST /api/resumes/:id/ats-score
 * @param {number} id                        — Resume ID to score
 * @param {{ jobDescription: string }} data  — the job description text (min 50 chars)
 * @returns {Promise<AxiosResponse>}
 *
 * Response data shape:
 * {
 *   score: number,            // 0-100
 *   summary: string,
 *   matchedSkills: string[],
 *   missingSkills: string[],
 *   suggestions: string[],
 *   experienceFeedback: string,
 *   educationFeedback: string
 * }
 */
export const generateAtsScore = (id, data) =>
  api.post(`/resumes/${id}/ats-score`, data)
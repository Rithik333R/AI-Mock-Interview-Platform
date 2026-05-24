import api from './axios'

/**
 * interview.api.js — Mock interview session endpoints.
 *
 * All endpoints are PROTECTED — JWT attached automatically
 * by the Axios request interceptor.
 *
 * Interview lifecycle:
 *   1. startInterview()      → creates session, generates 5 AI questions (5–10s)
 *   2. submitAnswer()        → submits one answer, returns AI feedback (3–6s)
 *      └─ repeat for each question
 *   3. completeInterview()   → computes overall score, marks COMPLETED
 *   4. getInterviewReport()  → full session with all Q&A and scores
 *   5. getMyInterviews()     → history list (lightweight, no questions loaded)
 */

/**
 * startInterview — create a new session and generate 5 AI questions.
 * This call is slow (5–10s) — show a prominent loading state.
 *
 * POST /api/interviews/start
 * @param {{ targetRole: string, difficulty: 'EASY'|'MEDIUM'|'HARD' }} data
 * @returns {Promise<AxiosResponse>}
 *
 * Response data shape:
 * {
 *   id: number,
 *   targetRole: string,
 *   difficulty: string,
 *   status: 'IN_PROGRESS',
 *   overallScore: null,
 *   createdAt: string,
 *   totalQuestions: 5,
 *   answeredQuestions: 0,
 *   questions: [
 *     {
 *       id: number,
 *       questionText: string,
 *       expectedAnswer: string,
 *       category: 'TECHNICAL'|'BEHAVIOURAL'|'SITUATIONAL'|'HR',
 *       sequenceNumber: number,
 *       response: null
 *     }
 *   ]
 * }
 */
export const startInterview = (data) =>
  api.post('/interviews/start', data)

/**
 * submitAnswer — submit one answer and receive AI feedback.
 * Each question is submitted individually — not in batch.
 * This call is slow (3–6s) — show a loading state on the submit button.
 *
 * POST /api/interviews/:id/answer
 * @param {number} id                                        — Interview session ID
 * @param {{ questionId: number, answerText: string }} data  — answer payload
 * @returns {Promise<AxiosResponse>}
 *
 * Response data shape:
 * {
 *   id: number,             // question id
 *   questionText: string,
 *   expectedAnswer: string,
 *   category: string,
 *   sequenceNumber: number,
 *   response: {
 *     id: number,
 *     answerText: string,
 *     aiFeedback: string,
 *     clarityScore: number,    // 0-10
 *     relevanceScore: number,  // 0-10
 *     depthScore: number,      // 0-10
 *     overallScore: number,    // average of three dimensions
 *     improvementTips: string
 *   }
 * }
 */
export const submitAnswer = (id, data) =>
  api.post(`/interviews/${id}/answer`, data)

/**
 * completeInterview — mark the session as COMPLETED.
 * Computes overall score = average of all answered questions (0–10).
 * Unanswered questions count as 0.
 * This action cannot be undone.
 *
 * POST /api/interviews/:id/complete
 * @param {number} id — Interview session ID
 * @returns {Promise<AxiosResponse>}
 */
export const completeInterview = (id) =>
  api.post(`/interviews/${id}/complete`)

/**
 * getInterviewReport — fetch the full session report.
 * Includes all questions, user answers, AI feedback, and per-question scores.
 * Best called after completeInterview().
 *
 * GET /api/interviews/:id/report
 * @param {number} id
 * @returns {Promise<AxiosResponse>}
 */
export const getInterviewReport = (id) =>
  api.get(`/interviews/${id}/report`)

/**
 * getMyInterviews — fetch all past sessions for the current user.
 * Returns a lightweight list (no questions or answers loaded).
 * Use getInterviewReport() for full details on a specific session.
 *
 * GET /api/interviews
 * @returns {Promise<AxiosResponse>}
 */
export const getMyInterviews = () =>
  api.get('/interviews')
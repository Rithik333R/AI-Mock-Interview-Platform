import api from './axios'

/**
 * dashboard.api.js — Dashboard analytics endpoints.
 *
 * All endpoints are PROTECTED — JWT attached automatically
 * by the Axios request interceptor.
 *
 * All four endpoints are called in parallel on DashboardPage load:
 *
 *   const [summary, stats, trend, skills] = await Promise.all([
 *     getDashboardSummary(),
 *     getInterviewStats(),
 *     getScoreTrend(),
 *     getSkillSummary(),
 *   ])
 *
 * All endpoints return zeros/empty arrays when no data exists yet —
 * they never return 404. Safe to call on a fresh account.
 */

/**
 * getDashboardSummary — top-level stats card data.
 *
 * GET /api/dashboard
 * @returns {Promise<AxiosResponse>}
 *
 * Response data shape:
 * {
 *   totalInterviews: number,
 *   completedInterviews: number,
 *   averageScore: number,      // 0.0 – 10.0
 *   bestScore: number,         // 0.0 – 10.0
 *   totalResumes: number,
 *   bestAtsScore: number,      // 0 – 100
 *   completionRate: number     // 0.0 – 100.0 (percentage)
 * }
 */
export const getDashboardSummary = () =>
  api.get('/dashboard')

/**
 * getInterviewStats — per-difficulty breakdown + total answers.
 *
 * GET /api/dashboard/interview-stats
 * @returns {Promise<AxiosResponse>}
 *
 * Response data shape:
 * {
 *   byDifficulty: [
 *     {
 *       difficulty: 'EASY' | 'MEDIUM' | 'HARD',
 *       totalSessions: number,
 *       completedSessions: number,
 *       averageScore: number    // 0.0 – 10.0
 *     }
 *   ],
 *   totalAnswered: number,
 *   averageAnswersPerSession: number
 * }
 */
export const getInterviewStats = () =>
  api.get('/dashboard/interview-stats')

/**
 * getScoreTrend — last 10 completed interview scores for a line chart.
 * Ordered chronologically — oldest first, newest last.
 * trendDirection tells the UI which arrow/colour to show.
 *
 * GET /api/dashboard/score-trend
 * @returns {Promise<AxiosResponse>}
 *
 * Response data shape:
 * {
 *   trend: [
 *     {
 *       interviewId: number,
 *       targetRole: string,
 *       difficulty: string,
 *       score: number,         // 0.0 – 10.0
 *       completedAt: string    // ISO datetime
 *     }
 *   ],
 *   trendDirection: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA'
 * }
 */
export const getScoreTrend = () =>
  api.get('/dashboard/score-trend')

/**
 * getSkillSummary — most-practiced roles + ATS scores per resume.
 *
 * GET /api/dashboard/skill-summary
 * @returns {Promise<AxiosResponse>}
 *
 * Response data shape:
 * {
 *   rolePracticeFrequency: [
 *     {
 *       targetRole: string,
 *       sessionCount: number,
 *       averageScore: number   // 0.0 – 10.0
 *     }
 *   ],
 *   resumeAtsSummary: [
 *     {
 *       resumeId: number,
 *       fileName: string,
 *       atsScore: number,               // 0 – 100
 *       jobDescriptionPreview: string   // first 80 chars
 *     }
 *   ]
 * }
 */
export const getSkillSummary = () =>
  api.get('/dashboard/skill-summary')
import api from './axios'

/**
 * skillgap.api.js — Skill gap analysis endpoints.
 *
 * All endpoints are PROTECTED — JWT attached automatically
 * by the Axios request interceptor.
 *
 * Skill gap flow:
 *   1. analyzeSkillGap()     → AI reads resume vs target role (5–10s)
 *   2. getLatestSkillGap()   → fetch most recent result (used on page load)
 *   3. getAllSkillGaps()      → full history list
 *   4. getSkillGapById()     → one specific analysis
 *
 * After a successful analysis, the user can proceed to:
 *   → roadmap.api.js → generateRoadmap({ skillGapId })
 */

/**
 * analyzeSkillGap — run an AI skill gap analysis.
 * Gemini compares the resume's extracted text against the target role
 * and returns current skills, missing skills, proficiency levels,
 * and a readiness score (0–100).
 * This call is slow (5–10s) — show a prominent loading state.
 *
 * POST /api/skill-gap/analyze
 * @param {{ resumeId: number, targetRole: string }} data
 * @returns {Promise<AxiosResponse>}
 *
 * Response data shape:
 * {
 *   id: number,
 *   targetRole: string,
 *   currentSkills: string[],
 *   missingSkills: string[],
 *   proficiencyMap: Record<string, 'BEGINNER'|'INTERMEDIATE'|'ADVANCED'|'NOT_STARTED'>,
 *   readinessScore: number,   // 0-100
 *   summary: string,
 *   resumeId: number,
 *   createdAt: string
 * }
 */
export const analyzeSkillGap = (data) =>
  api.post('/skill-gap/analyze', data)

/**
 * getLatestSkillGap — fetch the most recent analysis for the current user.
 * Called on SkillGapPage load to show the last result immediately.
 * Returns 404 if no analysis has been run yet — handle gracefully.
 *
 * GET /api/skill-gap/latest
 * @returns {Promise<AxiosResponse>}
 */
export const getLatestSkillGap = () =>
  api.get('/skill-gap/latest')

/**
 * getAllSkillGaps — fetch all past analyses for the current user.
 * Returns newest first.
 *
 * GET /api/skill-gap
 * @returns {Promise<AxiosResponse>}
 */
export const getAllSkillGaps = () =>
  api.get('/skill-gap')

/**
 * getSkillGapById — fetch one specific analysis by ID.
 * Only accessible by the owning user (enforced on backend).
 *
 * GET /api/skill-gap/:id
 * @param {number} id
 * @returns {Promise<AxiosResponse>}
 */
export const getSkillGapById = (id) =>
  api.get(`/skill-gap/${id}`)
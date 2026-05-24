import api from './axios'

/**
 * roadmap.api.js — Learning roadmap endpoints.
 *
 * All endpoints are PROTECTED — JWT attached automatically
 * by the Axios request interceptor.
 *
 * Roadmap flow:
 *   1. generateRoadmap()     → AI builds a week-by-week plan from a skill gap (5–10s)
 *   2. getActiveRoadmap()    → fetch the current active roadmap on page load
 *   3. completeMilestone()   → mark one milestone as done, get updated completion %
 *
 * Important backend rules:
 *   - Only ONE active roadmap per user at a time.
 *   - Generating a new roadmap automatically deactivates all previous ones.
 *   - getActiveRoadmap() returns 404 if no roadmap has been generated yet.
 *   - Each milestone can only be completed once (backend guards duplicate patches).
 */

/**
 * generateRoadmap — generate a personalised week-by-week learning plan.
 * Gemini reads the missing skills from the skill gap analysis and builds
 * a structured plan with resources per milestone.
 * This call is slow (5–10s) — show a prominent loading state.
 * Any previously active roadmap is deactivated automatically.
 *
 * POST /api/roadmap/generate
 * @param {{ skillGapId: number }} data
 * @returns {Promise<AxiosResponse>}
 *
 * Response data shape:
 * {
 *   id: number,
 *   targetRole: string,
 *   totalWeeks: number,
 *   completionPercentage: number,   // 0.0 – 100.0
 *   isActive: true,
 *   skillGapId: number,
 *   createdAt: string,
 *   milestones: [
 *     {
 *       id: number,
 *       weekNumber: number,
 *       title: string,
 *       description: string,
 *       skills: string[],
 *       resources: string[],
 *       completed: boolean
 *     }
 *   ]
 * }
 */
export const generateRoadmap = (data) =>
  api.post('/roadmap/generate', data)

/**
 * getActiveRoadmap — fetch the currently active roadmap with all milestones.
 * Called on RoadmapPage load to show the current plan immediately.
 * Returns 404 if no roadmap has been generated yet — handle gracefully
 * by showing an empty state with a CTA linking to /skill-gap.
 *
 * GET /api/roadmap/active
 * @returns {Promise<AxiosResponse>}
 */
export const getActiveRoadmap = () =>
  api.get('/roadmap/active')

/**
 * completeMilestone — mark one milestone as completed.
 * The backend flips the milestone's completed flag in the JSON blob,
 * recomputes completionPercentage, and returns the full updated roadmap.
 *
 * Use optimistic UI in RoadmapPage:
 *   1. Immediately flip the milestone's completed flag in local state
 *   2. Fire this API call in the background
 *   3. On error: revert the local state + show error toast
 *
 * PATCH /api/roadmap/:roadmapId/milestone/:milestoneId/complete
 * @param {number} roadmapId    — the roadmap that owns the milestone
 * @param {number} milestoneId  — the milestone's id field (from milestones array)
 * @returns {Promise<AxiosResponse>}
 */
export const completeMilestone = (roadmapId, milestoneId) =>
  api.patch(`/roadmap/${roadmapId}/milestone/${milestoneId}/complete`)
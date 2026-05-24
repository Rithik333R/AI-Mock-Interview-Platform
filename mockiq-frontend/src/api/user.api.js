import api from './axios'

/**
 * user.api.js — User profile endpoints.
 *
 * All endpoints are PROTECTED — JWT attached automatically
 * by the Axios request interceptor.
 *
 * Backend response shape on success:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "fullName": "John Doe",
 *     "email": "john@example.com",
 *     "role": "USER",
 *     "isActive": true,
 *     "createdAt": "2026-05-18T10:00:00"
 *   }
 * }
 */

/**
 * getMyProfile — fetch the currently authenticated user's profile.
 * Used on app load to refresh user data and in ProfilePage.
 *
 * GET /api/users/me
 * @returns {Promise<AxiosResponse>}
 */
export const getMyProfile = () =>
  api.get('/users/me')

/**
 * updateMyProfile — update the authenticated user's full name.
 * After success, call authStore.setUser() to sync state.
 *
 * PUT /api/users/me
 * @param {{ fullName: string }} data
 * @returns {Promise<AxiosResponse>}
 */
export const updateMyProfile = (data) =>
  api.put('/users/me', data)
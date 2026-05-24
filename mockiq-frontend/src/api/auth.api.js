import api from './axios'

/**
 * auth.api.js — Authentication endpoints.
 *
 * Both endpoints are PUBLIC — no JWT required.
 * The Axios request interceptor skips token attachment
 * when localStorage has no token (fresh session).
 *
 * Backend response shape on success:
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "accessToken": "eyJhbGci...",
 *     "tokenType": "Bearer",
 *     "email": "john@example.com",
 *     "fullName": "John Doe",
 *     "role": "USER"
 *   }
 * }
 */

/**
 * register — create a new user account.
 * On success the user is logged in immediately (token returned).
 *
 * @param {{ fullName: string, email: string, password: string }} data
 * @returns {Promise<AxiosResponse>}
 */
export const register = (data) =>
  api.post('/auth/register', data)

/**
 * login — authenticate with email + password.
 *
 * @param {{ email: string, password: string }} data
 * @returns {Promise<AxiosResponse>}
 */
export const login = (data) =>
  api.post('/auth/login', data)
import { useState, useEffect, useCallback, useRef } from 'react'
import { extractErrorMessage } from '@/api/axios'

/**
 * useApi — generic data fetching hook.
 *
 * Handles the loading → data/error lifecycle for any API call.
 * Eliminates repetitive useState/useEffect boilerplate across pages.
 *
 * Features:
 *   - Automatic fetch on mount (configurable)
 *   - Manual refetch trigger
 *   - Loading + error state
 *   - Abort on unmount (prevents state updates on unmounted components)
 *   - Dependency-based re-fetch (like useEffect deps)
 *   - immediate option to skip auto-fetch (for forms, mutations)
 *
 * Usage — auto fetch on mount:
 *   const { data, loading, error, refetch } = useApi(getMyResumes)
 *
 * Usage — fetch with params:
 *   const { data, loading } = useApi(() => getInterviewReport(id), [id])
 *
 * Usage — manual trigger only (no auto-fetch):
 *   const { data, loading, execute } = useApi(getMyResumes, [], {
 *     immediate: false
 *   })
 *   // later:
 *   await execute()
 *
 * Usage — with onSuccess callback:
 *   const { loading } = useApi(getMyProfile, [], {
 *     onSuccess: (data) => setUser(data),
 *   })
 *
 * @template T
 * @param {() => Promise<import('axios').AxiosResponse<{data: T}>>} apiFn
 * @param {unknown[]} deps        — re-fetch when these change (like useEffect)
 * @param {{
 *   immediate?: boolean,         — auto-fetch on mount (default: true)
 *   onSuccess?: (data: T) => void,
 *   onError?:   (message: string) => void,
 * }} options
 */
export default function useApi(apiFn, deps = [], options = {}) {
  const {
    immediate = true,
    onSuccess,
    onError,
  } = options

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error,   setError]   = useState(null)

  // Track mounted state to prevent setState after unmount
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Stable reference to apiFn — prevents infinite loops when
  // the caller passes an inline arrow function
  const apiFnRef = useRef(apiFn)
  useEffect(() => { apiFnRef.current = apiFn })

  /**
   * execute — run the API call.
   * Called automatically on mount (if immediate=true)
   * and manually via refetch().
   *
   * Returns the data on success so callers can await it:
   *   const result = await execute()
   */
  const execute = useCallback(async () => {
    if (!mountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const response = await apiFnRef.current()

      // Backend wraps data in { success, data, message }
      // We unwrap to the inner data object automatically
      const result = response?.data?.data ?? response?.data ?? null

      if (mountedRef.current) {
        setData(result)
        setLoading(false)
        onSuccess?.(result)
      }

      return result

    } catch (err) {
      const message = extractErrorMessage(err)

      if (mountedRef.current) {
        setError(message)
        setLoading(false)
        onError?.(message)
      }

      // Re-throw so callers can catch if needed
      throw err
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // Auto-fetch on mount and when deps change
  useEffect(() => {
    if (immediate) {
      execute()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate])

  return {
    data,
    loading,
    error,

    /**
     * refetch — re-run the API call manually.
     * Use after a mutation to refresh the list:
     *   await deleteResume(id)
     *   refetch()
     */
    refetch: execute,

    /**
     * execute — same as refetch but named semantically
     * for the immediate=false (manual trigger) pattern.
     */
    execute,

    /**
     * setData — manually update data without an API call.
     * Use for optimistic UI updates:
     *   setData(prev => prev.filter(r => r.id !== deletedId))
     */
    setData,
  }
}
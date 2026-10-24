import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError, api, buildQuery, type Params } from '@/lib/api'

interface AsyncState<T> {
  data: T | null
  error: string | null
  loading: boolean
  reload: () => void
}

/** Fetch once (and on parameter change) with explicit loading and error states. */
export function useApi<T>(path: string | null, params?: Params, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [nonce, setNonce] = useState(0)
  const alive = useRef(true)

  const key = `${path ?? ''}${buildQuery(params)}`

  useEffect(() => {
    if (!path) {
      setLoading(false)
      return
    }
    alive.current = true
    setLoading(true)
    setError(null)

    api
      .get<T>(path, params)
      .then((result) => {
        if (alive.current) setData(result)
      })
      .catch((err: unknown) => {
        if (alive.current) setError(err instanceof ApiError ? err.message : 'Unable to load this content.')
      })
      .finally(() => {
        if (alive.current) setLoading(false)
      })

    return () => {
      alive.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce, ...deps])

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  return { data, error, loading, reload }
}

/** Debounce a value, used by the search inputs. */
export function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

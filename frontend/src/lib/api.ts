/**
 * Thin API client.
 *
 * Every call goes to the same origin under /api, which the development server
 * proxies to the FastAPI service, so there is no cross-origin session handling
 * to get wrong.
 */

export interface FieldError {
  field: string
  message: string
}

export class ApiError extends Error {
  status: number
  fields: FieldError[]

  constructor(message: string, status: number, fields: FieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }

  fieldError(field: string): string | undefined {
    return this.fields.find((item) => item.field === field || item.field.endsWith(`.${field}`))?.message
  }
}

const TOKEN_KEY = 'urbanledge.token'

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable — the session simply will not persist */
  }
}

type Params = Record<string, string | number | boolean | null | undefined>

export function buildQuery(params: Params = {}): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`/api${path}`, { ...init, headers })
  } catch {
    throw new ApiError(
      'We could not reach the server. Check your connection and try again.',
      0,
    )
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  const payload = text ? safeParse(text) : null

  if (!response.ok) {
    const detail =
      (payload && typeof payload === 'object' && 'detail' in payload
        ? String((payload as { detail: unknown }).detail)
        : '') || 'Something went wrong. Please try again.'
    const fields =
      payload && typeof payload === 'object' && 'errors' in payload
        ? ((payload as { errors: FieldError[] }).errors ?? [])
        : []
    throw new ApiError(detail, response.status, fields)
  }

  return payload as T
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const api = {
  get: <T>(path: string, params?: Params) => request<T>(`${path}${buildQuery(params)}`),
  post: <T>(path: string, body?: unknown, params?: Params) =>
    request<T>(`${path}${buildQuery(params)}`, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  downloadUrl: (path: string) => `/api${path}`,
}

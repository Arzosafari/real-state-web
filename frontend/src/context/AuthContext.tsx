import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { ApiError, api, getToken, setToken } from '@/lib/api'
import type { AuthResponse, User } from '@/lib/types'

interface AuthValue {
  user: User | null
  ready: boolean
  isStaff: boolean
  signIn: (email: string, password: string) => Promise<User>
  register: (payload: {
    name: string
    email: string
    password: string
    phone?: string
    company?: string
  }) => Promise<User>
  signOut: () => void
  updateProfile: (payload: { name?: string; phone?: string; company?: string }) => Promise<User>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      setReady(true)
      return
    }
    api
      .get<User>('/auth/me')
      .then(setUser)
      .catch(() => {
        setToken(null)
        setUser(null)
      })
      .finally(() => setReady(true))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.post<AuthResponse>('/auth/login', { email, password })
    setToken(result.access_token)
    setUser(result.user)
    return result.user
  }, [])

  const register = useCallback<AuthValue['register']>(async (payload) => {
    const result = await api.post<AuthResponse>('/auth/register', payload)
    setToken(result.access_token)
    setUser(result.user)
    return result.user
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const updateProfile = useCallback<AuthValue['updateProfile']>(async (payload) => {
    const updated = await api.patch<User>('/auth/me', payload)
    setUser(updated)
    return updated
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      isStaff: Boolean(user && (user.role === 'admin' || user.role === 'editor')),
      signIn,
      register,
      signOut,
      updateProfile,
    }),
    [user, ready, signIn, register, signOut, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export { ApiError }

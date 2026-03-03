import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { fetchUserInfo, type UserInfo, type TokenResponse } from '@/lib/oauth'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserInfo | null
  accessToken: string | null
  error: string | null
}

interface AuthContextValue extends AuthState {
  setTokens: (tokens: TokenResponse) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'hanzo_access_token'
const REFRESH_KEY = 'hanzo_refresh_token'
const USER_KEY = 'hanzo_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
    error: null,
  })

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const userStr = localStorage.getItem(USER_KEY)
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setState({ isAuthenticated: true, isLoading: false, user, accessToken: token, error: null })
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setState((s) => ({ ...s, isLoading: false }))
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }))
    }
  }, [])

  const setTokens = useCallback(async (tokens: TokenResponse) => {
    localStorage.setItem(TOKEN_KEY, tokens.access_token)
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
    }
    try {
      const user = await fetchUserInfo(tokens.access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      setState({ isAuthenticated: true, isLoading: false, user, accessToken: tokens.access_token, error: null })
    } catch (err) {
      // Token might be a Casdoor JWT — decode it for basic user info
      try {
        const payload = JSON.parse(atob(tokens.access_token.split('.')[1]))
        const user: UserInfo = {
          sub: payload.sub || payload.name,
          name: payload.name,
          displayName: payload.displayName,
          email: payload.email,
          avatar: payload.avatar,
          owner: payload.owner,
        }
        localStorage.setItem(USER_KEY, JSON.stringify(user))
        setState({ isAuthenticated: true, isLoading: false, user, accessToken: tokens.access_token, error: null })
      } catch {
        setState({ isAuthenticated: true, isLoading: false, user: null, accessToken: tokens.access_token, error: null })
      }
    }
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    setState({ isAuthenticated: false, isLoading: false, user: null, accessToken: null, error: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, setTokens, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { exchangeCode, getOAuthExtraState } from '@/lib/oauth'
import { useAuth } from '@/contexts/AuthContext'
import { getTenantFromWindow } from '@/lib/tenant'
import { Loader2 } from 'lucide-react'

/**
 * OAuth2 callback handler.
 *
 * Handles two flows:
 * 1. Direct login: exchange code for tokens, store locally, redirect to /account
 * 2. Proxied OAuth: received code on behalf of a client app, redirect back with code
 */
const CallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setTokens } = useAuth()
  const tenant = getTenantFromWindow()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')
    const errorDesc = searchParams.get('error_description')

    if (errorParam) {
      setError(errorDesc || errorParam)
      return
    }

    if (!code) {
      setError('No authorization code received')
      return
    }

    // Check if this was a proxied OAuth flow (we stored extra state)
    const extra = getOAuthExtraState()

    if (extra?.redirect_uri) {
      // Proxied flow: forward the code to the original client's redirect_uri
      const redirect = new URL(extra.redirect_uri)
      redirect.searchParams.set('code', code)
      if (extra.state) redirect.searchParams.set('state', extra.state)
      window.location.href = redirect.toString()
      return
    }

    // Direct login flow: exchange code for tokens
    const callbackUri = `${window.location.origin}/callback`
    exchangeCode({
      code,
      state: state || '',
      clientId: tenant.defaultClientId,
      redirectUri: callbackUri,
    })
      .then((tokens) => {
        setTokens(tokens)
        navigate('/account')
      })
      .catch((err) => {
        setError(err.message || 'Token exchange failed')
      })
  }, [searchParams, navigate, setTokens, tenant])

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--black)] text-[var(--white)] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-bold text-red-400">Authentication Error</h1>
          <p className="text-neutral-400">{error}</p>
          <a href="/login" className="inline-block text-white underline">
            Try again
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--white)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-neutral-400" />
        <p className="text-neutral-400">Completing sign in...</p>
      </div>
    </div>
  )
}

export default CallbackPage

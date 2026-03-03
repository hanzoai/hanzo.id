import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { passwordLogin, startAuthorize } from '@/lib/oauth'
import { useAuth } from '@/contexts/AuthContext'
import { getTenantFromWindow } from '@/lib/tenant'

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setTokens } = useAuth()
  const tenant = getTenantFromWindow()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // OAuth params from query string (when redirected from a client app)
  const clientId = searchParams.get('client_id') ?? searchParams.get('clientId')
  const redirectUri = searchParams.get('redirect_uri') ?? searchParams.get('redirectUri')
  const responseType = searchParams.get('response_type') ?? searchParams.get('responseType')
  const scope = searchParams.get('scope')
  const state = searchParams.get('state')

  const isOAuthFlow = !!(clientId && redirectUri && responseType)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      if (isOAuthFlow) {
        // OAuth flow: password login returns a code, redirect back to client
        const loginUrl = new URL('/api/login', tenant.iamOrigin)
        loginUrl.searchParams.set('client_id', clientId!)
        loginUrl.searchParams.set('response_type', responseType!)
        loginUrl.searchParams.set('redirect_uri', redirectUri!)
        if (scope) loginUrl.searchParams.set('scope', scope)
        if (state) loginUrl.searchParams.set('state', state)

        const res = await fetch(loginUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: responseType === 'token' ? 'token' : 'code',
            organization: tenant.org,
            username: email,
            password,
            application: clientId,
          }),
        })

        const data = await res.json()

        if (data.status !== 'ok') {
          throw new Error(data.msg || 'Login failed')
        }

        if (responseType === 'token') {
          // Implicit flow: redirect with token in fragment
          const redirect = new URL(redirectUri!)
          redirect.hash = `access_token=${data.data}&token_type=bearer&state=${state || ''}`
          window.location.href = redirect.toString()
        } else {
          // Authorization code flow: redirect with code in query
          const redirect = new URL(redirectUri!)
          redirect.searchParams.set('code', data.data)
          if (state) redirect.searchParams.set('state', state)
          window.location.href = redirect.toString()
        }
      } else {
        // Direct login (no OAuth client): password login, store token locally
        const result = await passwordLogin({
          username: email,
          password,
        })
        await setTokens({ access_token: result.token, token_type: 'bearer', expires_in: 604800 })
        toast.success('Signed in successfully')
        navigate('/account')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthRedirect = async () => {
    // Redirect to Casdoor's authorize endpoint (for SSO via social providers)
    const callbackUri = `${window.location.origin}/callback`
    await startAuthorize({
      clientId: clientId ?? tenant.defaultClientId,
      redirectUri: callbackUri,
      scope: scope ?? 'openid profile email',
      extraState: redirectUri ? { redirect_uri: redirectUri, client_id: clientId ?? '', state: state ?? '' } : undefined,
    })
  }

  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--white)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <a href="/" className="inline-block mb-6">
            <img
              src={tenant.logoUrl}
              alt={`${tenant.displayName} Logo`}
              className="h-8 mx-auto"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </a>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-neutral-400 mt-2">
            Sign in to your {tenant.displayName} account
          </p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="/forget" className="text-sm text-neutral-400 hover:text-white hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              style={{ backgroundColor: tenant.accentColor }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-900/50 px-2 text-neutral-500">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-700 hover:bg-gray-800"
            onClick={handleOAuthRedirect}
            disabled={loading}
          >
            Sign in with SSO
          </Button>
        </div>

        <div className="text-center text-sm text-neutral-400">
          Don't have an account?{' '}
          <a
            href={`/signup${window.location.search}`}
            className="text-white hover:underline"
          >
            Sign up
          </a>
        </div>

        <div className="text-center text-xs text-neutral-600">
          <a href={tenant.termsUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">Terms</a>
          {' · '}
          <a href={tenant.privacyUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">Privacy</a>
        </div>
      </div>
    </div>
  )
}

export default Login

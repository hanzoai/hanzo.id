/**
 * OAuth2 / OIDC client utilities with PKCE support
 *
 * Implements RFC 6749 (OAuth2), RFC 7636 (PKCE), and OpenID Connect Core.
 * Works against Casdoor IAM backend via the tenant's iamOrigin.
 */

import { getTenantFromWindow, type TenantConfig } from './tenant'

// --- PKCE helpers (RFC 7636) ---

function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, length)
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  return crypto.subtle.digest('SHA-256', encoder.encode(plain))
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(64)
  const hashed = await sha256(verifier)
  const challenge = base64urlEncode(hashed)
  return { verifier, challenge }
}

// --- OAuth state management ---

const STORAGE_PREFIX = 'hanzo_auth_'

function store(key: string, value: string) {
  sessionStorage.setItem(STORAGE_PREFIX + key, value)
}

function retrieve(key: string): string | null {
  const val = sessionStorage.getItem(STORAGE_PREFIX + key)
  sessionStorage.removeItem(STORAGE_PREFIX + key)
  return val
}

// --- Token types ---

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
  scope?: string
}

export interface UserInfo {
  sub: string
  name?: string
  displayName?: string
  email?: string
  avatar?: string
  owner?: string  // Casdoor org
  type?: string
}

// --- Core OAuth flows ---

/**
 * Build the authorization URL and redirect. Uses PKCE (S256).
 */
export async function startAuthorize(params: {
  clientId: string
  redirectUri: string
  scope?: string
  /** Extra state to round-trip (JSON-serializable) */
  extraState?: Record<string, string>
}): Promise<void> {
  const tenant = getTenantFromWindow()
  const { verifier, challenge } = await generatePKCE()
  const state = generateRandomString(32)

  // Persist for callback
  store('pkce_verifier', verifier)
  store('oauth_state', state)
  if (params.extraState) {
    store('oauth_extra', JSON.stringify(params.extraState))
  }

  const url = new URL('/oauth/authorize', tenant.iamOrigin)
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('scope', params.scope ?? 'openid profile email')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')

  window.location.href = url.toString()
}

/**
 * Exchange authorization code for tokens (RFC 6749 + PKCE).
 * Called from the /callback route.
 */
export async function exchangeCode(params: {
  code: string
  state: string
  clientId: string
  redirectUri: string
}): Promise<TokenResponse> {
  const tenant = getTenantFromWindow()

  // Validate state
  const savedState = retrieve('oauth_state')
  if (savedState !== params.state) {
    throw new Error('OAuth state mismatch — possible CSRF attack')
  }

  const verifier = retrieve('pkce_verifier')
  if (!verifier) {
    throw new Error('Missing PKCE verifier — session may have expired')
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    code_verifier: verifier,
  })

  const res = await fetch(`${tenant.iamOrigin}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${text}`)
  }

  return res.json()
}

/**
 * Password login (Resource Owner Password Credentials — RFC 6749 Section 4.3).
 * Used for the built-in login form. Returns a JWT directly from Casdoor's /api/login.
 */
export async function passwordLogin(params: {
  username: string
  password: string
  application?: string
  clientId?: string
  redirectUri?: string
}): Promise<{ token: string; user?: UserInfo }> {
  const tenant = getTenantFromWindow()
  const clientId = params.clientId ?? tenant.defaultClientId
  const application = params.application ?? clientId

  // Casdoor's /api/login expects OAuth params as query params
  const url = new URL('/api/login', tenant.iamOrigin)
  if (params.redirectUri) {
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('redirect_uri', params.redirectUri)
    url.searchParams.set('scope', 'openid profile email')
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'token',
      organization: tenant.org,
      username: params.username,
      password: params.password,
      application,
    }),
  })

  const data = await res.json()

  if (data.status !== 'ok') {
    throw new Error(data.msg || 'Login failed')
  }

  return { token: data.data }
}

/**
 * Fetch user info from the OIDC userinfo endpoint.
 */
export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const tenant = getTenantFromWindow()
  const res = await fetch(`${tenant.iamOrigin}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Userinfo fetch failed: ${res.status}`)
  }

  return res.json()
}

/**
 * Refresh an access token using a refresh token.
 */
export async function refreshToken(params: {
  refreshToken: string
  clientId: string
}): Promise<TokenResponse> {
  const tenant = getTenantFromWindow()

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: params.refreshToken,
    client_id: params.clientId,
  })

  const res = await fetch(`${tenant.iamOrigin}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`)
  }

  return res.json()
}

/**
 * Logout — redirect to end_session_endpoint.
 */
export function logout(params?: {
  idTokenHint?: string
  postLogoutRedirectUri?: string
}): void {
  const tenant = getTenantFromWindow()
  const url = new URL('/oauth/logout', tenant.iamOrigin)
  if (params?.idTokenHint) {
    url.searchParams.set('id_token_hint', params.idTokenHint)
  }
  if (params?.postLogoutRedirectUri) {
    url.searchParams.set('post_logout_redirect_uri', params.postLogoutRedirectUri)
  }
  window.location.href = url.toString()
}

/**
 * Get the extra state that was passed through the OAuth flow.
 */
export function getOAuthExtraState(): Record<string, string> | null {
  const raw = retrieve('oauth_extra')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

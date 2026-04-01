/**
 * White-label tenant configuration
 *
 * Maps hostname to org, branding, and IAM origin.
 * Each *.id domain is a white-label login portal backed by the same Casdoor instance.
 */

export interface TenantConfig {
  /** Casdoor organization name */
  org: string
  /** Display name for branding */
  displayName: string
  /** Primary accent color (hex) */
  accentColor: string
  /** Logo URL */
  logoUrl: string
  /** IAM backend origin (Casdoor API) */
  iamOrigin: string
  /** Default application clientId for this tenant's login page */
  defaultClientId: string
  /** Terms of service URL */
  termsUrl: string
  /** Privacy policy URL */
  privacyUrl: string
}

const TENANTS: Record<string, TenantConfig> = {
  'hanzo.id': {
    org: 'hanzo',
    displayName: 'Hanzo',
    accentColor: '#fd4444',
    logoUrl: 'https://cdn.hanzo.ai/img/logo-white.svg',
    iamOrigin: 'https://iam.hanzo.ai',
    defaultClientId: 'hanzo-id',
    termsUrl: 'https://hanzo.ai/terms',
    privacyUrl: 'https://hanzo.ai/privacy',
  },
  'lux.id': {
    org: 'lux',
    displayName: 'Lux',
    accentColor: '#E4A11B',
    logoUrl: 'https://cdn.lux.network/img/logo-white.svg',
    iamOrigin: 'https://iam.lux.network',
    defaultClientId: 'lux-app-client-id',
    termsUrl: 'https://lux.network/terms',
    privacyUrl: 'https://lux.network/privacy',
  },
  'zoo.id': {
    org: 'zoo',
    displayName: 'Zoo',
    accentColor: '#22c55e',
    logoUrl: 'https://cdn.zoo.ngo/img/logo-white.svg',
    iamOrigin: 'https://iam.zoo.network',
    defaultClientId: 'zoo-app-client-id',
    termsUrl: 'https://zoo.ngo/terms',
    privacyUrl: 'https://zoo.ngo/privacy',
  },
  'pars.id': {
    org: 'pars',
    displayName: 'Pars',
    accentColor: '#8b5cf6',
    logoUrl: 'https://cdn.pars.network/img/logo-white.svg',
    iamOrigin: 'https://iam.pars.network',
    defaultClientId: 'pars-app-client-id',
    termsUrl: 'https://pars.network/terms',
    privacyUrl: 'https://pars.network/privacy',
  },
}

// Fallback for localhost / unknown hosts
const DEFAULT_TENANT = TENANTS['hanzo.id']

export function getTenant(hostname: string): TenantConfig {
  // Strip port for localhost dev
  const host = hostname.split(':')[0]
  return TENANTS[host] ?? DEFAULT_TENANT
}

export function getTenantFromWindow(): TenantConfig {
  if (typeof window === 'undefined') return DEFAULT_TENANT
  return getTenant(window.location.hostname)
}

/**
 * Cloudflare Pages Functions middleware
 *
 * 1. Detects tenant from hostname (hanzo.id, lux.id, zoo.id, pars.id)
 * 2. Proxies IAM/OAuth paths to the tenant's Casdoor backend
 * 3. Normalizes RFC 6749 / OIDC / SCIM paths to Casdoor's actual paths
 * 4. Rewrites OIDC discovery document to use the tenant's public origin
 * 5. Serves the Vite SPA for all other paths
 */

interface Env {
  IAM_ORIGIN?: string;
}

// --- Tenant configuration ---

interface TenantConfig {
  org: string;
  iamOrigin: string;
  publicOrigin: string;  // the *.id domain
}

const TENANTS: Record<string, TenantConfig> = {
  'hanzo.id': {
    org: 'hanzo',
    iamOrigin: 'https://iam.hanzo.ai',
    publicOrigin: 'https://hanzo.id',
  },
  'lux.id': {
    org: 'lux',
    iamOrigin: 'https://iam.lux.network',
    publicOrigin: 'https://lux.id',
  },
  'zoo.id': {
    org: 'zoo',
    iamOrigin: 'https://iam.zoo.network',
    publicOrigin: 'https://zoo.id',
  },
  'pars.id': {
    org: 'pars',
    iamOrigin: 'https://iam.pars.network',
    publicOrigin: 'https://pars.id',
  },
};

function getTenant(hostname: string, env: Env): TenantConfig {
  const host = hostname.split(':')[0];
  const tenant = TENANTS[host];
  if (tenant) return tenant;

  // Fallback: use IAM_ORIGIN env var or default to hanzo
  return {
    org: 'hanzo',
    iamOrigin: env.IAM_ORIGIN || 'https://iam.hanzo.ai',
    publicOrigin: `https://${host}`,
  };
}

// --- RFC path normalization ---
// Maps standard RFC paths to Casdoor's actual paths.
// Only includes paths where Casdoor differs from the standard.

const PATH_REWRITES: Record<string, string> = {
  // RFC 6749 — OAuth2 authorize uses /login/ prefix in Casdoor
  '/oauth/authorize':              '/login/oauth/authorize',
  // JWKS — standard is /.well-known/jwks.json, Casdoor uses /.well-known/jwks
  '/.well-known/jwks.json':        '/.well-known/jwks',
  // RFC 8414 — OAuth authorization server metadata (serve same as OIDC discovery)
  '/.well-known/oauth-authorization-server': '/.well-known/openid-configuration',
};

// Paths that should be proxied to IAM (prefix match)
const IAM_PATH_PREFIXES = [
  '/api/',
  '/oauth/',         // /oauth/token, /oauth/userinfo, /oauth/introspect, /oauth/logout, /oauth/device
  '/login/oauth/',   // /login/oauth/authorize (Casdoor's native path)
  '/callback',
  '/forget',
  '/result',
  '/cas/',           // CAS protocol
  '/scim/',          // SCIM 2.0
  '/.well-known/',   // OIDC discovery, JWKS
  '/static/',        // IAM static assets
  '/img/',           // IAM images
];

function shouldProxyToIAM(pathname: string): boolean {
  return IAM_PATH_PREFIXES.some(p => pathname.startsWith(p));
}

// --- OIDC discovery rewriting ---

async function rewriteOIDCDiscovery(
  response: Response,
  iamOrigin: string,
  publicOrigin: string
): Promise<Response> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('json')) return response;

  try {
    const body = await response.text();
    // Replace IAM origin with public origin in all URL fields
    const rewritten = body.replaceAll(iamOrigin, publicOrigin);

    return new Response(rewritten, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return response;
  }
}

// --- Main middleware ---

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  let pathname = url.pathname;
  const hostname = url.hostname;

  const tenant = getTenant(hostname, context.env);

  // Apply RFC path normalization
  const rewrittenPath = PATH_REWRITES[pathname];
  if (rewrittenPath) {
    pathname = rewrittenPath;
  }

  // Proxy IAM paths to backend
  if (shouldProxyToIAM(pathname)) {
    const iamUrl = new URL(pathname + url.search, tenant.iamOrigin);

    const iamRequest = new Request(iamUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      redirect: 'manual',
    });

    const response = await fetch(iamRequest);

    // Rewrite OIDC discovery documents to use public origin
    const isDiscovery = pathname === '/.well-known/openid-configuration'
      || pathname === '/.well-known/oauth-authorization-server';
    if (isDiscovery && response.ok) {
      return rewriteOIDCDiscovery(response, tenant.iamOrigin, tenant.publicOrigin);
    }

    // Clone response and rewrite redirect headers
    const newResponse = new Response(response.body, response);

    const location = newResponse.headers.get('location');
    if (location) {
      // Rewrite IAM origin back to public origin in redirects
      newResponse.headers.set(
        'location',
        location.replaceAll(tenant.iamOrigin, tenant.publicOrigin)
      );
    }

    return newResponse;
  }

  // For non-IAM paths, serve the static SPA
  return context.next();
};

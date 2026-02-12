/**
 * Cloudflare Pages Functions middleware
 * Routes authentication paths to IAM backend, serves marketing site for everything else
 */

interface Env {
  IAM_ORIGIN: string;
}

// Paths that should be proxied to IAM
const IAM_PATHS = [
  '/api/',
  '/oauth/',   // OAuth2/OIDC authorize, token, userinfo endpoints
  '/login',
  '/signup',
  '/callback',
  '/forget',
  '/result',
  '/cas/',
  '/scim/',
  '/.well-known/',
  '/static/',  // IAM static assets
  '/img/',     // IAM images
];

// Check if path should go to IAM
function shouldProxyToIAM(pathname: string): boolean {
  return IAM_PATHS.some(p => pathname.startsWith(p));
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Proxy IAM paths to backend
  if (shouldProxyToIAM(pathname)) {
    const iamOrigin = context.env.IAM_ORIGIN || 'https://iam.hanzo.ai';
    const iamUrl = new URL(pathname + url.search, iamOrigin);

    // Clone request with new URL
    const iamRequest = new Request(iamUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      redirect: 'manual',
    });

    // Forward to IAM
    const response = await fetch(iamRequest);

    // Clone response and modify headers if needed
    const newResponse = new Response(response.body, response);

    // Handle redirects - rewrite IAM domain back to hanzo.id
    const location = newResponse.headers.get('location');
    if (location && location.includes('iam.hanzo.ai')) {
      newResponse.headers.set('location', location.replace('iam.hanzo.ai', 'hanzo.id'));
    }

    return newResponse;
  }

  // For non-IAM paths, continue to the static site
  return context.next();
};

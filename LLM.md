# hanzo.id

Unified identity and SSO portal for the Hanzo ecosystem (hanzo.id). Serves as the login/signup gateway for all Hanzo products, with a marketing site for the identity product itself.

## Stack

- React 18 + TypeScript (Vite 5, SWC)
- React Router v6 (client-side routing)
- Tailwind CSS v4 + Radix UI primitives
- Framer Motion (animations)
- Cloudflare Pages (deployment) + Cloudflare Pages Functions (middleware)
- Wrangler CLI for CF Pages dev/deploy

## Structure

```
src/
  App.tsx             # Root router -- IDLanding as homepage
  pages/
    IDLanding.tsx     # Homepage (/) -- SSO, passwordless, social login features
    LoginPage.tsx     # Login UI
    SignUpPage.tsx     # Signup UI
    ...               # Shared pages (same as other Hanzo sites)
  components/         # Shared component library (same as hanzo.app)
functions/
  _middleware.ts      # CF Pages Functions -- routes /api, /oauth, /login, /signup,
                      #   /callback, /.well-known, /cas, /scim to IAM backend
wrangler.toml         # CF Pages config: project=hanzo-id, IAM_ORIGIN=https://iam.hanzo.ai
```

## Key Routes

- `/` -- IDLanding (identity product marketing: SSO, MFA, WebAuthn, social login)
- `/login`, `/signup` -- Auth pages (also proxied to IAM via middleware)
- `/api/*`, `/oauth/*`, `/callback/*`, `/.well-known/*` -- Proxied to IAM backend
- `/cas/*`, `/scim/*` -- Enterprise SSO protocol proxies
- All other routes -- Shared marketing/product/account pages

## Middleware (functions/_middleware.ts)

The CF Pages middleware splits traffic:
- Auth paths (`/api/`, `/oauth/`, `/login`, `/signup`, `/callback`, `/.well-known/`, `/cas/`, `/scim/`, `/static/`, `/img/`) proxy to `IAM_ORIGIN` (iam.hanzo.ai / Casdoor).
- Redirect headers from IAM are rewritten from `iam.hanzo.ai` back to `hanzo.id`.
- All other paths serve the static Vite SPA.

## Commands

```bash
pnpm install
pnpm dev              # Vite dev server
pnpm build            # Production build to dist/
pnpm deploy           # Build + wrangler pages deploy
pnpm pages:dev        # Local CF Pages dev (port 8788, tests middleware)
pnpm lint
```

## Notes

- Deployed to Cloudflare Pages as project `hanzo-id`.
- IAM backend is Casdoor at iam.hanzo.ai (see hanzo.id-worker for OAuth bridge flows).
- Shares the same component library and route structure as hanzo.app, hanzo.network, hanzo.one, and sensei.group. Only the landing page and CF middleware are unique.
- The `IDLanding` page emphasizes SSO, passwordless auth, social login, and privacy.

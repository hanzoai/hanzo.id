
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, CreditCard, BarChart3, FileText, Building, Settings, Gift } from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';

/* ── App list (shared across all Hanzo headers) ────────────── */
const APPS = [
  { label: 'Billing', href: 'https://billing.hanzo.ai' },
  { label: 'Console', href: 'https://console.hanzo.ai' },
  { label: 'Chat', href: 'https://chat.hanzo.ai' },
  { label: 'Platform', href: 'https://platform.hanzo.ai' },
];

/* ── Sidebar nav ────────────────────────────────────────────── */
const NAV = [
  { name: 'Profile', path: '/account', icon: User },
  { name: 'Organization', path: '/account/organization', icon: Building },
  { name: 'Referrals', path: '/account/referrals', icon: Gift },
  { name: 'Settings', path: '/account/settings', icon: Settings },
];
const BILLING_NAV = [
  { name: 'Overview', href: 'https://billing.hanzo.ai', icon: CreditCard },
  { name: 'Usage', href: 'https://billing.hanzo.ai#usage', icon: BarChart3 },
  { name: 'Invoices', href: 'https://billing.hanzo.ai#invoices', icon: FileText },
];

/* ── User/org dropdown ─────────────────────────────────────── */
function UserDropdown({
  user,
  organizations,
  currentOrganization,
  switchOrganization,
  logout,
}: {
  user: { name?: string; email: string; avatar?: string } | null;
  organizations: Array<{ id: string; name: string; role?: string }>;
  currentOrganization: { id: string; name: string } | null;
  switchOrganization: (id: string) => void;
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const initials = (user.name || user.email)
    .split(/[\s@._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.06]"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name || user.email} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[11px] font-semibold text-white/70">
            {initials}
          </span>
        )}
        <div className="hidden flex-col items-start sm:flex">
          {user.name && <span className="text-[12px] font-medium leading-none text-white/70">{user.name}</span>}
          <span className="text-[11px] leading-none text-white/30 mt-0.5">{user.email}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden text-white/30 sm:block">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-white/[0.08] bg-[#111113] shadow-2xl">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <p className="text-[13px] font-medium text-white/80">{user.name || 'User'}</p>
            <p className="text-[11px] text-white/40">{user.email}</p>
          </div>

          {organizations.length > 0 && (
            <div className="border-b border-white/[0.06] p-2">
              <p className="px-2 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/30">
                Organizations
              </p>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => { switchOrganization(org.id); setOpen(false); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-white/[0.06] transition-colors"
                >
                  <span className="text-[13px] text-white/70">{org.name}</span>
                  {org.id === currentOrganization?.id && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="p-2">
            <a href="https://billing.hanzo.ai" className="flex items-center rounded-lg px-3 py-2 text-[13px] text-white/60 hover:bg-white/[0.06] hover:text-white/80 transition-colors" onClick={() => setOpen(false)}>
              Billing
            </a>
            <button
              type="button"
              onClick={() => { setOpen(false); logout(); }}
              className="flex w-full items-center rounded-lg px-3 py-2 text-[13px] text-white/40 hover:bg-white/[0.06] hover:text-red-400/70 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const AccountLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user, organizations, currentOrganization, switchOrganization, isLoading, logout } = useAccount();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/account' && location.pathname === '/account') return true;
    if (path !== '/account' && location.pathname.startsWith(path)) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
          <p className="mt-4 text-[13px] text-white/30">Loading…</p>
        </div>
      </div>
    );
  }

  const sidebar = (
    <nav className="flex flex-col gap-0.5 p-3">
      {NAV.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
            isActive(item.path)
              ? 'bg-white/[0.08] text-white'
              : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
          }`}
        >
          <item.icon className="h-[17px] w-[17px] flex-shrink-0" />
          {item.name}
        </Link>
      ))}

      <div className="my-2 border-t border-white/[0.07]" />
      <p className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-white/25">Billing</p>

      {BILLING_NAV.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70"
        >
          <item.icon className="h-[17px] w-[17px] flex-shrink-0" />
          {item.name}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-white/20">
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </a>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-white">

      {/* ── Header (matches HanzoHeader design) ─────────────────── */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-white/[0.07] bg-[#09090b]/90 px-4 backdrop-blur-xl">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex-shrink-0 rounded-lg p-1.5 text-white/40 hover:bg-white/[0.06] hover:text-white/70 md:hidden"
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen
                ? <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>
                : <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>}
            </svg>
          </button>

          {/* Official Hanzo H-mark with proper shadow paths */}
          <a href="/" className="flex-shrink-0 rounded transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" aria-label="Hanzo">
            <svg width="22" height="22" viewBox="0 0 67 67" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.21 67V44.6369H0V67H22.21Z" fill="#ffffff" />
              <path d="M0 44.6369L22.21 46.8285V44.6369H0Z" fill="#DDDDDD" />
              <path d="M66.7038 22.3184H22.2534L0.0878906 44.6367H44.4634L66.7038 22.3184Z" fill="#ffffff" />
              <path d="M22.21 0H0V22.3184H22.21V0Z" fill="#ffffff" />
              <path d="M66.7198 0H44.5098V22.3184H66.7198V0Z" fill="#ffffff" />
              <path d="M66.6753 22.3185L44.5098 20.0822V22.3185H66.6753Z" fill="#DDDDDD" />
              <path d="M66.7198 67V44.6369H44.5098V67H66.7198Z" fill="#ffffff" />
            </svg>
          </a>

          <span className="select-none text-white/[0.15]">/</span>
          <span className="truncate text-[13px] font-medium text-white/50">Account</span>

          {/* App switcher links */}
          <div className="ml-1 hidden items-center gap-0.5 md:flex">
            {APPS.map((app) => (
              <a
                key={app.label}
                href={app.href}
                className="rounded-md px-2.5 py-1 text-[11px] font-medium text-white/25 transition-colors hover:bg-white/[0.05] hover:text-white/60"
              >
                {app.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right: user+org dropdown */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <UserDropdown
            user={user}
            organizations={organizations}
            currentOrganization={currentOrganization}
            switchOrganization={switchOrganization}
            logout={logout}
          />
        </div>
      </header>

      <div className="flex flex-1">
        {/* ── Desktop sidebar ──────────────────────────── */}
        <aside className="hidden w-56 flex-shrink-0 border-r border-white/[0.07] bg-[#0d0d10] md:block">
          {sidebar}
        </aside>

        {/* ── Mobile sidebar drawer ─────────────────── */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 w-60 border-r border-white/[0.07] bg-[#0d0d10] pt-14 md:hidden">
              {sidebar}
            </aside>
          </>
        )}

        {/* ── Main content ─────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07] py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 text-[11px] text-white/25">
          <span>© 2025 Hanzo AI, Inc.</span>
          <div className="flex gap-4">
            <a href="https://billing.hanzo.ai" className="transition hover:text-white/50">Billing</a>
            <a href="https://console.hanzo.ai" className="transition hover:text-white/50">Console</a>
            <a href="https://docs.hanzo.ai" target="_blank" rel="noreferrer" className="transition hover:text-white/50">Docs</a>
            <a href="https://hanzo.ai" target="_blank" rel="noreferrer" className="transition hover:text-white/50">hanzo.ai</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AccountLayout;


import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  User, CreditCard, BarChart3, FileText,
  Building, Settings, ChevronRight, LogOut,
  Gift, ExternalLink
} from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const AccountLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user, organizations, currentOrganization, switchOrganization, isLoading } = useAccount();
  const location = useLocation();

  const accountNavItems = [
    { name: 'Profile', path: '/account', icon: User },
    { name: 'Organization', path: '/account/organization', icon: Building },
    { name: 'Referrals', path: '/account/referrals', icon: Gift },
    { name: 'Settings', path: '/account/settings', icon: Settings },
  ];

  // External links to billing.hanzo.ai
  const billingNavItems = [
    { name: 'Billing', href: 'https://billing.hanzo.ai', icon: CreditCard },
    { name: 'Usage & Costs', href: 'https://billing.hanzo.ai#usage', icon: BarChart3 },
    { name: 'Invoices', href: 'https://billing.hanzo.ai#invoices', icon: FileText },
  ];

  const isActive = (path: string) => {
    if (path === '/account' && location.pathname === '/account') return true;
    if (path !== '/account' && location.pathname.startsWith(path)) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
          <p className="mt-4 text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Account Header — matches billing.hanzo.ai style */}
      <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* Hanzo logo */}
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 67 67" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M22.21 67V44.6369H0V67H22.21Z" fill="currentColor" />
                <path d="M66.7038 22.3184H22.2534L0.0878906 44.6367H44.4634L66.7038 22.3184Z" fill="currentColor" />
                <path d="M22.21 0H0V22.3184H22.21V0Z" fill="currentColor" />
                <path d="M66.7198 0H44.5098V22.3184H66.7198V0Z" fill="currentColor" />
                <path d="M66.7198 67V44.6369H44.5098V67H66.7198Z" fill="currentColor" />
              </svg>
              <span className="text-sm font-semibold">Hanzo</span>
            </a>
            <span className="text-neutral-600">/</span>
            <span className="text-sm text-neutral-400">Account</span>
          </div>

          {/* intentionally empty — no cross-nav tabs */}
          <div />

          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-neutral-400">
                {user.name || user.email}
              </span>
            )}
            <a
              href="/"
              className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              Home
            </a>
            <button
              className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Org switcher */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">Account</h1>

            {currentOrganization && (
              <Select
                value={currentOrganization.id}
                onValueChange={switchOrganization}
              >
                <SelectTrigger className="w-[250px] bg-black border-neutral-800">
                  <SelectValue>
                    <div className="flex items-center">
                      <div className="h-6 w-6 bg-neutral-800 rounded-full mr-2 flex items-center justify-center text-sm font-medium">
                        {currentOrganization.name.charAt(0)}
                      </div>
                      {currentOrganization.name}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800">
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id} className="text-white hover:bg-neutral-800">
                      <div className="flex items-center">
                        <div className="h-6 w-6 bg-neutral-800 rounded-full mr-2 flex items-center justify-center text-sm font-medium">
                          {org.name.charAt(0)}
                        </div>
                        {org.name}
                        <span className="ml-2 text-neutral-500 text-xs">({org.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="col-span-1">
              <div className="rounded-xl border border-neutral-800 p-4 space-y-1">
                {/* Account nav items */}
                {accountNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-neutral-800/50 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800/30 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive(item.path) && <ChevronRight className="ml-auto w-4 h-4" />}
                  </Link>
                ))}

                {/* Divider */}
                <div className="border-t border-neutral-800 my-3" />

                {/* Billing external links */}
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                    Billing
                  </span>
                </div>
                {billingNavItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-neutral-400 hover:bg-neutral-800/30 hover:text-white"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    <ExternalLink className="ml-auto w-3.5 h-3.5 text-neutral-600" />
                  </a>
                ))}

                {/* Divider + Sign out */}
                <div className="border-t border-neutral-800 my-3" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800/30 p-3"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-1 md:col-span-3">
              <div className="rounded-xl border border-neutral-800 p-8">
                {children || <Outlet />}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-neutral-800 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-neutral-600">
          <span>Hanzo Account</span>
          <div className="flex gap-4">
            <a href="https://billing.hanzo.ai" className="transition hover:text-neutral-400">Billing</a>
            <a href="https://docs.hanzo.ai" target="_blank" rel="noreferrer" className="transition hover:text-neutral-400">Docs</a>
            <a href="https://hanzo.ai" target="_blank" rel="noreferrer" className="transition hover:text-neutral-400">Hanzo</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AccountLayout;

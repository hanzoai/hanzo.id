
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for organizations and user
export interface Organization {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  plan?: string;
  memberCount?: number;
  description?: string;
  website?: string;
  location?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedDate?: string;
  website?: string;
  phone?: string;
}

interface AccountContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  switchOrganization: (orgId: string) => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  updateOrganization: (orgData: Partial<Organization>) => void;
  logout: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Storage keys — must match build/lib/client-auth.ts
const TOKEN_KEY = 'hanzo-auth-token';
const USER_KEY = 'hanzo-user';
const EXPIRES_KEY = 'hanzo-auth-expires';

const IAM_ENDPOINT = 'https://iam.hanzo.ai';
const COMMERCE_ENDPOINT = 'https://api.hanzo.ai';

// Map Casdoor userinfo response → User
function mapIAMUser(info: Record<string, string>): User {
  return {
    id: info.sub || info.id || '',
    name: info.preferred_username || info.name || info.sub || '',
    email: info.email || '',
    avatar: info.picture || '',
    bio: info.bio || info.description || '',
    location: info.location || info.address || '',
    joinedDate: info.updated_at
      ? new Date(info.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      : '',
    website: info.website || info.homepage || '',
    phone: info.phone_number || info.phone || '',
  };
}

// Build org list from IAM groups/org membership
function buildOrgs(user: User, groups?: string[]): Organization[] {
  const orgs: Organization[] = [
    {
      id: 'personal',
      name: 'Personal Account',
      role: 'owner',
      plan: 'Pro',
      memberCount: 1,
      description: 'Your personal workspace',
      website: '',
      location: '',
    },
  ];

  // Add orgs from IAM group membership
  if (groups && groups.length > 0) {
    for (const g of groups) {
      if (g === 'hanzo') {
        orgs.push({
          id: 'hanzo',
          name: 'Hanzo AI',
          role: 'owner',
          plan: 'Enterprise',
          memberCount: 26,
          description: 'AI infrastructure for the next generation of intelligent applications',
          website: 'https://hanzo.ai',
          location: 'San Francisco, CA',
        });
      } else if (g === 'lux') {
        orgs.push({
          id: 'lux',
          name: 'Lux Network',
          role: 'owner',
          plan: 'Enterprise',
          memberCount: 12,
          description: 'Multi-consensus blockchain with post-quantum cryptography',
          website: 'https://lux.network',
          location: 'San Francisco, CA',
        });
      } else if (g === 'zoo') {
        orgs.push({
          id: 'zoo',
          name: 'Zoo Labs',
          role: 'owner',
          plan: 'Enterprise',
          memberCount: 8,
          description: 'Open AI research network — DeSci and decentralized training',
          website: 'https://zoo.ngo',
          location: 'San Francisco, CA',
        });
      } else if (g !== 'built-in') {
        orgs.push({
          id: g,
          name: g.charAt(0).toUpperCase() + g.slice(1),
          role: 'member',
          plan: 'Team',
          memberCount: 1,
          description: '',
          website: '',
          location: '',
        });
      }
    }
  }

  return orgs;
}

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = (u: User) => {
    setUserState(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // 1. Read stored token
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const expiresStr = localStorage.getItem(EXPIRES_KEY);
        const userStr = localStorage.getItem(USER_KEY);

        // Check expiry
        if (storedToken && expiresStr && Date.now() > parseInt(expiresStr, 10)) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(EXPIRES_KEY);
          setIsLoading(false);
          return;
        }

        if (storedToken) {
          setToken(storedToken);

          // 2. Fetch fresh user info from IAM
          try {
            const res = await fetch(`${IAM_ENDPOINT}/api/userinfo`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });

            if (res.ok) {
              const info = await res.json();
              const iamUser = mapIAMUser(info);
              setUserState(iamUser);
              localStorage.setItem(USER_KEY, JSON.stringify(iamUser));

              // 3. Build orgs from IAM groups
              const groups: string[] = info.groups || info['cognito:groups'] || [];
              // Also try to get org from the user's "owner" field
              if (info.owner && !groups.includes(info.owner)) {
                groups.push(info.owner);
              }
              const orgs = buildOrgs(iamUser, groups);
              setOrganizations(orgs);
              setCurrentOrganization(orgs[0]);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.warn('IAM userinfo fetch failed, using cached user:', err);
          }

          // Fall back to cached user
          if (userStr) {
            try {
              const cachedUser = JSON.parse(userStr) as User;
              setUserState(cachedUser);
              const orgs = buildOrgs(cachedUser, []);
              setOrganizations(orgs);
              setCurrentOrganization(orgs[0]);
              setIsLoading(false);
              return;
            } catch {
              // ignore parse error
            }
          }
        }

        // 4. Try Casdoor session endpoint (for users logged in via Casdoor cookie)
        try {
          const sessionRes = await fetch(`${IAM_ENDPOINT}/api/get-account`, {
            credentials: 'include',
          });
          if (sessionRes.ok) {
            const data = await sessionRes.json();
            if (data.data) {
              const u = data.data;
              const sessionUser: User = {
                id: u.id || u.name || '',
                name: u.displayName || u.name || '',
                email: u.email || '',
                avatar: u.avatar || '',
                bio: u.bio || '',
                location: u.location || '',
                joinedDate: u.createdTime
                  ? new Date(u.createdTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                  : '',
                website: u.homepage || '',
                phone: u.phone || '',
              };
              setUserState(sessionUser);
              const groups: string[] = u.groups?.map((g: { name: string }) => g.name) || [];
              if (u.owner) groups.push(u.owner);
              const orgs = buildOrgs(sessionUser, groups);
              setOrganizations(orgs);
              setCurrentOrganization(orgs[0]);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          // session endpoint not available — not a Casdoor-hosted page
        }

        // Not authenticated
        setUserState(null);
        setOrganizations([]);
        setCurrentOrganization(null);
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const switchOrganization = (orgId: string) => {
    const organization = organizations.find((org) => org.id === orgId);
    if (organization) {
      setCurrentOrganization(organization);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...userData };
    setUserState(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));

    // Persist to IAM if we have a token
    if (token) {
      try {
        await fetch(`${IAM_ENDPOINT}/api/update-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            displayName: updated.name,
            email: updated.email,
            avatar: updated.avatar,
            bio: updated.bio,
            location: updated.location,
            homepage: updated.website,
            phone: updated.phone,
          }),
        });
      } catch (err) {
        console.warn('Failed to sync profile to IAM:', err);
      }
    }
  };

  const updateOrganization = (orgData: Partial<Organization>) => {
    if (currentOrganization) {
      const updatedOrg = { ...currentOrganization, ...orgData };
      setCurrentOrganization(updatedOrg);
      setOrganizations(organizations.map((org) =>
        org.id === currentOrganization.id ? updatedOrg : org
      ));
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    setUserState(null);
    setToken(null);
    setOrganizations([]);
    setCurrentOrganization(null);
    window.location.href = '/';
  };

  return (
    <AccountContext.Provider
      value={{
        user,
        token,
        setUser,
        organizations,
        currentOrganization,
        isLoading,
        switchOrganization,
        updateUserProfile,
        updateOrganization,
        logout,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

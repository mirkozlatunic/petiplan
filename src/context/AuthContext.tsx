import { createContext, useContext, useEffect, useReducer, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthUser, Organization } from '@/types';

interface AuthState {
  user: AuthUser | null;
  currentOrg: Organization | null;
  orgs: Organization[];
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchOrg: (orgId: string) => void;
  refreshOrgs: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

type AuthAction =
  | { type: 'SET_USER'; user: AuthUser | null }
  | { type: 'SET_ORGS'; orgs: Organization[] }
  | { type: 'SET_CURRENT_ORG'; org: Organization | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_INITIALIZED' }
  | { type: 'SIGN_OUT' };

const initialState: AuthState = {
  user: null,
  currentOrg: null,
  orgs: [],
  loading: false,
  initialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'SET_ORGS':
      return { ...state, orgs: action.orgs };
    case 'SET_CURRENT_ORG':
      return { ...state, currentOrg: action.org };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_INITIALIZED':
      return { ...state, initialized: true };
    case 'SIGN_OUT':
      return { ...initialState, initialized: true };
    default:
      return state;
  }
}

const AuthStateContext = createContext<AuthState | null>(null);
const AuthActionsContext = createContext<AuthActions | null>(null);

async function fetchUserData(userId: string): Promise<{ user: AuthUser; orgs: Organization[] }> {
  const [profileResult, orgsResult] = await Promise.all([
    supabase.from('profiles').select('id, display_name, avatar_url').eq('id', userId).single(),
    supabase
      .from('org_members')
      .select('organizations(id, name, slug, created_by, created_at)')
      .eq('user_id', userId),
  ]);

  const profile = profileResult.data;
  const { data: session } = await supabase.auth.getSession();
  const email = session?.session?.user?.email ?? '';

  const user: AuthUser = {
    id: userId,
    email,
    displayName: profile?.display_name ?? email.split('@')[0],
    avatarUrl: profile?.avatar_url ?? null,
  };

  const orgs: Organization[] = (orgsResult.data ?? [])
    .map((row) => {
      const org = (row.organizations as unknown) as { id: string; name: string; slug: string; created_by: string; created_at: string } | null;
      if (!org) return null;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        createdBy: org.created_by,
        createdAt: org.created_at,
      };
    })
    .filter((o): o is Organization => o !== null);

  return { user, orgs };
}

function resolveCurrentOrg(orgs: Organization[]): Organization | null {
  if (orgs.length === 0) return null;
  const savedId = localStorage.getItem('peptiplan-current-org');
  return orgs.find((o) => o.id === savedId) ?? orgs[0];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    let cancelled = false;
    let initialized = false;

    function markInitialized() {
      if (!cancelled && !initialized) {
        initialized = true;
        dispatch({ type: 'SET_INITIALIZED' });
      }
    }

    async function loadSession() {
      try {
        // Race against a 2 s timeout — getSession() can hang if a stored
        // refresh token triggers an internal token-refresh loop that never resolves.
        let timedOut = false;
        const timeout = new Promise<{ data: { session: null } }>((resolve) => {
          setTimeout(() => { timedOut = true; resolve({ data: { session: null } }); }, 2000);
        });
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeout,
        ]);
        if (timedOut) {
          // Clear the stale session key so the next load starts clean.
          const projectRef = (import.meta.env.VITE_SUPABASE_URL as string).split('//')[1]?.split('.')[0] ?? '';
          if (projectRef) localStorage.removeItem(`sb-${projectRef}-auth-token`);
          // The Supabase client singleton holds in-memory state (pending refresh
          // deferred) that blocks subsequent signInWithPassword calls — the only
          // reliable reset is a full page reload with a fresh client instance.
          // Use sessionStorage to prevent an infinite reload loop.
          if (!sessionStorage.getItem('peptiplan-auth-reset')) {
            sessionStorage.setItem('peptiplan-auth-reset', '1');
            window.location.reload();
            return;
          }
          sessionStorage.removeItem('peptiplan-auth-reset');
        }
        if (cancelled) return;
        if (session?.user) {
          try {
            const { user, orgs } = await fetchUserData(session.user.id);
            if (!cancelled) {
              dispatch({ type: 'SET_USER', user });
              dispatch({ type: 'SET_ORGS', orgs });
              dispatch({ type: 'SET_CURRENT_ORG', org: resolveCurrentOrg(orgs) });
            }
          } catch (err) {
            console.error('[Auth] fetchUserData failed:', err);
          }
        }
      } catch (err) {
        console.error('[Auth] getSession failed:', err);
      } finally {
        markInitialized();
      }
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { user, orgs } = await fetchUserData(session.user.id);
          if (!cancelled) {
            dispatch({ type: 'SET_USER', user });
            dispatch({ type: 'SET_ORGS', orgs });
            dispatch({ type: 'SET_CURRENT_ORG', org: resolveCurrentOrg(orgs) });
          }
        } catch (err) {
          console.error('[AuthContext] fetchUserData on SIGNED_IN failed:', err);
        } finally {
          markInitialized();
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SIGN_OUT' });
        markInitialized();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // silent refresh — no UI change needed
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out — check browser Network tab for a failed/pending request to Supabase.')), 12000),
    );
    const result = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      timeout,
    ]);
    const { error } = result;
    dispatch({ type: 'SET_LOADING', loading: false });
    if (error) throw error;
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    dispatch({ type: 'SET_LOADING', loading: false });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('peptiplan-current-org');
  }, []);

  const switchOrg = useCallback((orgId: string) => {
    const org = state.orgs.find((o) => o.id === orgId) ?? null;
    dispatch({ type: 'SET_CURRENT_ORG', org });
    if (org) localStorage.setItem('peptiplan-current-org', org.id);
  }, [state.orgs]);

  const updateProfile = useCallback(async (displayName: string) => {
    if (!state.user) return;
    await supabase.from('profiles').update({ display_name: displayName }).eq('id', state.user.id);
    dispatch({ type: 'SET_USER', user: { ...state.user, displayName } });
  }, [state.user]);

  const refreshOrgs = useCallback(async () => {
    if (!state.user) return;
    const { user, orgs } = await fetchUserData(state.user.id);
    dispatch({ type: 'SET_USER', user });
    dispatch({ type: 'SET_ORGS', orgs });
    if (!state.currentOrg) {
      dispatch({ type: 'SET_CURRENT_ORG', org: resolveCurrentOrg(orgs) });
    }
  }, [state.user, state.currentOrg]);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  }, []);

  const actions: AuthActions = {
    signInWithPassword,
    signInWithMagicLink,
    signUp,
    signOut,
    switchOrg,
    refreshOrgs,
    updateProfile,
    updatePassword,
    sendPasswordResetEmail,
  };

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState(): AuthState {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error('useAuthState must be used inside AuthProvider');
  return ctx;
}

export function useAuthActions(): AuthActions {
  const ctx = useContext(AuthActionsContext);
  if (!ctx) throw new Error('useAuthActions must be used inside AuthProvider');
  return ctx;
}

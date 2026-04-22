import { useAuthState, useAuthActions } from '@/context/AuthContext';

export function useAuth() {
  const state = useAuthState();
  const actions = useAuthActions();
  return { ...state, ...actions };
}

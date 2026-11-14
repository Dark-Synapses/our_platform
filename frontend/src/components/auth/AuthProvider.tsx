import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef,
  useState, type ReactNode,
} from 'react';
import { AuthError, getCurrentUser, type User } from '../../lib/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
  setAuthenticatedUser: (user: User) => void;
  clearSession: () => void;
  captureSession: () => number;
  invalidateSession: (token: number) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const sessionVersion = useRef(0);
  const pendingRequest = useRef<Promise<User> | null>(null);

  const fetchSession = useCallback((): Promise<User> => {
    if (!pendingRequest.current) {
      const request = getCurrentUser();
      pendingRequest.current = request;

      void request.finally(() => {
        if (pendingRequest.current === request) {
          pendingRequest.current = null;
        }
      }).catch(() => {});
    }

    return pendingRequest.current;
  }, []);

  const refresh = useCallback(async () => {
    const version = ++sessionVersion.current;
    setStatus('loading');

    try {
      const currentUser = await fetchSession();
      if (version !== sessionVersion.current) return;

      setUser(currentUser);
      setStatus('authenticated');
    } catch (error) {
      if (version !== sessionVersion.current) return;

      setUser(null);
      setStatus(
        error instanceof AuthError && error.status === 401
          ? 'unauthenticated'
          : 'error',
      );
    }
  }, [fetchSession]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setAuthenticatedUser = useCallback((nextUser: User) => {
    sessionVersion.current++;
    pendingRequest.current = null;
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const clearSession = useCallback(() => {
    sessionVersion.current++;
    pendingRequest.current = null;
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const captureSession = useCallback(() => sessionVersion.current, []);

  const invalidateSession = useCallback((token: number) => {
    if (token !== sessionVersion.current) return;

    sessionVersion.current++;
    pendingRequest.current = null;
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      refresh,
      setAuthenticatedUser,
      clearSession,
      captureSession,
      invalidateSession,
    }),
    [
      user,
      status,
      refresh,
      setAuthenticatedUser,
      clearSession,
      captureSession,
      invalidateSession,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

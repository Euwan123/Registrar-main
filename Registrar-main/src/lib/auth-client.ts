export type PortalRole = 'student' | 'admin';

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  role: PortalRole;
  email: string;
};

const SESSION_KEY = 'usep-auth-session';

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.removeItem('usep-demo-role');
}

export function clearAuthSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem('usep-use-database');
  window.localStorage.removeItem('usep-demo-role');
}

export function authHeaders(): HeadersInit {
  const session = getAuthSession();
  return session ? { Authorization: `Bearer ${session.accessToken}` } : {};
}

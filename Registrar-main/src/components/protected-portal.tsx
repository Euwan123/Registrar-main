import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { clearAuthSession, getAuthSession, type PortalRole } from '@/lib/auth-client';

export function ProtectedPortal({
  role,
  children,
}: {
  role: PortalRole;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      navigate({ to: '/login', replace: true });
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Session is no longer valid');
        return response.json() as Promise<{ role: PortalRole }>;
      })
      .then((user) => {
        if (user.role !== role) {
          navigate({ to: '/login', replace: true });
          return;
        }
        setAuthorized(true);
      })
      .catch(() => {
        clearAuthSession();
        navigate({ to: '/login', replace: true });
      });
  }, [navigate, role]);

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface-soft text-sm text-muted-foreground">
        Checking sign-in…
      </main>
    );
  }

  return children;
}

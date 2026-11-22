import { createFileRoute } from '@tanstack/react-router';
import { getAuthenticatedUser, supabaseRequest } from '@/lib/db';

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const user = await getAuthenticatedUser(request);
        if (!user) {
          return Response.json({ error: 'Authentication required.' }, { status: 401 });
        }
        const profiles = await supabaseRequest<Array<{
          first_name: string;
          last_name: string;
          university_id: string;
          program: string | null;
        }>>(
          'users',
          'GET',
          {
            query: new URLSearchParams({
              select: 'first_name,last_name,university_id,program',
              email: `eq.${user.email}`,
            }).toString(),
          },
        );
        if (!profiles[0]) {
          return Response.json({ error: 'User profile not found.' }, { status: 404 });
        }
        return Response.json({ ...user, profile: profiles[0] });
      },
    },
  },
});

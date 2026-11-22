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

        if (user.role !== 'student') {
          return Response.json({ ...user, profile: null });
        }

        if (!process.env['SUPABASE_SECRET_KEY']) {
          return Response.json({
            ...user,
            profile: null,
            profileError: 'Student profile data is unavailable because SUPABASE_SECRET_KEY is not configured.',
          });
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
          return Response.json({
            ...user,
            profile: null,
            profileError: 'Student profile was not found.',
          });
        }
        return Response.json({ ...user, profile: profiles[0] });
      },
    },
  },
});

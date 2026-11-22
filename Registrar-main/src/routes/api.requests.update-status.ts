import { createFileRoute } from '@tanstack/react-router';
import { getAuthenticatedUser, supabaseRequest } from '@/lib/db';

const requestStatuses = new Set([
  'Pending Review',
  'Processing',
  'Ready for Pickup',
  'Completed',
  'Declined',
]);

export const Route = createFileRoute('/api/requests/update-status')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const user = await getAuthenticatedUser(request);
        if (!user) {
          return Response.json({ error: 'Authentication required.' }, { status: 401 });
        }
        if (user.role !== 'admin') {
          return Response.json({ error: 'Administrator access required.' }, { status: 403 });
        }

        const body = await request.json() as { tracking_code?: string; status?: string };
        if (!body.tracking_code || body.tracking_code.length > 30 || !body.status || !requestStatuses.has(body.status)) {
          return Response.json({ error: 'A valid request id and status are required.' }, { status: 400 });
        }

        await supabaseRequest(
          body.tracking_code.startsWith('CR-') ? 'record_corrections' : 'requests',
          'PATCH',
          {
            query: `tracking_code=eq.${encodeURIComponent(body.tracking_code)}`,
            body: { status: body.status, updated_at: new Date().toISOString() },
          },
        );

        return Response.json({ success: true });
      },
    },
  },
});

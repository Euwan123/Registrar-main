import { createFileRoute } from '@tanstack/react-router';
import { getAuthenticatedUser, supabaseRequest } from '@/lib/db';

type RequestStatusRow = { status: string };

async function getCorrectionStatuses() {
  try {
    return await supabaseRequest<RequestStatusRow[]>(
      'record_corrections',
      'GET',
      { query: 'select=status' },
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('PGRST205')) return [];
    throw error;
  }
}

export const Route = createFileRoute('/api/stats/queue')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const user = await getAuthenticatedUser(request);
        if (!user) {
          return Response.json({ error: 'Authentication required.' }, { status: 401 });
        }
        if (user.role !== 'admin') {
          return Response.json({ error: 'Administrator access required.' }, { status: 403 });
        }

        const [requests, corrections] = await Promise.all([
          supabaseRequest<RequestStatusRow[]>(
            'requests',
            'GET',
            { query: 'select=status' },
          ),
          getCorrectionStatuses(),
        ]);
        const allRequests = [...requests, ...corrections];
        const pending = allRequests.filter((item) => item.status === 'Pending Review').length;
        const processing = allRequests.filter((item) => ['Processing', 'Under Review'].includes(item.status)).length;
        const ready = allRequests.filter((item) => ['Ready for Pickup', 'Approved'].includes(item.status)).length;

        return Response.json({
          active_queue: pending + processing,
          prioritized_intake: pending,
          ready_for_pickup: ready,
          under_evaluation: processing,
          pending_validation: pending,
          action_required: pending,
        });
      },
    },
  },
});

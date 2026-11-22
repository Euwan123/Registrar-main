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

export const Route = createFileRoute('/api/stats/dashboard')({
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

        const data = {
          total_queue: allRequests.length,
          pending_review: allRequests.filter((item) => item.status === 'Pending Review').length,
          in_process: allRequests.filter((item) => ['Processing', 'Under Review'].includes(item.status)).length,
          completed: allRequests.filter((item) => ['Completed', 'Approved'].includes(item.status)).length,
        };

        return Response.json(data);
      },
    },
  },
});

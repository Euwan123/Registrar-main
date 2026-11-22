import { createFileRoute } from '@tanstack/react-router';
import { getAuthenticatedUser, supabaseRequest } from '@/lib/db';

export async function clearDatabaseActivity() {
  let corrections: Array<{ id: number }> = [];
  try {
    corrections = await supabaseRequest<Array<{ id: number }>>(
      'record_corrections',
      'DELETE',
      { query: 'id=not.is.null&select=id' },
    );
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('PGRST205')) {
      throw error;
    }
  }

  const requests = await supabaseRequest<Array<{ id: number }>>(
    'requests',
    'DELETE',
    { query: 'id=not.is.null&select=id' },
  );
  return { corrections: corrections.length, requests: requests.length };
}

export const Route = createFileRoute('/api/admin/reset-activity')({
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

        const deleted = await clearDatabaseActivity();
        return Response.json({ success: true, ...deleted });
      },
    },
  },
});

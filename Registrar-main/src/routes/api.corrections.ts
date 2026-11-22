import { createFileRoute } from '@tanstack/react-router';
import { getAuthenticatedUser, supabaseRequest } from '@/lib/db';

export const Route = createFileRoute('/api/corrections')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const user = await getAuthenticatedUser(request);
        if (!user) {
          return Response.json({ error: 'Authentication required.' }, { status: 401 });
        }
        if (user.role !== 'student') {
          return Response.json({ error: 'Student access required.' }, { status: 403 });
        }

        const body = await request.json() as {
          category?: string;
          currentValue?: string;
          proposedValue?: string;
          contactNumber?: string;
          reason?: string;
        };
        if (
          !body.category?.trim() ||
          !body.currentValue?.trim() ||
          !body.proposedValue?.trim() ||
          !body.contactNumber?.trim() ||
          !body.reason?.trim()
        ) {
          return Response.json({ error: 'All correction fields are required.' }, { status: 400 });
        }

        const profiles = await supabaseRequest<Array<{ id: number }>>(
          'users',
          'GET',
          { query: new URLSearchParams({ select: 'id', email: `eq.${user.email}` }).toString() },
        );
        if (!profiles[0]) {
          return Response.json({ error: 'Student profile not found.' }, { status: 404 });
        }

        const trackingCode = `CR-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
        try {
          const created = await supabaseRequest<Array<{ tracking_code: string }>>(
            'record_corrections',
            'POST',
            {
              body: {
                tracking_code: trackingCode,
                student_id: profiles[0].id,
                category: body.category.trim(),
                current_value: body.currentValue.trim(),
                proposed_value: body.proposedValue.trim(),
                contact_number: body.contactNumber.trim(),
                reason: body.reason.trim(),
                status: 'Pending Review',
              },
            },
          );
          if (!created[0]) {
            throw new Error('Supabase did not return the created correction request');
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('PGRST205')) {
            return Response.json(
              { error: 'Run migration 003 before submitting correction requests.' },
              { status: 503 },
            );
          }
          throw error;
        }

        return Response.json({ tracking_code: trackingCode }, { status: 201 });
      },
    },
  },
});

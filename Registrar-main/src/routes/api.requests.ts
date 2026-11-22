import { createFileRoute } from '@tanstack/react-router';
import { getAuthenticatedUser, supabaseRequest } from '@/lib/db';

type RequestRow = {
  id: number;
  student_id: number;
  tracking_code: string;
  status: string;
  fulfillment_method: string;
  payment_method: string;
  purpose?: string | null;
  created_at: string;
  users: {
    university_id: string;
    first_name: string;
    last_name: string;
    program: string | null;
  } | null;
  request_items: Array<{
    document_types: { name: string } | null;
  }>;
};

type CorrectionRow = {
  tracking_code: string;
  student_id: number;
  category: string;
  current_value: string;
  proposed_value: string;
  reason: string;
  status: string;
  created_at: string;
  users: {
    university_id: string;
    first_name: string;
    last_name: string;
    program: string | null;
  } | null;
};

function isMissingPurposeColumn(error: unknown): boolean {
  return error instanceof Error &&
    error.message.includes('PGRST204') &&
    error.message.includes('purpose');
}

export const Route = createFileRoute('/api/requests')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const user = await getAuthenticatedUser(request);
        if (!user) {
          return Response.json({ error: 'Authentication required.' }, { status: 401 });
        }
        if (user.role !== 'student' && user.role !== 'admin') {
          return Response.json({ error: 'Portal access denied.' }, { status: 403 });
        }

        let studentFilter = '';
        if (user.role === 'student') {
          const profiles = await supabaseRequest<Array<{ id: number }>>(
            'users',
            'GET',
            { query: new URLSearchParams({ select: 'id', email: `eq.${user.email}` }).toString() },
          );
          if (!profiles[0]) return Response.json([]);
          studentFilter = `&student_id=eq.${profiles[0].id}`;
        }

        const requestFields = 'id,student_id,tracking_code,status,fulfillment_method,payment_method';
        const requestRelations = `created_at,users(university_id,first_name,last_name,program),request_items(document_types(name))&order=created_at.desc${studentFilter}`;
        let requests: RequestRow[];
        try {
          requests = await supabaseRequest<RequestRow[]>(
            'requests',
            'GET',
            { query: `select=${requestFields},purpose,${requestRelations}` },
          );
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes('requests.purpose does not exist')) {
            throw error;
          }
          requests = await supabaseRequest<RequestRow[]>(
            'requests',
            'GET',
            { query: `select=${requestFields},${requestRelations}` },
          );
        }

        let corrections: CorrectionRow[] = [];
        try {
          corrections = await supabaseRequest<CorrectionRow[]>(
            'record_corrections',
            'GET',
            {
              query: `select=tracking_code,student_id,category,current_value,proposed_value,reason,status,created_at,users(university_id,first_name,last_name,program)&order=created_at.desc${studentFilter}`,
            },
          );
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes('PGRST205')) {
            throw error;
          }
        }

        const documentRequests = requests.map((request) => ({
          id: request.id,
          tracking_code: request.tracking_code,
          kind: 'Document',
          student_name: request.users
            ? `${request.users.first_name} ${request.users.last_name}`
            : 'Unknown student',
          student_number: request.users?.university_id ?? '',
          course: request.users?.program ?? '',
          fulfillment_method: request.fulfillment_method,
          payment_method: request.payment_method,
          purpose: request.purpose ?? 'Not specified',
          status: request.status,
          created_at: request.created_at,
          items: request.request_items.map((item) => ({
            document_name: item.document_types?.name ?? 'Unknown',
          })),
        }));
        const correctionRequests = corrections.map((correction) => ({
          id: correction.tracking_code,
          tracking_code: correction.tracking_code,
          kind: 'Records Correction',
          student_name: correction.users
            ? `${correction.users.first_name} ${correction.users.last_name}`
            : 'Unknown student',
          student_number: correction.users?.university_id ?? '',
          course: correction.users?.program ?? '',
          fulfillment_method: 'not_applicable',
          payment_method: 'not_applicable',
          purpose: `${correction.current_value} → ${correction.proposed_value}. ${correction.reason}`,
          status: correction.status,
          created_at: correction.created_at,
          items: [{ document_name: correction.category }],
        }));

        return Response.json([...documentRequests, ...correctionRequests]);
      },
      POST: async ({ request }: { request: Request }) => {
        const user = await getAuthenticatedUser(request);
        if (!user) {
          return Response.json({ error: 'Authentication required.' }, { status: 401 });
        }
        if (user.role !== 'student') {
          return Response.json({ error: 'Student access required.' }, { status: 403 });
        }

        const body = await request.json() as {
          requestType?: string;
          requestTypes?: string[];
          purpose?: string;
          fulfillmentMethod?: 'pickup' | 'delivery' | 'digital';
          paymentMethod?: string;
        };
        const requestTypes = body.requestTypes ?? (body.requestType ? [body.requestType] : []);
        if (
          requestTypes.length === 0 ||
          requestTypes.some((name) => typeof name !== 'string' || name.trim().length === 0) ||
          requestTypes.length > 10 ||
          !body.purpose ||
          !body.fulfillmentMethod ||
          !['pickup', 'delivery', 'digital'].includes(body.fulfillmentMethod) ||
          !body.paymentMethod
        ) {
          return Response.json({ error: 'Request details are incomplete.' }, { status: 400 });
        }

        try {
          const profiles = await supabaseRequest<Array<{ id: number }>>(
            'users',
            'GET',
            { query: new URLSearchParams({ select: 'id', email: `eq.${user.email}` }).toString() },
          );
          if (!profiles[0]) {
            return Response.json({ error: 'Student profile not found.' }, { status: 404 });
          }

          const documents = await supabaseRequest<Array<{ id: number; base_fee: number }>>(
            'document_types',
            'GET',
            {
              query: new URLSearchParams({
                select: 'id,base_fee',
                name: `in.(${requestTypes.map((name) => `"${name.replace(/"/g, '""')}"`).join(',')})`,
                is_active: 'eq.true',
              }).toString(),
            },
          );
          if (documents.length !== requestTypes.length) {
            return Response.json({ error: 'Selected document is unavailable.' }, { status: 400 });
          }

          const trackingCode = `DOC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
          const baseRequestBody = {
            tracking_code: trackingCode,
            student_id: profiles[0].id,
            fulfillment_method: body.fulfillmentMethod,
            payment_method: body.paymentMethod,
            total_fee: documents.reduce((total, document) => total + document.base_fee, 0),
            status: 'Pending Review',
          };
          const requestBody = { ...baseRequestBody, purpose: body.purpose };
          let purposeSaved = true;
          let created: Array<{ id: number }>;
          try {
            created = await supabaseRequest<Array<{ id: number }>>(
              'requests',
              'POST',
              { body: requestBody },
            );
          } catch (error) {
            if (!isMissingPurposeColumn(error)) throw error;
            created = await supabaseRequest<Array<{ id: number }>>(
              'requests',
              'POST',
              { body: baseRequestBody },
            );
            purposeSaved = false;
          }
          const newRequest = created[0];
          if (!newRequest) {
            throw new Error('Supabase did not return the created request');
          }

          try {
            await supabaseRequest(
              'request_items',
              'POST',
              {
                body: documents.map((document) => ({
                  request_id: newRequest.id,
                  document_id: document.id,
                  copies: 1,
                })),
              },
            );
          } catch (error) {
            try {
              await supabaseRequest('requests', 'DELETE', {
                query: `id=eq.${newRequest.id}`,
              });
            } catch (cleanupError) {
              console.error('Failed to remove incomplete document request:', cleanupError);
            }
            throw error;
          }

          return Response.json(
            { tracking_code: trackingCode, purpose_saved: purposeSaved },
            { status: 201 },
          );
        } catch (error) {
          console.error('Failed to save student document request:', error);
          return Response.json(
            {
              error: process.env['NODE_ENV'] === 'development' && error instanceof Error
                ? error.message
                : 'Could not save your request. Please try again or contact the registrar.',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});

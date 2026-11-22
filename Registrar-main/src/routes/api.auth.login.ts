import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = await request.json() as { email?: string; password?: string };
        const email = body.email?.trim().toLowerCase();
        if (!email || !body.password) {
          return Response.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const url = process.env['SUPABASE_URL'];
        const publishableKey = process.env['SUPABASE_PUBLISHABLE_KEY'];
        if (!url || !publishableKey) {
          throw new Error('Supabase authentication environment variables are not configured');
        }

        const response = await fetch(
          `${url.replace(/\/$/, '')}/auth/v1/token?grant_type=password`,
          {
            method: 'POST',
            headers: {
              apikey: publishableKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password: body.password }),
          },
        );
        if (!response.ok) {
          return Response.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        const session = await response.json() as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
          user: {
            id: string;
            email: string;
            app_metadata?: { role?: string };
          };
        };
        const role = session.user.app_metadata?.role;
        if (role !== 'student' && role !== 'admin') {
          return Response.json({ error: 'This account has no portal role assigned.' }, { status: 403 });
        }

        return Response.json({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
          user: { id: session.user.id, email: session.user.email, role },
        });
      },
    },
  },
});

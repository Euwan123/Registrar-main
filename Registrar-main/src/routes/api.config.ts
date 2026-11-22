import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/config')({
  server: {
    handlers: {
      GET: async () => {
        const databaseEnabled =
          process.env['APP_MODE'] === 'database' &&
          Boolean(
            process.env['SUPABASE_URL'] &&
            process.env['SUPABASE_PUBLISHABLE_KEY'] &&
            process.env['SUPABASE_SECRET_KEY'],
          );

        return Response.json({ databaseEnabled });
      },
    },
  },
});

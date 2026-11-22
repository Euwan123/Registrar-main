

type SupabaseMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function getSupabaseConfig() {
  const url = process.env['SUPABASE_URL'];
  const secretKey = process.env['SUPABASE_SECRET_KEY'];

  if (!url || !secretKey) {
    throw new Error('SUPABASE_URL and server-side SUPABASE_SECRET_KEY must be configured');
  }

  return { url: url.replace(/\/$/, ''), secretKey };
}

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string | null;
};

export async function getAuthenticatedUser(
  request: Request,
): Promise<AuthenticatedUser | null> {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const url = process.env['SUPABASE_URL'];
  const publishableKey = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !publishableKey) {
    throw new Error('Supabase authentication environment variables are not configured');
  }

  const response = await fetch(`${url.replace(/\/$/, '')}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;

  const user = await response.json() as {
    id: string;
    email?: string;
    app_metadata?: { role?: string };
  };
  if (!user.email) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.app_metadata?.role ?? null,
  };
}

export async function supabaseRequest<T>(
  table: string,
  method: SupabaseMethod,
  options: { query?: string; body?: unknown } = {},
): Promise<T> {
  const { url, secretKey } = getSupabaseConfig();
  const path = `${url}/rest/v1/${table}${options.query ? `?${options.query}` : ''}`;

  const init: RequestInit = {
    method,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      Prefer: method === 'GET' ? 'return=representation' : 'return=representation',
    },
  };
  if (options.body !== undefined) init.body = JSON.stringify(options.body);

  const response = await fetch(path, init);

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase API error ${response.status}: ${detail}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return response.json() as Promise<T>;
}

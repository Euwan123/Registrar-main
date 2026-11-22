import fs from 'node:fs';
import pg from 'pg';

const env = {};
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
}

const sql = fs.readFileSync(
  'migrations/002_supabase_registrar_schema.sql',
  'utf8',
);

const client = new pg.Client({
  host: env.SUPABASE_DB_HOST,
  port: Number(env.SUPABASE_DB_PORT),
  database: env.SUPABASE_DB_NAME,
  user: env.SUPABASE_DB_USER,
  password: env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  const result = await client.query(
    "select tablename from pg_tables where schemaname = 'public' and tablename in ('users', 'document_types', 'requests', 'request_items') order by tablename",
  );
  console.log(JSON.stringify({
    status: 'migration_applied',
    tables: result.rows.map((row) => row.tablename),
  }));
} finally {
  await client.end();
}

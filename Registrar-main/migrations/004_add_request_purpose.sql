alter table public.requests
  add column if not exists purpose text not null default 'Not specified';

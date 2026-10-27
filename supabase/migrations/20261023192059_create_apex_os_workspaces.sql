-- Apex OS private cloud snapshot store.
-- Apply this migration to Supabase before enabling cloud sync.
-- The table is intentionally not directly accessible to browser roles; the Edge Function validates the pairing token.
create table if not exists public.apex_os_workspaces (
  workspace_id text primary key
    check (workspace_id ~ '^[A-Za-z0-9_-]{32,80}$'),
  secret_hash text not null
    check (secret_hash ~ '^[a-f0-9]{64}$'),
  state jsonb not null default '{}'::jsonb
    check (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 1000000),
  revision bigint not null default 1 check (revision >= 1),
  client_updated_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.apex_os_workspaces enable row level security;
revoke all on public.apex_os_workspaces from public, anon, authenticated;
grant all on public.apex_os_workspaces to service_role;

comment on table public.apex_os_workspaces is
  'Private Apex OS snapshots; access is brokered by apex-os-sync Edge Function after validating a per-workspace pairing token.';

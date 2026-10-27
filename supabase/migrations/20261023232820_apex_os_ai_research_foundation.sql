-- Apex OS AI research and university dossier foundations.
-- Apply after 202610240001_apex_os_workspaces.sql. Access is brokered by server-side Edge Functions.
create table if not exists public.apex_os_research_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.apex_os_workspaces(workspace_id) on delete cascade,
  university_id text not null,
  action text not null check (action in ('research','chat')),
  scope text,
  model text,
  status text not null default 'completed' check (status in ('queued','running','completed','needs_review','failed')),
  summary text,
  source_count integer not null default 0 check (source_count >= 0),
  grounded boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists apex_os_research_runs_workspace_created on public.apex_os_research_runs(workspace_id, created_at desc);

create table if not exists public.apex_os_source_registry (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.apex_os_workspaces(workspace_id) on delete cascade,
  university_id text not null,
  source_url text not null,
  source_title text,
  source_type text not null default 'unknown' check (source_type in ('university','government','scholarship_provider','exam_authority','immigration_authority','secondary','unknown')),
  last_checked_at timestamptz,
  last_success_at timestamptz,
  content_fingerprint text,
  status text not null default 'unverified' check (status in ('unverified','current','changed','unavailable','conflicting','superseded')),
  created_at timestamptz not null default now(),
  unique(workspace_id, university_id, source_url)
);
create index if not exists apex_os_source_registry_workspace_uni on public.apex_os_source_registry(workspace_id, university_id);

create table if not exists public.apex_os_evidence_claims (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.apex_os_workspaces(workspace_id) on delete cascade,
  university_id text not null,
  category text not null,
  claim text not null,
  value jsonb,
  applicable_intake text,
  applicant_category text,
  source_url text,
  evidence_excerpt text,
  verification_status text not null default 'unverified' check (verification_status in ('verified','conflicting','stale','unverified','not_found','not_applicable','superseded')),
  checked_at timestamptz,
  supersedes uuid references public.apex_os_evidence_claims(id),
  created_at timestamptz not null default now()
);
create index if not exists apex_os_evidence_claims_workspace_uni on public.apex_os_evidence_claims(workspace_id, university_id, category);

create table if not exists public.apex_os_change_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.apex_os_workspaces(workspace_id) on delete cascade,
  university_id text,
  entity_type text not null,
  entity_key text not null,
  change_type text not null check (change_type in ('proposed','applied','rejected','rolled_back','conflict_detected')),
  before_value jsonb,
  after_value jsonb,
  reason text,
  source_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists apex_os_change_log_workspace_created on public.apex_os_change_log(workspace_id, created_at desc);

alter table public.apex_os_research_runs enable row level security;
alter table public.apex_os_source_registry enable row level security;
alter table public.apex_os_evidence_claims enable row level security;
alter table public.apex_os_change_log enable row level security;
revoke all on public.apex_os_research_runs, public.apex_os_source_registry, public.apex_os_evidence_claims, public.apex_os_change_log from public, anon, authenticated;
grant all on public.apex_os_research_runs, public.apex_os_source_registry, public.apex_os_evidence_claims, public.apex_os_change_log to service_role;

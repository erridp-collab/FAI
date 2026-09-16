-- === fai_scans ===
create table public.fai_scans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  operator_id uuid not null references public.operators(id),
  stato text default 'in_progress' check (stato in ('draft','in_progress','completed')),
  versione_algo text default 'v4',
  score_complessivo numeric,
  completato_il timestamptz
);
alter table public.fai_scans enable row level security;
create policy fai_scans_admin_all on public.fai_scans
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy fai_scans_own_data on public.fai_scans
  for all
  using (operator_id in (select operators.id from public.operators where operators.profile_id = auth.uid()));

-- === fai_responses ===
create table public.fai_responses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  guest_email text,
  activity_type_id integer references public.operator_types(id),
  answers jsonb not null default '{}'::jsonb,
  calculated_results jsonb default '{}'::jsonb,
  completed_at timestamptz default now(),
  scan_id uuid references public.fai_scans(id),
  operator_id uuid references public.operators(id)
);
alter table public.fai_responses enable row level security;
create policy "Anyone can insert responses" on public.fai_responses
  for insert with check (true);

-- === fai_pillar_scores ===
create table public.fai_pillar_scores (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.fai_scans(id),
  pilastro text not null,
  score_raw numeric,
  score_pesato numeric,
  gate_status text check (gate_status in ('ok','warn','ko'))
);
alter table public.fai_pillar_scores enable row level security;
create policy fai_pillar_scores_admin_all on public.fai_pillar_scores
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy fai_pillar_scores_own_data on public.fai_pillar_scores
  for all
  using (scan_id in (select fs.id from public.fai_scans fs join public.operators o on o.id = fs.operator_id where o.profile_id = auth.uid()));

-- === fai_subindex_scores ===
create table public.fai_subindex_scores (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.fai_scans(id),
  nome text not null,
  score numeric,
  gate_status text check (gate_status in ('ok','warn','ko'))
);
alter table public.fai_subindex_scores enable row level security;
create policy fai_subindex_scores_admin_all on public.fai_subindex_scores
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy fai_subindex_scores_own_data on public.fai_subindex_scores
  for all
  using (scan_id in (select fs.id from public.fai_scans fs join public.operators o on o.id = fs.operator_id where o.profile_id = auth.uid()));

-- === fai_reports ===
create table public.fai_reports (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.fai_scans(id),
  generato_il timestamptz default now(),
  storage_path text,
  versione integer default 1
);
alter table public.fai_reports enable row level security;
create policy fai_reports_admin_all on public.fai_reports
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy fai_reports_own_data on public.fai_reports
  for all
  using (scan_id in (select fs.id from public.fai_scans fs join public.operators o on o.id = fs.operator_id where o.profile_id = auth.uid()));
;

-- === profiles ===
create table public.profiles (
  id uuid primary key references auth.users(id),
  email text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  ruolo text default 'operator' check (ruolo in ('admin','operator'))
);
alter table public.profiles enable row level security;
-- Nota: nel Master DB originale profiles non ha policy proprie (solo RLS abilitata).
-- Le altre tabelle verificano il ruolo admin via subquery su profiles nelle loro policy.

-- === operator_types ===
create table public.operator_types (
  id integer generated always as identity primary key,
  name text not null unique,
  created_at timestamptz default now()
);
alter table public.operator_types enable row level security;
create policy "Public read access to activity types" on public.operator_types
  for select using (true);

-- === territories ===
create table public.territories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  nome text not null,
  comune text,
  provincia text,
  regione text,
  hub_id uuid references public.territories(id),
  tipo text check (tipo in ('hotspot','satellite','comune')),
  lat numeric,
  lng numeric,
  slug text,
  description text
);
create unique index territories_slug_key on public.territories(slug) where slug is not null;
alter table public.territories enable row level security;
create policy territories_read_all on public.territories for select using (true);
create policy territories_admin_write on public.territories
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));

-- === operators ===
create table public.operators (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  profile_id uuid references public.profiles(id),
  nome_referente text not null,
  nome_attivita text,
  territory_id uuid references public.territories(id),
  operator_type_id integer references public.operator_types(id),
  stato text default 'lead' check (stato in ('lead','active','inactive')),
  email_contatto text,
  source text,
  note_interne text
);
alter table public.operators enable row level security;
create policy operators_admin_all on public.operators
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy operators_own_data on public.operators
  for all
  using (profile_id = auth.uid());

-- === subscriptions ===
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  operator_id uuid not null references public.operators(id),
  tipo text check (tipo in ('host','manager','travel')),
  stato text default 'active' check (stato in ('active','paused','cancelled')),
  inizia_il date,
  scade_il date,
  importo numeric
);
alter table public.subscriptions enable row level security;
create policy subscriptions_admin_all on public.subscriptions
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy subscriptions_own_data on public.subscriptions
  for all
  using (operator_id in (select operators.id from public.operators where operators.profile_id = auth.uid()));
;

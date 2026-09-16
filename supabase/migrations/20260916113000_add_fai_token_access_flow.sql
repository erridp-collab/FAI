begin;

create extension if not exists pgcrypto;

create table if not exists public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null,
  notes text,
  email text,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  response_id uuid
);

alter table public.access_tokens
  add column if not exists token text,
  add column if not exists notes text,
  add column if not exists email text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists used_at timestamptz,
  add column if not exists response_id uuid;

create unique index if not exists access_tokens_token_key
  on public.access_tokens (token);

create table if not exists public.fai_responses (
  id uuid primary key default gen_random_uuid()
);

alter table public.fai_responses
  add column if not exists token_id uuid,
  add column if not exists email text,
  add column if not exists nome_attivita text,
  add column if not exists settore text,
  add column if not exists citta text,
  add column if not exists answers_percezione jsonb not null default '{}'::jsonb,
  add column if not exists answers_obiettivi jsonb not null default '[]'::jsonb,
  add column if not exists answers_main jsonb not null default '{}'::jsonb,
  add column if not exists comments_percezione jsonb,
  add column if not exists comments_main jsonb,
  add column if not exists objectives_comments jsonb,
  add column if not exists preoccupazione text,
  add column if not exists preoccupazione_comment text,
  add column if not exists area_scores jsonb not null default '{}'::jsonb,
  add column if not exists composite_indicators jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists completed_at timestamptz,
  add column if not exists commento_finale text not null default '';

-- The existing Alva schema already has an `answers` column. Keep it compatible
-- with inserts made by this app, which stores answers in the more specific
-- answers_* columns.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'fai_responses'
      and column_name = 'answers'
  ) then
    alter table public.fai_responses
      alter column answers set default '{}'::jsonb;
  end if;
end
$$;

-- A response is partial until the questionnaire is submitted.
alter table public.fai_responses
  alter column completed_at drop default;

create unique index if not exists fai_responses_token_id_key
  on public.fai_responses (token_id)
  where token_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fai_responses_token_id_fkey'
      and conrelid = 'public.fai_responses'::regclass
  ) then
    alter table public.fai_responses
      add constraint fai_responses_token_id_fkey
      foreign key (token_id)
      references public.access_tokens(id)
      on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'access_tokens_response_id_fkey'
      and conrelid = 'public.access_tokens'::regclass
  ) then
    alter table public.access_tokens
      add constraint access_tokens_response_id_fkey
      foreign key (response_id)
      references public.fai_responses(id)
      on delete set null;
  end if;
end
$$;

create table if not exists public.access_tokens_test (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  notes text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.fai_responses_test (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.access_tokens_test(id) on delete cascade,
  email text,
  nome_attivita text,
  settore text,
  citta text,
  answers_percezione jsonb not null default '{}'::jsonb,
  answers_obiettivi jsonb not null default '[]'::jsonb,
  answers_main jsonb not null default '{}'::jsonb,
  comments_percezione jsonb,
  comments_main jsonb,
  objectives_comments jsonb,
  preoccupazione text,
  preoccupazione_comment text,
  area_scores jsonb not null default '{}'::jsonb,
  composite_indicators jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  commento_finale text not null default ''
);

create index if not exists fai_responses_test_token_id_idx
  on public.fai_responses_test (token_id);

alter table public.access_tokens enable row level security;
alter table public.fai_responses enable row level security;
alter table public.access_tokens_test enable row level security;
alter table public.fai_responses_test enable row level security;

-- All questionnaire data is accessed through server-side routes with the
-- service-role key. Remove the legacy anonymous insert policy.
drop policy if exists "Anyone can insert responses" on public.fai_responses;
drop policy if exists "Enable read access for all users" on public.access_tokens;
drop policy if exists "Enable all access for responses" on public.fai_responses;

insert into public.access_tokens_test (token, notes, is_active)
values ('FAI-TEST-ALVA-001', 'Shared tester token', true)
on conflict (token) do update
set notes = excluded.notes,
    is_active = true;

notify pgrst, 'reload schema';

commit;

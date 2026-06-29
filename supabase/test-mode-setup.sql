create extension if not exists pgcrypto;

create table if not exists public.access_tokens_test (
    id uuid primary key default gen_random_uuid(),
    token text unique not null,
    notes text,
    email text,
    is_active boolean not null default true,
    created_at timestamp with time zone not null default now()
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
    area_scores jsonb default '{}'::jsonb,
    composite_indicators jsonb default '{}'::jsonb,
    created_at timestamp with time zone not null default now(),
    completed_at timestamp with time zone,
    commento_finale text not null default ''
);

create index if not exists idx_fai_responses_test_token_id
    on public.fai_responses_test (token_id);

alter table public.access_tokens_test enable row level security;
alter table public.fai_responses_test enable row level security;

insert into public.access_tokens_test (token, notes, is_active)
values ('FAI-TEST-ALVA-001', 'Shared tester token', true)
on conflict (token) do update
set notes = excluded.notes,
    is_active = true;

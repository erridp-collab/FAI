create table public.travel_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome_it text not null,
  nome_en text,
  tagline_it text,
  tagline_en text,
  hub_territory_id uuid references public.territories(id),
  pubblicata boolean not null default false,
  created_at timestamptz not null default now(),
  descrizione_it text,
  descrizione_en text,
  hero_subtitle_it text,
  hero_subtitle_en text,
  immagine_path text
);

alter table public.travel_collections enable row level security;
create policy travel_collections_admin_all on public.travel_collections
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy travel_collections_read_published on public.travel_collections
  for select
  using (pubblicata = true);

create index travel_collections_hub_territory_id_idx on public.travel_collections(hub_territory_id);
;

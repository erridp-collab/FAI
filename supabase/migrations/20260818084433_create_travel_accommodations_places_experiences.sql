-- === travel_accommodations ===
create table public.travel_accommodations (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.travel_collections(id),
  territory_id uuid not null references public.territories(id),
  operator_id uuid references public.operators(id),
  slug text not null,
  tier text not null default 'editorial' check (tier in ('powered_by_alva','editorial')),
  nome_it text not null,
  nome_en text,
  descrizione_it text,
  descrizione_en text,
  nota_onesta_it text,
  nota_onesta_en text,
  indirizzo text,
  location_name text,
  lat numeric(9,6),
  lng numeric(9,6),
  prezzo_range text,
  guests integer,
  rooms integer,
  has_wifi boolean,
  tags text[],
  immagine_path text,
  booking_url text,
  website text,
  phone text,
  email text,
  maps_url text,
  host_name text,
  host_bio text,
  amenities jsonb not null default '{}'::jsonb,
  practical_info jsonb not null default '[]'::jsonb,
  nearby jsonb not null default '[]'::jsonb,
  highlights text[],
  getting_there jsonb not null default '[]'::jsonb,
  dati_extra jsonb not null default '{}'::jsonb,
  in_guida boolean not null default false,
  guida_posizione integer,
  stato text not null default 'pending' check (stato in ('pending','published','rejected')),
  created_at timestamptz not null default now()
);
create unique index travel_accommodations_slug_key on public.travel_accommodations(slug);
create index travel_accommodations_collection_id_idx on public.travel_accommodations(collection_id);
create index travel_accommodations_territory_id_idx on public.travel_accommodations(territory_id);
create index travel_accommodations_operator_id_idx on public.travel_accommodations(operator_id);

alter table public.travel_accommodations enable row level security;
create policy travel_accommodations_admin_all on public.travel_accommodations
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy travel_accommodations_own_data on public.travel_accommodations
  for all
  using (operator_id in (select operators.id from public.operators where operators.profile_id = auth.uid()));
create policy travel_accommodations_read_published on public.travel_accommodations
  for select
  using (stato = 'published' and in_guida = true);

-- === travel_places ===
create table public.travel_places (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.travel_collections(id),
  territory_id uuid not null references public.territories(id),
  operator_id uuid references public.operators(id),
  tipo text not null check (tipo in (
    'colazione','pranzo','aperitivo','cena','cucina_etnica','botteghe',
    'percorso','itinerario','luogo','evento'
  )),
  tier text check (tier in ('powered_by_alva','editorial')),
  slug text,
  nome_it text not null,
  nome_en text,
  descrizione_it text,
  descrizione_en text,
  nota_onesta_it text,
  nota_onesta_en text,
  indirizzo text,
  maps_url text,
  lat numeric(9,6),
  lng numeric(9,6),
  tags text[],
  prezzo_range text,
  phone text,
  immagine_path text,
  itinerary_mode text check (itinerary_mode in ('foot','bike','car')),
  itinerary_distance text,
  itinerary_duration text,
  itinerary_cost text,
  best_months text,
  pois text[],
  date_start date,
  date_end date,
  is_recurring boolean,
  is_free boolean,
  dati_extra jsonb not null default '{}'::jsonb,
  in_guida boolean not null default false,
  guida_posizione integer,
  stato text not null default 'pending' check (stato in ('pending','published','rejected')),
  created_at timestamptz not null default now()
);
create unique index travel_places_slug_key on public.travel_places(slug) where slug is not null;
create index travel_places_collection_id_idx on public.travel_places(collection_id);
create index travel_places_territory_id_idx on public.travel_places(territory_id);
create index travel_places_operator_id_idx on public.travel_places(operator_id);
create index travel_places_tipo_idx on public.travel_places(tipo);

alter table public.travel_places enable row level security;
create policy travel_places_admin_all on public.travel_places
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy travel_places_own_data on public.travel_places
  for all
  using (operator_id in (select operators.id from public.operators where operators.profile_id = auth.uid()));
create policy travel_places_read_published on public.travel_places
  for select
  using (stato = 'published' and in_guida = true);

-- === travel_experiences ===
create table public.travel_experiences (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.travel_collections(id),
  territory_id uuid not null references public.territories(id),
  operator_id uuid references public.operators(id),
  subscription_id uuid references public.subscriptions(id),
  slug text not null,
  nome_it text not null,
  nome_en text,
  descrizione_it text,
  descrizione_en text,
  nota_onesta_it text,
  nota_onesta_en text,
  prezzo numeric,
  prezzo_note text,
  booking_type text check (booking_type in ('phone','email','external_link')),
  contatto_prenotazione text,
  is_vetrina boolean not null default true,
  immagine_path text,
  stato text not null default 'draft' check (stato in ('draft','published','rejected')),
  created_at timestamptz not null default now()
);
create unique index travel_experiences_slug_key on public.travel_experiences(slug);
create index travel_experiences_collection_id_idx on public.travel_experiences(collection_id);
create index travel_experiences_territory_id_idx on public.travel_experiences(territory_id);
create index travel_experiences_operator_id_idx on public.travel_experiences(operator_id);
create index travel_experiences_subscription_id_idx on public.travel_experiences(subscription_id);

alter table public.travel_experiences enable row level security;
create policy travel_experiences_admin_all on public.travel_experiences
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy travel_experiences_own_data on public.travel_experiences
  for all
  using (operator_id in (select operators.id from public.operators where operators.profile_id = auth.uid()));
create policy travel_experiences_read_published on public.travel_experiences
  for select
  using (stato = 'published');
;

create table public.accommodation_access (
  id uuid primary key default gen_random_uuid(),
  accommodation_id uuid not null references public.travel_accommodations(id),
  access_point_type text not null check (access_point_type in ('station','bus_stop','parking','center')),
  access_point_name text not null,
  mode text not null check (mode in ('walk','bike','car','bus')),
  duration_minutes integer not null,
  note text
);
create index accommodation_access_accommodation_id_idx on public.accommodation_access(accommodation_id);
alter table public.accommodation_access enable row level security;
create policy accommodation_access_admin_all on public.accommodation_access
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy accommodation_access_own_data on public.accommodation_access
  for all
  using (accommodation_id in (
    select ta.id from public.travel_accommodations ta
    join public.operators o on o.id = ta.operator_id
    where o.profile_id = auth.uid()
  ));
create policy accommodation_access_read_published on public.accommodation_access
  for select
  using (accommodation_id in (select id from public.travel_accommodations where stato = 'published' and in_guida = true));

create table public.accommodation_host_recommendations (
  id uuid primary key default gen_random_uuid(),
  accommodation_id uuid not null references public.travel_accommodations(id),
  travel_place_id uuid not null references public.travel_places(id),
  host_note text
);
create index accommodation_host_recommendations_accommodation_id_idx on public.accommodation_host_recommendations(accommodation_id);
create index accommodation_host_recommendations_travel_place_id_idx on public.accommodation_host_recommendations(travel_place_id);
alter table public.accommodation_host_recommendations enable row level security;
create policy accommodation_host_recommendations_admin_all on public.accommodation_host_recommendations
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
create policy accommodation_host_recommendations_own_data on public.accommodation_host_recommendations
  for all
  using (accommodation_id in (
    select ta.id from public.travel_accommodations ta
    join public.operators o on o.id = ta.operator_id
    where o.profile_id = auth.uid()
  ));
create policy accommodation_host_recommendations_read_published on public.accommodation_host_recommendations
  for select
  using (accommodation_id in (select id from public.travel_accommodations where stato = 'published' and in_guida = true));

create table public.territory_hub_connections (
  id uuid primary key default gen_random_uuid(),
  territory_id uuid not null references public.territories(id),
  hub_territory_id uuid not null references public.territories(id),
  mode text not null check (mode in ('train','bus','car','bike')),
  duration_minutes integer not null,
  direct boolean not null default true,
  station_name text,
  frequency_minutes integer,
  note text
);
create index territory_hub_connections_territory_id_idx on public.territory_hub_connections(territory_id);
create index territory_hub_connections_hub_territory_id_idx on public.territory_hub_connections(hub_territory_id);
alter table public.territory_hub_connections enable row level security;
create policy territory_hub_connections_read_all on public.territory_hub_connections for select using (true);
create policy territory_hub_connections_admin_write on public.territory_hub_connections
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));

create table public.collection_territories (
  collection_id uuid not null references public.travel_collections(id),
  territory_id uuid not null references public.territories(id),
  priority integer,
  featured boolean not null default false,
  positioning_it text,
  positioning_en text,
  selection_reasons_it text[],
  selection_reasons_en text[],
  primary key (collection_id, territory_id)
);
alter table public.collection_territories enable row level security;
create policy collection_territories_read_all on public.collection_territories for select using (true);
create policy collection_territories_admin_write on public.collection_territories
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));

create table public.territory_get_around_items (
  id uuid primary key default gen_random_uuid(),
  territory_id uuid not null references public.territories(id),
  category text not null check (category in ('train','bike','taxi','bus','delivery')),
  title text not null,
  description text not null,
  detail text,
  sort_order integer
);
create index territory_get_around_items_territory_id_idx on public.territory_get_around_items(territory_id);
alter table public.territory_get_around_items enable row level security;
create policy territory_get_around_items_read_all on public.territory_get_around_items for select using (true);
create policy territory_get_around_items_admin_write on public.territory_get_around_items
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));
;

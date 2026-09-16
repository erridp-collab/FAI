begin;
-- I contenuti appartengono a un territorio. Le collection che li espongono
-- vengono derivate esclusivamente da collection_territories.
alter table public.travel_accommodations
  alter column collection_id drop not null;
alter table public.travel_places
  alter column collection_id drop not null;
alter table public.travel_experiences
  alter column collection_id drop not null;
comment on column public.travel_accommodations.collection_id is
  'DEPRECATED: derive collections through territory_id -> collection_territories.';
comment on column public.travel_places.collection_id is
  'DEPRECATED: derive collections through territory_id -> collection_territories.';
comment on column public.travel_experiences.collection_id is
  'DEPRECATED: derive collections through territory_id -> collection_territories.';
-- Un solo vocabolario editoriale per tutti i contenuti Travel.
alter table public.travel_accommodations drop constraint if exists travel_accommodations_stato_check;
update public.travel_accommodations
set stato = case stato
  when 'pending' then 'draft'
  when 'rejected' then 'archived'
  else stato
end;
alter table public.travel_accommodations
  alter column stato set default 'draft',
  add constraint travel_accommodations_stato_check
    check (stato in ('draft', 'published', 'archived'));
alter table public.travel_places drop constraint if exists travel_places_stato_check;
update public.travel_places
set stato = case stato
  when 'pending' then 'draft'
  when 'rejected' then 'archived'
  else stato
end;
alter table public.travel_places
  alter column stato set default 'draft',
  add constraint travel_places_stato_check
    check (stato in ('draft', 'published', 'archived'));
alter table public.travel_experiences drop constraint if exists travel_experiences_stato_check;
update public.travel_experiences
set stato = case stato
  when 'rejected' then 'archived'
  else stato
end;
alter table public.travel_experiences
  alter column stato set default 'draft',
  add constraint travel_experiences_stato_check
    check (stato in ('draft', 'published', 'archived'));
-- territories.hub_id resta solo per compatibilità storica. Le connessioni
-- reali, anche multiple, vivono esclusivamente in territory_hub_connections.
update public.territories set hub_id = null where hub_id is not null;
comment on column public.territories.hub_id is
  'DEPRECATED: use territory_hub_connections as the only source of truth.';
-- Una modalità di trasporto compare una sola volta per coppia territorio/hub.
create unique index territory_hub_connections_unique_mode_idx
  on public.territory_hub_connections (territory_id, hub_territory_id, mode);
commit;

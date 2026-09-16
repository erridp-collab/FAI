begin;

create table public.accommodation_images (
  id uuid primary key default gen_random_uuid(),
  accommodation_id uuid not null references public.travel_accommodations(id) on delete cascade,
  path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index accommodation_images_accommodation_id_idx on public.accommodation_images(accommodation_id);

alter table public.accommodation_images enable row level security;

create policy accommodation_images_admin_all on public.accommodation_images
  for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.ruolo = 'admin'));

create policy accommodation_images_own_data on public.accommodation_images
  for all
  using (accommodation_id in (
    select ta.id from public.travel_accommodations ta
    join public.operators o on o.id = ta.operator_id
    where o.profile_id = auth.uid()
  ));

create policy accommodation_images_read_published on public.accommodation_images
  for select
  using (accommodation_id in (select id from public.travel_accommodations where stato = 'published' and in_guida = true));

commit;
;

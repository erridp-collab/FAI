create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and ruolo = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'territories',
    'travel_collections',
    'collection_territories',
    'travel_accommodations',
    'travel_experiences',
    'travel_places',
    'territory_hub_connections',
    'territory_get_around_items',
    'accommodation_access',
    'accommodation_host_recommendations'
  ] loop
    execute format('grant select, insert, update, delete on table public.%I to authenticated', target_table);
    execute format('drop policy if exists admin_full_access on public.%I', target_table);
    execute format(
      'create policy admin_full_access on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      target_table
    );
  end loop;
end $$;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'travel-media',
  'travel-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists travel_media_public_read on storage.objects;
create policy travel_media_public_read
on storage.objects
for select
to public
using (bucket_id = 'travel-media');
drop policy if exists travel_media_admin_insert on storage.objects;
create policy travel_media_admin_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'travel-media' and public.is_admin());
drop policy if exists travel_media_admin_update on storage.objects;
create policy travel_media_admin_update
on storage.objects
for update
to authenticated
using (bucket_id = 'travel-media' and public.is_admin())
with check (bucket_id = 'travel-media' and public.is_admin());
drop policy if exists travel_media_admin_delete on storage.objects;
create policy travel_media_admin_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'travel-media' and public.is_admin());

begin;

drop policy if exists accommodation_images_admin_all on public.accommodation_images;

create policy admin_full_access on public.accommodation_images
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

commit;
;

insert into public.profiles (id, email, ruolo)
values ('311fcfbe-677d-4171-a49e-46dc3b21650a', 'erri.dp@gmail.com', 'admin')
on conflict (id) do update set ruolo = 'admin';
;

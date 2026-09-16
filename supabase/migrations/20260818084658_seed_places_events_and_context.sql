with ctx as (
  select
    (select id from public.travel_collections where slug = 'firenze-e-oltre') as collection_id,
    (select id from public.territories where nome = 'Empoli') as territory_id
)
insert into public.travel_places (
  collection_id, territory_id, tipo, slug, nome_it, descrizione_it, nota_onesta_it, indirizzo, maps_url,
  itinerary_mode, itinerary_distance, itinerary_duration, itinerary_cost, best_months, pois,
  in_guida, stato
)
select ctx.collection_id, ctx.territory_id, 'itinerario', 'centro-storico', 'Centro storico a piedi',
  'Un giro a piedi tra Piazza Farinata degli Uberti, il Duomo e le vie dei mercanti medievali.',
  'Molto affollato durante i mercati cittadini del sabato.',
  'Piazza Farinata degli Uberti, Empoli', 'https://maps.google.com/?q=Piazza+Farinata+Empoli',
  'foot', '1.5 km', '1h 30min', 'Gratuito', 'mar–nov',
  array['Piazza Farinata degli Uberti', 'Collegiata di Sant''Andrea', 'Museo della Collegiata', 'Via dei Neri'],
  true, 'published'
from ctx
union all
select ctx.collection_id, ctx.territory_id, 'percorso', 'parco-serravalle', 'Parco di Serravalle',
  'Un''ampia oasi verde perfetta per passeggiate e sport all''aperto.',
  'Scarsamente illuminato la sera.',
  'Parco di Serravalle, Empoli', 'https://maps.google.com/?q=Parco+Serravalle+Empoli',
  'foot', '3 km', '45min', 'Gratuito', 'apr–ott',
  null,
  true, 'published'
from ctx;

with ctx as (
  select
    (select id from public.travel_collections where slug = 'firenze-e-oltre') as collection_id,
    (select id from public.territories where nome = 'Empoli') as territory_id
)
insert into public.travel_places (
  collection_id, territory_id, tipo, nome_it, descrizione_it, indirizzo,
  date_start, date_end, is_recurring, is_free, in_guida, stato
)
select ctx.collection_id, ctx.territory_id, 'evento', 'Mercato dell''Antiquariato',
  'Esposizione di mobili e oggetti d''epoca nel centro storico.', 'Piazza dei Leoni',
  date '2026-06-20', null::date, true, true, true, 'published'
from ctx
union all
select ctx.collection_id, ctx.territory_id, 'evento', 'Festival del Carciofo Empolese',
  'Degustazioni e stand gastronomici dedicati al prodotto tipico locale.', 'Piazza del Popolo',
  date '2026-06-25', date '2026-06-27', false, true, true, 'published'
from ctx;

insert into public.territory_hub_connections (territory_id, hub_territory_id, mode, duration_minutes, direct, station_name)
select e.id, f.id, 'train', 25, true, 'Empoli'
from public.territories e, public.territories f
where e.nome = 'Empoli' and f.nome = 'Firenze';

insert into public.collection_territories (collection_id, territory_id, priority, featured, positioning_it, selection_reasons_it)
select c.id, t.id, 1, true,
  'Una base viva e ben collegata per esplorare Firenze e la Toscana occidentale.',
  array[
    'Collegamento ferroviario diretto con Firenze',
    'Servizi e vita locale durante tutto l''anno',
    'Una posizione utile per raggiungere più destinazioni toscane'
  ]
from public.travel_collections c, public.territories t
where c.slug = 'firenze-e-oltre' and t.nome = 'Empoli';

insert into public.territory_get_around_items (territory_id, category, title, description, detail, sort_order)
select t.id, v.category, v.title, v.description, v.detail, v.sort_order
from public.territories t,
  (values
    ('train', 'Treno', 'La stazione di Empoli è un nodo sulle linee Firenze–Pisa e Firenze–Siena. L''opzione più pratica per esplorare la regione senza auto.', 'Pisa 35 min · San Miniato 10 min · Siena ~50 min', 1),
    ('bike', 'Bike sharing — Elerent', '20 e-bike in 10 stazioni — stazione, ospedale, Piazza della Vittoria e altri. Free-floating: prendi e lasci dove vuoi nei confini comunali, 24h su 24. App Elerent: scarica, registrati, scannerizza il QR sulla bici.', '€1 sblocco + €0,20/minuto', 2),
    ('taxi', 'Radio Taxi Empoli', 'Posteggio situato davanti alla stazione ferroviaria.', '0571 73100', 3),
    ('delivery', 'Delivery', 'Le principali piattaforme di delivery sono attive a Empoli (Just Eat, Deliveroo, Uber Eats — verificare copertura attuale).', 'Pesciolino e Le Maison Pizza & Pesce hanno anche consegna propria', 4)
  ) as v(category, title, description, detail, sort_order)
where t.nome = 'Empoli';
;

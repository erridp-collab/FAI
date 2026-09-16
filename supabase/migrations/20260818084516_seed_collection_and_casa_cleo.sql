insert into public.travel_collections (slug, nome_it, tagline_it, hub_territory_id, pubblicata, descrizione_it, hero_subtitle_it)
select 'firenze-e-oltre', 'Firenze e oltre', 'Firenze è vicina. Qui il ritmo cambia.', t.id, true,
  'Strutture selezionate in territori ben collegati a Firenze, per scoprire la città e vivere più Toscana dallo stesso soggiorno.',
  'Basi selezionate per vivere Firenze insieme a territori toscani con una propria identità.'
from public.territories t where t.nome = 'Firenze';

insert into public.operators (territory_id, operator_type_id, nome_referente, nome_attivita, stato, email_contatto)
select t.id, ot.id, 'Irene', 'Casa Cleo', 'active', 'irene@casacleo.it'
from public.territories t, public.operator_types ot
where t.nome = 'Empoli' and ot.name = 'hospitality';

insert into public.travel_accommodations (
  collection_id, territory_id, operator_id, slug, tier,
  nome_it, descrizione_it, nota_onesta_it,
  indirizzo, location_name, prezzo_range, tags,
  booking_url, email, maps_url, host_name, highlights,
  in_guida, stato
)
select
  c.id, t.id, o.id, 'casa-cleo', 'powered_by_alva',
  'Casa Cleo',
  'Appartamento nel centro di Empoli, gestito da Irene: una casa curata, comoda per vivere la città e raggiungere la stazione a piedi.',
  'Non è adatto a chi cerca un hotel con servizi. È una casa vera, con la cura di chi ci tiene.',
  'Via Ridolfi 4, Empoli', 'Empoli', '€60–90/notte', array['coppie','wifi','colazione'],
  '', 'irene@casacleo.it', 'https://maps.google.com/?q=Casa+Cleo+Empoli', 'Irene',
  array['Collegiata di Sant''Andrea', 'Piazza Farinata degli Uberti', 'Parco di Serravalle'],
  true, 'published'
from public.travel_collections c, public.territories t, public.operators o
where c.slug = 'firenze-e-oltre' and t.nome = 'Empoli' and o.nome_attivita = 'Casa Cleo';

insert into public.accommodation_access (accommodation_id, access_point_type, access_point_name, mode, duration_minutes)
select ta.id, 'station', 'Stazione di Empoli', 'walk', 10
from public.travel_accommodations ta where ta.slug = 'casa-cleo';
;

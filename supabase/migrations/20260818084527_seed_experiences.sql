with ctx as (
  select
    (select id from public.travel_collections where slug = 'firenze-e-oltre') as collection_id,
    (select id from public.territories where nome = 'Empoli') as territory_id,
    (select id from public.operators where nome_attivita = 'Casa Cleo') as casa_cleo_id
)
insert into public.travel_experiences (
  collection_id, territory_id, operator_id, slug, nome_it, descrizione_it, nota_onesta_it,
  prezzo, prezzo_note, booking_type, contatto_prenotazione, is_vetrina, stato
)
select ctx.collection_id, ctx.territory_id, ctx.casa_cleo_id,
  'pasta-fresca-irene', 'Corso di pasta fresca con Irene',
  'Impara a fare la pasta fresca come una volta, direttamente a Casa Cleo.',
  'Richiede manualità e pazienza, sconsigliato a chi ha fretta.',
  45, 'a persona, ingredienti inclusi', 'email', 'irene@casacleo.it', true, 'published'
from ctx
union all
select ctx.collection_id, ctx.territory_id, null,
  'degustazione-vini', 'Degustazione vini locali',
  'Scopri i migliori vini del territorio guidato dal nostro sommelier.',
  'Solo maggiorenni. L''ambiente può essere rumoroso.',
  35, 'a persona, 3 calici inclusi', 'phone', '0571123456', true, 'published'
from ctx;
;

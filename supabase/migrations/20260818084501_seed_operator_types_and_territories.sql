insert into public.operator_types (name) values
  ('hospitality'), ('food_beverage'), ('retail'), ('services'), ('agriturismo'), ('altro');

insert into public.territories (nome, comune, provincia, regione, tipo, slug)
values ('Firenze', 'Firenze', 'FI', 'Toscana', 'hotspot', 'firenze');

insert into public.territories (nome, comune, provincia, regione, tipo, hub_id, slug, description)
select 'Empoli', 'Empoli', 'FI', 'Toscana', 'satellite', t.id, 'empoli',
  'Una città toscana viva e ben collegata, tra Firenze, Pisa e le colline dell''Empolese Valdelsa.'
from public.territories t where t.nome = 'Firenze';
;

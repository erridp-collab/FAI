with ctx as (
  select
    (select id from public.travel_collections where slug = 'firenze-e-oltre') as collection_id,
    (select id from public.territories where nome = 'Empoli') as territory_id
),
rows as (
  select * from (values
    ('ristorante-cucina-sant-andrea', 'cena', 'Ristorante Cucina Sant''Andrea',
     'In pieno centro storico, dentro uno spazio bello con una parete del 1600 che fa già metà del lavoro. La cucina è classica, carne e pesce, con qualche tocco moderno senza stravolgere la tradizione. Funziona tutto: il cibo, il servizio, l''atmosfera.',
     'Un posto storico e affidabile, consigliato per una cena in famiglia o una cena romantica.',
     'Via Vincenzo Salvagnoli 47, Empoli', 'https://maps.google.com/?q=Via+Vincenzo+Salvagnoli+47+Empoli', array['centro storico','romantico']),
    ('trattoria-sciabolino', 'cena', 'Trattoria Sciabolino',
     'Un''istituzione. Se vuoi capire cos''è davvero la cucina toscana, questo è il posto. Spazio enorme, classico ma curato, con la brace a vista che dice tutto sull''approccio. Si mangia carne, tanta e bene: bistecche, spezzatini, cacciagione, ragù di cinghiale e anatra, pollo e coniglio fritti.',
     'Fuori dal centro; consigliata l''auto.',
     'Via d''Ormicello 18, Pozzale-Case Nuove, Empoli', 'https://maps.google.com/?q=Via+d%27Ormicello+18+Pozzale+Empoli', array['cucina toscana','carne']),
    ('le-maison-pizza-e-pesce', 'cena', 'Le Maison Pizza & Pesce',
     'Il nome dice tutto, ma il pesce dice di più. In una delle piazze più belle di Empoli, con tavoli all''aperto quando il tempo lo permette. I piatti di pesce non sono scontati e sono ben eseguiti: freschi, cucinati con un approccio moderno che funziona.',
     'Propone anche panini al pesce per qualcosa di più informale.',
     'Piazza Farinata degli Uberti 2, Empoli', 'https://maps.google.com/?q=Piazza+Farinata+degli+Uberti+2+Empoli', array['pesce','piazza']),
    ('manifattura-culinaria', 'cena', 'Manifattura Culinaria',
     'Una scommessa riuscita. Una giovane coppia che porta avanti una cucina di ricerca senza tradire le radici toscane. Sperimentano, propongono, introducono un modo diverso di mangiare a un pubblico che spesso non se lo aspetta. I vini sono naturali e molto curati.',
     'Il dettaglio più distintivo è lo chef''s table: da provare!',
     'Via Andrea Bonistalli 20/a, Empoli', 'https://maps.google.com/?q=Via+Andrea+Bonistalli+20+Empoli', array['cucina di ricerca','vini naturali']),
    ('pizzeria-napule', 'cena', 'Pizzeria Napule''',
     'Pizza napoletana, fatta bene. Il locale è piccolo, spesso pieno — il che dice tutto. Gestione simpatica e prezzi giusti. Non serve aggiungere altro.',
     null,
     'Via Cosimo Ridolfi 36, Empoli', 'https://maps.google.com/?q=Via+Cosimo+Ridolfi+36+Empoli', array['pizza napoletana']),
    ('pizzeria-ventitre', 'cena', 'Pizzeria Ventitré',
     'Una pizzeria moderna e spaziosa con vera ricerca dietro l''impasto e gli abbinamenti. Il risultato è un ibrido interessante tra tradizione napoletana e toscana — non un compromesso, ma una sintesi che funziona.',
     'Molto frequentata, e con ragione.',
     'Piazza XXIV Luglio 14, Empoli', 'https://maps.google.com/?q=Piazza+XXIV+Luglio+14+Empoli', array['impasto','ibrido napoletano-toscano']),
    ('pesciolino', 'cena', 'Pesciolino',
     'Via Chiara corre parallela alle strade pedonali del centro — fuori dal classico ''Giro d''Empoli'' del centro storico. Ed è esattamente questo il punto. Pesciolino è un banco di street food di pesce in una via secondaria: panini di pesce, fritture, qualche opzione di carne, prezzi onesti. Menu settimanali e offerte per famiglie ne fanno un posto abituale per la gente del posto.',
     'Non è un ristorante, non è un posto dove si siede: pesce fritto, nel cartoccio.',
     'Via Chiara 30, Empoli', 'https://maps.google.com/?q=Via+Chiara+30+Empoli', array['street food','fritto di pesce']),
    ('karma', 'cucina_etnica', 'Karma',
     'Una cucina indiana autentica in un ambiente curato che non lascia nulla al caso. La cucina è tradizionale ma raffinata, meno casalinga e più accessibile a chi non conosce bene i sapori del subcontinente.',
     'Circa 15 minuti a piedi dal centro, vicino al parco di Serravalle.',
     'Via Campania 16, Empoli', 'https://maps.google.com/?q=Via+Campania+16+Empoli', array['cucina indiana']),
    ('ristorante-cinese-la-fortuna', 'cucina_etnica', 'Ristorante Cinese La Fortuna',
     'Ristorante cinese classico. Niente di rivoluzionario, ma molto frequentato per una ragione chiara: economico e soddisfacente. Una cucina onesta che fa esattamente quello che deve fare, senza pretese.',
     null,
     'Piazza Guido Guerra 40, Empoli', 'https://maps.google.com/?q=Piazza+Guido+Guerra+40+Empoli', array['cucina cinese']),
    ('spaccio-agricolo', 'botteghe', 'Spaccio Agricolo',
     'Un piccolo negozio con un''ampia selezione di frutta, verdura e specialità alimentari, scelte con cura per garantire qualità e freschezza, sempre a prezzi giusti — il tutto in soli 22 metri quadri. Latte, prodotti vegetariani, formaggi e molto altro.',
     null,
     'Via Leonardo Da Vinci 30, Empoli', 'https://maps.google.com/?q=Via+Leonardo+Da+Vinci+30+Empoli', array['prodotti locali']),
    ('panificio-il-forno-allegro', 'botteghe', 'Panificio Il Forno Allegro',
     'Panificio locale direttamente in Piazza Matteotti, con schiacciata, pizze al forno e una varietà di pani freschi. Si trovano anche salumi e panini semplici e ben fatti: il tipo di posto su cui si può contare per uno spuntino rapido e soddisfacente a qualsiasi ora del giorno.',
     null,
     'Piazza Giacomo Matteotti 2, Empoli', 'https://maps.google.com/?q=Piazza+Giacomo+Matteotti+2+Empoli', array['pane fresco']),
    ('pane-amore-e-fantasia', 'botteghe', 'Pane Amore e Fantasia',
     'Una panetteria che porta i sapori del Sud Italia a Empoli, con una selezione di pani regionali, pizze e specialità da forno tradizionali. Accanto al salato, si trovano anche dolci classici meridionali: semplici, generosi e radicati nella tradizione.',
     null,
     'Via Piave 40, Empoli', 'https://maps.google.com/?q=Via+Piave+40+Empoli', array['sud italia'])
  ) as v(slug, tipo, nome_it, descrizione_it, nota_onesta_it, indirizzo, maps_url, tags)
)
insert into public.travel_places (collection_id, territory_id, tipo, tier, slug, nome_it, descrizione_it, nota_onesta_it, indirizzo, maps_url, tags, in_guida, stato)
select ctx.collection_id, ctx.territory_id, rows.tipo, 'editorial', rows.slug, rows.nome_it, rows.descrizione_it, rows.nota_onesta_it, rows.indirizzo, rows.maps_url, rows.tags, true, 'published'
from ctx, rows;
;

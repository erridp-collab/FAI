with ctx as (
  select
    (select id from public.travel_collections where slug = 'firenze-e-oltre') as collection_id,
    (select id from public.territories where nome = 'Empoli') as territory_id
),
rows as (
  select * from (values
    ('via-roma-24', 'colazione', 'Via Roma 24',
     'Una pasticceria con laboratorio proprio. Croissant, pain au chocolat e dolci in stile francese fatti davvero bene: il tipo di colazione che si ricorda a prezzi onesti. Popolarissima tra i locali. I cani sono benvenuti e ricevono anche un biscotto fatto apposta per loro.',
     'Saletta piccola, sette o otto tavoli: ma è il posto migliore per iniziare la mattina a Empoli.',
     'Via Roma 24, Empoli', 'https://maps.google.com/?q=Via+Roma+24+Empoli', array['cornetti','locals'], null::text),
    ('bar-gaggioli-e-vezzosi', 'colazione', 'Bar Gaggioli e Vezzosi',
     'Un classico del centro storico: due piani, quell''atmosfera anni ''80 di qualità — solida, familiare, sempre aperta. Pasticceria propria, prezzi nella norma e ampi spazi. Se arrivi oltre l''orario della colazione o vuoi qualcosa di salato, trovi focaccia e panini senza problemi.',
     'Il posto giusto quando vuoi restare in centro e goderti la vista delle vie del centro.',
     'Via del Giglio 8, Empoli', 'https://maps.google.com/?q=Via+del+Giglio+8+Empoli', array['centro storico'], null),
    ('pasticceria-la-perla', 'colazione', 'Pasticceria La Perla',
     'Non è in centro, ma si raggiunge a piedi senza sforzo. Il suo punto di forza è la varietà: tante opzioni sia dolci che salate, una selezione più ampia della media. Molto frequentata, con quell''atmosfera consumata da bar di quartiere. Non aspettarti una pasticceria raffinata, ma una colazione buona e soddisfacente.',
     null,
     'Località Viale Petrarca 130, Empoli', 'https://maps.google.com/?q=Localita+Viale+Petrarca+130+Empoli', array['quartiere'], null),
    ('pasticceria-dolcemente', 'colazione', 'Pasticceria DolceMente',
     'Una pasticceria moderna specializzata in torte contemporanee. La colazione è più classica, ma ben eseguita. Il posto giusto se cerchi qualcosa oltre l''estetica tradizionale.',
     null,
     'Via Jacopo Carrucci 99, Empoli', 'https://maps.google.com/?q=Via+Jacopo+Carrucci+99+Empoli', array['moderno'], null),
    ('pasticceria-la-sicilia-in-bocca', 'colazione', 'Pasticceria La Sicilia in Bocca',
     'Una pasticceria e rosticceria siciliana davvero originale. Un po'' fuori dal centro, facilmente raggiungibile sia a piedi che in auto. Ampi spazi e grande selezione dolce e salata (compresi gli arancini o arancine).',
     null,
     'Via dei Cappuccini 22, Empoli', 'https://maps.google.com/?q=Via+dei+Cappuccini+22+Empoli', array['sicilia','arancini'], null),
    ('schiaccia-vineria', 'pranzo', 'Schiaccia Vineria',
     'Se fosse a Firenze, ci sarebbe la fila fuori. La schiacciata è eccezionale: croccante, freschissima, sempre fatta al momento, con una selezione di salumi che non lascia niente al caso. Una delle migliori che si possano mangiare in Toscana.',
     'Pochi posti a sedere all''esterno: col bel tempo il pranzo si sposta naturalmente in Piazza della Vittoria.',
     'Via Jacopo Carrucci 99, Empoli', 'https://maps.google.com/?q=Via+Jacopo+Carrucci+99+Empoli', array['schiacciata','salumi'], null),
    ('laboratorio-doppio-zero', 'pranzo', 'Laboratorio Doppio Zero',
     'Un laboratorio di pasta che a pranzo diventa una piccola trattoria di pasta fresca. Ravioli, lasagne, sughi classici fatti come si deve: il tipo di posto che i lavoratori degli uffici vicini hanno già scoperto da soli, riconoscibile dal fatto che si riempie alla stessa ora ogni giorno.',
     'Zero fronzoli, tanta sostanza.',
     'Via Cosimo Ridolfi 59, Empoli', 'https://maps.google.com/?q=Via+Cosimo+Ridolfi+59+Empoli', array['pasta fresca','impiegati'], null),
    ('maciste-wine-bar', 'aperitivo', 'Maciste Wine Bar',
     'Il riferimento. Quando la gente del posto vuole bere bene, finiscono qui. La selezione di vini è curata con vera passione — nessuna etichetta ovvia, niente che trovi dappertutto. Anche i cocktail sono ottimi, e l''energia all''aperto a fine giornata è inequivocabilmente toscana.',
     'Ottimo anche per comprare una buona bottiglia da portare a casa.',
     'Via dei Neri 32, Empoli', 'https://maps.google.com/?q=Via+dei+Neri+32+Empoli', array['vino','cocktail'], null),
    ('la-birroteca', 'aperitivo', 'La Birroteca',
     'Tavoli direttamente sul corso principale, birre artigianali ben selezionate e un''atmosfera che si crea da sola. Chi lo gestisce porta una simpatia genuina: il tipo di posto dove si finisce a restare più del previsto.',
     'Nessuna cucina, ma il cibo dai locali vicini si può ordinare e mangiare qui.',
     'Via Cosimo Ridolfi 55, Empoli', 'https://maps.google.com/?q=Via+Cosimo+Ridolfi+55+Empoli', array['birra artigianale'], null),
    ('birrercole', 'aperitivo', 'Birrercole',
     'Un pub vero con una selezione seria di birre alla spina e in bottiglia. Quello che lo distingue è il cibo: panini e fritti in stile pub, ma con un accento toscano che lo differenzia dai soliti pub.',
     'Un posto che sa esattamente da dove viene.',
     'Piazza Guido Guerra 52, Empoli', 'https://maps.google.com/?q=Piazza+Guido+Guerra+52+Empoli', array['birra','pub'], null),
    ('vinegar', 'aperitivo', 'Vinegar',
     'Grande, sempre aperto. Dalla colazione alla cena, ma è all''aperitivo che offre il meglio di sé: buffet, buoni cocktail e una carta dei vini con etichette scelte con cura. C''è anche lo champagne per chi vuole alzare il livello.',
     'Comodo, centrale, affidabile.',
     'Piazza della Vittoria 36, Empoli', 'https://maps.google.com/?q=Piazza+della+Vittoria+36+Empoli', array['buffet','centrale'], '€8–12'),
    ('ciborgo', 'cena', 'Ciborgo',
     'Un rapporto qualità-prezzo difficile da battere, gestione impeccabile, cucina moderna senza pretese — non rivoluzionaria, ma abbastanza ricercata e curata nella presentazione. Il menu ha pochi piatti, tutti squisiti e stagionali, sia pesce che carne.',
     'La prenotazione è indispensabile: è sempre pieno, giustamente!',
     'Via Jacopo Chimenti 7, Empoli', 'https://maps.google.com/?q=Via+Jacopo+Chimenti+7+Empoli', array['menu corto'], null)
  ) as v(slug, tipo, nome_it, descrizione_it, nota_onesta_it, indirizzo, maps_url, tags, prezzo_range)
)
insert into public.travel_places (collection_id, territory_id, tipo, tier, slug, nome_it, descrizione_it, nota_onesta_it, indirizzo, maps_url, tags, prezzo_range, in_guida, stato)
select ctx.collection_id, ctx.territory_id, rows.tipo, 'editorial', rows.slug, rows.nome_it, rows.descrizione_it, rows.nota_onesta_it, rows.indirizzo, rows.maps_url, rows.tags, rows.prezzo_range, true, 'published'
from ctx, rows;
;

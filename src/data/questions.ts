export type Question = {
  id: number;
  area: string;
  number: string;
  text: string;
  labels: { 1: string; 3: string; 5: string };
  activity_types: string[];
};

export const questions: Question[] = [
  {
    "id": 1,
    "area": "#",
    "number": "1.1",
    "text": "Se ti chiedo perché un cliente dovrebbe scegliere te (non per il prezzo, non per la posizione), cosa risponderesti?",
    "labels": {
      "1": "non saprei cosa rispondere / non ci ho mai pensato",
      "3": "so cosa faccio ma fatico a spiegarlo in modo convincente",
      "5": "ho una storia chiara, la racconto con sicurezza"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 2,
    "area": "#",
    "number": "1.2",
    "text": "Quando i clienti ti lasciano una recensione, parlano di qualcosa che solo tu potresti offrire, o potrebbero descrivere qualsiasi altra attività simile?",
    "labels": {
      "1": "parlano solo di prezzo e di posizione",
      "3": "alcuni riconoscono qualcosa di specifico, ma non tutti",
      "5": "le recensioni dicono esattamente perché tornano da me"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 3,
    "area": "#",
    "number": "1.3",
    "text": "Chi ti trova online e poi viene da te trova la stessa cosa, o si aspettava qualcosa di diverso?",
    "labels": {
      "1": "il modo in cui comunico e presento la mia attività è improvvisato o frammentato / non ci ho mai pensato",
      "3": "il modo in cui comunico e presento la mia attività è abbastanza coerente",
      "5": "chi mi vede online e chi viene da me trova la stessa cosa"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 4,
    "area": "#",
    "number": "2.1",
    "text": "Se il canale che ti porta più clienti chiudesse domani, quanto tempo impiegheresti a rimpiazzare quei ricavi?",
    "labels": {
      "1": "avrei un problema serio, dipendo da un solo canale",
      "3": "ci vorrebbe del tempo ma ho qualche alternativa",
      "5": "ho quattro o più canali attivi, nessuno supera il 40%"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 5,
    "area": "#",
    "number": "2.2",
    "text": "Se la tipologia di clienti che ti porta più ricavi smettesse di venire, quanto sarebbe un problema?",
    "labels": {
      "1": "sarebbe un problema serio, una sola tipologia di cliente copre oltre il 70% dei ricavi",
      "3": "sarebbe difficile ma gestibile, una tipologia sola copre il 40-50% dei ricavi",
      "5": "non mi preoccuperei più di tanto. Nessuna tipologia di clienti supera il 25%, ho un mix reale"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 6,
    "area": "#",
    "number": "2.3",
    "text": "Se i ricavi si azzerassero oggi, quanti mesi di spese fisse potresti coprire?",
    "labels": {
      "1": "meno di 1 mese",
      "3": "2-3 mesi",
      "5": "5+ mesi"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 7,
    "area": "#",
    "number": "2.4",
    "text": "I tuoi ricavi sono distribuiti nell'anno o concentrati in pochi mesi?",
    "labels": {
      "1": "lavoro meno di 6 mesi l'anno",
      "3": "6-7 mesi attivi",
      "5": "10+ mesi con offerta per la bassa stagione"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 8,
    "area": "#",
    "number": "2.5",
    "text": "Un cliente che ti trova online può prenotare o acquistare direttamente da te — senza passare da Airbnb, Booking, Shopify o un altro intermediario?",
    "labels": {
      "1": "no, non ho nulla di mio",
      "3": "ho un sito ma senza possibilità di prenotazione o acquisto diretto",
      "5": "sì ho un sito aggiornato e con prenotazione/acquisto diretto"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 9,
    "area": "#",
    "number": "2.6",
    "text": "Su 100 euro di ricavi, quanti arrivano da clienti che comprano direttamente da te, senza passare da piattaforme, portali, marketplace o intermediari?",
    "labels": {
      "1": "meno di 5 euro su 100 arrivano da canali diretti",
      "3": "tra 15 e 25 euro su 100 arrivano da canali diretti",
      "5": "più di 35 euro su 100 arrivano da canali diretti"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 10,
    "area": "#",
    "number": "2.7",
    "text": "Se volessi contattare i tuoi clienti domani, per un'offerta, un aggiornamento, per ringraziarli, riusciresti a farlo senza troppi sforzi? Hai un elenco organizzato?",
    "labels": {
      "1": "no / non ci ho mai pensato",
      "3": "ho qualcosa ma non lo uso regolarmente",
      "5": "ho una lista attiva e aggiornata che uso regolarmente per comunicazioni con i clienti"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 11,
    "area": "#",
    "number": "3.1",
    "text": "Alla fine del mese, sai quanto ti rimane davvero dopo aver considerato tutti i costi dell’attività, le tasse previste e il valore del tuo lavoro?",
    "labels": {
      "1": "non l'ho mai calcolato / non ci ho mai pensato",
      "3": "lo so a grandi linee ma non lo controllo ogni mese",
      "5": "lo calcolo ogni mese, includendo costi, tasse previste e valore del mio lavoro"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 12,
    "area": "#",
    "number": "3.2",
    "text": "Se arrivasse un controllo domani (CIN, sicurezza, GDPR, HACCP, antincendio etc.) saresti tranquillo?",
    "labels": {
      "1": "so che dovrei sistemare delle cose, ci sto lavorando",
      "3": "sono in regola ma non seguo gli aggiornamenti normativi",
      "5": "sono in regola e mi tengo aggiornato quando le regole cambiano"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 13,
    "area": "#",
    "number": "3.3",
    "text": "Sai qual è il prodotto o servizio su cui guadagni di più, e qual è quello su cui guadagni di meno, con numeri precisi?",
    "labels": {
      "1": "non so / non ci ho mai pensato",
      "3": "saprei rispondere a intuito, ma senza numeri precisi",
      "5": "sì, saprei rispondere con numeri aggiornati e li uso per decidere cosa promuovere, aumentare, ridurre o cambiare"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 14,
    "area": "#",
    "number": "3.4",
    "text": "Riesci a dire, senza andare a controllare, quali sono le tue spese più alte questo mese e approssimativamente a quanto ammontano?",
    "labels": {
      "1": "no, vado a sensazione",
      "3": "traccio le spese principali ma non in modo sistematico",
      "5": "ho un sistema per tracciare le spese e rivedo le mie strategie se necessario"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 15,
    "area": "#",
    "number": "3.5",
    "text": "Se domani succedesse un danno serio alla tua attività (allagamento, incendio, furto, danni a un cliente o interruzione forzata) sai se la tua assicurazione coprirebbe le spese principali?",
    "labels": {
      "1": "non ho un’assicurazione / non ci ho mai pensato",
      "3": "ho un’assicurazione di base, ma non sono sicuro di cosa copra davvero",
      "5": "ho una copertura adeguata e so esattamente cosa copre e cosa non copre"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 16,
    "area": "#",
    "number": 3.6,
    "text": "Sei in regola con le ultime scadenze fiscali e contributive (IVA, INPS, imposte sul reddito, acconti)? Hai già messo da parte le somme per le prossime?",
    "labels": {
      "1": "ho scadenze arretrate o non so dove sono",
      "3": "sono in regola ma vado in difficoltà spesso vicino alle scadenze",
      "5": "sono in regola e metto da parte le somme con anticipo"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 17,
    "area": "#",
    "number": "4.1",
    "text": "Quando noti che i bisogni dei clienti cambiano (per esempio nuove richieste, prodotti meno richiesti o abitudini diverse) riesci ad adattare la tua offerta in modo concreto?",
    "labels": {
      "1": "no, la mia offerta è sostanzialmente identica da anni e non cambia in base ai segnali dei clienti",
      "3": "ogni tanto cambio qualcosa, ma senza un metodo preciso",
      "5": "adatto regolarmente prodotti, servizi, prezzi o modalità di vendita in base a ciò che osservo dai clienti"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 18,
    "area": "#",
    "number": "4.2",
    "text": "Se da domani un imprevisto ti impedisse di lavorare normalmente per due settimane (per esempio maltempo, guasto, problemi di salute, blocco dei fornitori o chiusura temporanea) sapresti già cosa fare nei primi giorni?",
    "labels": {
      "1": "no, improvviserei / non ci ho mai pensato",
      "3": "ho un’idea generale, ma non ho mai verificato se funzionerebbe",
      "5": "ho un piano chiaro: so chi contattare, quali priorità gestire e quali azioni fare subito"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 19,
    "area": "#",
    "number": "4.3",
    "text": "Se i tuoi clienti locali/abituali smettessero di venire, hai già altri segmenti (da fuori, dall'estero ecc) con cui lavorare?",
    "labels": {
      "1": "i miei clienti sono quasi tutti locali, non ho alternativa",
      "3": "ho qualche cliente che viene da fuori. Sto provando a raggiungere nuovi mercati",
      "5": "ho un mix nazionale e internazionale, con offerta adattata a segmenti diversi"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 20,
    "area": "#",
    "number": "4.4",
    "text": "Se arrivasse un cliente straniero con un problema da risolvere riusciresti ad aiutarlo e a comunicare con successo?",
    "labels": {
      "1": "per niente / penso di non averne bisogno",
      "3": "capisco e mi faccio capire, anche se a fatica",
      "5": "padroneggio la lingua e riesco a rispondere alle esigenze dei clienti stranieri"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 21,
    "area": "#",
    "number": "5.1",
    "text": "Se da domani mattina non potessi occuparti della tua attività per un mese, c’è qualcuno (collaboratore, familiare, socio, persona di fiducia ecc) che saprebbe cosa fare e dove trovare le istruzioni principali?",
    "labels": {
      "1": "no, senza di me si fermerebbe tutto",
      "3": "qualcuno potrebbe aiutare, ma con difficoltà e senza istruzioni complete",
      "5": "sì, ci sono persone di riferimento e procedure scritte per gestire le attività principali"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 22,
    "area": "#",
    "number": "5.2",
    "text": "Se perdessi il telefono domani, quanto tempo ti costerebbe ritrovare le informazioni che ti servono per lavorare?",
    "labels": {
      "1": "sarebbe un problema serio è tutto in testa o sul telefono",
      "3": "uso qualche strumento, ma non mi sento organizzato",
      "5": "uso un sistema digitale strutturato, le informazioni sono accessibili anche in mia assenza"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 23,
    "area": "#",
    "number": "5.3",
    "text": "Se qualcuno ti chiedesse come proteggi i dati dei tuoi clienti, sapresti rispondere con precisione?",
    "labels": {
      "1": "non ci ho mai pensato / non penso sia rilevante per la mia attività",
      "3": "uso sistemi di backup e password, cerco di fare attenzione",
      "5": "ho un sistema preciso e so esattamente come tratto i dati"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 24,
    "area": "#",
    "number": "5.4",
    "text": "Quanto sei attento alla sostenibilità ambientale nella gestione quotidiana?",
    "labels": {
      "1": "non ci ho mai pensato / non penso che sia rilevante per la mia attività",
      "3": "mi adeguo alle normative",
      "5": "rispetto pienamente le normative, propongo soluzioni sostenibili aggiuntive e mi tengo aggiornato"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 25,
    "area": "#",
    "number": "5.5",
    "text": "C'è qualcosa nella tua struttura che sai che va sistemato ma che rimandi da tempo?",
    "labels": {
      "1": "intervengo solo quando qualcosa si rompe",
      "3": "programmo la manutenzione ma non in modo strutturato",
      "5": "ho piano di manutenzione/ristrutturazione a lungo termine e lo seguo"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 26,
    "area": "#",
    "number": "6.1",
    "text": "Hai accordi, anche informali, con altri operatori locali per mandarvi clienti a vicenda?",
    "labels": {
      "1": "nessuno, lavoro da solo",
      "3": "tre–cinque collaborazioni, principalmente informali",
      "5": "faccio parte di una rete strutturata con accordi chiari e reciprocità"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 27,
    "area": "#",
    "number": "6.2",
    "text": "Se chiedessi a tre persone del territorio cosa pensano della tua attività, cosa ti aspetti che risponderebbero?",
    "labels": {
      "1": "non ho un rapporto con la comunità locale / non mi sento parte del territorio",
      "3": "la comunità è neutra, non ho né conflitti né legami forti",
      "5": "sono percepito come una risorsa, vengo coinvolto in eventi e progetti locali"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 28,
    "area": "#",
    "number": "6.3",
    "text": "Quando un cliente ti chiede dove mangiare, dove comprare, cosa fare ecc hai una risposta pronta, con nomi precisi?",
    "labels": {
      "1": "no /non ci ho mai pensato",
      "3": "ho qualche consiglio da dare se ci penso",
      "5": "ho un sistema di consigli per diverse esigenze, e gli operatori che consiglio lo sanno"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 29,
    "area": "#",
    "number": "6.4",
    "text": "Sai cosa sta succedendo nel tuo territorio (bandi, progetti, decisioni che potrebbero riguardarti) prima che diventi un problema o un'opportunità persa?",
    "labels": {
      "1": "no, non seguo / non lo ritengo rilevante",
      "3": "mi tengo aggiornato, a volte partecipo",
      "5": "sono attivo, la mia voce conta nella co-progettazione"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 30,
    "area": "#",
    "number": "7.1",
    "text": "Raccogli e usi le opinioni dei clienti (recensioni, commenti, critiche, domande o osservazioni dirette) per capire cosa migliorare nella tua attività?",
    "labels": {
      "1": "no, non raccolgo o non leggo regolarmente le opinioni dei clienti",
      "3": "le ascolto o le leggo, e ogni tanto ne traggo qualche spunto",
      "5": "raccolgo, osservo e confronto regolarmente i feedback dei clienti, poi li uso per decidere cosa migliorare"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 31,
    "area": "#",
    "number": "7.2",
    "text": "Negli ultimi dodici mesi hai provato qualcosa che non avevi mai fatto prima (anche se non ha funzionato come speravi)?",
    "labels": {
      "1": "no faccio le stesse cose da tempo",
      "3": "ho provato a sperimentare qualcosa di nuovo con risultati parziali",
      "5": "sperimento regolarmente. Anche le talvolta questi esperimenti non funzionano mi danno informazioni utili"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 32,
    "area": "#",
    "number": "7.3",
    "text": "Negli ultimi dodici mesi hai imparato qualcosa di nuovo che hai poi usato davvero?",
    "labels": {
      "1": "no / non lo ritengo rilevante",
      "3": "sì, ho seguito un corso strutturato / cerco di ternermi aggiornato",
      "5": "la formazione continua (strutturata o meno) e il confronto attivo sono parte integrante della mia attività."
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  },
  {
    "id": 33,
    "area": "#",
    "number": "7.4",
    "text": "Sai cosa fa meglio di te il tuo competitor più forte? E come usi queste informazioni?",
    "labels": {
      "1": "non guardo mai i competitor / non ci ho mai pensato / non ho competitors",
      "3": "ogni tanto guardo le recensioni/profili pubblici per farmi un'idea",
      "5": "analizzo strategie di vendita, recensioni e sviluppi dei miei competitori in maniera regolare e agisco di conseguenza"
    },
    "activity_types": [
      "commercio",
      "ricettivita"
    ]
  }
];

# Design: Miglioramenti UX Questionario
Data: 2026-06-16
Stato: Approvato per implementazione

---

## Panoramica

Sette modifiche al flusso questionario (`/questionnaire`) che migliorano la raccolta dati e il layout desktop. Nessuna modifica al sistema di scoring o ai risultati.

---

## 1. Commenti facoltativi su ogni domanda

### Comportamento
- Un campo textarea appare sotto i bottoni 1–5 per tutte le domande di percezione (7) e tutte le domande principali (33).
- Il campo è sempre visibile, non dipende dalla selezione del voto.
- Opzionale. Limite: **400 caratteri** con contatore visibile in basso a destra.
- Il commento viene salvato insieme alla risposta quando l'utente clicca "Avanti →".

### Auto-advance rimosso
- L'attuale auto-advance dopo 300ms viene **eliminato** per tutte le domande scala.
- Al suo posto: il bottone "Avanti →" in fondo alla card, **abilitato solo dopo che un voto è stato selezionato**.
- Il bottone "← Indietro" resta nella posizione attuale (in basso a sinistra).

### Dati
- Nuovo stato: `commentsPercezione: Record<string, string>` (chiave = ID percezione, es. `"p1.1"`)
- Nuovo stato: `commentsMain: Record<number, string>` (chiave = ID domanda principale, es. `1`)
- Questi vengono salvati nel DB come nuove colonne JSONB (vedi §6).

---

## 2. Layout desktop — card larga + scala opzione B

### Card
- `max-w-2xl` → **`max-w-4xl`** su desktop.
- Padding interno invariato (`p-6 md:p-10`).

### Scala di riferimento (label 1/3/5)
- **Eliminato** il blocco card a 3 colonne attuale.
- **Eliminato** il testo "2 e 4 sono valori intermedi".
- **Nuovo**: banda orizzontale con le label di testo allineate sopra i bottoni:
  ```
  1 — [testo label 1]      3 — [testo label 3]      5 — [testo label 5]
  [ 1 ]  [ 2 ]  [ 3 ]  [ 4 ]  [ 5 ]
  ```
  - Le label 1, 3, 5 sono in testo piccolo (`text-xs text-secondary`) su una riga `justify-between`.
  - Nessuna label per 2 e 4 — l'utente intuisce che sono intermedi.
- I bottoni scala diventano più compatti: altezza ridotta, font `text-xl font-bold`.

### Struttura HTML della domanda (ordine verticale)
1. Label area (`text-accent-surface text-sm font-semibold uppercase`)
2. Testo domanda (`text-2xl md:text-3xl font-medium`)
3. Sottotesto hint colonna E (solo domande principali — vedi §7)
4. Banda label scala + bottoni 1–5
5. Textarea commento facoltativo
6. Footer: `← Indietro` | `Avanti →`

---

## 3. Commento negli obiettivi

### Comportamento
- Quando un obiettivo viene selezionato (toggle ON), sotto di esso appare un campo textarea con placeholder: **"Perché è importante per te — facoltativo"**.
- Il campo scompare se l'obiettivo viene deselezionato (il testo viene perso).
- Limite: 400 caratteri (per coerenza).
- Viene salvato al submit del blocco obiettivi.

### Dati
- Nuovo stato: `objectivesComments: Record<string, string>` (chiave = ID obiettivo, es. `"2.1"`)

---

## 4. Blocco 3 — "Cosa ti preoccupa di più"

### Posizione nel flusso
Nuovo step tra obiettivi e schermata di transizione.

### Opzioni (8 — scelta singola, una sola)
| ID | Testo |
|----|-------|
| 3.1 | Non sapere raccontare cosa mi rende diverso e competere solo sul prezzo. |
| 3.2 | Dipendere troppo da un canale o una stagione. |
| 3.3 | Non sapere davvero quanto guadagno. |
| 3.4 | Non essere in regola con qualcosa senza saperlo e scoprirlo troppo tardi. |
| 3.5 | Non essere preparato per un imprevisto serio (alluvione, pandemia, nuova legge ecc). |
| 3.6 | Essere così indispensabile per la mia attività, da non poter mai staccare. |
| 3.7 | Lavorare da solo, senza una rete, senza qualcuno con cui confrontarmi. |
| 3.8 | Che il mio territorio perda attrattività e io i miei guadagni. |

### Comportamento
- Titolo blocco: **"Cosa ti preoccupa di più?"**
- Istruzione: **"Sceglila UNA sola."**
- Selezione radio-like: click seleziona, click di nuovo deseleziona.
- Dopo la selezione, compare textarea con placeholder: **"Perché ti preoccupa — facoltativo"** (400 char).
- Bottone "Continua" abilitato dopo aver selezionato un'opzione.

### Dati
- Nuovo stato: `preoccupazione: string | null` (ID selezionato, es. `"3.2"`)
- Nuovo stato: `preoccupazioneComment: string`

### `questions.ts`
Aggiungere tipo e array:
```ts
export type Worry = { id: string; text: string };
export const worries: Worry[] = [ /* 8 voci */ ];
```

---

## 5. Schermata di transizione

### Posizione nel flusso
Nuovo step dopo il Blocco 3, prima delle 33 domande principali.

### Contenuto
> Grazie delle informazioni che hai condiviso.
>
> Ora clicca continua per iniziare il questionario vero e proprio.

_(Testo verbatim da `REFERENCE_RAW.md`, cella B40 del foglio "Prima di iniziare")_

### Comportamento
- Nessun input — solo testo e un bottone **"Continua →"**.
- La schermata è contata come step nel progress bar (contribuisce al totale).
- Il bottone "← Indietro" è presente per coerenza.

---

## 6. Struttura step e dati

### Nuova mappa step
```
N_PERCEPTION       = 7
STEP_OBJECTIVES    = 7   (invariato)
STEP_PREOCCUPAZIONE = 8  (nuovo)
STEP_TRANSITION    = 9  (nuovo)
STEP_MAIN_START    = 10  (era 8)
STEP_MAIN_END      = 42  (era 40)
STEP_FINAL         = 43  (era 41)
TOTAL_STEPS        = 44  (era 42)
```

Il `handleObjectivesSubmit` deve andare a `STEP_PREOCCUPAZIONE` invece di `8`.

### Resume logic aggiornata
Dopo caricamento progress salvato:
1. Se percezioni incomplete → torna allo step corrispondente.
2. Se obiettivi < 3 → `STEP_OBJECTIVES`.
3. Se `preoccupazione` null → `STEP_PREOCCUPAZIONE`.
4. Se step di transizione non ancora superato → `STEP_TRANSITION`.
5. Se domande principali incomplete → `STEP_MAIN_START + mainCount`.
6. Se complete → `STEP_FINAL`.

### Migrazione Supabase (`fai_responses`)
```sql
ALTER TABLE fai_responses
  ADD COLUMN comments_percezione    JSONB,
  ADD COLUMN comments_main          JSONB,
  ADD COLUMN objectives_comments    JSONB,
  ADD COLUMN preoccupazione         TEXT,
  ADD COLUMN preoccupazione_comment TEXT;
```

### API `/api/save-progress` (POST body)
Aggiungere campi opzionali:
- `comments_percezione?: Record<string, string>`
- `comments_main?: Record<number, string>`
- `objectives_comments?: Record<string, string>`
- `preoccupazione?: string`
- `preoccupazione_comment?: string`

Questi vengono passati nel body e salvati nel record `fai_responses`.

---

## 7. Sottotesto domande (colonna E "La tua realtà")

### Comportamento
- Per tutte le 33 domande principali, appare un sottotesto in corsivo tra il testo della domanda e la scala.
- Stile: `text-sm text-secondary italic` con bordo sinistro sottile (`border-l-2 border-accent/30 pl-3`).
- Non presente nelle domande di percezione (non hanno colonna E nel foglio Excel).

### Dati
- Aggiungere campo `hint: string` al tipo `MainQuestion` in `questions.ts`.
- Aggiungere il testo corrispondente alla colonna E per ciascuna delle 33 domande (dati disponibili in `REFERENCE_RAW.md`).

### Mappa hint (estratto — tutte le 33 domande)
| number | hint |
|--------|------|
| 1.1 | Non il 'cosa vendi' ma il 'perché lo fai e perché proprio qui'. Se non sai dirlo in 30 secondi, i clienti non lo sanno neanche loro. |
| 1.2 | Rileggi le recensioni o chiedi feedback direttamente ai tuoi clienti. Se potrebbero essere recensioni di un tuo concorrente sei a 1-2. |
| 1.3 | Confronta il tuo profilo Instagram con l'esperienza reale: sembrano la stessa attività? |
| 2.1 | Non conta quanti canali di vendita hai aperto, ma quanti effettivamente portano clienti. |
| 2.2 | Famiglie, coppie, business, stranieri ecc. Se una di queste tipologie sparisce, riesci a portare avanti la tua attività senza troppi sforzi? |
| 2.3 | La causa principale di chiusura delle piccole imprese non è la mancanza di clienti, è la cassa che non regge un momento difficile. |
| 2.4 | Te lo chiediamo perché i mesi morti costano: affitto, utenze, manutenzione sono spese da sostenere anche quando non lavori. |
| 2.5 | Te lo chiediamo perché serve a valutare il margine di profitto. Ogni prenotazione che passa da una piattaforma ha un costo. Sapere quanto ti costa ogni canale è il primo passo per ridurlo. |
| 2.6 | Te lo chiediamo perché più ricavi diretti hai, più hai controllo sul rapporto con il cliente, sui margini e sulle decisioni commerciali. |
| 2.7 | Per esempio, hai un gruppo WhatsApp / mailing list tramite cui raggiungere i tuoi clienti facilmente? |
| 3.1 | Includi tutti i costi reali dell'attività: affitto, utenze, fornitori, materie prime, commissioni, strumenti, consulenti, trasporti, tasse e contributi. E includi anche il tuo tempo: se non ti paghi, o non consideri il valore del tuo lavoro, il margine che vedi non è reale. |
| 3.2 | Le normative cambiano in fretta. Non sapere ha un costo, spesso più alto di quello che si pensa. |
| 3.3 | Questa domanda serve a capire se sai dove guadagni davvero. Non tutti i prodotti / servizi hanno lo stesso margine. Alcuni possono vendere tanto ma lasciare poco, perché richiedono molto tempo, hanno costi alti, commissioni, sprechi o consegne costose. Altri possono vendere meno, ma lasciare un margine migliore. |
| 3.4 | Te lo chiediamo perché se non sai dove vanno i soldi, non puoi decidere dove fare tagli o investire. |
| 3.5 | Questa domanda serve a capire se, davanti a un danno importante, la tua attività avrebbe una protezione economica oppure se dovresti pagare tutto di tasca tua. Non basta "avere una polizza": è importante sapere cosa copre davvero. |
| 3.6 | Te lo chiediamo perché le tasse arrivano a rate irregolari — e senza tenerle in conto durante l'anno, le scadenze possono trasformarsi in un problema di liquidità anche quando l'attività va bene. |
| 4.1 | Non serve cambiare tutto in continuazione. Se negli ultimi sei mesi hai introdotto, eliminato o modificato almeno un prodotto / servizio dopo aver osservato il comportamento dei clienti, probabilmente sei già tra 4 e 5. |
| 4.2 | Te lo chiediamo per capire quanto sei preparato a reagire agli imprevisti. Alluvioni, frane, pandemie, ondate di calore, guasti e ritardi dei fornitori non sono solo ipotesi lontane: possono succedere. Avere un piano non significa prevedere tutto, ma sapere almeno quali sono le prime mosse. |
| 4.3 | Diversificare i mercati non significa smettere di servire i locali, ma significa non dipendere esclusivamente da loro. |
| 4.4 | Non si tratta di essere fluenti. Si tratta di non perdere un cliente per una barriera che si può abbassare. |
| 5.1 | Può bastare una rete minima di persone fidate e istruzioni semplici. Per esempio: chi apre e chiude, chi risponde ai clienti, chi gestisce ordini e pagamenti, dove sono password e documenti essenziali. Se tutto è solo nella tua testa, l'attività è più esposta. |
| 5.2 | Calendari, liste, app, promemoria — contano tutti. Il punto è se funzionano anche quando non ci sei tu. |
| 5.3 | Un gruppo WhatsApp con i numeri di tutti i clienti visibili a tutti è già una violazione. Non servono sistemi complicati ma serve consapevolezza. |
| 5.4 | Il 69% dei consumatori italiani è disposto a spendere di più per prodotti/attività sostenibili. Non è solo etica, è posizionamento. |
| 5.5 | Te lo chiediamo perché manutenere significa anche risparmiare e ridurre i costi gestione a breve e lungo termine. |
| 6.1 | Per esempio, hai degli accordi con altre attività locali (ristoranti, bar, piccoli fornitori ecc)? Sponsorizzi altri prodotti/attività nel territorio? |
| 6.2 | Te lo chiediamo perché questo conta molto: un buon rapporto con il territorio può portare passaparola, fiducia, clienti ricorrenti, collaborazioni e supporto nei momenti difficili. |
| 6.3 | Consigliare un ristoratore e dirgli che lo fai è il gesto più semplice per iniziare una rete. E chi riceve un cliente tende a restituirlo. |
| 6.4 | Chi partecipa è informato in anticipo. Chi non partecipa scopre le cose quando è già troppo tardi. |
| 7.1 | Le recensioni, anche quelle negative, spesso contengono informazioni preziose e possono diventare un vantaggio rispetto ai concorrenti. |
| 7.2 | Per esempio, hai provato qualcosa di nuovo (una piattaforma, un servizio, un canale di vendita) che non ha funzionato come speravi, ma hai imparato qualcosa di concreto sulla tua attività? Se questo sei tu, sei a 3. |
| 7.3 | Non si parla solo di corsi ufficiali o certificati. Può essere anche qualcosa di pratico: imparare a usare meglio i social, tenersi aggiornati su tendenze e cambiamenti, confrontarsi con altri imprenditori, migliorare una procedura ecc. |
| 7.4 | Osservi come si presenta il tuo competitore più forte (foto, recensioni, cosa raccontano di sé)? Non per copiarlo, ma per capire cosa ti rende diverso? Se sì, sei tra 4 e 5. Se pensi di non avere competitori diretti, hai mai pensato a quelli indiretti? |

---

## File coinvolti

| File | Modifica |
|------|----------|
| `src/data/questions.ts` | Aggiungere campo `hint` a `MainQuestion`, aggiungere tipo `Worry` e array `worries`, aggiornare 33 oggetti con i testi hint |
| `src/app/questionnaire/page.tsx` | Nuovo stato (5 campi), nuova struttura step (STEP_PREOCCUPAZIONE, STEP_TRANSITION), rimozione auto-advance, aggiunta bottone Avanti, rendering Blocco 3 e schermata transizione, campo commento su tutte le domande, hint sotto domande principali, scala opzione B |
| `src/app/api/save-progress/route.ts` | Accettare e salvare i 5 nuovi campi nel body |
| `database_schema.sql` | Aggiungere le 5 nuove colonne a `fai_responses` |
| Supabase (migration) | `ALTER TABLE fai_responses ADD COLUMN ...` (5 colonne) |

---

## Cosa non cambia

- Scoring (`/utils/scoring.ts`) — invariato
- Pagina risultati (`/results/[id]`) — invariata
- Token validation e flusso di accesso — invariati
- Dev mode — invariato (commenti e preoccupazione vengono semplicemente inclusi nel payload sessionStorage)

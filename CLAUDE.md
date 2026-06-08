# FAI Microimpresa - Project Context

## Panoramica

Questo progetto è una web app Next.js (app router) contenuta nella cartella `fai-web`. Lo scopo è offrire una diagnosi gratuita per piccole attività commerciali e ricettive, tramite un questionario a risposta rapida.

## Componenti principali

- `src/app/page.tsx`
  - Pagina di benvenuto
  - Permette all'utente di scegliere tra `commercio` e `ricettivita`
  - Reindirizza a `/questionnaire?type=...`

- `src/app/questionnaire/page.tsx`
  - Componente client-side che gestisce il questionario
  - Mostra una domanda alla volta, con punteggio da 1 a 5
  - Avanza automaticamente alla domanda successiva
  - Al termine richiede email e salva i risultati su Supabase

- `src/data/questions.ts`
  - Definisce la lista delle domande e le etichette per i punteggi
  - Ogni domanda ha `activity_types` ma oggi tutte le domande valgono sia per `commercio` che per `ricettivita`
  - Alcuni campi sono ancora placeholders: `area` è impostato su `#`

- `src/utils/scoring.ts`
  - Calcola il punteggio medio per area
  - Restituisce punteggio complessivo, punteggi area, area più forte e area più debole
  - Mappa i livelli su `Critico`, `Attenzione`, `Solido`, `Eccellente`

- `src/utils/supabase/client.ts`
  - Crea il client Supabase usando le variabili d'ambiente:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Flusso attuale

1. L'utente sceglie attività su `/`
2. Arriva su `/questionnaire?type=<tipo>`
3. Risponde alle domande con un punteggio 1-5
4. Alla fine inserisce l'email
5. Il front-end calcola i risultati e li salva su Supabase nella tabella `fai_responses`

## Stato attuale / problemi chiave

- Il questionario non mostra ancora una pagina di risultati dettagliata dopo il salvataggio.
- Il filtro delle domande per tipo di attività è presente, ma `questions.ts` non differenzia davvero i tipi.
- `area` è impostato su `#`, quindi l'analisi per area non è significativa finché non vengono classificate le domande in aree reali.
- Manca validazione avanzata sui dati e gestione degli errori lato server.
- Il salvataggio su Supabase è client-side: potrebbe essere più sicuro con un endpoint server.
- Il file `CLAUDE.md` ora serve come punto di riferimento per il contesto del progetto.

## Suggerimenti per riprendere lo sviluppo

- Controllare prima `src/data/questions.ts` e completare le aree / categorie delle domande.
- Implementare una pagina di report finale con i risultati dettagliati e i suggerimenti.
- Valutare se usare un API route/server action per salvare le risposte invece di `supabase.from(...)` direttamente nel client.
- Verificare che `fai_responses` contenga i campi usati: `guest_email`, `activity_type_id`, `answers`, `calculated_results`.
- Se vuoi mantenere due percorsi distinti, confermare le differenze tra domande per `commercio` e `ricettivita`.

## Comandi utili

- `npm run dev` per avviare l'app in sviluppo
- `npm run build` per compilare
- `npm run lint` per controllare la qualità del codice

## Note importanti

- Il progetto usa Next.js 16, React 19 e Tailwind CSS v4.
- La cartella principale del front-end è `fai-web`.
- Ci sono script Python `export_to_json.py` e `read_excel.py` nella root che probabilmente servono per generare i dati dalle tabelle Excel, ma non sono collegati direttamente all'app Next.js.


# FAI Microimpresa - Project Context

## Panoramica

Questo progetto e una web app Next.js (App Router) che vive direttamente nella root del repository `FAI`.
Lo scopo e offrire una diagnosi gratuita per piccole attivita commerciali e ricettive tramite un questionario a risposta rapida.

## Componenti principali

- `src/app/page.tsx`
  - Pagina di benvenuto
  - Permette all'utente di scegliere tra `commercio` e `ricettivita`
  - Reindirizza a `/questionnaire?type=...`

- `src/app/questionnaire/page.tsx`
  - Componente client-side che gestisce il questionario
  - Mostra una domanda alla volta, con punteggio da 1 a 5
  - Avanza automaticamente alla domanda successiva
  - Supporta anche il flusso `dev mode`

- `src/app/results/[id]/page.tsx`
  - Mostra i risultati finali
  - In `dev mode` legge i dati dalla sessione
  - In produzione passa da API server-side

- `src/utils/scoring.ts`
  - Calcola punteggi area, indicatori compositi e punteggio complessivo
  - Contiene le soglie aggiornate per aree e compositi
  - Fallisce esplicitamente se il questionario principale e incompleto

- `src/app/api/*`
  - Gestiscono validazione token, salvataggio progressi e lettura risultati
  - Usano il client server-side di Supabase

- `src/utils/supabase/client.ts`
  - Espone il client browser Supabase con inizializzazione lazy

- `src/utils/supabase/server.ts`
  - Espone il client server Supabase con `SUPABASE_SERVICE_ROLE_KEY`

## Flusso attuale

1. L'utente entra da `/`
2. Seleziona il percorso e avvia il questionario
3. Compila le domande iniziali, gli obiettivi e il questionario principale
4. Inserisce i dati finali
5. Ottiene i risultati, oppure in `dev mode` viene reindirizzato a `/results/__dev__`

## Comandi utili

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`

## Note importanti

- Il progetto usa Next.js 16, React 19 e Tailwind CSS v4.
- Gli script di supporto per Excel vivono nella root (`export_to_json.py`, `read_excel.py`, `generate_questions.js`, `scripts/extract_reference.py`).
- I documenti di riferimento e i piani stanno in `docs/`.

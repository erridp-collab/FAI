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

## Strategia branch

- **`main`** — codice di produzione. NON deve contenere nulla legato al dev mode (`NEXT_PUBLIC_ALLOW_DEV_MODE`). Chiunque abbia accesso al repo vedrebbe il flag.
- **`preview`** — identico a `main` + il fix dev mode che abilita il pulsante di test in homepage. Va riapplicato con cherry-pick ogni volta che si mergia su `main`.
- Regola: ogni volta che si fa push su `main`, fare cherry-pick del commit dev mode su `preview` e force-push.

## UI Premium Upgrade (2026-06-17)

Upgrade visivo completo documentato in `docs/superpowers/specs/2026-06-17-ui-premium-upgrade-design.md`.

Modifiche applicate:

- **Progress indicator** (`questionnaire/page.tsx`) — sostituita la griglia 44 quadratini con una mini-bar compatta a una riga: 4 pillole fase + divisore + dots area corrente + nome area + contatore. Pills e dots sono cliccabili e keyboard-accessible.
- **Scale 1–5** (`questionnaire/page.tsx`) — pulsanti filled: default `bg-raised`, selezionato `bg-accent` + shadow + `-translate-y-0.5`. Font `text-2xl font-extrabold`.
- **Commento finale** (`questionnaire/page.tsx`) — textarea opzionale (max 1000 chars + contatore) nell'ultimo step, sopra il pulsante submit.
- **API save-progress** (`api/save-progress/route.ts`) — accetta e salva `commento_finale` nel payload finale.
- **DB** (`database_schema.sql`) — colonna `commento_finale TEXT DEFAULT '' NOT NULL` aggiunta a `fai_responses`. Migrazione applicata su Supabase (`qljhgtzgvywealorsrvr`).
- **Homepage hero** (`page.tsx`) — radial gradient di sfondo + SVG radar chart statico 90×90px + glow dot nel pill badge.
- **Homepage CTA** (`page.tsx`) — card con gradient, pulsante primario "Richiedi l'accesso →", snippet token, link contatto.
- **Results header** (`results/[id]/page.tsx`) — linear gradient 180deg + badge "DIAGNOSI COMPLETATA" con cerchio glow.
- **Results indicatori compositi** (`results/[id]/page.tsx`) — da lista a card grid 2 colonne con bordo sinistro colorato per livello (Fragile/Vulnerabile/Adeguata/Solida).
- **Results email CTA** (`results/[id]/page.tsx`) — card minimal con icona 📬 e timeline tre passi (Diagnosi completata → Elaborazione → Report via email).

## Note importanti

- Il progetto usa Next.js 16, React 19 e Tailwind CSS v4.
- Gli script di supporto per Excel vivono nella root (`export_to_json.py`, `read_excel.py`, `generate_questions.js`, `scripts/extract_reference.py`).
- I documenti di riferimento e i piani stanno in `docs/`.

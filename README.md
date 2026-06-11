# FAI Microimpresa

Web app Next.js per la diagnosi di microimprese commerciali e ricettive tramite questionario guidato.

## Struttura

- La root del repository `FAI` coincide con la root dell'app.
- Il codice applicativo vive in `src/`.
- I documenti di prodotto e riferimento vivono in `docs/`.
- Gli script di supporto per Excel stanno nella root e in `scripts/`.

## Flusso principale

- `/` landing iniziale
- `/start?token=...` validazione token
- `/questionnaire` compilazione questionario
- `/results/[id]` risultati finali
- `/questionnaire?dev=1` flusso locale senza dipendenza dal database

## Comandi utili

```bash
npm run dev
npm run test
npm run test:e2e
npm run lint
npm run build
```

## Variabili ambiente

Per il flusso completo server-side:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

In `dev mode` il questionario puo essere testato anche senza database.

## Documentazione utile

- `CLAUDE.md` contesto operativo del progetto
- `docs/product-readiness/REFERENCE.md` fonte di verita estratta dall'Excel
- `docs/product-readiness/BACKLOG.md` backlog dei miglioramenti
- `docs/superpowers/specs/` specifiche storiche di design e product-readiness

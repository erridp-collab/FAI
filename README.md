# FAI Microimpresa

Web app Next.js per la diagnosi di microimprese commerciali e ricettive tramite questionario guidato.

## Struttura

- La root del repository `FAI` coincide con la root dell'app.
- Il codice applicativo vive in `src/`.
- I documenti di prodotto e riferimento vivono in `docs/`.
- Gli script di supporto per Excel stanno nella root e in `scripts/`.

## Flusso principale

- `/` landing iniziale
- `/start?token=...` validazione token e instradamento automatico su ramo reale o test
- `/questionnaire` compilazione questionario
- `/results/[id]` risultati finali
- `/questionnaire?dev=1` fallback locale di sviluppo senza dipendenza dal database

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
- `ADMIN_PASSWORD` — password server-side per la dashboard `/admin`

Per l'invio automatico dei link via email (facoltativo):

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` — mittente verificato; default `noreply@fai-microimpresa.it`

La creazione manuale dei token funziona anche senza Resend: la dashboard mostra
il link personale da copiare e inviare. Le variabili di produzione vanno gestite
su Vercel e richiedono un nuovo deployment dopo ogni modifica.

In `dev mode` il questionario puo essere testato anche senza database.

Per il flusso di test condiviso con salvataggio su Supabase, usa sempre `/start?token=...`.

## Documentazione utile

- `CLAUDE.md` contesto operativo del progetto
- `docs/test-mode.md` guida operativa del flusso test condiviso
- `docs/product-readiness/REFERENCE.md` fonte di verita estratta dall'Excel
- `docs/product-readiness/BACKLOG.md` backlog dei miglioramenti
- `docs/superpowers/specs/` specifiche storiche di design e product-readiness

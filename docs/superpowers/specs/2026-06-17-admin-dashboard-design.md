# Admin Dashboard — Design Spec
**Data:** 2026-06-17
**Scope:** Dashboard admin per gestire i token di accesso a FAI Microimpresa.
**Obiettivo:** Permettere all'admin di creare token, inviare email agli utenti e visualizzare i risultati completati, senza toccare Supabase Studio.

---

## Panoramica

Dashboard protetta da password che vive nell'app Next.js esistente sotto `/admin`. Nessuna nuova deployment, nessun nuovo servizio eccetto Resend per le email.

Chi lo usa: solo l'admin (Enrico). Un solo ruolo, nessuna gestione utenti.

---

## 1. Autenticazione

### Meccanismo
- Password singola in `.env.local`: `ADMIN_PASSWORD=<valore>`
- Cookie `fai_admin_session` (HttpOnly, Secure, SameSite=Strict, max-age 7 giorni)
- `src/middleware.ts` intercetta tutte le richieste `/admin/*`: se il cookie manca o è invalido → redirect a `/admin/login`
- L'endpoint `POST /api/admin/login` confronta la password con `ADMIN_PASSWORD`, imposta il cookie se corretta

### Pagina login
- `/admin/login` — form minimalista con campo password + pulsante "Accedi"
- Errore generico "Password non corretta" senza dettagli
- Redirect a `/admin` dopo login riuscito

---

## 2. Pagine

### `/admin` — Lista token
Tabella con colonne: **Token** (monospace) · **Note** · **Email** · **Stato** · **Data** · **Azioni**

Stati badge:
- `Non usato` — grigio (`#6B6890`)
- `In corso` — giallo (`#F3CF69`)
- `Completato` — verde (`#4ade80`)

Colonna Azioni:
- Stato "Completato" → link "Risultati →" che apre `/admin/responses/[id]`
- Altri stati → nessuna azione

Header tabella: titolo "Token di accesso" + pulsante "+ Nuovo token" che apre il modale.

### Modale — Crea token
Si apre sopra la lista senza navigare. Campi:
- **Nome / Note** (text, required) — uso interno, es. "Mario Rossi – Bar Centro"
- **Email destinatario** (email, required) — a chi viene mandata l'email

Pulsante: "Crea token e invia email →"

Al submit:
1. `POST /api/admin/tokens` — genera token `ALVA-XXXXXXXX`, salva in DB, invia email via Resend
2. Se successo: chiude modale, aggiunge riga in cima alla tabella, mostra toast "Token creato e email inviata"
3. Se errore: mostra messaggio d'errore inline nel modale

### `/admin/responses/[id]` — Risultati admin
Stessa visualizzazione di `results/[id]/page.tsx` (radar chart, area scores, indicatori compositi, email CTA) ma:
- Carica i dati da `GET /api/admin/responses/[id]` (autenticato via cookie admin, nessun token utente richiesto)
- Aggiunge breadcrumb "← Torna alla lista" in cima

---

## 3. API Routes

Tutte le route `/api/admin/*` verificano il cookie `fai_admin_session` prima di procedere. Se assente → `401`.

### `POST /api/admin/login`
```
Body: { password: string }
Response 200: { ok: true }  → imposta cookie
Response 401: { error: "Password non corretta" }
```

### `GET /api/admin/tokens`
```
Response 200: { tokens: Token[] }

Token: {
  id: string
  token: string
  notes: string | null
  email: string | null      // da fai_responses se esiste
  created_at: string
  used_at: string | null
  response_id: string | null
  status: "unused" | "in_progress" | "completed"
}
```
Status derivato:
- `unused` → `used_at` null e `response_id` null
- `in_progress` → `response_id` non null ma `completed_at` null in fai_responses
- `completed` → `completed_at` non null in fai_responses

### `POST /api/admin/tokens`
```
Body: { notes: string, email: string }
Response 201: { token: Token }
Side-effect: invia email via Resend
```
Generazione token: `ALVA-` + 6 caratteri alfanumerici maiuscoli (es. `ALVA-8F2K9X`). Rigenera se collision.

### `GET /api/admin/responses/[id]`
```
Response 200: { data: ResultsData }
```
Stessa shape di `ResultsData` già usata in `results/[id]/page.tsx`.

---

## 4. Email (Resend)

**SDK:** `resend` (npm package)
**Variabile env:** `RESEND_API_KEY`
**From:** `noreply@fai-microimpresa.it` (dominio da verificare in Resend)

Template testo:

```
Oggetto: Il tuo accesso alla diagnosi FAI Microimpresa

Ciao,
hai richiesto l'accesso alla diagnosi gratuita per la tua attività.

Clicca il link qui sotto per iniziare:
https://fai-microimpresa.it/start?token=<TOKEN>

Il link è personale e può essere usato una sola volta.

— Team FAI Microimpresa
```

Formato: testo semplice (no HTML template per ora — mantiene la semplicità).

---

## 5. Schema DB

Richiede una migrazione: aggiungere la colonna `email` ad `access_tokens` per salvare l'email del destinatario al momento della creazione del token. Senza questa colonna i token non ancora usati non avrebbero email visibile in tabella.

```sql
ALTER TABLE public.access_tokens
  ADD COLUMN IF NOT EXISTS email TEXT;
```

La colonna `email` in `fai_responses` (inserita dall'utente durante il questionario) è separata e indipendente — potrebbe differire dall'email del destinatario originale.

---

## 6. File coinvolti

| File | Modifica |
|------|----------|
| `src/middleware.ts` | Nuovo — protezione `/admin/*` |
| `src/app/admin/login/page.tsx` | Nuovo — form password |
| `src/app/admin/page.tsx` | Nuovo — lista token + modale |
| `src/app/admin/responses/[id]/page.tsx` | Nuovo — risultati admin |
| `src/app/api/admin/login/route.ts` | Nuovo |
| `src/app/api/admin/tokens/route.ts` | Nuovo (GET + POST) |
| `src/app/api/admin/responses/[id]/route.ts` | Nuovo |
| `database_schema.sql` | Aggiungere colonna `email` ad `access_tokens` |
| `.env.local` | Aggiungere `ADMIN_PASSWORD` e `RESEND_API_KEY` |

---

## 7. Variabili d'ambiente richieste

```
ADMIN_PASSWORD=<password-segreta>
RESEND_API_KEY=re_<chiave-resend>
NEXT_PUBLIC_BASE_URL=https://fai-microimpresa.it
```

`NEXT_PUBLIC_BASE_URL` serve per costruire il link nel testo dell'email.

---

## Principi

- **Nessuna libreria UI nuova** — solo Tailwind e il design system esistente
- **Cookie HttpOnly** — la password non è mai esposta al client JS
- **Resend SDK** — una sola chiamata, nessuna configurazione SMTP
- **Nessuna migrazione DB** — tutto si ricava dai dati esistenti

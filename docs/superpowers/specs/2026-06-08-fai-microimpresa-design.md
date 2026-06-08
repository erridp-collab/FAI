# FAI Microimpresa — Design Spec
**Data:** 2026-06-08  
**Stato:** Approvato

---

## 1. Panoramica

Web app Next.js per la diagnosi a pagamento di microimprese turistiche/commerciali. L'utente acquista l'accesso fuori dall'app (pagamento manuale), riceve un link unico via email, completa il questionario e vede immediatamente uno spider web dei risultati. Il report completo viene inviato entro 3 giorni lavorativi.

---

## 2. Flusso di navigazione

```
/                        Landing + Istruzioni (pubblica, no auth)
/start?token=xxx         Validazione token → redirect a /questionnaire
/questionnaire           Protetta (sessionStorage token)
  Step 0–6              Prima di iniziare – Blocco 1 (7 domande percezione, 1–5)
  Step 7                Prima di iniziare – Blocco 2 (scegli esattamente 3 obiettivi)
  Step 8–40             33 domande principali divise in 7 aree
  Step 41               Form finale: nome attività, settore, città, email
/results/[responseId]   Risultati (spider web + 7 definizioni + banner 3 giorni)
```

**Regole di accesso:**
- `/` sempre pubblica
- `/start?token=xxx` → API valida token → scrive `sessionToken` in sessionStorage → redirect a `/questionnaire`
- `/questionnaire` → controlla sessionStorage al mount → se assente redirect a `/`
- Al ritorno con token già usato parzialmente → riprende dall'ultimo step salvato
- `/results/[id]` → accessibile dopo salvataggio finale (responseId generato al completamento)

---

## 3. Sistema Access Token

### Tabella `access_tokens`

| campo | tipo | note |
|---|---|---|
| `id` | uuid PK | |
| `token` | text unique | formato `ALVA-XXXXXXXX` |
| `notes` | text | uso admin (nome cliente, data vendita) |
| `created_at` | timestamptz | |
| `used_at` | timestamptz | null finché non completato |
| `response_id` | uuid FK | riferimento a `fai_responses`, null finché non completato |

### Generazione token (fase 1 — no admin UI)
```sql
INSERT INTO access_tokens (token, notes)
VALUES ('ALVA-' || upper(substring(gen_random_uuid()::text, 1, 8)), 'Cliente: Mario Rossi - 08/06/2026');
```

### Validazione (`/api/validate-token`)
1. Cerca token in `access_tokens`
2. Non trovato → risposta `{ error: "invalid" }` → pagina errore "Link non valido"
3. Trovato con `response_id` non null → `{ error: "used" }` → "Diagnosi già completata"
4. Trovato e valido → `{ ok: true }` → client salva in sessionStorage, redirect a `/questionnaire`

**Nota:** token riutilizzabile finché `response_id` è null (l'utente può chiudere il browser e riaprire il link per riprendere).

---

## 4. Data Model Supabase

### Tabella `fai_responses`

| campo | tipo | note |
|---|---|---|
| `id` | uuid PK | |
| `token_id` | uuid FK | → `access_tokens.id` |
| `email` | text | |
| `nome_attivita` | text | |
| `settore` | text | free text |
| `citta` | text | |
| `answers_percezione` | jsonb | `{ "p1.1": 3, "p1.2": 4, ... }` — 7 domande Blocco 1 |
| `answers_obiettivi` | jsonb | `["2.1", "2.3", "2.5"]` — 3 obiettivi selezionati |
| `answers_main` | jsonb | `{ "1": 4, "2": 2, ... }` — 33 domande per question ID |
| `area_scores` | jsonb | `{ "voce": 3.67, "ricavi": 2.43, ... }` — 7 medie |
| `composite_indicators` | jsonb | indicatori compositi (per il report completo) |
| `created_at` | timestamptz | |
| `completed_at` | timestamptz | null finché non completato |

### Salvataggio intermedio
- Upsert su `fai_responses` (match su `token_id`) dopo ogni risposta
- `completed_at` rimane null fino al submit del form finale
- Al ritorno via token: query `SELECT * FROM fai_responses WHERE token_id = $1 AND completed_at IS NULL` → se trovata, riprendere dallo step corrispondente all'ultima risposta salvata

---

## 5. Struttura Questionario

### Prima di iniziare — Blocco 1 (7 domande, scala 1–5)

| ID | Testo sintetico |
|---|---|
| p1.1 | Storia chiara che ti rende unico? |
| p1.2 | Tranquillo riguardo ai ricavi? |
| p1.3 | Conosci i numeri? Sei in regola? |
| p1.4 | Pronto se qualcosa cambiasse? |
| p1.5 | L'attività andrebbe avanti senza di te? |
| p1.6 | Parte di una rete? |
| p1.7 | Stai imparando e migliorando? |

Stessa UX delle domande principali (una domanda per schermata, pulsanti 1–5, auto-avanzamento dopo selezione).

### Prima di iniziare — Blocco 2 (selezione 3 obiettivi)

UI diversa: N pulsanti toggle, il "Continua" si abilita solo quando sono selezionati esattamente 3.

Lista completa da estrarre dal foglio "Prima di iniziare" dell'Excel (colonna Obiettivo, righe 2.1–2.N). Confermate dall'Excel:

| ID | Obiettivo |
|---|---|
| 2.1 | Riuscire a raccontare meglio cosa mi rende diverso e smettere di competere solo sul prezzo |
| 2.2 | Diversificare i ricavi. Non dipendere solo da un canale di vendita o stagione |
| 2.3 | Capire i miei numeri davvero (margini, costi, sostenibilità) |
| 2.4+ | **Da verificare** — rileggere l'Excel completo per le righe successive |

**Azione implementazione:** prima di codificare il Blocco 2, estrarre la lista completa degli obiettivi dall'Excel con lo script Python.

### 33 domande principali

| Area | Label | Domande | Question IDs |
|---|---|---|---|
| 1 | La tua voce | 3 | 1–3 |
| 2 | I tuoi ricavi | 7 | 4–10 |
| 3 | I tuoi margini | 6 | 11–16 |
| 4 | La tua adattabilità | 4 | 17–20 |
| 5 | Il tuo sistema | 5 | 21–25 |
| 6 | La tua rete | 4 | 26–29 |
| 7 | Il tuo apprendimento | 4 | 30–33 |

Ogni domanda ha: testo, etichetta area, label per score 1 / 3 / 5.

### Form finale (Step 41)
Campi obbligatori: **Nome attività · Settore · Città · Email**  
CTA: "Calcola i tuoi risultati →"  
Al submit: calcola scores, upsert finale, imposta `completed_at`, aggiorna `access_tokens.used_at` e `response_id`, redirect a `/results/[id]`.

### Navigazione e progress
- **Numerazione quadratini** (stile C): tutti gli step come quadratini numerati in cima alla pagina
- Quadratini cliccabili solo se già risposti (navigazione backward libera)
- Step corrente evidenziato in `bg-accent #4A3F8C`
- Step completato in `text-accent-surface #9A8FE0`
- Step futuro in `bg-raised #3A3550`

---

## 6. Scoring

### 7 punteggi area (mostrati nello spider web)
Media aritmetica delle risposte per area, arrotondata a 2 decimali.

### Indicatori compositi (salvati, non mostrati — per il report completo)

| Indicatore | Formula |
|---|---|
| Identità | (Q1.1 + Q1.2 + Q1.3 + Q6.2×0.5) / 3.5 |
| Tenuta attività | (score\_ricavi + score\_margini) / 2 |
| Liquidità | Q2.3 |
| Resilienza operativa | (Q5.1 + Q5.4×0.5 + Q5.5 + Q6.1 + Q6.2 + Q6.3×0.5 + Q6.4) / 6 |
| Digital Readiness | (Q5.2 + Q5.3 + Q7.1×0.5 + Q2.5×0.5 + Q2.7×0.5) / 3.5 |
| Compliance e protezione | (Q3.2 + Q3.5 + Q3.6 + Q5.3) / 4 |
| Capacità di evoluzione | (score\_adattabilità + score\_apprendimento) / 2 |

Livelli per tutti gli score: `< 2` = Critico · `< 3.5` = Attenzione · `< 4.5` = Solido · `≥ 4.5` = Eccellente

---

## 7. Pagina Risultati (`/results/[id]`)

### Layout (sfondo `#16141F`)
1. **Header:** badge "DIAGNOSI COMPLETATA" + titolo con nome attività
2. **Spider web:** Recharts `RadarChart`, palette dark, fill `rgba(154,143,224,0.15)`, stroke `#9A8FE0`, dot area con punteggio più basso evidenziato in gold `#F3CF69`
3. **7 tile area:** griglia 2 colonne su mobile/desktop, sfondo `#2D2A3E`, label area in `#9A8FE0`, definizione statica in `#9490B8`. Tile dell'area col punteggio più basso ha bordo `#F3CF6940`
4. **Banner 3 giorni:** gradient `#4A3F8C → #3A3550`, testo `#EDE8FF`, "3 giorni lavorativi" in gold

### Definizioni statiche delle 7 aree

| Area | Definizione |
|---|---|
| La tua voce | Quanto sei riconoscibile e differente dai tuoi competitor. |
| I tuoi ricavi | Diversificazione delle entrate e stabilità finanziaria. |
| I tuoi margini | Conoscenza dei costi, margini e conformità normativa. |
| La tua adattabilità | Capacità di rispondere a imprevisti e nuovi mercati. |
| Il tuo sistema | Quanto l'attività funziona in modo indipendente da te. |
| La tua rete | Connessioni con il territorio e altri operatori locali. |
| Il tuo apprendimento | Capacità di evolvere, sperimentare e imparare dall'esterno. |

---

## 8. Palette di riferimento

| Token | Hex | Uso |
|---|---|---|
| bg-canvas | `#16141F` | Sfondo globale |
| bg-surface | `#2D2A3E` | Card, tile aree, input |
| bg-raised | `#3A3550` | Hover, step futuri, nested |
| text-primary | `#EDE8FF` | Titoli e corpo testo |
| text-secondary | `#9490B8` | Didascalie, metadata |
| text-tertiary | `#6B6890` | Decorativo, 18px+ |
| text-accent | `#7C6FCD` | Link/CTA su bg-canvas |
| text-accent-surface | `#9A8FE0` | Link/interattivo su bg-surface |
| bg-accent | `#4A3F8C` | Bottone primario filled |
| text-gold | `#F3CF69` | Max 1 per schermata, area critica |

---

## 9. Stack tecnico

- **Framework:** Next.js (App Router) + TypeScript
- **UI:** Tailwind CSS v4
- **Animazioni:** Framer Motion (già installato)
- **Grafici:** Recharts (`RadarChart`)
- **Database:** Supabase (tabelle `access_tokens` + `fai_responses`)
- **Pagamenti:** Fuori scope (gestiti manualmente, Stripe in fase successiva)
- **Icone:** Lucide React (già installato)

---

## 10. Migrazione codice esistente

- `questions.ts`: aggiungere campo `area` con nome reale per ogni domanda (attualmente tutto `"#"`) e rimuovere `activity_types` (distinzione commercio/ricettività eliminata)
- `scoring.ts`: aggiornare con le 7 aree reali e aggiungere calcolo indicatori compositi
- `questionnaire/page.tsx`: refactor completo — nuova struttura step 0–41, salvataggio intermedio, navigazione quadratini
- `supabase/client.ts`: nessuna modifica, riutilizzato
- Creare tabella `access_tokens` in Supabase (migration SQL)
- Aggiungere campi mancanti a `fai_responses` (migration SQL)

---

## 11. Fuori scope (fase 1)

- Integrazione Stripe
- Admin UI per generazione token
- Invio automatico report via email
- Differenziazione domande per tipo attività (commercio vs ricettività)
- Pagina risultati con testi level-based dall'Excel

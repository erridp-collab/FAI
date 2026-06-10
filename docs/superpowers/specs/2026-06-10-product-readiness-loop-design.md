# FAI Microimpresa — Product-Readiness Loop (Design Spec)

**Data:** 2026-06-10
**Stato:** In revisione
**Obiettivo:** Portare la web app da prototipo funzionante a prodotto vendibile, tramite un loop ripetibile e orchestrato che modelli economici possono eseguire task per task, con verifica oggettiva (test) e revisione umana ai checkpoint.

---

## 0. Ruoli

- **Orchestratore (Opus, io):** mantiene gli artefatti, sceglie i task, dispatcha i subagenti, revisiona i diff e l'output dei test, fa da gate prima di passare al task successivo. NON scrive il codice di implementazione (salvo Fase 0 e revisioni puntuali).
- **Subagente esecutore (modello economico):** riceve un singolo task atomico via `TASK_CONTRACT`, scrive prima il test che fallisce, implementa, esegue la verifica, riporta. Non improvvisa fuori dal task.
- **Subagente auditor (modello economico, sola lettura):** apre ogni fase. Ispeziona, NON modifica codice, appende nuovi finding al `BACKLOG`. È il meccanismo che cattura "cose mai pensate".
- **Umano (tu):** approva i checkpoint di fine fase e ogni modifica che tocca i vincoli protetti (vedi §6).

---

## 1. I quattro artefatti permanenti

Tutti sotto `fai-web/docs/product-readiness/`.

### 1.1 `REFERENCE.md` — fonte di verità estratta dall'Excel
Estrazione leggibile e versionata di `FAI_Microimpresa_v6(1).xlsx` (fonte canonica). Contiene, per ciascun foglio rilevante:
- **`Prima di iniziare`** — 7 domande percezione + lista completa obiettivi
- **`La tua realtà`** — 33 domande, aree, label 1/3/5
- **`2_Le7Aree`** — definizione e composizione delle 7 aree
- **`3_Subindici`** — formule canoniche dei 7 indicatori compositi (pesi esatti)
- **`4_PercAnalisi`** — logica di analisi della percezione vs realtà
- **`5_RischioInerzia`** — logica del rischio inerzia
- **`6_Azioni`** — azioni/raccomandazioni per livello
- **`Report_Logic` / `Risultati`** — mappatura punteggio → livello → testo report

Ogni formula è trascritta in forma esplicita e non ambigua (operandi, pesi, divisore, soglie). I subagenti validano **contro questo file**, mai contro l'Excel grezzo (illeggibile per un modello economico).

> **Nota di scope:** la logica del report completo (`5_RischioInerzia`, `6_Azioni`, `Report_Logic`) viene **estratta e documentata ora** in `REFERENCE.md`, ma la sua **implementazione nel prodotto è una fase separata futura** (vedi §8). Il loop attuale la usa solo come riferimento, non la costruisce.

### 1.2 `BACKLOG.md` — coda di task atomici
Tabella/elenco vivente. Ogni task ha:

| Campo | Valore |
|---|---|
| `ID` | es. `FORMULA-03` |
| `Categoria` | `FORMULA` / `SECURITY` / `FUNC` / `UX` / `A11Y` / `PERF` / `TEST` |
| `Severità` | `critica` / `alta` / `media` / `bassa` |
| `Fase` | 0–6 |
| `File` | percorsi coinvolti |
| `Descrizione` | cosa e perché |
| `Criteri di accettazione` | condizioni oggettive di "done" |
| `Dipende da` | altri ID |
| `Stato` | `todo` / `in-progress` / `review` / `done` |

Il BACKLOG è popolato dai subagenti-auditor e dall'analisi iniziale dell'orchestratore. È l'unico punto di verità sullo stato del lavoro.

### 1.3 `TASK_CONTRACT.md` — template fisso per i subagenti
Definisce esattamente cosa riceve ed esegue un esecutore. Sequenza obbligatoria:
1. **Invoca le skill superpowers pertinenti** (vedi §1.4) prima di agire — è obbligatorio, non opzionale.
2. Leggi il task dal BACKLOG e i file coinvolti.
3. Leggi i vincoli protetti (§6) — se il task li tocca, FERMATI e segnala.
4. **Scrivi prima il test** che riproduce il problema / specifica il comportamento atteso → deve fallire (skill `test-driven-development`).
5. Implementa il cambiamento minimo per far passare il test.
6. Se un test fallisce in modo inatteso o emerge un bug, applica `systematic-debugging` (no fix alla cieca).
7. Esegui: `npm run test` (unit), `npm run test:e2e` se il task tocca un flusso, `npm run lint`, `npm run build`.
8. Prima di dichiarare "done" applica `verification-before-completion`: incolla l'output reale dei comandi, niente affermazioni senza prova.
9. Riporta nel formato fisso: file toccati, diff sintetica, test aggiunti, output verde incollato, eventuali finding collaterali da aggiungere al BACKLOG.

### 1.4 Uso obbligatorio delle skill superpowers
Il loro impiego non è a discrezione del modello economico: il `TASK_CONTRACT` e i prompt di dispatch impongono di invocarle quando la situazione lo richiede. Mappatura:

| Skill | Chi / Quando |
|---|---|
| `using-superpowers` | Ogni subagente, all'avvio: verifica quali skill si applicano |
| `test-driven-development` | Esecutore, sempre: test che fallisce prima dell'implementazione |
| `systematic-debugging` | Esecutore, ad ogni bug / test rosso inatteso |
| `verification-before-completion` | Esecutore, prima di marcare un task `done` |
| `requesting-code-review` | Orchestratore, a fine fase o su task ad alto rischio (FORMULA/SECURITY) |
| `receiving-code-review` | Esecutore/orchestratore, quando si applica il feedback di review |
| `frontend-design` | Esecutore, nelle Fasi 4–5 (UX/A11Y) — **entro i vincoli §6**: palette fissa, spider web intoccabile |
| `subagent-driven-development` / `dispatching-parallel-agents` | Orchestratore, per dispatchare ed eventualmente parallelizzare task indipendenti |
| `executing-plans` | Orchestratore, per eseguire il piano di implementazione prodotto da `writing-plans` |

Regola: se un subagente pensa che una skill possa applicarsi anche solo all'1%, la invoca. L'orchestratore verifica nel report che le skill dovute siano state usate; in caso contrario, rimanda il task.

### 1.5 Test harness
- **Vitest** per unit (formule, scoring, utility, validazione input).
- **Playwright** per e2e (flusso questionario, resume, validazione token, pagina risultati).
- Script in `package.json`: `test`, `test:watch`, `test:e2e`.
- Regola ferrea: **nessun task è `done` senza test verdi pertinenti**.

---

## 2. Le fasi ordinate

| Fase | Nome | Contenuto | Gate di uscita |
|---|---|---|---|
| **0** | Fondamenta | Setup Vitest + Playwright; estrazione `REFERENCE.md` dall'Excel | Harness gira; REFERENCE completo e revisionato da te |
| **1** | Formule & scoring | Validare ogni area e indicatore composito vs REFERENCE; correggere bug noti; gestione risposte mancanti; soglie livelli | 100% formule coperte da unit test verdi e allineate al REFERENCE |
| **2** | Sicurezza & dati | Chiudere RLS aperta; scritture/letture sensibili lato server; hardening validazione token; protezione `/results/[id]` | Nessun accesso non autorizzato a risposte altrui; test di sicurezza verdi |
| **3** | Robustezza funzionale | Resume corretto, gestione errori, edge case (token usato/parziale, doppio submit, rete) | e2e dei flussi critici verdi |
| **4** | UX | Auto-avanzamento rivedibile, label mobile, navigazione, microcopy, stati di caricamento/errore | Checklist UX soddisfatta; e2e verdi |
| **5** | Accessibilità (WCAG) | Tastiera, focus, ARIA, contrasto entro palette, alternativa testuale al grafico | Audit a11y automatizzato (axe) senza violazioni serie |
| **6** | Rifinitura prodotto | Landing, SEO/meta, performance, e2e di regressione completo | Build pulita; lighthouse/perf accettabile; suite e2e completa verde |

L'ordine è sequenziale ma i task **dentro** una fase possono essere paralleli se indipendenti.

---

## 3. Il ciclo ripetibile

```
                ┌─────────────────────────────────────────────┐
                │  Inizio fase N → dispatch SUBAGENTE-AUDITOR  │
                │  (sola lettura) → appende finding al BACKLOG │
                └───────────────────────┬─────────────────────┘
                                        │
                                        ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  LOOP sui task `todo` della fase N:                           │
   │   1. Orchestratore sceglie prossimo task (rispetta dipendenze)│
   │   2. Dispatch SUBAGENTE-ESECUTORE con TASK_CONTRACT           │
   │   3. Esecutore: test-che-fallisce → implementa → verifica     │
   │   4. Esecutore riporta diff + output test                     │
   │   5. Orchestratore revisiona:                                 │
   │        accetta → stato `done`                                 │
   │        problema → rimanda con feedback puntuale (torna a 2)   │
   └──────────────────────────────┬───────────────────────────────┘
                                   │  tutti i task della fase `done`
                                   ▼
                ┌─────────────────────────────────────────────┐
                │  CHECKPOINT UMANO: report di fase a te,      │
                │  approvazione → avanza a fase N+1            │
                └─────────────────────────────────────────────┘
```

---

## 4. Backlog iniziale (seed dall'analisi orchestratore)

Finding già identificati, da formalizzare nel BACKLOG all'avvio. Gli auditor ne aggiungeranno altri.

**FORMULA**
- `getQ()` in `scoring.ts` ritorna `0` per risposte mancanti → falsa gli indicatori compositi su questionari parziali. Definire comportamento corretto (escludere o impedire calcolo parziale).
- Validare i 7 indicatori compositi contro `3_Subindici` dell'Excel (pesi e divisori esatti).
- Le aree referenziate per nome stringa (`getAreaScore("I tuoi ricavi")`) sono fragili: un refuso rompe il calcolo silenziosamente → introdurre costanti/enum tipizzati.
- Soglie livelli (`<2 / <3.5 / <4.5 / ≥4.5`) da validare contro `Report_Logic`/`Risultati`.

**SECURITY**
- RLS Supabase aperta (`USING (true)` su `fai_responses`) → chiunque legge/scrive tutte le risposte. Critica.
- `/results/[id]` legge direttamente da Supabase lato client con anon key → spostare dietro API/server o restringere.
- Validazione e generazione token: verificare resistenza a enumerazione/riuso.

**FUNC**
- Logica di resume basata sul conteggio chiavi: fragile se le risposte non sono contigue.
- Doppio submit del form finale / doppio `response_id`.
- Gestione errori di rete nel salvataggio incrementale.

**UX**
- Auto-avanzamento a 300ms senza possibilità di rivedere/annullare la risposta.
- Su mobile le label dei punteggi sono troncate a 30 caratteri con `...`; punteggi 2 e 4 senza alcuna label.
- Navigazione indietro solo via quadratini completati; nessun pulsante "indietro" esplicito.

**A11Y**
- Quadratini di progresso: `div` con `onClick`, non raggiungibili da tastiera, senza `role`/`aria`.
- Bottoni punteggio senza `aria-label` descrittiva; tooltip nascosti su mobile.
- Contrasto di `text-tertiary #6B6890` su sfondi scuri da verificare (WCAG AA).
- Radar chart senza alternativa testuale per screen reader.

**PERF / PROD**
- Meta/SEO, title, favicon, Open Graph mancanti o di default.
- Verificare bundle e caricamento Recharts.

---

## 5. Formato del report di fase (checkpoint)

A fine fase l'orchestratore presenta a te:
- Task completati (ID + una riga ciascuno).
- Diff aggregata sintetica e file toccati.
- Output dei test (verdi) e copertura della parte critica.
- Nuovi finding emersi e dove sono finiti nel BACKLOG.
- Eventuali decisioni che richiedono te (specie vincoli protetti §6).

---

## 6. Vincoli protetti (non-negoziabili per i subagenti)

1. **Palette e design invariati.** I token colore dello spec di prodotto restano esatti: `#16141F`, `#2D2A3E`, `#3A3550`, `#EDE8FF`, `#9490B8`, `#6B6890`, `#7C6FCD`, `#9A8FE0`, `#4A3F8C`, `#F3CF69`. Miglioramenti UX/A11Y (es. contrasto) sono ammessi **solo entro questa palette**; nessuna reinvenzione estetica.
2. **Spider web protetto.** Il grafico radar resta. Qualsiasi modifica al grafico — anche solo per accessibilità — va **proposta all'umano e approvata prima**. Un subagente che incontra un task del genere si ferma e segnala.
3. **Excel = fonte di verità.** In caso di conflitto tra codice e `REFERENCE.md`, vince il REFERENCE (derivato dall'Excel). Discrepanze si risolvono allineando il codice, non il riferimento.
4. **Test prima.** Nessuna implementazione senza un test che prima fallisce.

---

## 7. Stack di verifica

- `npm run test` — Vitest unit (formule, utility, validazione).
- `npm run test:e2e` — Playwright (flussi end-to-end, usa `?dev=1` per evitare il DB dove possibile).
- `npm run lint` — ESLint.
- `npm run build` — build Next.js pulita.
- Audit a11y automatizzato (axe via Playwright) in Fase 5.

---

## 8. Fuori scope di questo loop (fasi future separate)

- **Implementazione** del report completo (rischio inerzia + azioni personalizzate + testi level-based) nel prodotto. La logica viene estratta in `REFERENCE.md` ora, ma costruita dopo, come progetto a sé (proprio spec → plan → implementazione).
- Integrazione Stripe / pagamenti automatici.
- Admin UI per generazione token.
- Invio automatico del report via email.
- Differenziazione domande per tipo attività (commercio vs ricettività).

---

## 9. Criteri di "prodotto vendibile" (definizione di fatto)

Il loop si considera concluso quando:
- Tutte le formule sono validate contro l'Excel e coperte da unit test verdi.
- Nessuna risposta cliente è accessibile o modificabile da terzi non autorizzati.
- Il flusso completo è coperto da e2e verdi, inclusi gli edge case principali.
- L'app supera un audit a11y automatizzato senza violazioni serie, mantenendo palette e spider web.
- `npm run build` è pulito e le meta/SEO di base sono presenti.

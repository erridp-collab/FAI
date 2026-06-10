# Phase 0 — Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilire le fondamenta del product-readiness loop: un test harness funzionante (Vitest unit + Playwright e2e), l'estrazione canonica dell'Excel in `REFERENCE.md`, e gli artefatti permanenti del loop (`BACKLOG.md`, `TASK_CONTRACT.md`).

**Architecture:** Vitest gira sui moduli TS puri (formule/scoring) con alias `@` → `src`. Playwright guida il flusso reale usando `?dev=1` (nessun DB). L'Excel viene estratto da uno script Python (openpyxl, `data_only=False` per catturare le formule) in un dump grezzo, poi curato a mano in `REFERENCE.md`. Gli artefatti del loop sono file markdown versionati.

**Tech Stack:** Next.js 16 · React 19 · TypeScript · Vitest · Playwright · Python 3 + openpyxl (venv esistente in root).

**Working dir:** tutti i comandi `npm`/`npx` da `c:\Users\Enrico\Desktop\FAI\fai-web`. Lo script Python e l'Excel sono nella root `c:\Users\Enrico\Desktop\FAI`.

---

## File Structure

| File | Responsabilità |
|---|---|
| `fai-web/vitest.config.ts` | Config Vitest + alias `@` → `./src` |
| `fai-web/src/utils/scoring.test.ts` | Primo unit test (smoke, soglie livelli) |
| `fai-web/playwright.config.ts` | Config Playwright + webServer su `npm run dev` |
| `fai-web/e2e/smoke.spec.ts` | Primo e2e (flusso `?dev=1` carica la prima domanda) |
| `fai-web/package.json` | Script `test`, `test:watch`, `test:e2e` |
| `scripts/extract_reference.py` | Dump leggibile di ogni foglio Excel (valori + formule) |
| `fai-web/docs/product-readiness/REFERENCE_RAW.md` | Dump grezzo generato dallo script (input per la curatela) |
| `fai-web/docs/product-readiness/REFERENCE.md` | Fonte di verità curata (gate di revisione umana) |
| `fai-web/docs/product-readiness/BACKLOG.md` | Coda di task atomici (seed dai finding noti) |
| `fai-web/docs/product-readiness/TASK_CONTRACT.md` | Template fisso per i subagenti esecutori |

---

## Task 1: Installare e configurare Vitest

**Files:**
- Modify: `fai-web/package.json` (devDependencies + scripts)
- Create: `fai-web/vitest.config.ts`

- [ ] **Step 1: Installare Vitest**

Run (da `fai-web`): `npm install -D vitest`
Expected: `vitest` compare in `devDependencies`, exit 0.

- [ ] **Step 2: Creare la config con alias `@`**

Create `fai-web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: true,
  },
});
```

- [ ] **Step 3: Aggiungere gli script a `package.json`**

In `fai-web/package.json`, dentro `"scripts"`, aggiungere:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Commit**

```bash
git add fai-web/package.json fai-web/package-lock.json fai-web/vitest.config.ts
git commit -m "test: setup Vitest con alias @ -> src"
```

---

## Task 2: Primo unit test (smoke su getLevelFromScore)

Questo test verifica solo le soglie dei livelli dichiarate nello spec (`<2` Critico · `<3.5` Attenzione · `<4.5` Solido · `≥4.5` Eccellente). Sono confini non ambigui: un test sicuro che prova che l'harness gira, senza anticipare le validazioni di formula della Fase 1.

**Files:**
- Test: `fai-web/src/utils/scoring.test.ts`

- [ ] **Step 1: Scrivere il test che fallisce**

Create `fai-web/src/utils/scoring.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getLevelFromScore } from "@/utils/scoring";

describe("getLevelFromScore", () => {
  it("ritorna Critico sotto 2", () => {
    expect(getLevelFromScore(1)).toBe("Critico");
    expect(getLevelFromScore(1.99)).toBe("Critico");
  });

  it("ritorna Attenzione da 2 a sotto 3.5", () => {
    expect(getLevelFromScore(2)).toBe("Attenzione");
    expect(getLevelFromScore(3.49)).toBe("Attenzione");
  });

  it("ritorna Solido da 3.5 a sotto 4.5", () => {
    expect(getLevelFromScore(3.5)).toBe("Solido");
    expect(getLevelFromScore(4.49)).toBe("Solido");
  });

  it("ritorna Eccellente da 4.5 in su", () => {
    expect(getLevelFromScore(4.5)).toBe("Eccellente");
    expect(getLevelFromScore(5)).toBe("Eccellente");
  });
});
```

- [ ] **Step 2: Eseguire il test e verificare che PASSI**

Run (da `fai-web`): `npm run test`
Expected: 4 test verdi. (La funzione esiste già in `scoring.ts`; questo test ne blocca il comportamento e prova che l'harness + alias funzionano.)

- [ ] **Step 3: Commit**

```bash
git add fai-web/src/utils/scoring.test.ts
git commit -m "test: smoke test sulle soglie dei livelli (getLevelFromScore)"
```

---

## Task 3: Installare e configurare Playwright

**Files:**
- Modify: `fai-web/package.json` (devDependencies + script `test:e2e`)
- Create: `fai-web/playwright.config.ts`

- [ ] **Step 1: Installare Playwright e i browser**

Run (da `fai-web`): `npm install -D @playwright/test`
Poi: `npx playwright install chromium`
Expected: `@playwright/test` in `devDependencies`; Chromium scaricato.

- [ ] **Step 2: Creare la config**

Create `fai-web/playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
```

- [ ] **Step 3: Aggiungere lo script `test:e2e`**

In `fai-web/package.json`, dentro `"scripts"`, aggiungere:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 4: Ignorare gli artefatti Playwright**

In `fai-web/.gitignore`, aggiungere in fondo:

```
/test-results/
/playwright-report/
/playwright/.cache/
```

- [ ] **Step 5: Commit**

```bash
git add fai-web/package.json fai-web/package-lock.json fai-web/playwright.config.ts fai-web/.gitignore
git commit -m "test: setup Playwright con webServer su next dev"
```

---

## Task 4: Primo e2e (smoke sul flusso dev)

`?dev=1` bypassa il token (vedi `questionnaire/page.tsx:29`) e non tocca il DB. La prima domanda percezione è `perceptionQuestions[0]` con testo che inizia con "Senti di avere una storia chiara?".

**Files:**
- Test: `fai-web/e2e/smoke.spec.ts`

- [ ] **Step 1: Scrivere il test che fallisce**

Create `fai-web/e2e/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("il questionario in dev mode carica la prima domanda", async ({ page }) => {
  await page.goto("/questionnaire?dev=1");
  // Banner modalità sviluppo presente
  await expect(page.getByText("Modalità sviluppo attiva")).toBeVisible();
  // Prima domanda percezione
  await expect(
    page.getByRole("heading", { name: /storia chiara/i })
  ).toBeVisible();
  // I cinque pulsanti punteggio sono presenti
  for (const n of ["1", "2", "3", "4", "5"]) {
    await expect(page.getByRole("button", { name: n, exact: true })).toBeVisible();
  }
});
```

- [ ] **Step 2: Eseguire e verificare che PASSI**

Run (da `fai-web`): `npm run test:e2e`
Expected: 1 test verde. Playwright avvia `next dev`, naviga, trova banner + heading + bottoni.
Se il bottone matcha più nodi (testo + label), restringere con `.first()` — ma `exact: true` sul solo numero dovrebbe bastare.

- [ ] **Step 3: Commit**

```bash
git add fai-web/e2e/smoke.spec.ts
git commit -m "test: smoke e2e del flusso questionario in dev mode"
```

---

## Task 5: Script di estrazione dell'Excel

Dump leggibile di ogni foglio: per ogni cella non vuota stampa coordinata, valore e — se presente — la formula. `data_only=False` espone le formule (es. nei fogli `3_Subindici`, `Report_Logic`). L'output è un unico markdown grezzo che alimenta la curatela del REFERENCE.

**Files:**
- Create: `scripts/extract_reference.py`

- [ ] **Step 1: Scrivere lo script**

Create `scripts/extract_reference.py`:

```python
"""Estrae ogni foglio di FAI_Microimpresa_v6(1).xlsx in un markdown leggibile.
Cattura valori e formule (data_only=False) per documentare la fonte di verità.
Uso (dalla root del progetto):
    ./venv/Scripts/python.exe scripts/extract_reference.py
"""
import openpyxl

SRC = "FAI_Microimpresa_v6(1).xlsx"
OUT = "fai-web/docs/product-readiness/REFERENCE_RAW.md"

def cell_repr(cell):
    val = cell.value
    if val is None:
        return None
    # Le formule in openpyxl (data_only=False) sono stringhe che iniziano con "="
    if isinstance(val, str) and val.startswith("="):
        return f"FORMULA `{val}`"
    return str(val).strip()

def main():
    wb = openpyxl.load_workbook(SRC, data_only=False)
    lines = ["# REFERENCE_RAW — dump grezzo Excel", ""]
    lines.append(f"Generato da `scripts/extract_reference.py` su `{SRC}`.")
    lines.append("Non modificare a mano: rigenerabile. La curatela vive in REFERENCE.md.")
    lines.append("")
    for name in wb.sheetnames:
        ws = wb[name]
        lines.append(f"## Foglio: {name}")
        lines.append("")
        lines.append("| Cella | Contenuto |")
        lines.append("|---|---|")
        for row in ws.iter_rows():
            for cell in row:
                rep = cell_repr(cell)
                if rep is not None:
                    safe = rep.replace("|", "\\|").replace("\n", " ")
                    lines.append(f"| {cell.coordinate} | {safe} |")
        lines.append("")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Scritto {OUT} ({len(lines)} righe)")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Eseguire lo script**

Run (dalla root `c:\Users\Enrico\Desktop\FAI`): `./venv/Scripts/python.exe scripts/extract_reference.py`
Expected: stampa "Scritto fai-web/docs/product-readiness/REFERENCE_RAW.md (N righe)"; il file esiste e contiene i 12 fogli, con celle `FORMULA ...` dove l'Excel ha formule.
Se `openpyxl` manca: `./venv/Scripts/pip.exe install openpyxl` e rieseguire.

- [ ] **Step 3: Commit**

```bash
git add scripts/extract_reference.py fai-web/docs/product-readiness/REFERENCE_RAW.md
git commit -m "tooling: script di estrazione Excel -> REFERENCE_RAW.md"
```

---

## Task 6: Curare REFERENCE.md (gate di revisione umana)

Trasformare il dump grezzo nella fonte di verità leggibile e non ambigua. **Questo task termina con una richiesta di revisione umana** (è il gate di uscita della Fase 0 per la parte riferimento).

**Files:**
- Create: `fai-web/docs/product-readiness/REFERENCE.md`

- [ ] **Step 1: Leggere il dump grezzo**

Leggere `fai-web/docs/product-readiness/REFERENCE_RAW.md` per intero, foglio per foglio.

- [ ] **Step 2: Scrivere REFERENCE.md curato**

Create `fai-web/docs/product-readiness/REFERENCE.md` con queste sezioni, trascritte dal dump (NON inventare valori; se una cella è ambigua, marcarla `⚠️ DA CHIARIRE` invece di indovinare):

1. `## 7 Domande Percezione` — id, testo, label 1/3/5
2. `## Obiettivi` — lista completa con id
3. `## 33 Domande` — id, area, numero, testo, label 1/3/5
4. `## 7 Aree` — nome + composizione (quali domande) da `2_Le7Aree`
5. `## Indicatori Compositi` — per ciascuno: **formula esatta** (operandi, pesi, divisore) da `3_Subindici`, trascritta dalle celle `FORMULA ...`
6. `## Soglie Livelli` — da `Report_Logic`/`Risultati`
7. `## Report: Rischio Inerzia` — logica da `5_RischioInerzia` (solo documentazione, implementazione futura)
8. `## Report: Azioni` — da `6_Azioni` (solo documentazione)
9. `## Analisi Percezione` — da `4_PercAnalisi` (solo documentazione)

Per ogni indicatore composito aggiungere una riga **"Confronto col codice"**: corrisponde a `scoring.ts`? Sì / No / Discrepanza: <dettaglio>. Queste discrepanze diventano task FORMULA nel BACKLOG (Fase 1).

- [ ] **Step 3: Verifica anti-allucinazione**

Per ogni formula composita in REFERENCE.md, ritrovare la cella `FORMULA` corrispondente in REFERENCE_RAW.md e confermare che operandi/pesi coincidano. Nessuna formula senza fonte tracciabile nel dump.

- [ ] **Step 4: Commit**

```bash
git add fai-web/docs/product-readiness/REFERENCE.md
git commit -m "docs: REFERENCE.md curato dalla fonte Excel (fonte di verita')"
```

- [ ] **Step 5: GATE — richiedere revisione umana**

Presentare all'umano: l'elenco degli indicatori compositi con formula REFERENCE vs codice e le discrepanze trovate. Attendere conferma che il REFERENCE rispecchia l'Excel prima di chiudere la Fase 0. NON procedere alla Fase 1 senza questo OK.

---

## Task 7: Creare BACKLOG.md e TASK_CONTRACT.md

**Files:**
- Create: `fai-web/docs/product-readiness/BACKLOG.md`
- Create: `fai-web/docs/product-readiness/TASK_CONTRACT.md`

- [ ] **Step 1: Creare BACKLOG.md seedato**

Create `fai-web/docs/product-readiness/BACKLOG.md`:

```markdown
# Product-Readiness BACKLOG

Coda di task atomici del loop. Stati: `todo` · `in-progress` · `review` · `done`.
Categorie: FORMULA · SECURITY · FUNC · UX · A11Y · PERF · TEST.

| ID | Cat | Sev | Fase | File | Descrizione | Criteri di accettazione | Dipende da | Stato |
|---|---|---|---|---|---|---|---|---|
| FORMULA-01 | FORMULA | alta | 1 | src/utils/scoring.ts | `getQ()` ritorna 0 per risposte mancanti, falsando i compositi su questionari parziali | Comportamento definito vs REFERENCE; test su input parziale verde | REFERENCE.md | todo |
| FORMULA-02 | FORMULA | critica | 1 | src/utils/scoring.ts | Validare i 7 indicatori compositi contro `3_Subindici` | Ogni formula == REFERENCE; unit test per indicatore verdi | REFERENCE.md | todo |
| FORMULA-03 | FORMULA | media | 1 | src/utils/scoring.ts | Aree referenziate per stringa (`getAreaScore("...")`): fragili a refusi | Costanti tipizzate per le 7 aree; nessuna stringa magica | REFERENCE.md | todo |
| FORMULA-04 | FORMULA | media | 1 | src/utils/scoring.ts | Validare soglie livelli vs `Report_Logic`/`Risultati` | Soglie == REFERENCE; test confini verdi | REFERENCE.md | todo |
| SECURITY-01 | SECURITY | critica | 2 | database_schema.sql | RLS aperta su `fai_responses` (`USING true`): lettura/scrittura di tutte le risposte | Accesso ristretto; impossibile leggere risposte altrui; test verde | — | todo |
| SECURITY-02 | SECURITY | alta | 2 | src/app/results/[id]/page.tsx | `/results/[id]` legge da Supabase lato client con anon key | Lettura dietro API/server o vincolata; test verde | SECURITY-01 | todo |
| SECURITY-03 | SECURITY | alta | 2 | src/app/api/validate-token/route.ts | Token: resistenza a enumerazione/riuso da verificare | Comportamento sicuro documentato e testato | — | todo |
| FUNC-01 | FUNC | media | 3 | src/app/questionnaire/page.tsx | Resume basato sul conteggio chiavi: fragile se non contigue | Resume corretto anche con risposte non contigue; e2e verde | — | todo |
| FUNC-02 | FUNC | media | 3 | src/app/questionnaire/page.tsx | Doppio submit del form finale / doppio response_id | Submit idempotente; test verde | — | todo |
| FUNC-03 | FUNC | media | 3 | src/app/questionnaire/page.tsx | Errori di rete nel salvataggio incrementale non gestiti chiaramente | Retry/feedback definito; test verde | — | todo |
| UX-01 | UX | media | 4 | src/app/questionnaire/page.tsx | Auto-avanzamento a 300ms senza poter rivedere | Possibilità di rivedere/tornare; e2e verde | — | todo |
| UX-02 | UX | media | 4 | src/app/questionnaire/page.tsx | Mobile: label troncate a 30 char; punteggi 2 e 4 senza label | Label leggibili su mobile; nessun troncamento brusco | — | todo |
| A11Y-01 | A11Y | alta | 5 | src/app/questionnaire/page.tsx | Quadratini progresso: div con onClick, non da tastiera, senza ARIA | Navigabili da tastiera con ruoli/aria corretti; axe pulito | — | todo |
| A11Y-02 | A11Y | media | 5 | src/app/questionnaire/page.tsx | Bottoni punteggio senza aria-label; tooltip nascosti su mobile | aria-label descrittive; alternativa accessibile alle label | — | todo |
| A11Y-03 | A11Y | media | 5 | src/app/globals.css | Contrasto `text-tertiary #6B6890` su sfondi scuri da verificare | Contrasto WCAG AA entro palette; axe pulito | — | todo |
| A11Y-04 | A11Y | media | 5 | src/app/results/[id]/page.tsx | Radar chart senza alternativa testuale ⚠️ tocca spider web | Alternativa testuale; modifica al grafico APPROVATA dall'umano | — | todo |
| PERF-01 | PERF | bassa | 6 | src/app/layout.tsx | Meta/SEO/title/OG mancanti o default | Metadata di base presenti; build pulita | — | todo |
```

- [ ] **Step 2: Creare TASK_CONTRACT.md**

Create `fai-web/docs/product-readiness/TASK_CONTRACT.md`:

```markdown
# TASK_CONTRACT — istruzioni per il subagente esecutore

Ricevi UN solo task dal BACKLOG. Eseguilo esattamente così, senza uscire dal suo scope.

## Sequenza obbligatoria
1. Invoca le skill superpowers pertinenti (vedi sotto). Obbligatorio.
2. Leggi il task nel BACKLOG e TUTTI i file elencati. Leggi REFERENCE.md se il task è FORMULA.
3. Leggi i VINCOLI PROTETTI. Se il task li tocca, FERMATI e segnala all'orchestratore.
4. Scrivi PRIMA il test che fallisce (riproduce il problema / specifica l'atteso). Eseguilo: deve fallire.
5. Implementa il cambiamento MINIMO per farlo passare.
6. Se emerge un bug o un rosso inatteso: applica `systematic-debugging` (niente fix alla cieca).
7. Esegui e incolla l'output REALE: `npm run test`; `npm run test:e2e` se tocchi un flusso; `npm run lint`; `npm run build`.
8. Applica `verification-before-completion`: nessuna affermazione "fatto" senza output verde incollato.
9. Riporta: file toccati · diff sintetica · test aggiunti · output verde · nuovi finding per il BACKLOG.

## Skill da invocare (obbligatorie quando si applicano)
- `using-superpowers` — all'avvio, sempre.
- `test-driven-development` — sempre: test prima.
- `systematic-debugging` — ad ogni bug/rosso inatteso.
- `verification-before-completion` — prima di "done".
- `receiving-code-review` — quando applichi feedback di review.
- `frontend-design` — task UX/A11Y (Fasi 4–5), SOLO entro i vincoli protetti.

## VINCOLI PROTETTI (non-negoziabili)
1. Palette e design invariati: usa SOLO i token colore esistenti
   (#16141F #2D2A3E #3A3550 #EDE8FF #9490B8 #6B6890 #7C6FCD #9A8FE0 #4A3F8C #F3CF69).
   Nessuna reinvenzione estetica.
2. Spider web protetto: qualunque modifica al grafico radar va proposta all'umano e
   approvata PRIMA. Se il tuo task lo tocca (es. A11Y-04), fermati e segnala.
3. Excel = fonte di verità: in conflitto codice vs REFERENCE.md, vince REFERENCE.
4. Test prima: nessuna implementazione senza un test che prima fallisce.

## Formato del report (incolla così)
- **Task:** <ID>
- **File toccati:** <elenco>
- **Test aggiunti:** <nomi>
- **Output verde:** <incolla l'output reale di test/lint/build>
- **Skill usate:** <elenco>
- **Nuovi finding:** <eventuali, da aggiungere al BACKLOG> oppure "nessuno"
- **Vincoli protetti toccati:** <quali, o "nessuno">
```

- [ ] **Step 3: Commit**

```bash
git add fai-web/docs/product-readiness/BACKLOG.md fai-web/docs/product-readiness/TASK_CONTRACT.md
git commit -m "docs: BACKLOG seedato + TASK_CONTRACT per i subagenti"
```

---

## Self-Review (eseguita in fase di scrittura)

- **Copertura spec:** test harness (§1.5 spec) → Task 1–4 ✓; REFERENCE.md (§1.1) → Task 5–6 ✓; BACKLOG (§1.2) → Task 7 ✓; TASK_CONTRACT + skill (§1.3/§1.4) → Task 7 ✓; vincoli protetti (§6) → dentro TASK_CONTRACT ✓; gate revisione umana (§2 Fase 0) → Task 6 Step 5 ✓.
- **Placeholder:** nessun TBD; i contenuti dei file sono completi. La curatela di REFERENCE.md (Task 6) è intrinsecamente di trascrizione: i "valori" reali arrivano dal dump del Task 5, non da invenzione — vincolo anti-allucinazione esplicito in Step 3.
- **Coerenza tipi/nomi:** alias `@`→`src` coerente tra vitest.config e i test; script `test`/`test:e2e` coerenti tra package.json e i comandi; percorsi REFERENCE_RAW/REFERENCE coerenti tra Task 5, 6 e lo script Python.

---

## Note di esecuzione

- **Ordine:** Task 1→2 (unit), 3→4 (e2e), 5→6 (riferimento), 7 (artefatti). Task 5–6 e 1–4 sono indipendenti e parallelizzabili; Task 6 dipende da Task 5.
- **Gate di fine fase:** dopo Task 6 Step 5 (revisione umana del REFERENCE) e con harness verde, la Fase 0 è chiusa → si passa a pianificare la Fase 1 (Formule).

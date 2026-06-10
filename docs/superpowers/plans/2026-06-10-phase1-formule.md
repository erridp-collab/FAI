# Phase 1 — Formule & Scoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. TDD obbligatorio. Steps con checkbox `- [ ]`.

**Goal:** Allineare `src/utils/scoring.ts` alla fonte di verità `REFERENCE.md` (Excel), correggendo le soglie dei livelli (inventate), il fallback silenzioso a 0 sulle risposte mancanti, e l'assenza del punteggio complessivo; poi bloccare tutte le formule con unit test su un vettore di input verificato a mano.

**Architecture:** Tutte le modifiche sono in `src/utils/scoring.ts` (+ relativi test). Le formule composite nel codice **coincidono già** con l'Excel (verificato cella per cella in REFERENCE §6) — NON vanno cambiate. Si interviene su: costanti tipizzate delle aree, sistema dei livelli, gestione input incompleto, punteggio complessivo, e copertura test. I valori attesi nei test derivano da REFERENCE §5–§7.

**Tech Stack:** TypeScript · Vitest (harness già attivo dalla Fase 0).

**Riferimenti chiave (REFERENCE.md):** §5 aree + F66; §6 compositi; §7 soglie livelli; §11 discrepanze D-01…D-07.

**Vincoli protetti:** palette invariata, spider web intoccabile (non rilevanti qui — nessuna UI toccata in Fase 1). Excel = fonte di verità.

---

## File Structure

| File | Responsabilità | Modifica |
|---|---|---|
| `src/utils/scoring.ts` | costanti aree, livelli, calcolo punteggi/compositi/complessivo | Modify |
| `src/utils/scoring.test.ts` | unit test (sostituisce lo smoke test della Fase 0) | Modify/Expand |

---

## Mapping id domanda → valore (per costruire i vettori di test)

Da `questions.ts` (id 1–33) e REFERENCE §1:
- id 1–3 → area "La tua voce" (Q1.1–1.3)
- id 4–10 → "I tuoi ricavi" (Q2.1–2.7)
- id 11–16 → "I tuoi margini" (Q3.1–3.6)
- id 17–20 → "La tua adattabilità" (Q4.1–4.4)
- id 21–25 → "Il tuo sistema" (Q5.1–5.5)
- id 26–29 → "La tua rete" (Q6.1–6.4)
- id 30–33 → "Il tuo apprendimento" (Q7.1–7.4)

---

## Task 1: Costanti tipizzate delle aree (FORMULA-05)

Elimina le stringhe magiche (`getAreaScore("I tuoi ricavi")`): un refuso oggi rompe il calcolo in silenzio.

**Files:** Modify `src/utils/scoring.ts`; Test `src/utils/scoring.test.ts`

- [ ] **Step 1: Scrivere il test che fallisce**

Aggiungere in `scoring.test.ts`:
```ts
import { AREA } from "@/utils/scoring";
import { mainQuestions } from "@/data/questions";

describe("AREA constants", () => {
  it("ogni area di mainQuestions corrisponde a una costante AREA", () => {
    const valid = new Set(Object.values(AREA));
    for (const q of mainQuestions) {
      expect(valid.has(q.area as any)).toBe(true);
    }
  });
  it("ci sono esattamente 7 aree", () => {
    expect(Object.keys(AREA)).toHaveLength(7);
  });
});
```

- [ ] **Step 2: Eseguire e verificare il FAIL**

Run: `npm run test`
Expected: FAIL — `AREA` non esiste ancora (import error).

- [ ] **Step 3: Implementare le costanti**

In `scoring.ts`, in cima (dopo l'import di `mainQuestions`), aggiungere:
```ts
export const AREA = {
  voce: "La tua voce",
  ricavi: "I tuoi ricavi",
  margini: "I tuoi margini",
  adattabilita: "La tua adattabilità",
  sistema: "Il tuo sistema",
  rete: "La tua rete",
  apprendimento: "Il tuo apprendimento",
} as const;

export type AreaName = (typeof AREA)[keyof typeof AREA];
```
Poi sostituire dentro `calculateResults` le stringhe magiche con le costanti:
- `getAreaScore("I tuoi ricavi")` → `getAreaScore(AREA.ricavi)`
- `getAreaScore("I tuoi margini")` → `getAreaScore(AREA.margini)`
- `getAreaScore("La tua adattabilità")` → `getAreaScore(AREA.adattabilita)`
- `getAreaScore("Il tuo apprendimento")` → `getAreaScore(AREA.apprendimento)`

**Importante:** i valori stringa delle costanti devono coincidere ESATTAMENTE con il campo `area` in `questions.ts` (incluse maiuscole/accenti). Non rinominare le aree.

- [ ] **Step 4: Eseguire e verificare il PASS**

Run: `npm run test`
Expected: i test AREA passano; nessun test preesistente rotto (lo smoke test della Fase 0 sarà aggiornato nel Task 2).

- [ ] **Step 5: Commit**
```bash
git add src/utils/scoring.ts src/utils/scoring.test.ts
git commit -m "refactor(scoring): costanti tipizzate AREA al posto delle stringhe magiche (FORMULA-05)"
```

---

## Task 2: Sistema dei livelli allineato all'Excel (FORMULA-01, D-03)

`getLevelFromScore` (`<2/<3.5/<4.5/≥4.5` con "Eccellente") non corrisponde all'Excel e non è usato da nessuna UI. Va sostituito da **due** funzioni: una per le 7 aree (5 livelli), una per i compositi (4 livelli). Soglie da REFERENCE §7.1 e §7.2.

**Files:** Modify `src/utils/scoring.ts`; Modify `src/utils/scoring.test.ts`

- [ ] **Step 1: Verificare che non ci siano altri consumatori**

Run: `git grep -n "getLevelFromScore\|Level\b" src` (oppure cercare con lo strumento di ricerca).
Confermare che `getLevelFromScore` e il tipo `Level` sono usati SOLO in `scoring.ts` e `scoring.test.ts`. Se compaiono altrove (es. results page), FERMARSI e riportare (sarebbe uno scope diverso). Il tipo `AreaScore` (che referenzia `Level`) risulta non utilizzato: rimuoverlo se nessun consumatore lo importa.

- [ ] **Step 2: Riscrivere il test che fallisce**

In `scoring.test.ts`, SOSTITUIRE il blocco `describe("getLevelFromScore", ...)` esistente con:
```ts
import { getAreaLevel, getCompositeLevel } from "@/utils/scoring";

describe("getAreaLevel (7 aree, 5 livelli — REFERENCE §7.1)", () => {
  it("≤2.25 → Vulnerabile", () => {
    expect(getAreaLevel(1)).toBe("Vulnerabile");
    expect(getAreaLevel(2.25)).toBe("Vulnerabile");
  });
  it("<3 → In costruzione", () => {
    expect(getAreaLevel(2.26)).toBe("In costruzione");
    expect(getAreaLevel(2.99)).toBe("In costruzione");
  });
  it("<3.5 → Sufficiente", () => {
    expect(getAreaLevel(3)).toBe("Sufficiente");
    expect(getAreaLevel(3.49)).toBe("Sufficiente");
  });
  it("<4 → Solido", () => {
    expect(getAreaLevel(3.5)).toBe("Solido");
    expect(getAreaLevel(3.99)).toBe("Solido");
  });
  it("≥4 → Forte", () => {
    expect(getAreaLevel(4)).toBe("Forte");
    expect(getAreaLevel(5)).toBe("Forte");
  });
});

describe("getCompositeLevel (indicatori, 4 livelli — REFERENCE §7.2)", () => {
  it("≤1.5 → Fragile", () => {
    expect(getCompositeLevel(1)).toBe("Fragile");
    expect(getCompositeLevel(1.5)).toBe("Fragile");
  });
  it("≤2.5 → Vulnerabile", () => {
    expect(getCompositeLevel(1.51)).toBe("Vulnerabile");
    expect(getCompositeLevel(2.5)).toBe("Vulnerabile");
  });
  it("≤3.5 → Adeguata", () => {
    expect(getCompositeLevel(2.51)).toBe("Adeguata");
    expect(getCompositeLevel(3.5)).toBe("Adeguata");
  });
  it(">3.5 → Solida", () => {
    expect(getCompositeLevel(3.51)).toBe("Solida");
    expect(getCompositeLevel(5)).toBe("Solida");
  });
});
```

- [ ] **Step 3: Eseguire e verificare il FAIL**

Run: `npm run test`
Expected: FAIL — `getAreaLevel`/`getCompositeLevel` non esistono.

- [ ] **Step 4: Implementare**

In `scoring.ts`: RIMUOVERE `export type Level = ...`, la funzione `getLevelFromScore`, e il tipo `AreaScore` se non importato altrove. AGGIUNGERE:
```ts
export type AreaLevel = "Vulnerabile" | "In costruzione" | "Sufficiente" | "Solido" | "Forte";
export type CompositeLevel = "Fragile" | "Vulnerabile" | "Adeguata" | "Solida";

// Soglie 7 aree — REFERENCE §7.1 (Report_Logic!A37, Risultati!C3–C9)
export function getAreaLevel(score: number): AreaLevel {
  if (score <= 2.25) return "Vulnerabile";
  if (score < 3) return "In costruzione";
  if (score < 3.5) return "Sufficiente";
  if (score < 4) return "Solido";
  return "Forte";
}

// Soglie indicatori compositi — REFERENCE §7.2 (Report_Logic!A49, 3_Subindici!A3)
export function getCompositeLevel(score: number): CompositeLevel {
  if (score <= 1.5) return "Fragile";
  if (score <= 2.5) return "Vulnerabile";
  if (score <= 3.5) return "Adeguata";
  return "Solida";
}
```

- [ ] **Step 5: Eseguire test + lint + build**

Run: `npm run test` (tutti verdi), poi `npm run lint`, poi `npm run build`.
Expected: tutto verde; build pulita (conferma che nessun altro file importava `getLevelFromScore`/`Level`/`AreaScore`).

- [ ] **Step 6: Commit**
```bash
git add src/utils/scoring.ts src/utils/scoring.test.ts
git commit -m "fix(scoring): soglie livelli aree+compositi da Excel, rimosso Eccellente (FORMULA-01, D-03)"
```

---

## Task 3: Hardening di calculateResults — input incompleto + punteggio complessivo (FORMULA-02, FORMULA-04, D-02, D-07)

Due correzioni nella stessa funzione: (a) niente fallback silenzioso a 0 per risposte mancanti — l'Excel non calcola se incompleto, quindi `calculateResults` deve fallire esplicitamente se manca una delle 33 risposte; (b) esporre `overallScore` = media delle 7 medie di area (F66).

**Files:** Modify `src/utils/scoring.ts`; Modify `src/utils/scoring.test.ts`

- [ ] **Step 1: Scrivere i test che falliscono**

Aggiungere in `scoring.test.ts`:
```ts
import { calculateResults } from "@/utils/scoring";
import { mainQuestions } from "@/data/questions";

// Helper: tutte e 33 le risposte a un valore fisso
function fullAnswers(value: number): Record<number, number> {
  const a: Record<number, number> = {};
  for (const q of mainQuestions) a[q.id] = value;
  return a;
}

describe("calculateResults — input incompleto (FORMULA-02)", () => {
  it("lancia errore se manca anche una sola risposta", () => {
    const a = fullAnswers(4);
    delete a[5]; // rimuove la Q2.2
    expect(() => calculateResults(a)).toThrow();
  });
  it("non lancia se tutte e 33 presenti", () => {
    expect(() => calculateResults(fullAnswers(4))).not.toThrow();
  });
});

describe("calculateResults — punteggio complessivo (FORMULA-04)", () => {
  it("overallScore = media delle 7 aree; con tutte 4 vale 4", () => {
    const res = calculateResults(fullAnswers(4));
    expect(res.overallScore).toBe(4);
  });
});
```

- [ ] **Step 2: Eseguire e verificare il FAIL**

Run: `npm run test`
Expected: FAIL — attualmente `calculateResults` NON lancia (usa fallback 0) e `overallScore` non esiste.

- [ ] **Step 3: Implementare**

In `scoring.ts`, dentro `calculateResults`, come PRIMA istruzione aggiungere la guardia di completezza:
```ts
  // L'Excel (IFERROR→"") non calcola su questionario incompleto: falliamo esplicitamente.
  const missing = mainQuestions
    .filter((q) => answersMain[q.id] === undefined)
    .map((q) => q.number);
  if (missing.length > 0) {
    throw new Error(`Risposte mancanti per le domande: ${missing.join(", ")}`);
  }
```
Aggiornare il tipo `ScoringResult` aggiungendo il campo:
```ts
export type ScoringResult = {
  areaScores: Record<string, number>;
  compositeIndicators: CompositeIndicators;
  overallScore: number;
};
```
Prima del `return`, calcolare `overallScore` come media semplice delle 7 medie di area (REFERENCE §5, F66 = AVERAGE(F16,F26,F35,F42,F50,F57,F64)):
```ts
  const areaValues = Object.values(areaScores);
  const overallScore = Number(
    (areaValues.reduce((a, b) => a + b, 0) / areaValues.length).toFixed(2)
  );
```
E includerlo nel return:
```ts
  return { areaScores, compositeIndicators, overallScore };
```

- [ ] **Step 4: Eseguire test + lint + build**

Run: `npm run test` (verdi), `npm run lint`, `npm run build`.
Expected: tutto verde. NB: il dev-mode e il submit finale chiamano `calculateResults` solo con tutte le risposte presenti, quindi la guardia non rompe il flusso reale.

- [ ] **Step 5: Commit**
```bash
git add src/utils/scoring.ts src/utils/scoring.test.ts
git commit -m "fix(scoring): fail-fast su input incompleto + overallScore F66 (FORMULA-02, FORMULA-04)"
```

---

## Task 4: Lock test completo su vettore verificato a mano (FORMULA-03)

Blocca TUTTE le formule (7 aree + 7 compositi + complessivo + livelli) con un input non banale dove ogni area ha un valore costante distinto, così ogni formula pesata produce un numero diverso e verificabile a mano.

**Vettore di input** (per area): voce=1, ricavi=2, margini=3, adattabilità=4, sistema=5, rete=1, apprendimento=2.

**Valori attesi (calcolati da REFERENCE §5–§7, arrotondati a 2 decimali come fa il codice):**
- areaScores: `La tua voce`=1, `I tuoi ricavi`=2, `I tuoi margini`=3, `La tua adattabilità`=4, `Il tuo sistema`=5, `La tua rete`=1, `Il tuo apprendimento`=2
- overallScore = (1+2+3+4+5+1+2)/7 = 18/7 = **2.57**
- Identità = (1+1+1+1×0.5)/3.5 = 3.5/3.5 = **1**
- Tenuta = (2+3)/2 = **2.5**
- Liquidità = Q2.3 = **2**
- Resilienza = (5+5×0.5+5+1+1+1×0.5+1)/6 = 16/6 = **2.67**
- Digital = (5+5+2×0.5+2×0.5+2×0.5)/3.5 = 13/3.5 = **3.71**
- Compliance = (3+3+3+5)/4 = 14/4 = **3.5**
- Capacità evoluzione = (4+2)/2 = **3**
- Livelli aree (getAreaLevel): voce(1)=Vulnerabile, ricavi(2)=Vulnerabile, margini(3)=Sufficiente, adattabilità(4)=Forte, sistema(5)=Forte, rete(1)=Vulnerabile, apprendimento(2)=Vulnerabile
- Livelli compositi (getCompositeLevel): Identità(1)=Fragile, Tenuta(2.5)=Vulnerabile, Compliance(3.5)=Adeguata, Digital(3.71)=Solida

**Files:** Modify `src/utils/scoring.test.ts`

- [ ] **Step 1: Scrivere il test (deve passare subito se i Task 1–3 sono corretti — è un lock di regressione)**

Aggiungere in `scoring.test.ts`:
```ts
// Vettore per area: ogni area un valore costante distinto (REFERENCE §1 mapping id→area)
function vectorByArea(): Record<number, number> {
  const byId: Record<number, number> = {};
  const set = (ids: number[], v: number) => ids.forEach((i) => (byId[i] = v));
  set([1, 2, 3], 1);                 // voce
  set([4, 5, 6, 7, 8, 9, 10], 2);    // ricavi
  set([11, 12, 13, 14, 15, 16], 3);  // margini
  set([17, 18, 19, 20], 4);          // adattabilità
  set([21, 22, 23, 24, 25], 5);      // sistema
  set([26, 27, 28, 29], 1);          // rete
  set([30, 31, 32, 33], 2);          // apprendimento
  return byId;
}

describe("calculateResults — lock formule su vettore verificato (FORMULA-03)", () => {
  const res = calculateResults(vectorByArea());

  it("punteggi area", () => {
    expect(res.areaScores["La tua voce"]).toBe(1);
    expect(res.areaScores["I tuoi ricavi"]).toBe(2);
    expect(res.areaScores["I tuoi margini"]).toBe(3);
    expect(res.areaScores["La tua adattabilità"]).toBe(4);
    expect(res.areaScores["Il tuo sistema"]).toBe(5);
    expect(res.areaScores["La tua rete"]).toBe(1);
    expect(res.areaScores["Il tuo apprendimento"]).toBe(2);
  });

  it("punteggio complessivo F66", () => {
    expect(res.overallScore).toBe(2.57);
  });

  it("indicatori compositi (REFERENCE §6)", () => {
    const c = res.compositeIndicators;
    expect(c.identita).toBe(1);
    expect(c.tenutaAttivita).toBe(2.5);
    expect(c.liquidita).toBe(2);
    expect(c.resilienzaOperativa).toBe(2.67);
    expect(c.digitalReadiness).toBe(3.71);
    expect(c.complianceProtezione).toBe(3.5);
    expect(c.capacitaEvoluzione).toBe(3);
  });

  it("livelli area (REFERENCE §7.1)", () => {
    expect(getAreaLevel(res.areaScores["I tuoi margini"])).toBe("Sufficiente");
    expect(getAreaLevel(res.areaScores["Il tuo sistema"])).toBe("Forte");
    expect(getAreaLevel(res.areaScores["La tua voce"])).toBe("Vulnerabile");
  });

  it("livelli compositi (REFERENCE §7.2)", () => {
    expect(getCompositeLevel(res.compositeIndicators.identita)).toBe("Fragile");
    expect(getCompositeLevel(res.compositeIndicators.tenutaAttivita)).toBe("Vulnerabile");
    expect(getCompositeLevel(res.compositeIndicators.complianceProtezione)).toBe("Adeguata");
    expect(getCompositeLevel(res.compositeIndicators.digitalReadiness)).toBe("Solida");
  });
});
```

- [ ] **Step 2: Eseguire**

Run: `npm run test`
Expected: TUTTI verdi. Se un valore atteso non torna, NON modificare il valore atteso per farlo passare: verificare prima la formula in `scoring.ts` contro REFERENCE §6 e segnalare la discrepanza (potrebbe essere un bug reale introdotto nei Task 1–3). Applicare `systematic-debugging`.

- [ ] **Step 3: Commit**
```bash
git add src/utils/scoring.test.ts
git commit -m "test(scoring): lock completo formule su vettore verificato a mano (FORMULA-03)"
```

---

## Task 5: Documentare i nomi canonici degli indicatori (FORMULA-06)

Solo documentazione (nessun cambio di comportamento): i campi del codice (`tenutaAttivita`, `digitalReadiness`) hanno nomi-utente diversi nell'Excel ("Sopravvivenza", "Digital Readiness"). Annotare la mappatura per la futura UI/report, senza rinominare i campi (eviterebbe rotture).

**Files:** Modify `src/utils/scoring.ts`

- [ ] **Step 1: Aggiungere JSDoc sopra il tipo `CompositeIndicators`**

Inserire un commento che mappa ogni campo al nome presentato all'utente (foglio `Risultati`) e alla cella sorgente:
```ts
/**
 * Indicatori compositi (REFERENCE §6). Nome campo → nome UI (foglio Risultati) → cella:
 * - identita            → "Identità"               (Risultati!B14, Report_Logic!B15)
 * - tenutaAttivita      → "Sopravvivenza"          (Risultati!B15, Report_Logic!B16)  [Report_Logic la chiama "Tenuta dell'attività"]
 * - liquidita           → "Liquidità"              (Risultati!B16, Report_Logic!B17)
 * - resilienzaOperativa → "Resilienza operativa"   (Risultati!B17, Report_Logic!B18)
 * - digitalReadiness    → "Digital Readiness"      (Risultati!B18)  [Report_Logic la chiama "Preparazione digitale"]
 * - complianceProtezione→ "Compliance e protezione"(Risultati!B19)  [Report_Logic: "Regole, sicurezza e assicurazioni"]
 * - capacitaEvoluzione  → "Capacità di evoluzione" (Risultati!B20, Report_Logic!B21)
 */
```

- [ ] **Step 2: Verificare che nulla si rompa**

Run: `npm run test`, `npm run lint`, `npm run build`.
Expected: tutto verde (è solo un commento).

- [ ] **Step 3: Commit**
```bash
git add src/utils/scoring.ts
git commit -m "docs(scoring): mappa nomi-utente indicatori vs campi codice (FORMULA-06)"
```

---

## Self-Review (eseguita in scrittura)

- **Copertura spec/BACKLOG:** FORMULA-05→Task1 ✓; FORMULA-01+D-03→Task2 ✓; FORMULA-02+FORMULA-04+D-02+D-07→Task3 ✓; FORMULA-03→Task4 ✓; FORMULA-06→Task5 ✓. FORMULA-07 (Media CARATTERE/RISCHIO) resta `todo` nel BACKLOG, legata alla fase report futura (fuori scope Fase 1, come da REFERENCE §6.8/D-06). D-08…D-14 informativi/futuri: non in Fase 1.
- **Placeholder:** nessuno; ogni step ha codice e valori espliciti. Valori attesi del Task 4 calcolati da REFERENCE §5–§7.
- **Coerenza nomi:** `AREA`, `AreaName`, `getAreaLevel`, `getCompositeLevel`, `overallScore`, `ScoringResult` usati coerentemente tra i task. I campi `compositeIndicators` (identita, tenutaAttivita, liquidita, resilienzaOperativa, digitalReadiness, complianceProtezione, capacitaEvoluzione) combaciano con `scoring.ts` esistente.
- **Rischio regressione:** Task 2 rimuove `getLevelFromScore`/`Level`/`AreaScore` — Step 1 del Task 2 verifica esplicitamente l'assenza di altri consumatori prima di rimuovere; `npm run build` conferma.

---

## Note di esecuzione

- Ordine obbligato (stesso file, modifiche sequenziali): Task 1 → 2 → 3 → 4 → 5. Nessuna parallelizzazione.
- Gate di uscita Fase 1: tutti i test verdi, `lint` e `build` puliti, e le 7 formule composite + 7 aree + complessivo + livelli bloccati dal lock test del Task 4 e allineati a REFERENCE.

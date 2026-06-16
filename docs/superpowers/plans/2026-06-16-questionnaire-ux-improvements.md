# Questionnaire UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 7 UX modifications to the questionnaire flow — comment fields, desktop rescaling, objective comments, Blocco 3 (preoccupazione), transition screen, contextual placeholders, and main question hint subtext.

**Architecture:** All changes are confined to 4 source files plus a Supabase migration. No changes to scoring logic (`/utils/scoring.ts`) or the results page. The questionnaire step count grows from 42 to 44 (two new steps: Blocco 3 and transition screen).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase (PostgreSQL JSONB columns).

---

## File Map

| File | Action | Summary of changes |
|------|--------|--------------------|
| `src/data/questions.ts` | Modify | Add `hint: string` to `MainQuestion` type; add `Worry` type + `worries` array (8 items); populate `hint` on all 33 `mainQuestions` |
| `src/app/questionnaire/page.tsx` | Modify | New step constants (44 total), 5 new state vars, remove auto-advance, add Avanti button + comment textarea on scale steps, Banda B scale layout, hint subtext, Blocco 3 render, transition render, updated resume logic, card `max-w-4xl` |
| `src/app/api/save-progress/route.ts` | Modify | Accept and persist 5 new optional fields in POST |
| `database_schema.sql` | Modify | Document 5 new columns in `fai_responses` |
| Supabase (live DB) | Migration | `ALTER TABLE fai_responses ADD COLUMN ...` (5 columns) |

---

## Task 1: Update `src/data/questions.ts` — data additions

**Files:**
- Modify: `src/data/questions.ts`

- [ ] **Step 1.1: Add `hint` to `MainQuestion` type and add `Worry` type + array**

Replace the `MainQuestion` type definition (lines 12–18 — the block starting `export type MainQuestion`):

```ts
export type MainQuestion = {
  id: number;
  area: string;
  number: string;
  text: string;
  hint: string;
  labels: { 1: string; 3: string; 5: string };
};

export type Worry = { id: string; text: string };

export const worries: Worry[] = [
  { id: "3.1", text: "Non sapere raccontare cosa mi rende diverso e competere solo sul prezzo." },
  { id: "3.2", text: "Dipendere troppo da un canale o una stagione." },
  { id: "3.3", text: "Non sapere davvero quanto guadagno." },
  { id: "3.4", text: "Non essere in regola con qualcosa senza saperlo e scoprirlo troppo tardi." },
  { id: "3.5", text: "Non essere preparato per un imprevisto serio (alluvione, pandemia, nuova legge ecc)." },
  { id: "3.6", text: "Essere così indispensabile per la mia attività, da non poter mai staccare." },
  { id: "3.7", text: "Lavorare da solo, senza una rete, senza qualcuno con cui confrontarmi." },
  { id: "3.8", text: "Che il mio territorio perda attrattività e io i miei guadagni." },
];
```

Place the `worries` array immediately after the `Worry` type, before the `export const mainQuestions` line.

- [ ] **Step 1.2: Add `hint` field to all 33 `mainQuestions` objects**

For each entry in `mainQuestions`, insert `"hint": "..."` after the `"text"` field. Use this exact mapping:

| id | hint text |
|----|-----------|
| 1 | `"Non il 'cosa vendi' ma il 'perché lo fai e perché proprio qui'. Se non sai dirlo in 30 secondi, i clienti non lo sanno neanche loro."` |
| 2 | `"Rileggi le recensioni o chiedi feedback direttamente ai tuoi clienti. Se potrebbero essere recensioni di un tuo concorrente sei a 1-2."` |
| 3 | `"Confronta il tuo profilo Instagram con l'esperienza reale: sembrano la stessa attività?"` |
| 4 | `"Non conta quanti canali di vendita hai aperto, ma quanti effettivamente portano clienti."` |
| 5 | `"Famiglie, coppie, business, stranieri ecc. Se una di queste tipologie sparisce, riesci a portare avanti la tua attività senza troppi sforzi?"` |
| 6 | `"La causa principale di chiusura delle piccole imprese non è la mancanza di clienti, è la cassa che non regge un momento difficile."` |
| 7 | `"Te lo chiediamo perché i mesi morti costano: affitto, utenze, manutenzione sono spese da sostenere anche quando non lavori."` |
| 8 | `"Te lo chiediamo perché serve a valutare il margine di profitto. Ogni prenotazione che passa da una piattaforma ha un costo. Sapere quanto ti costa ogni canale è il primo passo per ridurlo."` |
| 9 | `"Te lo chiediamo perché più ricavi diretti hai, più hai controllo sul rapporto con il cliente, sui margini e sulle decisioni commerciali."` |
| 10 | `"Per esempio, hai un gruppo WhatsApp / mailing list tramite cui raggiungere i tuoi clienti facilmente?"` |
| 11 | `"Includi tutti i costi reali dell'attività: affitto, utenze, fornitori, materie prime, commissioni, strumenti, consulenti, trasporti, tasse e contributi. E includi anche il tuo tempo: se non ti paghi, o non consideri il valore del tuo lavoro, il margine che vedi non è reale."` |
| 12 | `"Le normative cambiano in fretta. Non sapere ha un costo, spesso più alto di quello che si pensa."` |
| 13 | `"Questa domanda serve a capire se sai dove guadagni davvero. Non tutti i prodotti / servizi hanno lo stesso margine. Alcuni possono vendere tanto ma lasciare poco, perché richiedono molto tempo, hanno costi alti, commissioni, sprechi o consegne costose. Altri possono vendere meno, ma lasciare un margine migliore."` |
| 14 | `"Te lo chiediamo perché se non sai dove vanno i soldi, non puoi decidere dove fare tagli o investire."` |
| 15 | `"Questa domanda serve a capire se, davanti a un danno importante, la tua attività avrebbe una protezione economica oppure se dovresti pagare tutto di tasca tua. Non basta 'avere una polizza': è importante sapere cosa copre davvero."` |
| 16 | `"Te lo chiediamo perché le tasse arrivano a rate irregolari — e senza tenerle in conto durante l'anno, le scadenze possono trasformarsi in un problema di liquidità anche quando l'attività va bene."` |
| 17 | `"Non serve cambiare tutto in continuazione. Se negli ultimi sei mesi hai introdotto, eliminato o modificato almeno un prodotto / servizio dopo aver osservato il comportamento dei clienti, probabilmente sei già tra 4 e 5."` |
| 18 | `"Te lo chiediamo per capire quanto sei preparato a reagire agli imprevisti. Alluvioni, frane, pandemie, ondate di calore, guasti e ritardi dei fornitori non sono solo ipotesi lontane: possono succedere. Avere un piano non significa prevedere tutto, ma sapere almeno quali sono le prime mosse."` |
| 19 | `"Diversificare i mercati non significa smettere di servire i locali, ma significa non dipendere esclusivamente da loro."` |
| 20 | `"Non si tratta di essere fluenti. Si tratta di non perdere un cliente per una barriera che si può abbassare."` |
| 21 | `"Può bastare una rete minima di persone fidate e istruzioni semplici. Per esempio: chi apre e chiude, chi risponde ai clienti, chi gestisce ordini e pagamenti, dove sono password e documenti essenziali. Se tutto è solo nella tua testa, l'attività è più esposta."` |
| 22 | `"Calendari, liste, app, promemoria — contano tutti. Il punto è se funzionano anche quando non ci sei tu."` |
| 23 | `"Un gruppo WhatsApp con i numeri di tutti i clienti visibili a tutti è già una violazione. Non servono sistemi complicati ma serve consapevolezza."` |
| 24 | `"Il 69% dei consumatori italiani è disposto a spendere di più per prodotti/attività sostenibili. Non è solo etica, è posizionamento."` |
| 25 | `"Te lo chiediamo perché manutenere significa anche risparmiare e ridurre i costi gestione a breve e lungo termine."` |
| 26 | `"Per esempio, hai degli accordi con altre attività locali (ristoranti, bar, piccoli fornitori ecc)? Sponsorizzi altri prodotti/attività nel territorio?"` |
| 27 | `"Te lo chiediamo perché questo conta molto: un buon rapporto con il territorio può portare passaparola, fiducia, clienti ricorrenti, collaborazioni e supporto nei momenti difficili."` |
| 28 | `"Consigliare un ristoratore e dirgli che lo fai è il gesto più semplice per iniziare una rete. E chi riceve un cliente tende a restituirlo."` |
| 29 | `"Chi partecipa è informato in anticipo. Chi non partecipa scopre le cose quando è già troppo tardi."` |
| 30 | `"Le recensioni, anche quelle negative, spesso contengono informazioni preziose e possono diventare un vantaggio rispetto ai concorrenti."` |
| 31 | `"Per esempio, hai provato qualcosa di nuovo (una piattaforma, un servizio, un canale di vendita) che non ha funzionato come speravi, ma hai imparato qualcosa di concreto sulla tua attività? Se questo sei tu, sei a 3."` |
| 32 | `"Non si parla solo di corsi ufficiali o certificati. Può essere anche qualcosa di pratico: imparare a usare meglio i social, tenersi aggiornati su tendenze e cambiamenti, confrontarsi con altri imprenditori, migliorare una procedura ecc."` |
| 33 | `"Osservi come si presenta il tuo competitore più forte (foto, recensioni, cosa raccontano di sé)? Non per copiarlo, ma per capire cosa ti rende diverso? Se sì, sei tra 4 e 5. Se pensi di non avere competitori diretti, hai mai pensato a quelli indiretti?"` |

Example of id 1 after the change:
```ts
{
  "id": 1,
  "area": "La tua voce",
  "number": "1.1",
  "text": "Se ti chiedo perché un cliente dovrebbe scegliere te (non per il prezzo, non per la posizione), cosa risponderesti?",
  "hint": "Non il 'cosa vendi' ma il 'perché lo fai e perché proprio qui'. Se non sai dirlo in 30 secondi, i clienti non lo sanno neanche loro.",
  "labels": {
    "1": "non saprei cosa rispondere / non ci ho mai pensato",
    "3": "so cosa faccio ma fatico a spiegarlo in modo convincente",
    "5": "ho una storia chiara, la racconto con sicurezza"
  }
},
```

- [ ] **Step 1.3: Verify TypeScript compiles**

Run: `npm run build`

Expected: No errors. If you see `Property 'hint' is missing in type`, check all 33 entries — one is likely missing the field.

- [ ] **Step 1.4: Commit**

```bash
git add src/data/questions.ts
git commit -m "feat: add hint field to MainQuestion and Worry type with worries array"
```

---

## Task 2: Apply Supabase database migration

**Files:**
- Modify: `database_schema.sql`
- Live Supabase project: apply migration

- [ ] **Step 2.1: Update `database_schema.sql`**

Inside the `CREATE TABLE public.fai_responses` block, add 5 new column definitions after `answers_main JSONB DEFAULT '{}'::jsonb,` and before `area_scores`:

```sql
    comments_percezione     JSONB,       -- {"p1.1": "comment text", ...}
    comments_main           JSONB,       -- {"1": "comment text", ...}
    objectives_comments     JSONB,       -- {"2.1": "comment text", ...}
    preoccupazione          TEXT,        -- selected worry ID e.g. "3.2"
    preoccupazione_comment  TEXT,        -- optional comment on the worry
```

- [ ] **Step 2.2: Apply migration to live Supabase via MCP**

Execute this SQL using the `mcp__claude_ai_Supabase__apply_migration` tool (or paste directly in Supabase SQL editor):

```sql
ALTER TABLE public.fai_responses
  ADD COLUMN IF NOT EXISTS comments_percezione     JSONB,
  ADD COLUMN IF NOT EXISTS comments_main           JSONB,
  ADD COLUMN IF NOT EXISTS objectives_comments     JSONB,
  ADD COLUMN IF NOT EXISTS preoccupazione          TEXT,
  ADD COLUMN IF NOT EXISTS preoccupazione_comment  TEXT;
```

- [ ] **Step 2.3: Commit schema file**

```bash
git add database_schema.sql
git commit -m "chore: document 5 new fai_responses columns in schema file"
```

---

## Task 3: Update API route `src/app/api/save-progress/route.ts`

**Files:**
- Modify: `src/app/api/save-progress/route.ts`

- [ ] **Step 3.1: Extend `SaveProgressRequest` type**

Replace the `SaveProgressRequest` type (lines 13–20):

```ts
type SaveProgressRequest = {
  tokenId?: string;
  answers_percezione?: Record<string, number>;
  answers_obiettivi?: string[];
  answers_main?: Record<number, number>;
  isFinal?: boolean;
  finalData?: FinalData;
  comments_percezione?: Record<string, string>;
  comments_main?: Record<number, string>;
  objectives_comments?: Record<string, string>;
  preoccupazione?: string | null;
  preoccupazione_comment?: string;
};
```

- [ ] **Step 3.2: Extend `SaveProgressPayload` type**

Replace the `SaveProgressPayload` type (lines 22–34):

```ts
type SaveProgressPayload = {
  token_id: string;
  answers_percezione: Record<string, number>;
  answers_obiettivi: string[];
  answers_main: Record<number, number>;
  comments_percezione?: Record<string, string>;
  comments_main?: Record<number, string>;
  objectives_comments?: Record<string, string>;
  preoccupazione?: string | null;
  preoccupazione_comment?: string;
  nome_attivita?: string;
  settore?: string;
  citta?: string;
  email?: string;
  area_scores?: Record<string, number>;
  composite_indicators?: CompositeIndicators;
  completed_at?: string | null;
};
```

- [ ] **Step 3.3: Destructure new fields from request body**

In the `POST` handler, replace the destructuring (lines 40–47):

```ts
const {
  tokenId,
  answers_percezione,
  answers_obiettivi,
  answers_main,
  isFinal,
  finalData,
  comments_percezione,
  comments_main,
  objectives_comments,
  preoccupazione,
  preoccupazione_comment,
} = body;
```

- [ ] **Step 3.4: Include new fields in the payload**

Replace the `payload` construction block:

```ts
const payload: SaveProgressPayload = {
  token_id: tokenId,
  answers_percezione: answers_percezione || {},
  answers_obiettivi: answers_obiettivi || [],
  answers_main: answers_main || {},
  comments_percezione,
  comments_main,
  objectives_comments,
  preoccupazione,
  preoccupazione_comment,
};
```

- [ ] **Step 3.5: Verify build**

Run: `npm run build`
Expected: No TypeScript errors in `route.ts`.

- [ ] **Step 3.6: Commit**

```bash
git add src/app/api/save-progress/route.ts
git commit -m "feat: accept and persist comment/preoccupazione fields in save-progress API"
```

---

## Task 4: Update step constants, types, and state in `questionnaire/page.tsx`

**Files:**
- Modify: `src/app/questionnaire/page.tsx`

- [ ] **Step 4.1: Add `worries` to the import**

Replace line 14:
```ts
import { mainQuestions, objectives, perceptionQuestions } from "@/data/questions";
```
With:
```ts
import { mainQuestions, objectives, perceptionQuestions, worries } from "@/data/questions";
```

- [ ] **Step 4.2: Replace step constants (lines 17–23)**

```ts
const N_PERCEPTION = perceptionQuestions.length; // 7
const N_MAIN = mainQuestions.length; // 33
const STEP_OBJECTIVES    = N_PERCEPTION;           // 7
const STEP_PREOCCUPAZIONE = N_PERCEPTION + 1;      // 8
const STEP_TRANSITION    = N_PERCEPTION + 2;       // 9
const STEP_MAIN_START    = N_PERCEPTION + 3;       // 10
const STEP_MAIN_END      = N_PERCEPTION + 2 + N_MAIN; // 42
const STEP_FINAL         = N_PERCEPTION + 3 + N_MAIN; // 43
const TOTAL_STEPS        = STEP_FINAL + 1;         // 44
```

- [ ] **Step 4.3: Extend `SavedProgressData` type (lines 32–38)**

```ts
type SavedProgressData = {
  id: string;
  answers_percezione?: Record<string, number>;
  answers_obiettivi?: string[];
  answers_main?: Record<number, number>;
  comments_percezione?: Record<string, string>;
  comments_main?: Record<number, string>;
  objectives_comments?: Record<string, string>;
  preoccupazione?: string | null;
  preoccupazione_comment?: string;
  completed_at?: string | null;
};
```

- [ ] **Step 4.4: Add 5 new state variables**

After the `finalData` state declaration (after line 96), add:

```ts
const [commentsPercezione, setCommentsPercezione] = useState<Record<string, string>>({});
const [commentsMain, setCommentsMain] = useState<Record<number, string>>({});
const [objectivesComments, setObjectivesComments] = useState<Record<string, string>>({});
const [preoccupazione, setPreoccupazione] = useState<string | null>(null);
const [preoccupazioneComment, setPreoccupazioneComment] = useState<string>("");
```

- [ ] **Step 4.5: Commit (types and constants only — no render changes yet)**

```bash
git add src/app/questionnaire/page.tsx
git commit -m "feat: add step constants and state vars for new questionnaire steps"
```

---

## Task 5: Update `loadProgress`, `saveProgress`, `handleAnswer`, `handleObjectivesSubmit`

- [ ] **Step 5.1: Update `loadProgress` — restore new state fields on resume**

Inside the `loadProgress` async function, after `setAnswersMain(loaded.answers_main || {})` (line ~121), add:

```ts
setCommentsPercezione(loaded.comments_percezione || {});
setCommentsMain(loaded.comments_main || {});
setObjectivesComments(loaded.objectives_comments || {});
setPreoccupazione(loaded.preoccupazione || null);
setPreoccupazioneComment(loaded.preoccupazione_comment || "");
```

- [ ] **Step 5.2: Update `loadProgress` resume logic — add preoccupazione and transition checks**

Replace the resume logic block (currently lines 128–141):

```ts
const perceptionCount = Object.keys(loaded.answers_percezione || {}).length;

if (perceptionCount < N_PERCEPTION) {
  setCurrentStep(perceptionCount);
  return;
}

if ((loaded.answers_obiettivi || []).length < 3) {
  setCurrentStep(STEP_OBJECTIVES);
  return;
}

if (!loaded.preoccupazione) {
  setCurrentStep(STEP_PREOCCUPAZIONE);
  return;
}

const mainCount = Object.keys(loaded.answers_main || {}).length;

if (mainCount === 0) {
  setCurrentStep(STEP_TRANSITION);
  return;
}

setCurrentStep(mainCount < N_MAIN ? STEP_MAIN_START + mainCount : STEP_FINAL);
```

- [ ] **Step 5.3: Update `saveProgress` — include 5 new fields in POST body**

In the `saveProgress` function, replace the `body: JSON.stringify({...})` call:

```ts
body: JSON.stringify({
  tokenId,
  answers_percezione: overrides?.percezione ?? answersPercezione,
  answers_obiettivi: answersObiettivi,
  answers_main: overrides?.main ?? answersMain,
  isFinal,
  finalData,
  comments_percezione: commentsPercezione,
  comments_main: commentsMain,
  objectives_comments: objectivesComments,
  preoccupazione,
  preoccupazione_comment: preoccupazioneComment,
}),
```

- [ ] **Step 5.4: Remove auto-advance from `handleAnswer`**

In `handleAnswer`, delete the setTimeout block at the end of the function:

```ts
// DELETE these 3 lines:
if (currentStep < TOTAL_STEPS - 1) {
  setTimeout(() => setCurrentStep((step) => step + 1), 300);
}
```

The function now only saves the score. Navigation happens via the Avanti → button.

- [ ] **Step 5.5: Fix `handleObjectivesSubmit` — replace hardcoded `8`**

```ts
const handleObjectivesSubmit = async () => {
  if (answersObiettivi.length === 3) {
    await saveProgress();
    setCurrentStep(STEP_PREOCCUPAZIONE);
  }
};
```

- [ ] **Step 5.6: Fix dev mode hardcoded step in `handleFinalSubmit`**

Replace:
```ts
setCurrentStep(8 + mainQuestions.findIndex((question) => question.id === firstMissingQuestion.id));
```
With:
```ts
setCurrentStep(STEP_MAIN_START + mainQuestions.findIndex((question) => question.id === firstMissingQuestion.id));
```

- [ ] **Step 5.7: Commit**

```bash
git add src/app/questionnaire/page.tsx
git commit -m "feat: update progress load/save and remove auto-advance from handleAnswer"
```

---

## Task 6: Replace scale question render — Banda B layout + Avanti + comment + hint

- [ ] **Step 6.1: Add derived values and handlers after `isScaleValueSelected` (after line ~318)**

```ts
const hasScoreSelected =
  (isPerception &&
    currentPerceptionQuestion !== null &&
    answersPercezione[currentPerceptionQuestion.id] !== undefined) ||
  (isMain &&
    currentMainQuestion !== null &&
    answersMain[currentMainQuestion.id] !== undefined);

const currentComment =
  isPerception && currentPerceptionQuestion
    ? (commentsPercezione[currentPerceptionQuestion.id] ?? "")
    : isMain && currentMainQuestion
    ? (commentsMain[currentMainQuestion.id] ?? "")
    : "";

const handleCommentChange = (value: string) => {
  if (isPerception && currentPerceptionQuestion) {
    setCommentsPercezione((prev) => ({ ...prev, [currentPerceptionQuestion.id]: value }));
  } else if (isMain && currentMainQuestion) {
    setCommentsMain((prev) => ({ ...prev, [currentMainQuestion.id]: value }));
  }
};

const handleNext = () => {
  if (currentStep < TOTAL_STEPS - 1) {
    setCurrentStep((s) => s + 1);
  }
};
```

- [ ] **Step 6.2: Expand card from `max-w-2xl` to `max-w-4xl`**

On the `<motion.div>` className (line ~374):

```tsx
className="w-full max-w-4xl bg-surface p-6 md:p-10 rounded-2xl shadow-xl relative overflow-hidden"
```

- [ ] **Step 6.3: Replace the entire scale question render block**

Find the block `{(isPerception || isMain) && currentScaleQuestion && (` (line ~392) and replace everything up to its closing `)}`:

```tsx
{(isPerception || isMain) && currentScaleQuestion && (
  <div className="flex flex-col gap-6">
    <h2 className="text-2xl md:text-3xl font-medium leading-tight text-primary">
      {currentScaleQuestion.text}
    </h2>

    {isMain && currentMainQuestion && (
      <div className="text-sm text-secondary italic border-l-2 border-accent-surface/30 pl-3">
        {currentMainQuestion.hint}
      </div>
    )}

    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2 text-xs text-secondary">
        <span>
          <span className="text-accent-surface font-semibold">1 — </span>
          {currentScaleQuestion.labels[1]}
        </span>
        <span className="text-center">
          <span className="text-accent-surface font-semibold">3 — </span>
          {currentScaleQuestion.labels[3]}
        </span>
        <span className="text-right">
          <span className="text-accent-surface font-semibold">5 — </span>
          {currentScaleQuestion.labels[5]}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((value) => {
          const selected = isScaleValueSelected(value);
          return (
            <button
              key={value}
              onClick={() => handleAnswer(value)}
              aria-label={`Seleziona punteggio ${value} su 5`}
              className={`flex items-center justify-center py-3 rounded-xl border-2 transition-all duration-200
                ${
                  selected
                    ? "border-accent bg-accent/20 text-primary"
                    : "border-raised bg-raised/30 text-secondary hover:border-accent-surface hover:bg-raised/50"
                }`}
            >
              <span className="text-xl font-bold">{value}</span>
            </button>
          );
        })}
      </div>
    </div>

    <div className="relative">
      <textarea
        maxLength={400}
        placeholder="Commento facoltativo — puoi aggiungere un dettaglio o un contesto se vuoi…"
        value={currentComment}
        onChange={(e) => handleCommentChange(e.target.value)}
        className="w-full bg-canvas border border-raised rounded-xl p-3 text-sm text-primary resize-none h-20 focus:outline-none focus:border-accent-surface placeholder:text-tertiary"
      />
      <span className="absolute bottom-2 right-3 text-xs text-tertiary pointer-events-none">
        {currentComment.length} / 400
      </span>
    </div>

    <div className="flex items-center justify-between mt-2">
      {currentStep > 0 ? (
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          className="text-secondary text-sm flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          ← Indietro
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={handleNext}
        disabled={!hasScoreSelected}
        className="bg-accent hover:bg-accent/80 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-40"
      >
        Avanti →
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 6.4: Restrict the external Indietro button to non-scale, non-transition steps**

Find the external Indietro button block (lines ~547–554):

```tsx
{currentStep > 0 && !isFinalStep && (
```

Replace with:

```tsx
{currentStep > 0 && !isFinalStep && !isPerception && !isMain && (
```

(Transition and preoccupazione steps will each get their own internal Indietro in Tasks 7 and 8.)

- [ ] **Step 6.5: Run dev server and verify scale UI**

Run: `npm run dev`

Open: `http://localhost:3000/questionnaire?dev=1`

Verify on perception questions (steps 0–6):
- Card is wider on desktop
- Scale labels appear in a 3-column row above the buttons (1 — text | 3 — text | 5 — text)
- No "2 e 4 sono valori intermedi" text
- No 3-column card layout
- Clicking a number highlights it but does NOT auto-advance to the next step
- "Avanti →" is disabled until a score is selected, enabled after
- Textarea is visible with character counter
- Footer has ← Indietro (left) and Avanti → (right) inside the card

On main questions (steps 10–42): also verify the italic hint text appears below the question.

- [ ] **Step 6.6: Commit**

```bash
git add src/app/questionnaire/page.tsx
git commit -m "feat: Banda B scale layout, Avanti button, comment textarea, and main question hints"
```

---

## Task 7: Update objectives block — add comment fields

- [ ] **Step 7.1: Replace objective button markup to include comment textarea**

Find the `{objectives.map((objective) => {` block inside `{isObjectives && (`. The current markup is a single `<button>` per objective. Replace each `<button>` element with a `<div>` wrapper that contains both the toggle button and a conditional comment textarea:

```tsx
<div key={objective.id} className="flex flex-col gap-2">
  <button
    onClick={() => handleObjectiveToggle(objective.id)}
    disabled={isDisabled}
    className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4
      ${
        isSelected
          ? "border-accent bg-accent/20"
          : "border-raised bg-raised/30 hover:bg-raised/50"
      }
      ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    <div
      className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 mt-0.5
        ${isSelected ? "bg-accent border-accent text-white" : "border-tertiary"}
      `}
    >
      {isSelected && <CheckCircle2 className="w-4 h-4" />}
    </div>
    <span className={isSelected ? "text-primary font-medium" : "text-secondary"}>
      {objective.text}
    </span>
  </button>
  {isSelected && (
    <div className="relative pl-2">
      <textarea
        maxLength={400}
        placeholder="Perché è importante per te — facoltativo"
        value={objectivesComments[objective.id] ?? ""}
        onChange={(e) =>
          setObjectivesComments((prev) => ({ ...prev, [objective.id]: e.target.value }))
        }
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-canvas border border-raised rounded-xl p-3 text-sm text-primary resize-none h-16 focus:outline-none focus:border-accent-surface placeholder:text-tertiary"
      />
      <span className="absolute bottom-2 right-3 text-xs text-tertiary pointer-events-none">
        {(objectivesComments[objective.id] ?? "").length} / 400
      </span>
    </div>
  )}
</div>
```

Note: remove the `key` from the old `<button>` and move it to the outer `<div>`.

- [ ] **Step 7.2: Verify objectives UI**

Advance to step 7 (objectives) in dev mode.

Verify:
- Selecting an objective shows a textarea below it with placeholder "Perché è importante per te — facoltativo"
- Character counter works
- Deselecting the objective hides the textarea (comment lost — expected per spec)
- "Continua" only enables with exactly 3 objectives selected

- [ ] **Step 7.3: Commit**

```bash
git add src/app/questionnaire/page.tsx
git commit -m "feat: add comment fields under selected objectives"
```

---

## Task 8: Add Blocco 3 (preoccupazione) step

- [ ] **Step 8.1: Add `isPreoccupazione` and `isTransition` derived flags**

After the existing step-flag declarations (around lines 297–300):

```ts
const isPreoccupazione = currentStep === STEP_PREOCCUPAZIONE;
const isTransition = currentStep === STEP_TRANSITION;
```

- [ ] **Step 8.2: Add Blocco 3 render block**

Inside the `<motion.div>`, after the closing `)}` of the `{isObjectives && (` block, add:

```tsx
{isPreoccupazione && (
  <div className="flex flex-col gap-6">
    <div className="text-accent-surface text-sm font-semibold uppercase tracking-wider">
      Prima di iniziare
    </div>
    <h2 className="text-2xl md:text-3xl font-medium text-primary">
      Cosa ti preoccupa di più?
    </h2>
    <p className="text-secondary text-sm">Scegline UNA sola.</p>
    <div className="flex flex-col gap-3">
      {worries.map((worry) => {
        const isSelected = preoccupazione === worry.id;
        return (
          <div key={worry.id} className="flex flex-col gap-2">
            <button
              onClick={() =>
                setPreoccupazione((prev) => (prev === worry.id ? null : worry.id))
              }
              className={`text-left p-4 rounded-xl border-2 transition-all
                ${
                  isSelected
                    ? "border-accent bg-accent/20"
                    : "border-raised bg-raised/30 hover:bg-raised/50"
                }`}
            >
              <span className={isSelected ? "text-primary font-medium" : "text-secondary"}>
                {worry.text}
              </span>
            </button>
            {isSelected && (
              <div className="relative pl-2">
                <textarea
                  maxLength={400}
                  placeholder="Perché ti preoccupa — facoltativo"
                  value={preoccupazioneComment}
                  onChange={(e) => setPreoccupazioneComment(e.target.value)}
                  className="w-full bg-canvas border border-raised rounded-xl p-3 text-sm text-primary resize-none h-16 focus:outline-none focus:border-accent-surface placeholder:text-tertiary"
                />
                <span className="absolute bottom-2 right-3 text-xs text-tertiary pointer-events-none">
                  {preoccupazioneComment.length} / 400
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
    <button
      onClick={async () => {
        await saveProgress();
        setCurrentStep(STEP_TRANSITION);
      }}
      disabled={preoccupazione === null || isSaving}
      className="mt-2 w-full bg-accent hover:bg-accent/80 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center"
    >
      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continua →"}
    </button>
  </div>
)}
```

- [ ] **Step 8.3: Verify Blocco 3**

Skip to step 8 in dev mode (use the progress bar to click back to earlier steps then advance).

Verify:
- 8 worry options are listed with correct text
- Clicking an option selects it; clicking again deselects (radio-like)
- Comment textarea appears only under the selected option, with placeholder "Perché ti preoccupa — facoltativo"
- "Continua →" is disabled until one option is selected
- External ← Indietro (outside the card) is visible and functional

- [ ] **Step 8.4: Commit**

```bash
git add src/app/questionnaire/page.tsx
git commit -m "feat: add Blocco 3 preoccupazione step with radio select and comment"
```

---

## Task 9: Add transition screen

- [ ] **Step 9.1: Add transition render block**

After the closing `)}` of the `{isPreoccupazione && (` block, add:

```tsx
{isTransition && (
  <div className="flex flex-col gap-8">
    <div className="text-accent-surface text-sm font-semibold uppercase tracking-wider">
      Il questionario
    </div>
    <h2 className="text-2xl md:text-3xl font-medium text-primary leading-relaxed">
      Grazie delle informazioni che hai condiviso.
    </h2>
    <p className="text-secondary text-lg leading-relaxed">
      Ora clicca continua per iniziare il questionario vero e proprio.
    </p>
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => setCurrentStep((s) => s - 1)}
        className="text-secondary text-sm flex items-center gap-1.5 hover:text-primary transition-colors"
      >
        ← Indietro
      </button>
      <button
        onClick={() => setCurrentStep(STEP_MAIN_START)}
        className="bg-accent hover:bg-accent/80 text-white font-bold py-3 px-8 rounded-xl transition-all"
      >
        Continua →
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 9.2: Exclude transition from external Indietro button**

Update the condition from Task 6.4 to also exclude transition (which has its own internal Indietro):

```tsx
{currentStep > 0 && !isFinalStep && !isPerception && !isMain && !isTransition && (
```

- [ ] **Step 9.3: Verify transition screen**

In dev mode, complete preoccupazione step and click Continua.

Verify:
- Transition screen shows "Grazie delle informazioni che hai condiviso." as a heading
- Subtext: "Ora clicca continua per iniziare il questionario vero e proprio."
- "Continua →" goes directly to step 10 (first main question)
- "← Indietro" goes to step 8 (preoccupazione)
- Progress bar shows step 9 (index 9) as current

- [ ] **Step 9.4: Commit**

```bash
git add src/app/questionnaire/page.tsx
git commit -m "feat: add transition screen between Blocco 3 and main questionnaire"
```

---

## Task 10: Full flow verification and build check

- [ ] **Step 10.1: Run TypeScript build**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors and no linting errors.

If you see errors:
- `Property 'hint' does not exist` → a `mainQuestions` entry is missing the `hint` field (Task 1.2)
- `Argument of type ... not assignable` in `save-progress/route.ts` → check the payload type matches (Task 3)
- `Cannot find name 'STEP_PREOCCUPAZIONE'` → constant is missing or misspelled (Task 4.2)

- [ ] **Step 10.2: Full dev mode walkthrough**

Run: `npm run dev`

Open: `http://localhost:3000/questionnaire?dev=1`

Walk through all 44 steps:

| Steps | What to verify |
|-------|----------------|
| 0–6 (7 perception) | Banda B scale (no card, no "2 e 4" text), Avanti → enabled only after score selected, comment textarea with 400-char counter, ← Indietro + Avanti → inside card footer |
| 7 (objectives) | Select 3, comment textarea appears under each selected objective, "Perché è importante per te" placeholder |
| 8 (preoccupazione) | 8 options, radio-like select, comment after selection, "Perché ti preoccupa" placeholder, Continua → enabled only after selection |
| 9 (transition) | Verbatim two-sentence text, Continua → to step 10, ← Indietro to step 8 |
| 10–42 (33 main) | Same as perception + italic hint text below question text |
| 43 (final) | Form submits, dev results appear at `/results/__dev__` |

- [ ] **Step 10.3: Commit any fixes**

```bash
git add src/app/questionnaire/page.tsx src/data/questions.ts
git commit -m "fix: address issues found during full flow walkthrough"
```

---

## Self-Review Checklist

- [x] **Spec §1 comment fields** → Tasks 6 (scale), 7 (objectives), 8 (preoccupazione)
- [x] **Spec §2 desktop rescaling** → Task 6 (`max-w-4xl`, Banda B)
- [x] **Spec §3 objectives comment** → Task 7
- [x] **Spec §4 Blocco 3** → Task 8
- [x] **Spec §5 transition screen** → Task 9
- [x] **Spec §6 empty state** → All textareas have `placeholder` attributes
- [x] **Spec §7 hint subtext** → Task 1.2 (data) + Task 6.3 (render)
- [x] **Resume logic** → Task 5.2 (all 6 cases from spec §6 covered)
- [x] **Dev mode hardcoded step** → Task 5.6 (uses `STEP_MAIN_START` constant)
- [x] **DB migration** → Task 2 (5 columns with `IF NOT EXISTS`)
- [x] **Type consistency** → `commentsMain: Record<number, string>` used as `Record<number, string>` throughout; `preoccupazione: string | null` consistent with DB `TEXT` nullable

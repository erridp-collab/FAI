# UI Premium Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade visual quality and product feeling across questionnaire, homepage, and results page without changing content or adding dependencies.

**Architecture:** Pure CSS/Tailwind className changes across 4 existing files plus one DB column migration. No new components, no new libraries. Each task is self-contained and produces a working commit.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (CSS-first config via `@theme` in globals.css), Framer Motion (already installed), Lucide React (already installed), Supabase.

---

## File Map

| File | Tasks |
|------|-------|
| `database_schema.sql` | Task 1 |
| `src/app/api/save-progress/route.ts` | Task 2 |
| `src/app/questionnaire/page.tsx` | Tasks 3, 4, 5 |
| `src/app/page.tsx` | Tasks 6, 7 |
| `src/app/results/[id]/page.tsx` | Tasks 8, 9, 10 |

---

## Task 1: DB Migration — commento_finale column

**Files:**
- Modify: `database_schema.sql`
- Run: SQL against Supabase project

- [ ] **Step 1: Add column to schema file**

Open `database_schema.sql`. After the existing columns in the `fai_responses` table definition, add this line (around line 42, before the closing parenthesis of `CREATE TABLE`):

```sql
-- In database_schema.sql, inside CREATE TABLE public.fai_responses (...):
commento_finale TEXT DEFAULT '' NOT NULL,
```

The updated table definition block should include `commento_finale TEXT DEFAULT '' NOT NULL,` as the last column before the closing `)`.

- [ ] **Step 2: Run migration against Supabase**

Run this SQL in the Supabase dashboard → SQL Editor (or via `supabase db execute` CLI):

```sql
ALTER TABLE public.fai_responses
  ADD COLUMN IF NOT EXISTS commento_finale TEXT DEFAULT '' NOT NULL;
```

Expected: no error. Verify by running `SELECT column_name FROM information_schema.columns WHERE table_name = 'fai_responses' AND column_name = 'commento_finale';` — should return one row.

- [ ] **Step 3: Commit schema change**

```bash
git add database_schema.sql
git commit -m "feat: add commento_finale column to fai_responses"
```

---

## Task 2: API — accept commento_finale in save-progress

**Files:**
- Modify: `src/app/api/save-progress/route.ts`

- [ ] **Step 1: Add field to request and payload types**

In `src/app/api/save-progress/route.ts`, update the two type definitions:

```typescript
// Replace the existing FinalData type (lines 6-11):
type FinalData = {
  nome_attivita: string;
  settore: string;
  citta: string;
  email: string;
  commento_finale: string;
};

// Replace the existing SaveProgressRequest type (lines 13-25):
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

// Replace the existing SaveProgressPayload type (lines 27-44):
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
  commento_finale?: string;
  area_scores?: Record<string, number>;
  composite_indicators?: CompositeIndicators;
  completed_at?: string | null;
};
```

- [ ] **Step 2: Include commento_finale in the isFinal payload block**

In the POST handler, the `if (isFinal)` block (around lines 98-106) currently sets `nome_attivita`, `settore`, `citta`, `email`. Add `commento_finale`:

```typescript
    if (isFinal) {
      payload.nome_attivita = finalData?.nome_attivita;
      payload.settore = finalData?.settore;
      payload.citta = finalData?.citta;
      payload.email = finalData?.email;
      payload.commento_finale = finalData?.commento_finale ?? "";
      payload.area_scores = areaScores;
      payload.composite_indicators = compositeIndicators;
      payload.completed_at = completedAt;
    }
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: no TypeScript errors. If you see "commento_finale does not exist on type", double-check that `SaveProgressPayload` was updated in step 1.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/save-progress/route.ts
git commit -m "feat: accept commento_finale in save-progress API"
```

---

## Task 3: Progress Indicator — replace renderSquares()

**Files:**
- Modify: `src/app/questionnaire/page.tsx`

The current `renderSquares()` function (lines 380–413) renders 44 numbered squares. Replace it entirely with `renderProgressBar()` which renders a single compact row.

- [ ] **Step 1: Replace the renderSquares function**

Delete the entire `renderSquares` function (lines 380–413) and replace it with this new function, inserted at the same position:

```typescript
  const renderProgressBar = () => {
    const currentPhase =
      currentStep <= 6 ? 1
      : currentStep <= 9 ? 2
      : currentStep <= 42 ? 3
      : 4;

    // Start step for each phase (used for click navigation)
    const phaseStarts = [0, STEP_OBJECTIVES, STEP_MAIN_START, STEP_FINAL];

    // Dots to show for the current phase
    let dots: number[] = [];
    if (currentPhase === 1) {
      dots = Array.from({ length: 7 }, (_, i) => i);
    } else if (currentPhase === 2) {
      dots = [STEP_OBJECTIVES, STEP_PREOCCUPAZIONE, STEP_TRANSITION];
    } else if (currentPhase === 3) {
      const currentArea = mainQuestions[currentStep - STEP_MAIN_START]?.area ?? "";
      dots = mainQuestions
        .map((q, i) => ({ area: q.area, step: STEP_MAIN_START + i }))
        .filter(({ area }) => area === currentArea)
        .map(({ step }) => step);
    } else {
      dots = [STEP_FINAL];
    }

    const areaLabel =
      currentPhase === 1 ? "Come ti senti"
      : currentPhase === 2 ? "Obiettivi"
      : currentPhase === 3 ? (mainQuestions[currentStep - STEP_MAIN_START]?.area ?? "")
      : "Dati finali";

    return (
      <div className="mb-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2.5 bg-surface border border-raised rounded-lg px-3 py-2">
          {/* Phase pills */}
          <div className="flex gap-1.5 items-center flex-shrink-0">
            {([1, 2, 3, 4] as const).map((phase) => {
              const isDone = phase < currentPhase;
              const isCurrent = phase === currentPhase;
              return (
                <div
                  key={phase}
                  onClick={() => isDone && setCurrentStep(phaseStarts[phase - 1])}
                  className={`h-[3px] w-6 rounded-full transition-all ${
                    isDone
                      ? "bg-accent cursor-pointer hover:bg-accent-surface"
                      : isCurrent
                      ? "bg-accent-surface"
                      : "bg-raised"
                  }`}
                />
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-raised flex-shrink-0" />

          {/* Question dots */}
          <div className="flex gap-1 items-center flex-shrink-0">
            {dots.map((step) => {
              const isDone = step < currentStep;
              const isCurrent = step === currentStep;
              return (
                <div
                  key={step}
                  onClick={() => isDone && setCurrentStep(step)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isDone
                      ? "bg-accent cursor-pointer hover:bg-accent-surface"
                      : isCurrent
                      ? "bg-accent-surface shadow-[0_0_5px_rgba(154,143,224,0.7)]"
                      : "bg-raised"
                  }`}
                />
              );
            })}
          </div>

          {/* Area label */}
          <span className="text-[0.6rem] text-tertiary truncate flex-1 min-w-0 ml-0.5">
            {areaLabel}
          </span>

          {/* Step counter */}
          <span className="text-[0.6rem] text-tertiary tabular-nums flex-shrink-0">
            {currentStep + 1} / {TOTAL_STEPS}
          </span>
        </div>
      </div>
    );
  };
```

- [ ] **Step 2: Replace the call site**

In the `return` statement, find `{renderSquares()}` (around line 422 after the refactor) and replace it with:

```tsx
        {renderProgressBar()}
```

- [ ] **Step 3: Verify build and lint**

```bash
npm run build && npm run lint
```

Expected: no errors. The `renderSquares` was the only reference to those 44-square styles.

- [ ] **Step 4: Smoke test in dev**

```bash
npm run dev
```

Open `http://localhost:3000/questionnaire?dev=1`. Verify:
- A single compact bar appears at the top (no 44 squares)
- 4 phase pills visible, first one highlighted
- 7 dots visible (for perception phase)
- Label shows "Come ti senti" and counter "1 / 44"
- Answering and clicking Avanti advances the dots and counter

- [ ] **Step 5: Commit**

```bash
git add src/app/questionnaire/page.tsx
git commit -m "feat: replace 44-square progress indicator with compact mini-bar"
```

---

## Task 4: Scale Buttons — filled style

**Files:**
- Modify: `src/app/questionnaire/page.tsx`

- [ ] **Step 1: Update scale button className**

Find the scale button grid (around line 479 after previous task). The current `<button>` inside the `.map((value) => {` looks like:

```tsx
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
```

Replace with:

```tsx
                        <button
                          key={value}
                          onClick={() => handleAnswer(value)}
                          aria-label={`Seleziona punteggio ${value} su 5`}
                          className={`flex items-center justify-center py-4 rounded-xl transition-all duration-200 ${
                            selected
                              ? "bg-accent text-primary shadow-[0_4px_16px_rgba(74,63,140,0.4)] -translate-y-0.5"
                              : "bg-raised text-tertiary hover:text-secondary hover:bg-raised/80"
                          }`}
                        >
                          <span className="text-2xl font-extrabold">{value}</span>
                        </button>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Smoke test in dev**

Open `http://localhost:3000/questionnaire?dev=1`. Click any scale button. Verify:
- Unselected buttons: dark grey background (`bg-raised`), muted number
- Selected button: purple filled (`bg-accent`), white number, slight lift (`-translate-y-0.5`), shadow visible

- [ ] **Step 4: Commit**

```bash
git add src/app/questionnaire/page.tsx
git commit -m "feat: upgrade scale 1-5 buttons to filled style with shadow"
```

---

## Task 5: Final Comment Textarea

**Files:**
- Modify: `src/app/questionnaire/page.tsx`

- [ ] **Step 1: Add commento_finale to FinalData type**

At the top of the file, find the `FinalData` type (around line 27):

```typescript
type FinalData = {
  nome_attivita: string;
  settore: string;
  citta: string;
  email: string;
};
```

Replace with:

```typescript
type FinalData = {
  nome_attivita: string;
  settore: string;
  citta: string;
  email: string;
  commento_finale: string;
};
```

- [ ] **Step 2: Update the useState initial value**

Find the `finalData` useState (around line 98):

```typescript
  const [finalData, setFinalData] = useState<FinalData>({
    nome_attivita: "",
    settore: "",
    citta: "",
    email: "",
  });
```

Replace with:

```typescript
  const [finalData, setFinalData] = useState<FinalData>({
    nome_attivita: "",
    settore: "",
    citta: "",
    email: "",
    commento_finale: "",
  });
```

- [ ] **Step 3: Add textarea in the final step form**

In the `isFinalStep` section, find the final `<form>` block. The form currently ends with the submit button. Insert the textarea between the `FINAL_FIELDS` map and the submit button:

Find this block:
```tsx
                  {FINAL_FIELDS.map(({ label, key, type }) => (
                    <div key={key}>
                      <label
                        htmlFor={key}
                        className="block text-sm font-medium text-secondary mb-1"
                      >
                        {label} *
                      </label>
                      <input
                        id={key}
                        type={type}
                        required
                        value={finalData[key]}
                        onChange={(event) => {
                          const { value } = event.currentTarget;
                          setFinalData((prev) => ({
                            ...prev,
                            [key]: value,
                          }));
                        }}
                        className="w-full bg-canvas border border-raised rounded-lg p-3 text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
```

Replace with:

```tsx
                  {FINAL_FIELDS.map(({ label, key, type }) => (
                    <div key={key}>
                      <label
                        htmlFor={key}
                        className="block text-sm font-medium text-secondary mb-1"
                      >
                        {label} *
                      </label>
                      <input
                        id={key}
                        type={type}
                        required
                        value={finalData[key]}
                        onChange={(event) => {
                          const { value } = event.currentTarget;
                          setFinalData((prev) => ({
                            ...prev,
                            [key]: value,
                          }));
                        }}
                        className="w-full bg-canvas border border-raised rounded-lg p-3 text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                  ))}

                  <div>
                    <label
                      htmlFor="commento_finale"
                      className="block text-sm font-medium text-secondary mb-1"
                    >
                      Vuoi aggiungere qualcosa? <span className="text-tertiary font-normal">(facoltativo)</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="commento_finale"
                        maxLength={1000}
                        placeholder="Un pensiero libero, un contesto che potrebbe essere utile, qualcosa che non rientra nelle domande…"
                        value={finalData.commento_finale}
                        onChange={(e) =>
                          setFinalData((prev) => ({ ...prev, commento_finale: e.target.value }))
                        }
                        className="w-full bg-canvas border border-raised rounded-xl p-3 pb-6 text-sm text-primary resize-none h-28 focus:outline-none focus:border-accent-surface placeholder:text-tertiary"
                      />
                      <span className="absolute bottom-2 right-3 text-xs text-tertiary pointer-events-none">
                        {finalData.commento_finale.length} / 1000
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors. If you see `commento_finale` missing on `FinalData`, verify step 1 was applied.

- [ ] **Step 5: Smoke test**

Open `http://localhost:3000/questionnaire?dev=1`. Complete all steps to reach the final form. Verify:
- Textarea appears below the 4 existing fields
- Character counter increments correctly up to 1000
- Placeholder text is visible

- [ ] **Step 6: Commit**

```bash
git add src/app/questionnaire/page.tsx
git commit -m "feat: add optional commento_finale textarea to final questionnaire step"
```

---

## Task 6: Homepage Hero — gradient + SVG radar

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update the hero section**

In `src/app/page.tsx`, find the first `<section>` (around line 9):

```tsx
        <section className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent-surface text-sm font-medium tracking-wide">
            Diagnosi per microimprese
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Quanto è solida
            <br />
            <span className="text-accent-surface">la tua attività?</span>
          </h1>
          <p className="text-secondary text-lg max-w-xl mx-auto leading-relaxed">
            Ti dice quanto regge la tua attività se qualcosa cambia o va male. Non è un
            esame: è una diagnosi onesta basata sui tuoi dati, costruita su misura per
            le piccole imprese.
          </p>
        </section>
```

Replace with:

```tsx
        <section className="text-center space-y-6 relative overflow-hidden">
          {/* Radial gradient backdrop */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none bg-[radial-gradient(ellipse,rgba(74,63,140,0.35)_0%,transparent_70%)]" />

          {/* Mini radar chart — static SVG preview of the output */}
          <div className="relative z-10 flex justify-center">
            <svg
              width="90"
              height="90"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-70"
              style={{ filter: "drop-shadow(0 0 8px rgba(154,143,224,0.4))" }}
              aria-hidden="true"
            >
              <polygon points="50,10 90,32 90,68 50,90 10,68 10,32" fill="none" stroke="#3A3550" strokeWidth="1" />
              <polygon points="50,22 78,37 78,63 50,78 22,63 22,37" fill="none" stroke="#3A3550" strokeWidth="1" />
              <polygon points="50,34 66,42 66,58 50,66 34,58 34,42" fill="none" stroke="#3A3550" strokeWidth="1" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#3A3550" strokeWidth="0.5" />
              <line x1="10" y1="32" x2="90" y2="68" stroke="#3A3550" strokeWidth="0.5" />
              <line x1="90" y1="32" x2="10" y2="68" stroke="#3A3550" strokeWidth="0.5" />
              <polygon points="50,18 80,38 82,62 50,82 24,65 20,38" fill="rgba(154,143,224,0.18)" stroke="#9A8FE0" strokeWidth="1.5" />
              <circle cx="50" cy="18" r="3" fill="#9A8FE0" />
              <circle cx="80" cy="38" r="3" fill="#9A8FE0" />
              <circle cx="82" cy="62" r="3" fill="#9A8FE0" />
              <circle cx="50" cy="82" r="3" fill="#F3CF69" />
              <circle cx="24" cy="65" r="3" fill="#9A8FE0" />
              <circle cx="20" cy="38" r="3" fill="#9A8FE0" />
            </svg>
          </div>

          <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent-surface text-sm font-medium tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-surface shadow-[0_0_6px_rgba(154,143,224,0.8)]" />
            Diagnosi per microimprese
          </div>

          <h1 className="relative z-10 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Quanto è solida
            <br />
            <span className="text-accent-surface">la tua attività?</span>
          </h1>
          <p className="relative z-10 text-secondary text-lg max-w-xl mx-auto leading-relaxed">
            Ti dice quanto regge la tua attività se qualcosa cambia o va male. Non è un
            esame: è una diagnosi onesta basata sui tuoi dati, costruita su misura per
            le piccole imprese.
          </p>
        </section>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors. SVG attributes in React use camelCase (`strokeWidth`, not `stroke-width`) — verify they are camelCase in the file.

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- A subtle purple radial glow appears behind the hero text
- A small radar chart SVG is visible above the pill badge
- The pill badge has a glowing dot on the left
- All existing text is unchanged

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add radar SVG and radial gradient to homepage hero"
```

---

## Task 7: Homepage CTA — split into two clear actions

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the CTA section**

Find the last `<section>` before the `{isDev && ...}` block (around line 97):

```tsx
        <section className="bg-surface border border-accent/20 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Hai già acquistato l&apos;accesso?</h2>
          <p className="text-secondary text-sm">
            Usa il link personale ricevuto via email. Ogni link è valido per una sola
            diagnosi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <code className="bg-raised text-tertiary text-sm px-4 py-2 rounded-lg">
              fai-microimpresa.it/start?token=ALVA-XXXXXXXX
            </code>
          </div>
          <p className="text-tertiary text-xs pt-2">
            Non hai ancora un accesso?{" "}
            <a
              href="mailto:info@fai-microimpresa.it"
              className="text-accent-surface underline underline-offset-2"
            >
              Contattaci
            </a>
          </p>
        </section>
```

Replace with:

```tsx
        <section className="relative overflow-hidden bg-gradient-to-br from-accent/25 to-surface/80 border border-accent-surface/25 rounded-2xl p-8 text-center space-y-4">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(154,143,224,0.15),transparent)]" />
          <h2 className="relative z-10 text-xl font-semibold">Inizia la tua diagnosi</h2>
          <p className="relative z-10 text-secondary text-sm">
            Hai già acquistato l&apos;accesso? Usa il link personale ricevuto via email.
            Non ce l&apos;hai ancora?
          </p>
          <div className="relative z-10 pt-1">
            <a
              href="mailto:info@fai-microimpresa.it"
              className="inline-block bg-accent hover:bg-accent/80 text-white font-bold text-sm px-6 py-3 rounded-[0.625rem] shadow-[0_4px_16px_rgba(74,63,140,0.4)] transition-colors"
            >
              Richiedi l&apos;accesso →
            </a>
          </div>
          <p className="relative z-10 text-tertiary text-xs">oppure inserisci direttamente il tuo link</p>
          <div className="relative z-10 flex justify-center">
            <code className="bg-raised/50 border border-raised text-accent-surface text-xs px-4 py-2 rounded-lg">
              fai-microimpresa.it/start?token=ALVA-XXXXXXXX
            </code>
          </div>
          <p className="relative z-10 text-tertiary text-xs pt-1">
            Domande?{" "}
            <a
              href="mailto:info@fai-microimpresa.it"
              className="text-accent-surface underline underline-offset-2"
            >
              info@fai-microimpresa.it
            </a>
          </p>
        </section>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Smoke test**

Open `http://localhost:3000`. Scroll to the bottom CTA section. Verify:
- Section has a subtle gradient background (purple tint)
- "Richiedi l'accesso →" is a visible button (not just a link)
- The token code snippet is still present but visually secondary
- The mailto contact link is at the bottom

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: upgrade homepage CTA with gradient card and primary action button"
```

---

## Task 8: Results Page — Header with gradient and badge glow

**Files:**
- Modify: `src/app/results/[id]/page.tsx`

- [ ] **Step 1: Replace the header section**

Find the `{/* Header */}` block (around line 197):

```tsx
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-surface px-4 py-2 rounded-full text-sm font-semibold tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> DIAGNOSI COMPLETATA
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight">
            I risultati per <br className="md:hidden" />
            <span className="text-accent-surface font-semibold">
              {data.nome_attivita}
            </span>
          </h1>
          <p className="text-secondary text-lg max-w-xl mx-auto">
            Ecco una fotografia immediata della solidità della tua attività, basata
            sulle tue risposte.
          </p>
        </header>
```

Replace with:

```tsx
        {/* Header */}
        <header className="relative text-center space-y-4 py-4 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(74,63,140,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10 inline-flex items-center gap-2 bg-accent/25 text-accent-surface px-4 py-2 rounded-full text-sm font-semibold tracking-wider border border-accent-surface/30 shadow-[0_0_20px_rgba(74,63,140,0.3)]">
            <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-[9px] font-bold text-white shadow-[0_0_8px_rgba(154,143,224,0.6)]">
              ✓
            </div>
            DIAGNOSI COMPLETATA
          </div>
          <h1 className="relative z-10 text-3xl md:text-5xl font-medium tracking-tight">
            I risultati per <br className="md:hidden" />
            <span className="text-accent-surface font-semibold">
              {data.nome_attivita}
            </span>
          </h1>
          <p className="relative z-10 text-secondary text-lg max-w-xl mx-auto">
            Ecco una fotografia immediata della solidità della tua attività, basata
            sulle tue risposte.
          </p>
        </header>
```

Note: the `CheckCircle2` import from lucide-react is no longer used in the header. It may still be used elsewhere in the file — check before removing. In this file `CheckCircle2` is only in the header, so it can be removed from the import.

- [ ] **Step 2: Remove unused CheckCircle2 import**

Find the import line at the top of `src/app/results/[id]/page.tsx`:

```typescript
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
```

Replace with:

```typescript
import { AlertCircle, Loader2 } from "lucide-react";
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no unused import warnings or errors.

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

Open `http://localhost:3000/questionnaire?dev=1`, complete the questionnaire. On the results page verify:
- Purple gradient glow visible behind the header area
- "DIAGNOSI COMPLETATA" badge has a purple circle with ✓ and a glow effect
- Badge has a visible border and outer glow shadow

- [ ] **Step 5: Commit**

```bash
git add src/app/results/[id]/page.tsx
git commit -m "feat: upgrade results page header with gradient and glowing badge"
```

---

## Task 9: Results Page — Composite Indicators card grid

**Files:**
- Modify: `src/app/results/[id]/page.tsx`

- [ ] **Step 1: Add LEVEL_BORDER_COLOR and LEVEL_SCORE_COLOR constants**

In `src/app/results/[id]/page.tsx`, after the existing `LEVEL_BAR_COLOR` constant (around line 83), add:

```typescript
const LEVEL_BORDER_COLOR: Record<keyof typeof LEVEL_STYLES, string> = {
  Fragile: "#f87171",
  Vulnerabile: "#F3CF69",
  Adeguata: "#9A8FE0",
  Solida: "#4ade80",
};

const LEVEL_SCORE_COLOR: Record<keyof typeof LEVEL_STYLES, string> = {
  Fragile: "#f87171",
  Vulnerabile: "#F3CF69",
  Adeguata: "#9A8FE0",
  Solida: "#4ade80",
};
```

- [ ] **Step 2: Replace the composite indicators section**

Find the `{/* Composite indicators */}` block (around line 309):

```tsx
        {/* Composite indicators */}
        {compositeIndicators && (
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-medium">Indicatori chiave</h3>
              <p className="text-secondary text-sm mt-1">
                Sette dimensioni trasversali che emergono dall&apos;insieme delle tue risposte.
              </p>
            </div>
            <div className="bg-surface border border-raised rounded-2xl overflow-hidden divide-y divide-raised">
              {COMPOSITE_META.map(({ key, label, description }) => {
                const score = compositeIndicators[key];
                const level = getCompositeLevel(score);
                const levelStyle = LEVEL_STYLES[level];
                const barColor = LEVEL_BAR_COLOR[level];

                return (
                  <div key={key} className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-primary text-sm">{label}</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${levelStyle}`}
                          >
                            {level}
                          </span>
                        </div>
                        <p className="text-tertiary text-xs leading-relaxed">{description}</p>
                      </div>
                      <div className="flex items-center gap-3 sm:w-36 flex-shrink-0">
                        <div className="flex-1 bg-raised rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${barColor}`}
                            style={{ width: `${(score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-primary w-8 text-right">
                          {score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
```

Replace with:

```tsx
        {/* Composite indicators */}
        {compositeIndicators && (
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-medium">Indicatori chiave</h3>
              <p className="text-secondary text-sm mt-1">
                Sette dimensioni trasversali che emergono dall&apos;insieme delle tue risposte.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMPOSITE_META.map(({ key, label, description }) => {
                const score = compositeIndicators[key];
                const level = getCompositeLevel(score);
                const borderColor = LEVEL_BORDER_COLOR[level];
                const scoreColor = LEVEL_SCORE_COLOR[level];
                const barColor = LEVEL_BAR_COLOR[level];

                return (
                  <div
                    key={key}
                    className="bg-surface border border-raised rounded-2xl p-4"
                    style={{ borderLeft: `3px solid ${borderColor}` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-primary text-sm">{label}</span>
                      <span
                        className="text-base font-extrabold tabular-nums"
                        style={{ color: scoreColor }}
                      >
                        {score.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-raised rounded-full h-[3px] mb-2">
                      <div
                        className={`h-[3px] rounded-full transition-all ${barColor}`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-tertiary text-xs leading-relaxed">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no type errors. `LEVEL_BORDER_COLOR` and `LEVEL_SCORE_COLOR` use the same key union as `LEVEL_STYLES` so the type is correct.

- [ ] **Step 4: Smoke test**

On the results page, scroll to "Indicatori chiave". Verify:
- Cards are in a 2-column grid on desktop, 1-column on mobile
- Each card has a colored left border matching the level (red=Fragile, yellow=Vulnerabile, purple=Adeguata, green=Solida)
- Score number is displayed in the matching level color

- [ ] **Step 5: Commit**

```bash
git add src/app/results/[id]/page.tsx
git commit -m "feat: replace composite indicators list with color-coded card grid"
```

---

## Task 10: Results Page — Email CTA with timeline

**Files:**
- Modify: `src/app/results/[id]/page.tsx`

- [ ] **Step 1: Replace the Email CTA block**

Find the `{/* Email CTA */}` block (around line 358):

```tsx
        {/* Email CTA */}
        <div className="bg-gradient-to-r from-accent to-raised p-7 md:p-8 rounded-3xl border border-accent-surface/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent blur-3xl opacity-50 pointer-events-none" />

          <h2 className="text-xl md:text-2xl font-semibold mb-3">Il tuo report completo è in arrivo</h2>
          <p className="text-primary/90 max-w-2xl text-base md:text-lg leading-relaxed">
            Stiamo elaborando tutti i dati raccolti. Riceverai un report dettagliato e
            personalizzato all&apos;indirizzo email{" "}
            <span className="font-semibold text-white">{data.email}</span> entro{" "}
            <span className="text-gold font-bold">3 giorni lavorativi</span>.
          </p>
        </div>
```

Replace with:

```tsx
        {/* Email CTA */}
        <div className="bg-surface border border-accent-surface/20 rounded-2xl p-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-accent/30 border border-accent-surface/20 flex items-center justify-center text-xl flex-shrink-0">
            📬
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold mb-1">
              Report in arrivo a{" "}
              <span className="text-accent-surface">{data.email}</span>
            </h2>
            <p className="text-secondary text-sm leading-relaxed">
              Stiamo elaborando tutti i dati raccolti. Riceverai un report dettagliato e
              personalizzato entro{" "}
              <span className="text-gold font-bold">3 giorni lavorativi</span>.
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-tertiary">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-surface shadow-[0_0_5px_rgba(154,143,224,0.6)]" />
                Diagnosi completata
              </div>
              <span className="text-tertiary text-xs">→</span>
              <div className="flex items-center gap-1.5 text-xs text-tertiary">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Elaborazione
              </div>
              <span className="text-tertiary text-xs">→</span>
              <div className="flex items-center gap-1.5 text-xs text-tertiary">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                Report via email
              </div>
            </div>
          </div>
        </div>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Run all tests**

```bash
npm run test
```

Expected: all existing tests pass (scoring, API, security). This task made no logic changes.

- [ ] **Step 4: Smoke test**

On the results page, scroll to the bottom. Verify:
- No more gradient card — replaced by a clean card with email icon
- Report email address is highlighted in accent-surface color
- Timeline "Diagnosi completata → Elaborazione → Report via email" is visible with colored dots
- "3 giorni lavorativi" still shows in gold

- [ ] **Step 5: Commit**

```bash
git add src/app/results/[id]/page.tsx
git commit -m "feat: replace email CTA gradient card with timeline step card"
```

---

## Self-Review Checklist

- [x] **Spec §1 Progress Indicator** → Task 3 ✓
- [x] **Spec §2 Scale buttons** → Task 4 ✓
- [x] **Spec §3 Homepage hero gradient + SVG** → Task 6 ✓
- [x] **Spec §4 Homepage CTA** → Task 7 ✓
- [x] **Spec §5 Results header** → Task 8 ✓
- [x] **Spec §6 Composite indicators card grid** → Task 9 ✓
- [x] **Spec §7 Email CTA timeline** → Task 10 ✓
- [x] **Spec §8 Commento finale textarea** → Tasks 1+2+5 ✓
- [x] **DB migration** → Task 1 ✓ (noted as manual SQL execution)
- [x] **No new dependencies** → verified, all changes are CSS/className only

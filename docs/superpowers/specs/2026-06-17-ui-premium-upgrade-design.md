# UI Premium Upgrade — Design Spec
**Data:** 2026-06-17  
**Scope:** Miglioramento qualità visiva e product feeling senza stravolgere contenuto o struttura.  
**Obiettivo:** Rendere il prodotto percepito come premium per supportare la vendita.

---

## 1. Questionario — Progress Indicator

### Decisione
Sostituire la griglia di 44 quadratini numerati con una **mini-bar compatta a una riga** (variante B).

### Struttura della mini-bar
```
[pill fase 1][pill fase 2][pill fase 3][pill fase 4] | [dot][dot][dot][dot][dot]  Nome area  22/44
```

- **4 pillole fasi** (rettangoli 22×3px): mostrano le macro-fasi del percorso
  - Fasi completate: `bg-accent` (`#4A3F8C`) — cliccabili, navigano all'inizio della fase
  - Fase corrente: `bg-accent-surface` (`#9A8FE0`)
  - Fasi future: `bg-raised` (`#3A3550`)
- **Divisore verticale** (1px, `#3A3550`) separa le pillole dai dots
- **Dots domanda** (6px circle): mostrano le domande dell'area/sezione corrente
  - Completate: `bg-accent` — cliccabili, navigano alla domanda
  - Corrente: `bg-accent-surface` con `box-shadow` glow
  - Future: `bg-raised`
- **Nome area** (testo 0.6rem, `#6B6890`), troncato con `text-overflow: ellipsis`
- **Contatore** `22 / 44` (0.6rem, `#6B6890`, `margin-left: auto`)

### Container
`background: rgba(45,42,62,0.95)` + `border: 1px solid #3A3550` + `border-radius: 0.6rem` + `backdrop-filter: blur(8px)`  
Padding: `0.5rem 0.75rem`. Gap tra elementi: `0.6rem`.

### Fasi
| # | Label | Step range | Dots mostrati |
|---|-------|-----------|--------------|
| 1 | Come ti senti | Steps 0–6 (7 domande percezione) | 7 dots, uno per domanda |
| 2 | Obiettivi + Preoccupazione | Steps 7–9 (Obiettivi, Preoccupazione, Transizione) | 3 dots |
| 3 | La tua realtà | Steps 10–42 (33 domande main) | Dots per area corrente (es. 5 dots per "I tuoi margini") |
| 4 | Dati finali | Step 43 | 1 dot |

### Comportamento
- Tutto in una sola riga, nessun testo label fasi (evita cramping su mobile)
- Il contatore fornisce il riferimento numerico che i quadratini davano prima
- Cliccabilità mantenuta: pillole fase completata + dots completati sono cliccabili
- Applicato a tutti i breakpoint (nessun responsive diverso)

---

## 2. Questionario — Scale 1–5

### Decisione
Variante B: **pulsanti filled + shadow al click**.

### Stato default
- `background: #3A3550`
- `border: none`
- `border-radius: 0.875rem`
- `color: #6B6890`
- `font-size: 1.4rem`, `font-weight: 800`
- Padding: `1rem 0`

### Stato selezionato
- `background: #4A3F8C`
- `color: #EDE8FF`
- `box-shadow: 0 4px 16px rgba(74,63,140,0.4)`
- `transform: translateY(-2px)`
- Transition: `all 0.2s`

### Layout
`display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px`

---

## 3. Homepage — Hero Section

### Decisione
Aggiungere **radial gradient di sfondo** + **mini radar chart SVG** come visual hint del prodotto. Nessun cambio di testo.

### Gradient
Elemento `::before` o `div` assoluto centrato:
```css
background: radial-gradient(ellipse, rgba(74,63,140,0.35) 0%, transparent 70%);
width: 400px; height: 400px;
position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
pointer-events: none; z-index: 0;
```

### Mini radar chart SVG
- Dimensioni: `90×90px`, centrato sopra l'`<h1>`
- `opacity: 0.7` + `filter: drop-shadow(0 0 8px rgba(154,143,224,0.4))`
- SVG statico (no dati reali): griglia esagonale + shape dati approssimata + 6 dot `fill="#9A8FE0"`, il dot più basso `fill="#F3CF69"` (richiama il gold del punto di miglioramento)
- Trasmette visivamente l'output atteso prima ancora che l'utente inizi

### Pill badge hero
Aggiungere `<div class="pill-dot">` — cerchio da 6px `bg-accent-surface` con `box-shadow: 0 0 6px rgba(154,143,224,0.8)` — affiancato al testo "Diagnosi per microimprese".

---

## 4. Homepage — CTA Section

### Decisione
Separare la CTA attuale in **due azioni chiare** (variante "Fix" approvata).

### Struttura
```
[Card con gradient sottile]
  Titolo: "Inizia la tua diagnosi"
  Testo: "Hai già acquistato l'accesso? Usa il link personale ricevuto via email. Non ce l'hai ancora?"
  
  [Button primario] "Richiedi l'accesso →"     ← mailto:info@fai-microimpresa.it
  
  ── oppure inserisci direttamente il tuo link ──
  
  [code block] fai-microimpresa.it/start?token=ALVA-XXXXXXXX
  
  [link testo] Domande? info@fai-microimpresa.it
```

### Stili card
- `background: linear-gradient(135deg, rgba(74,63,140,0.25) 0%, rgba(45,42,62,0.8) 100%)`
- `border: 1px solid rgba(154,143,224,0.25)`
- `border-radius: 1rem`
- Decorazione `::after`: cerchio blur `rgba(154,143,224,0.15)` in alto a destra

### Button primario
- `background: #4A3F8C`
- `box-shadow: 0 4px 16px rgba(74,63,140,0.4)`
- `border-radius: 0.625rem`
- `font-weight: 700`

---

## 5. Pagina Risultati — Header

### Decisione
Radial gradient di sfondo + badge "DIAGNOSI COMPLETATA" con glow.

### Background sezione header
```css
background: linear-gradient(180deg, rgba(74,63,140,0.12) 0%, transparent 60%);
```
Applicato alla section header, non all'intera pagina.

### Badge
```
[cerchio 16px bg-accent con check ✓ + glow] DIAGNOSI COMPLETATA
```
- Container: `background: rgba(74,63,140,0.25)` + `border: 1px solid rgba(154,143,224,0.3)` + `border-radius: 100px`
- `box-shadow: 0 0 20px rgba(74,63,140,0.3)` sul container
- Cerchio interno: `box-shadow: 0 0 8px rgba(154,143,224,0.6)`

---

## 6. Pagina Risultati — Indicatori Compositi

### Decisione
Da lista a righe a **card grid 2 colonne** con bordo sinistro colorato per livello.

### Layout
```css
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 8px;
/* mobile: grid-template-columns: 1fr */
```

### Card per indicatore
- `background: #2D2A3E`
- `border: 1px solid #3A3550`
- `border-left: 3px solid <color-livello>`
- `border-radius: 0.875rem`
- Padding: `0.875rem 1rem`

### Contenuto card
1. Header: nome indicatore (0.8rem bold) + punteggio (1rem 800 weight, colore livello)
2. Barra progresso (3px, `border-radius: 100px`)
3. Descrizione (0.65rem, `#6B6890`)

### Colori per livello
| Livello | Bordo + punteggio | Barra |
|---------|------------------|-------|
| Fragile | `#f87171` | `bg-red-400` |
| Vulnerabile | `#F3CF69` | `bg-yellow-400` |
| Adeguata | `#9A8FE0` | `bg-accent-surface` |
| Solida | `#4ade80` | `bg-green-400` |

---

## 7. Pagina Risultati — CTA Email

### Decisione
Da card con gradiente decorativo a **card minimal con timeline passi**.

### Struttura
```
[Card #2D2A3E border rgba(154,143,224,0.2)]
  [Icona 📬 in box 40px rounded]  [Testo body]
                                    Titolo: "Report in arrivo a {email}"
                                    Testo: "Riceverai entro 3 giorni lavorativi..."
                                    
                                    [Timeline]
                                    ● Diagnosi completata  →  ● Elaborazione  →  ● Report via email
```

### Timeline dots
- `Diagnosi completata`: dot `#9A8FE0` con glow
- `Elaborazione`: dot `#4A3F8C`
- `Report via email`: dot `#F3CF69`

---

## 8. Questionario — Commento finale

### Decisione
Aggiungere un campo **textarea opzionale** nell'ultimo step (STEP_FINAL) per raccogliere un commento libero dell'utente, max 1000 caratteri.

### Posizione
Nello step finale (`isFinalStep`), **sotto i 4 campi esistenti** (Nome Attività, Settore, Città, Email) e **sopra il pulsante** "Calcola i tuoi risultati →".

### Struttura UI
```
[...campi esistenti...]

[label] Vuoi aggiungere qualcosa? (facoltativo)
[textarea 1000 chars — stile coerente con le textarea già presenti nel questionario]
                                              [contatore chars] X / 1000

[button] Calcola i tuoi risultati →
```

### Stili textarea
Coerente con le textarea già presenti nel questionario:
- `background: #16141F` (bg-canvas)
- `border: 1px solid #3A3550` → `focus: border-accent-surface`
- `border-radius: 0.75rem`
- `padding: 0.75rem`
- `resize: none`
- Altezza: `h-28` (~112px) — più alta delle textarea intermedie perché è un campo libero
- Contatore in basso a destra: `X / 1000` (stile `text-tertiary text-xs`)

### Dati
- Nuovo campo `commento_finale: string` aggiunto a `FinalData` in `questionnaire/page.tsx`
- Aggiunto a `SaveProgressRequest` e `SaveProgressPayload` in `save-progress/route.ts`
- Incluso nel payload `isFinal` assieme agli altri campi `finalData`
- Se vuoto, inviato come stringa vuota `""` (non nullable)

**Richiede migrazione DB** — aggiungere colonna a `fai_responses`:
```sql
ALTER TABLE public.fai_responses
  ADD COLUMN IF NOT EXISTS commento_finale TEXT DEFAULT '';
```

---

## File coinvolti

| File | Modifiche |
|------|-----------|
| `src/app/globals.css` | Nessuna (secondary color invariato per scelta) |
| `src/app/layout.tsx` | Nessuna |
| `src/app/page.tsx` | Hero: gradient + SVG radar. CTA section: restructure |
| `src/app/questionnaire/page.tsx` | Progress indicator: replace `renderSquares()`. Scale buttons: update className. Final step: add `commento_finale` textarea |
| `src/app/results/[id]/page.tsx` | Header section, composite indicators grid, email CTA card |
| `src/app/api/save-progress/route.ts` | Accettare e salvare `commento_finale` nel payload finale |

---

## Principi guida

- **Solo CSS/className** — nessuna nuova dipendenza, nessuna libreria aggiuntiva
- **Nessun cambio di contenuto** — testi, label, struttura dati invariati
- **Framer Motion già installato** — le transizioni esistenti rimangono
- **Lucide React già installato** — le icone esistenti rimangono
- **Mobile-first** — mini-bar e card grid si adattano con un breakpoint `sm:`

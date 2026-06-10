# Product-Readiness BACKLOG

Coda di task atomici del loop. Stati: `todo` · `in-progress` · `review` · `done`.
Categorie: FORMULA · SECURITY · FUNC · UX · A11Y · PERF · TEST.
Le voci FORMULA derivano da `REFERENCE.md` §11 (discrepanze codice vs Excel, verificate cella per cella).

| ID | Cat | Sev | Fase | File | Descrizione | Criteri di accettazione | Dipende da | Stato |
|---|---|---|---|---|---|---|---|---|
| FORMULA-01 | FORMULA | critica | 1 | src/utils/scoring.ts | Soglie livelli inventate: `getLevelFromScore` usa `<2/<3.5/<4.5/≥4.5` con label "Eccellente" che NON esiste nell'Excel. L'Excel ha sistemi distinti: 7 aree (≤2.25 Vulnerabile / <3 In costruzione / <3.5 Sufficiente / <4 Solido / ≥4 Forte) e compositi (≤1.5 Fragile / ≤2.5 Vulnerabile / ≤3.5 Adeguata / >3.5 Solida) | Funzioni separate per aree e compositi con soglie/label da REFERENCE; "Eccellente" rimosso dal tipo Level; unit test sui confini verdi | REFERENCE.md | todo |
| FORMULA-02 | FORMULA | alta | 1 | src/utils/scoring.ts | `getQ()` ritorna 0 per risposte mancanti, falsando i compositi su questionari parziali (l'Excel usa IFERROR→"" cioè nessun calcolo se incompleto) | Comportamento definito vs REFERENCE (no calcolo/escludi su incompleto); test su input parziale verde | REFERENCE.md | todo |
| FORMULA-03 | FORMULA | alta | 1 | src/utils/scoring.ts | Bloccare con unit test i 7 indicatori compositi (già verificati == Excel: Identità, Tenuta, Liquidità, Resilienza, Digital, Compliance, Capacità evoluzione) | Un unit test per indicatore con input noto e valore atteso da REFERENCE; tutti verdi | REFERENCE.md | todo |
| FORMULA-04 | FORMULA | media | 1 | src/utils/scoring.ts | Punteggio complessivo F66 = AVERAGE delle 7 aree non calcolato né esposto in `ScoringResult` | `overallScore` aggiunto a ScoringResult e calcolato come da F66; test verde | REFERENCE.md | todo |
| FORMULA-05 | FORMULA | media | 1 | src/utils/scoring.ts | Aree referenziate per stringa (`getAreaScore("I tuoi ricavi")`): un refuso rompe il calcolo in silenzio | Costanti/enum tipizzati per le 7 aree; nessuna stringa magica | REFERENCE.md | todo |
| FORMULA-06 | FORMULA | bassa | 1 | src/utils/scoring.ts | Nomi indicatori divergenti dall'Excel (codice `tenutaAttivita`/`digitalReadiness` vs "Sopravvivenza"/"Preparazione digitale") | Naming canonico deciso e documentato coerente con REFERENCE | REFERENCE.md | todo |
| FORMULA-07 | FORMULA | bassa | 1 | src/utils/scoring.ts | Media CARATTERE e Media RISCHIO (per la selezione dei 6 profili in apertura) non implementate | Documentate; implementazione legata alla fase report futura (non bloccante) | REFERENCE.md | todo |
| SECURITY-01 | SECURITY | critica | 2 | database_schema.sql | RLS aperta su `fai_responses` (`USING true`): chiunque legge/scrive tutte le risposte | Accesso ristretto; impossibile leggere risposte altrui; test verde | — | todo |
| SECURITY-02 | SECURITY | alta | 2 | src/app/results/[id]/page.tsx | `/results/[id]` legge da Supabase lato client con anon key | Lettura dietro API/server o vincolata; test verde | SECURITY-01 | todo |
| SECURITY-03 | SECURITY | alta | 2 | src/app/api/validate-token/route.ts | Token: resistenza a enumerazione/riuso da verificare | Comportamento sicuro documentato e testato | — | todo |
| FUNC-01 | FUNC | media | 3 | src/app/questionnaire/page.tsx | Resume basato sul conteggio chiavi: fragile se le risposte non sono contigue | Resume corretto anche con risposte non contigue; e2e verde | — | todo |
| FUNC-02 | FUNC | media | 3 | src/app/questionnaire/page.tsx | Doppio submit del form finale / doppio response_id | Submit idempotente; test verde | — | todo |
| FUNC-03 | FUNC | media | 3 | src/app/questionnaire/page.tsx | Errori di rete nel salvataggio incrementale non gestiti chiaramente | Retry/feedback definito; test verde | — | todo |
| UX-01 | UX | media | 4 | src/app/questionnaire/page.tsx | Auto-avanzamento a 300ms senza poter rivedere la risposta | Possibilità di rivedere/tornare; e2e verde | — | todo |
| UX-02 | UX | media | 4 | src/app/questionnaire/page.tsx | Mobile: label troncate a 30 char con "..."; punteggi 2 e 4 senza label | Label leggibili su mobile; nessun troncamento brusco | — | todo |
| A11Y-01 | A11Y | alta | 5 | src/app/questionnaire/page.tsx | Quadratini progresso: div con onClick, non da tastiera, senza ARIA | Navigabili da tastiera con ruoli/aria corretti; axe pulito | — | todo |
| A11Y-02 | A11Y | media | 5 | src/app/questionnaire/page.tsx | Bottoni punteggio: nome accessibile gonfiato dalle label (1/3/5) e nessuna label per 2/4; tooltip nascosti su mobile | aria-label descrittive e numerali puliti; alternativa accessibile alle label | — | todo |
| A11Y-03 | A11Y | media | 5 | src/app/globals.css | Contrasto `text-tertiary #6B6890` su sfondi scuri da verificare (WCAG AA) | Contrasto AA entro palette; axe pulito | — | todo |
| A11Y-04 | A11Y | media | 5 | src/app/results/[id]/page.tsx | Radar chart senza alternativa testuale ⚠️ TOCCA SPIDER WEB | Alternativa testuale; ogni modifica al grafico APPROVATA dall'umano prima | — | todo |
| PERF-01 | PERF | bassa | 6 | src/app/layout.tsx | Meta/SEO/title/OG mancanti o default | Metadata di base presenti; build pulita | — | todo |

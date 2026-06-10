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
- `frontend-design` — task UX/A11Y (Fasi 4-5), SOLO entro i vincoli protetti.

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

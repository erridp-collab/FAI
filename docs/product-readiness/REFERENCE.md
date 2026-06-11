# REFERENCE.md — Fonte di verità per le formule Excel

Curato manualmente da `REFERENCE_RAW.md` (dump da `FAI_Microimpresa_v6(1).xlsx`).
Non modificare senza tracciare le modifiche. Ogni formula è riferita alla cella sorgente.
Ultima revisione: 2026-06-10.

---

## 1. Mappa celle → domande

La colonna F del foglio `La tua realtà` contiene i punteggi (1-5) inseriti dall'utente per ciascuna domanda, e le medie di area. La tabella seguente è ricavata leggendo i valori della colonna A (numero domanda) adiacenti a ciascuna riga F nel dump.

| Cella F | Numero domanda | Area | Conferma vs ipotesi |
|---|---|---|---|
| F13 | Q1.1 | La tua voce | Confermata (`A13 = "1.1"`) |
| F14 | Q1.2 | La tua voce | Confermata (`A14 = "1.2"`) |
| F15 | Q1.3 | La tua voce | Confermata (`A15 = "1.3"`) |
| **F16** | **AVERAGE(F13:F15)** | **Area media** | Fonte: `La tua realtà`!F16 |
| F19 | Q2.1 | I tuoi ricavi | Confermata (`A19 = "2.1"`) |
| F20 | Q2.2 | I tuoi ricavi | Confermata (`A20 = "2.2"`) |
| F21 | Q2.3 | I tuoi ricavi | Confermata (`A21 = "2.3"`) |
| F22 | Q2.4 | I tuoi ricavi | Confermata (`A22 = "2.4"`) |
| F23 | Q2.5 | I tuoi ricavi | Confermata (`A23 = "2.5"`) |
| F24 | Q2.6 | I tuoi ricavi | Confermata (`A24 = "2.6"`) |
| F25 | Q2.7 | I tuoi ricavi | Confermata (`A25 = "2.7"`) |
| **F26** | **AVERAGE(F19:F25)** | **Area media** | Fonte: `La tua realtà`!F26 |
| F29 | Q3.1 | I tuoi margini | Confermata (`A29 = "3.1"`) |
| F30 | Q3.2 | I tuoi margini | Confermata (`A30 = "3.2"`) |
| F31 | Q3.3 | I tuoi margini | Confermata (`A31 = "3.3"`) |
| F32 | Q3.4 | I tuoi margini | Confermata (`A32 = "3.4"`) |
| F33 | Q3.5 | I tuoi margini | Confermata (`A33 = "3.5"`) |
| F34 | Q3.6 | I tuoi margini | Confermata (`A34 = "3.6"`) |
| **F35** | **AVERAGE(F29:F34)** | **Area media** | Fonte: `La tua realtà`!F35 |
| F38 | Q4.1 | La tua adattabilità | Confermata (`A38 = "4.1"`) |
| F39 | Q4.2 | La tua adattabilità | Confermata (`A39 = "4.2"`) |
| F40 | Q4.3 | La tua adattabilità | Confermata (`A40 = "4.3"`) |
| F41 | Q4.4 | La tua adattabilità | Confermata (`A41 = "4.4"`) |
| **F42** | **AVERAGE(F38:F41)** | **Area media** | Fonte: `La tua realtà`!F42 |
| F45 | Q5.1 | Il tuo sistema | Confermata (`A45 = "5.1"`) |
| F46 | Q5.2 | Il tuo sistema | Confermata (`A46 = "5.2"`) |
| F47 | Q5.3 | Il tuo sistema | Confermata (`A47 = "5.3"`) |
| F48 | Q5.4 | Il tuo sistema | Confermata (`A48 = "5.4"`) |
| F49 | Q5.5 | Il tuo sistema | Confermata (`A49 = "5.5"`) |
| **F50** | **AVERAGE(F45:F49)** | **Area media** | Fonte: `La tua realtà`!F50 |
| F53 | Q6.1 | La tua rete | Confermata (`A53 = "6.1"`) |
| F54 | Q6.2 | La tua rete | Confermata (`A54 = "6.2"`) |
| F55 | Q6.3 | La tua rete | Confermata (`A55 = "6.3"`) |
| F56 | Q6.4 | La tua rete | Confermata (`A56 = "6.4"`) |
| **F57** | **AVERAGE(F53:F56)** | **Area media** | Fonte: `La tua realtà`!F57 |
| F60 | Q7.1 | Il tuo apprendimento | Confermata (`A60 = "7.1"`) |
| F61 | Q7.2 | Il tuo apprendimento | Confermata (`A61 = "7.2"`) |
| F62 | Q7.3 | Il tuo apprendimento | Confermata (`A62 = "7.3"`) |
| F63 | Q7.4 | Il tuo apprendimento | Confermata (`A63 = "7.4"`) |
| **F64** | **AVERAGE(F60:F63)** | **Area media** | Fonte: `La tua realtà`!F64 |
| **F66** | **AVERAGE(F16,F26,F35,F42,F50,F57,F64)** | **Punteggio complessivo** | Fonte: `La tua realtà`!F66 |

**Conclusione:** L'ipotesi di mapping si conferma integralmente. Nessuna correzione necessaria.

**Nota su F17, F18 (righe vuote):** Le righe 17-18 del foglio `La tua realtà` contengono intestazioni di sezione, non punteggi. Le domande dell'Area 2 iniziano a F19 (non F17). Stessa struttura per tutte le aree: c'è sempre una riga di titolo area (A) e una riga di sottotitolo tra la media precedente e la prima domanda della nuova area.

---

## 2. 7 Domande Percezione

Fonte: foglio `Prima di iniziare`, colonne A–F (righe 8–14).

| ID | Testo | Label 1 | Label 3 | Label 5 |
|---|---|---|---|---|
| p1.1 | Senti di avere una storia chiara? Qualcosa che ti rende unico e che i clienti riconoscono? | Non saprei cosa dire di speciale / non ci ho mai pensato | Sento di aver tanto da raccontare ma non riesco a raccontarmi come vorrei | Sì, conosco la mia storia, so quello che faccio e perché e i clienti mi scelgono per quello che sono |
| p1.2 | Ti senti tranquillo riguardo ai tuoi ricavi? Se un canale di vendita si chiudesse domani, cosa succederebbe? | Non sono tranquillo, dipendo da un unico canale di vendita | Ho diversi canali. Sento di poter fare di più, ma non so come/temo la complessità | Mi sento tranquillo, ho diversi canali e riserve |
| p1.3 | Quanto ti senti tranquillo sui numeri e, sai quanto guadagni davvero? Sei in regola con pagamenti, tasse, certificazioni? (Ad esempio, HACCP, norme antincendio, sicurezza sul lavoro e altri adempimenti obbligatori) | Non ho idea / non sono sicuro di essere in regola | Ho una conoscenza di base della mia situazione ma non dettagliata | So esattamente quali sono i miei margini, sono a posto con tutto |
| p1.4 | Se le cose cambiassero improvvisamente (crisi, stagione anomala, nuova legge), ti sentiresti pronto? Sapresti cosa fare? | Ogni imprevisto mette in difficoltà la mia attività | Mi servirebbe del tempo per capire come agire / avrei dubbi sulle decisioni da prendere | Ho piani B, mi adatto in fretta, mi sento preparato per rispondere ai cambiamenti. |
| p1.5 | Se per qualunque motivo non potessi lavorare per un mese, l'attività andrebbe avanti senza di te? | Si fermerebbe tutto | Continuerebbe con un certo sforzo/dovrei chiedere aiuto esterno | Funzionerebbe quasi normalmente |
| p1.6 | Ti senti parte di una rete, o lavori da solo? La comunità locale ti vede come una risorsa? | Non ci ho mai pensato / Lavoro completamente isolato | Faccio collaborazioni occasionali ma niente di strutturato | Sono parte di una rete forte, la comunità mi apprezza e viceversa |
| p1.7 | Senti che stai imparando e migliorando, o ripeti le stesse cose da anni? | Faccio le stesse cose da sempre / Ho appena iniziato | Cerco di tenermi aggiornato ma non sono sicuro di cogliere le opportunità giuste per me | Imparo continuamente, sperimento, mi confronto |

**Nota:** Le 7 domande percezione corrispondono alle 7 aree del questionario principale. Nella `Report_Logic`, le percezioni vengono lette da `Prima di iniziare`!C8–C14 rispettivamente per le aree 1–7 (celle B23–B29 di Report_Logic).

---

## 3. Obiettivi

Fonte: foglio `Prima di iniziare`, colonne A–B (righe 19–27). Blocco 2: "Scegli i 3 obiettivi più importanti per te adesso".

| ID | Testo |
|---|---|
| 2.1 | Riuscire a raccontare meglio cosa mi rende diverso e smettere di competere solo sul prezzo. |
| 2.2 | Diversificare i ricavi. Non dipendere solo da un canale di vendita o stagione. |
| 2.3 | Capire i miei numeri davvero (margini, costi, sostenibilità). |
| 2.4 | Prepararmi agli imprevisti (clima, normative, crisi, aumenti ecc). |
| 2.5 | Rendere la mia attività meno dipendente da me personalmente. |
| 2.6 | Collaborare con altre attività. Far parte di una rete. Cercare collaboratori. |
| 2.7 | Espandermi su mercati o segmenti diversi. |
| 2.8 | Imparare, migliorare, sperimentare cose nuove. |
| 2.9 | Rendere più digitale la mia attività e proteggere meglio i dati. |

**Nota:** Il foglio `Prima di iniziare` include anche un Blocco 3 ("Cosa ti preoccupa di più?", IDs 3.1–3.8) e un campo per indicare l'obiettivo 1/2/3. Questi non sono presenti in `questions.ts` e sono usati solo per la prioritizzazione delle azioni nel report (`Report_Logic` sezione F, colonna D, flag `★`).

---

## 4. 33 Domande

Fonte: foglio `La tua realtà`. Per ciascuna domanda, la colonna A contiene il numero, la colonna B il testo, la colonna C la guida ai punteggi (label 1/3/5 separate da spazi o paragrafi).

**Confronto con `questions.ts`:** Le domande nel file TypeScript coincidono integralmente con il testo e i numeri del foglio Excel per tutte le 33 domande. Il mapping `id` (1-33) → `number` ("1.1"–"7.4") → `area` è conforme. Di seguito si riportano solo le differenze rilevate (nessuna differenza testuale significativa trovata) e i punti di attenzione.

### Area 1 – La tua voce (Q1.1–Q1.3, celle F13–F15)

| N. | ID (questions.ts) | Testo (coincide con questions.ts) | Celle Excel |
|---|---|---|---|
| 1.1 | 1 | "Se ti chiedo perché un cliente dovrebbe scegliere te..." | A13–C13 |
| 1.2 | 2 | "Quando i clienti ti lasciano una recensione..." | A14–C14 |
| 1.3 | 3 | "Chi ti trova online e poi viene da te trova la stessa cosa..." | A15–C15 |

### Area 2 – I tuoi ricavi (Q2.1–Q2.7, celle F19–F25)

| N. | ID | Testo | Celle Excel |
|---|---|---|---|
| 2.1 | 4 | "Se il canale che ti porta più clienti chiudesse domani..." | A19–C19 |
| 2.2 | 5 | "Se la tipologia di clienti che ti porta più ricavi..." | A20–C20 |
| 2.3 | 6 | "Se i ricavi si azzerassero oggi, quanti mesi di spese fisse..." | A21–C21 |
| 2.4 | 7 | "I tuoi ricavi sono distribuiti nell'anno o concentrati in pochi mesi?" | A22–C22 |
| 2.5 | 8 | "Un cliente che ti trova online può prenotare o acquistare direttamente da te..." | A23–C23 |
| 2.6 | 9 | "Su 100 euro di ricavi, quanti arrivano da clienti che comprano direttamente da te..." | A24–C24 |
| 2.7 | 10 | "Se volessi contattare i tuoi clienti domani..." | A25–C25 |

### Area 3 – I tuoi margini (Q3.1–Q3.6, celle F29–F34)

| N. | ID | Testo | Celle Excel |
|---|---|---|---|
| 3.1 | 11 | "Alla fine del mese, sai quanto ti rimane davvero..." | A29–C29 |
| 3.2 | 12 | "Se arrivasse un controllo domani (CIN, sicurezza, GDPR, HACCP, antincendio etc.)..." | A30–C30 |
| 3.3 | 13 | "Sai qual è il prodotto o servizio su cui guadagni di più..." | A31–C31 |
| 3.4 | 14 | "Riesci a dire, senza andare a controllare, quali sono le tue spese più alte..." | A32–C32 |
| 3.5 | 15 | "Se domani succedesse un danno serio alla tua attività..." | A33–C33 |
| 3.6 | 16 | "Sei in regola con le ultime scadenze fiscali e contributive (IVA, INPS, imposte sul reddito, acconti)?" | A34–C34 |

**Nota su H35:** Il dump mostra `H35 = IFERROR(AVERAGE(H29:H33),"")` — la colonna H è la versione normalizzata 0-4 (formula `=F-1`). `H35` copre solo H29:H33 (Q3.1–Q3.5), escludendo H34 (Q3.6). Questo sembra un errore nella colonna H del foglio Excel. La colonna F corretta `F35 = AVERAGE(F29:F34)` include tutte e 6 le domande. **Non impatta il calcolo del punteggio area** (che usa F35), ma è una anomalia nel foglio da segnalare.

### Area 4 – La tua adattabilità (Q4.1–Q4.4, celle F38–F41)

| N. | ID | Testo | Celle Excel |
|---|---|---|---|
| 4.1 | 17 | "Quando noti che i bisogni dei clienti cambiano..." | A38–C38 |
| 4.2 | 18 | "Se da domani un imprevisto ti impedisse di lavorare normalmente per due settimane..." | A39–C39 |
| 4.3 | 19 | "Se i tuoi clienti locali/abituali smettessero di venire..." | A40–C40 |
| 4.4 | 20 | "Se arrivasse un cliente straniero con un problema da risolvere..." | A41–C41 |

### Area 5 – Il tuo sistema (Q5.1–Q5.5, celle F45–F49)

| N. | ID | Testo | Celle Excel |
|---|---|---|---|
| 5.1 | 21 | "Se da domani mattina non potessi occuparti della tua attività per un mese..." | A45–C45 |
| 5.2 | 22 | "Se perdessi il telefono domani, quanto tempo ti costerebbe ritrovare le informazioni..." | A46–C46 |
| 5.3 | 23 | "Se qualcuno ti chiedesse come proteggi i dati dei tuoi clienti, sapresti rispondere con precisione?" | A47–C47 |
| 5.4 | 24 | "Quanto sei attento alla sostenibilità ambientale nella gestione quotidiana?" | A48–C48 |
| 5.5 | 25 | "C'è qualcosa nella tua struttura che sai che va sistemato ma che rimandi da tempo?" | A49–C49 |

### Area 6 – La tua rete (Q6.1–Q6.4, celle F53–F56)

| N. | ID | Testo | Celle Excel |
|---|---|---|---|
| 6.1 | 26 | "Hai accordi, anche informali, con altri operatori locali per mandarvi clienti a vicenda?" | A53–C53 |
| 6.2 | 27 | "Se chiedessi a tre persone del territorio cosa pensano della tua attività..." | A54–C54 |
| 6.3 | 28 | "Quando un cliente ti chiede dove mangiare, dove comprare, cosa fare ecc hai una risposta pronta..." | A55–C55 |
| 6.4 | 29 | "Sai cosa sta succedendo nel tuo territorio (bandi, progetti, decisioni che potrebbero riguardarti)..." | A56–C56 |

### Area 7 – Il tuo apprendimento (Q7.1–Q7.4, celle F60–F63)

| N. | ID | Testo | Celle Excel |
|---|---|---|---|
| 7.1 | 30 | "Raccogli e usi le opinioni dei clienti (recensioni, commenti, critiche, domande o osservazioni dirette)..." | A60–C60 |
| 7.2 | 31 | "Negli ultimi dodici mesi hai provato qualcosa che non avevi mai fatto prima..." | A61–C61 |
| 7.3 | 32 | "Negli ultimi dodici mesi hai imparato qualcosa di nuovo che hai poi usato davvero?" | A62–C62 |
| 7.4 | 33 | "Sai cosa fa meglio di te il tuo competitor più forte? E come usi queste informazioni?" | A63–C63 |

---

## 5. 7 Aree

Fonte: foglio `La tua realtà` (celle F con formula AVERAGE) e foglio `Report_Logic` (B5–B11 che referenziano tali celle).

| Area | Domande | Formula area | Cella fonte |
|---|---|---|---|
| La tua voce | Q1.1, Q1.2, Q1.3 | `=IFERROR(AVERAGE(F13:F15),"")` | `La tua realtà`!F16 |
| I tuoi ricavi | Q2.1–Q2.7 | `=IFERROR(AVERAGE(F19:F25),"")` | `La tua realtà`!F26 |
| I tuoi margini | Q3.1–Q3.6 | `=IFERROR(AVERAGE(F29:F34),"")` | `La tua realtà`!F35 |
| La tua adattabilità | Q4.1–Q4.4 | `=IFERROR(AVERAGE(F38:F41),"")` | `La tua realtà`!F42 |
| Il tuo sistema | Q5.1–Q5.5 | `=IFERROR(AVERAGE(F45:F49),"")` | `La tua realtà`!F50 |
| La tua rete | Q6.1–Q6.4 | `=IFERROR(AVERAGE(F53:F56),"")` | `La tua realtà`!F57 |
| Il tuo apprendimento | Q7.1–Q7.4 | `=IFERROR(AVERAGE(F60:F63),"")` | `La tua realtà`!F64 |

**Punteggio complessivo:**
- Cella: `La tua realtà`!F66
- Formula: `=IFERROR(AVERAGE(F16,F26,F35,F42,F50,F57,F64),"")`
- Semantica: media aritmetica semplice delle 7 medie di area.
- **Non implementato nel codice** (`scoring.ts` non espone il punteggio complessivo come valore diretto, né la funzione `calculateResults` lo calcola e restituisce come campo separato).

**Meta-indicatori derivati (Report_Logic):**
- `Media CARATTERE` (B13): `=IFERROR(AVERAGE(B5,B10,B11),"")` = media(voce, rete, apprendimento) — usata per la selezione profilo apertura.
- `Media RISCHIO` (B14): `=IFERROR(AVERAGE(B6,B7,B8,B9),"")` = media(ricavi, margini, adattabilità, sistema) — usata per la selezione profilo apertura.
- **Non implementati nel codice.**

---

## 6. Indicatori Compositi

Ci sono **due fogli** che definiscono gli indicatori compositi con formule identiche ma nomi leggermente diversi:
- Foglio `Report_Logic` (B13–B21): usato per la selezione dei testi del report dinamico.
- Foglio `Risultati` (righe 14–20): presentati all'utente nella sezione "INDICATORI DI CONTROLLO".

I valori numerici sono identici tra i due fogli (Risultati li calcola direttamente, Report_Logic li referenzia internamente). Si riportano le formule dal foglio `Risultati` (più diretto) con riferimento incrociato al foglio `Report_Logic`.

### 6.1 Identità

| Attributo | Valore |
|---|---|
| Nome in Report_Logic | "Indicatore Identità" (B15) |
| Nome in Risultati | "Identità" (A14) |
| Cella Report_Logic | B15 |
| Cella Risultati | B14 |
| Formula Excel (Report_Logic B15) | `=IFERROR((F13+F14+F15+F54*0.5)/3.5,"")` |
| Formula Excel (Risultati B14) | `=IFERROR((F13+F14+F15+F54*0.5)/3.5,"")` (identica) |
| In Q-numbers | `(Q1.1 + Q1.2 + Q1.3 + Q6.2×0.5) / 3.5` |
| Gate | `≤2.5 → WARN` (Report_Logic D51) |
| **Confronto col codice** | **Coincide.** `scoring.ts` linea 66: `(getQ("1.1") + getQ("1.2") + getQ("1.3") + getQ("6.2") * 0.5) / 3.5` |

### 6.2 Tenuta dell'attività / Sopravvivenza

| Attributo | Valore |
|---|---|
| Nome in Report_Logic | "Indicatore Tenuta dell'attività" (A16) |
| Nome in Risultati | "Sopravvivenza" (A15) |
| Cella Report_Logic | B16 |
| Cella Risultati | B15 |
| Formula Excel (Report_Logic B16) | `=IFERROR((F26+F35)/2,"")` |
| Formula Excel (Risultati B15) | `=IFERROR((F26+F35)/2,"")` (identica) |
| In Q-numbers | `(AVERAGE(Q2.1–Q2.7) + AVERAGE(Q3.1–Q3.6)) / 2` |
| Gate | `≤2 → KO` (Report_Logic D52) |
| **Confronto col codice** | **Coincide** (logica equivalente). `scoring.ts` linee 68–70: `tenutaAttivita = (scoreRicavi + scoreMargini) / 2`. |
| **Attenzione** | Il nome in `Report_Logic` è "Tenuta dell'attività", in `Risultati` è "Sopravvivenza". Il codice usa `tenutaAttivita`. |

### 6.3 Liquidità

| Attributo | Valore |
|---|---|
| Nome in Report_Logic | "Indicatore Liquidità" (A17) |
| Nome in Risultati | "Liquidità" (A16) |
| Cella Report_Logic | B17 |
| Cella Risultati | B16 |
| Formula Excel (Report_Logic B17) | `=IFERROR(F21,"")` |
| Formula Excel (Risultati B16) | `=IFERROR(F21,"")` (identica) |
| In Q-numbers | `Q2.3` (risposta singola, nessuna media) |
| Gate | `≤2 → KO` (Report_Logic D53) |
| **Confronto col codice** | **Coincide.** `scoring.ts` linea 72: `const liquidita = getQ("2.3")` |

### 6.4 Resilienza operativa

| Attributo | Valore |
|---|---|
| Nome in Report_Logic | "Indicatore Resilienza operativa" (A18) |
| Nome in Risultati | "Resilienza operativa" (A17) |
| Cella Report_Logic | B18 |
| Cella Risultati | B17 |
| Formula Excel (Report_Logic B18) | `=IFERROR((F45+F48*0.5+F49+F53+F54+F55*0.5+F56)/6,"")` |
| Formula Excel (Risultati B17) | `=IFERROR((F45+F48*0.5+F49+F53+F54+F55*0.5+F56)/6,"")` (identica) |
| In Q-numbers | `(Q5.1 + Q5.4×0.5 + Q5.5 + Q6.1 + Q6.2 + Q6.3×0.5 + Q6.4) / 6` |
| Gate | `≤2.5 → WARN` (Report_Logic D54) |
| **Confronto col codice** | **Coincide.** `scoring.ts` linee 74–82: `(getQ("5.1") + getQ("5.4")*0.5 + getQ("5.5") + getQ("6.1") + getQ("6.2") + getQ("6.3")*0.5 + getQ("6.4")) / 6` |

### 6.5 Digital Readiness (Preparazione digitale)

| Attributo | Valore |
|---|---|
| Nome in Report_Logic | "Indicatore Preparazione digitale" (A19) |
| Nome in Risultati | "Digital Readiness" (A18) |
| Cella Report_Logic | B19 |
| Cella Risultati | B18 |
| Formula Excel (Report_Logic B19) | `=IFERROR((F46+F47+F60*0.5+F23*0.5+F25*0.5)/3.5,"")` |
| Formula Excel (Risultati B18) | `=IFERROR((F46+F47+F60*0.5+F23*0.5+F25*0.5)/3.5,"")` (identica) |
| In Q-numbers | `(Q5.2 + Q5.3 + Q7.1×0.5 + Q2.5×0.5 + Q2.7×0.5) / 3.5` |
| Gate | `≤2.5 → WARN` (Report_Logic D55) |
| **Confronto col codice** | **Coincide.** `scoring.ts` linee 84–90: `(getQ("5.2") + getQ("5.3") + getQ("7.1")*0.5 + getQ("2.5")*0.5 + getQ("2.7")*0.5) / 3.5` |

### 6.6 Compliance e protezione (Regole, sicurezza e assicurazioni)

| Attributo | Valore |
|---|---|
| Nome in Report_Logic | "Indicatore Regole, sicurezza e assicurazioni" (A20) |
| Nome in Risultati | "Compliance e protezione" (A19) |
| Cella Report_Logic | B20 |
| Cella Risultati | B19 |
| Formula Excel (Report_Logic B20) | `=IFERROR((F30+F33+F34+F47)/4,"")` |
| Formula Excel (Risultati B19) | `=IFERROR((F30+F33+F34+F47)/4,"")` (identica) |
| In Q-numbers | `(Q3.2 + Q3.5 + Q3.6 + Q5.3) / 4` |
| Gate | `≤2 → KO; ≤3 → WARN` (Report_Logic D56) |
| **Confronto col codice** | **Coincide.** `scoring.ts` linee 92–97: `(getQ("3.2") + getQ("3.5") + getQ("3.6") + getQ("5.3")) / 4` |

### 6.7 Capacità di evoluzione

| Attributo | Valore |
|---|---|
| Nome in Report_Logic | "Indicatore Capacità di evoluzione" (A21) |
| Nome in Risultati | "Capacità di evoluzione" (A20) |
| Cella Report_Logic | B21 |
| Cella Risultati | B20 |
| Formula Excel (Report_Logic B21) | `=IFERROR((F42+F64)/2,"")` |
| Formula Excel (Risultati B20) | `=IFERROR((F42+F64)/2,"")` (identica) |
| In Q-numbers | `(AVERAGE(Q4.1–Q4.4) + AVERAGE(Q7.1–Q7.4)) / 2` |
| Gate | `≤2.5 → WARN` (Report_Logic D57) |
| **Confronto col codice** | **Coincide** (logica equivalente). `scoring.ts` linee 99–101: `(scoreAdattabilita + scoreApprendimento) / 2` |

### 6.8 Media CARATTERE e Media RISCHIO (non implementati)

| Attributo | Valore |
|---|---|
| Nome | "Media CARATTERE (Aree 1,6,7)" |
| Cella | `Report_Logic`!B13 |
| Formula | `=IFERROR(AVERAGE(B5,B10,B11),"")` |
| In Q-numbers | `AVERAGE(area_voce, area_rete, area_apprendimento)` |
| **Confronto col codice** | **Non implementato nel codice.** Usata per selezione profilo apertura in Report_Logic B34. |

| Attributo | Valore |
|---|---|
| Nome | "Media RISCHIO (Aree 2,3,4,5)" |
| Cella | `Report_Logic`!B14 |
| Formula | `=IFERROR(AVERAGE(B6,B7,B8,B9),"")` |
| In Q-numbers | `AVERAGE(area_ricavi, area_margini, area_adattabilita, area_sistema)` |
| **Confronto col codice** | **Non implementato nel codice.** Usata per selezione profilo apertura in Report_Logic B34. |

### 6.9 Punteggio complessivo F66

| Attributo | Valore |
|---|---|
| Cella | `La tua realtà`!F66 (referenziata in `Risultati`!D10 e `Report_Logic`!B12) |
| Formula | `=IFERROR(AVERAGE(F16,F26,F35,F42,F50,F57,F64),"")` |
| Semantica | Media aritmetica semplice delle 7 medie di area (1-5) |
| **Confronto col codice** | **Non implementato direttamente.** `calculateResults` restituisce `areaScores` ma non calcola esplicitamente questa media. Se calcolato dal chiamante come `AVERAGE(Object.values(areaScores))`, il risultato è equivalente solo se tutte le 7 aree hanno risposte (la media semplice coincide solo quando tutti i gruppi hanno lo stesso peso, il che non è garantito se mancano domande). |

---

## 7. Soglie Livelli

### 7.1 Livelli per le 7 Aree (scala 1-5)

Fonte: `Report_Logic`!A37 (header esplicito) e celle B39–B45 e B73–B79; `Risultati`!C3–C9.

| Soglia | Nome livello | Operatore |
|---|---|---|
| score ≤ 2.25 | Vulnerabile | `<=2.25` |
| score < 3.00 | In costruzione | `<3` |
| score < 3.50 | Sufficiente | `<3.5` |
| score < 4.00 | Solido | `<4` |
| score ≤ 5.00 | Forte | else (≥4) |

Citazione testuale da `Report_Logic`!A37:
> "C — LE 7 AREE | Livelli: ≤2.25 Vulnerabile / <3 In costruzione / <3.5 Sufficiente / <4 Solido / ≤5 Forte"

### 7.2 Livelli per gli Indicatori Compositi (scala 1-5)

Fonte: `Report_Logic`!A49 (header esplicito), celle C51–C57; `3_Subindici`!A3.

| Soglia | Nome livello | Operatore |
|---|---|---|
| score ≤ 1.5 | Fragile | `<=1.5` |
| score ≤ 2.5 | Vulnerabile | `<=2.5` |
| score > 2.5 | Adeguata | `>2.5` (cioè `<=3.5`) |
| score > 3.5 | Solida | `>3.5` |

Citazione testuale da `Report_Logic`!A49:
> "D — INDICATORI DI CONTROLLO | 7 gate non compensativi | Livelli: ≤1.5 Fragile / ≤2.5 Vulnerabile / >2.5 Adeguata / >3.5 Solida"

Citazione testuale da `3_Subindici`!A3:
> "Livelli: ≤1.5 (Fragile) ≤2.5 (Vulnerabile) >2.5 (Adeguata) >3.5 (Solida)"

### 7.3 Livelli per le Azioni Prioritarie (Report_Logic sezione F)

Fonte: celle `Report_Logic`!C73–C79 (formula ripetuta per ciascuna area).

| Soglia | Nome | Operatore |
|---|---|---|
| score ≤ 1.5 | Critico | `<=1.5` |
| score ≤ 2.5 | Attenzione | `<=2.5` |
| score > 2.5 | Solido | `>2.5` (cioè `<=3.5`) |
| score > 3.5 | Forte | `>3.5` |

(Esempio cella `Report_Logic`!C73: `=IFERROR(IF(B5="","",IF(B5<=1.5,"≤1.5 (Critico)",IF(B5<=2.5,"≤2.5 (Attenzione)",IF(B5<=3.5,">2.5 (Solido)",">3.5 (Forte)")))),"")`

### 7.4 DISCREPANZA CRITICA con il codice

Il codice `scoring.ts` implementa `getLevelFromScore` con soglie completamente diverse:

```typescript
// scoring.ts - ATTUALE (NON CORRISPONDE ALL'EXCEL)
if (score < 2) return "Critico";
if (score < 3.5) return "Attenzione";
if (score < 4.5) return "Solido";
return "Eccellente";
```

**Excel (7 aree):** 5 livelli: Vulnerabile / In costruzione / Sufficiente / Solido / Forte
**Excel (compositi):** 4 livelli: Fragile / Vulnerabile / Adeguata / Solida
**Excel (azioni):** 4 livelli: Critico / Attenzione / Solido / Forte (simile al codice ma soglie diverse)
**Codice:** 4 livelli: Critico / Attenzione / Solido / Eccellente (soglie `<2 / <3.5 / <4.5 / ≥4.5`)

Confronto soglie per azioni/aree (la funzione `getLevelFromScore` del codice è la più vicina):

| Soglia | Excel (azioni) | Codice |
|---|---|---|
| Prima soglia | ≤1.5 Critico | <2 Critico |
| Seconda soglia | ≤2.5 Attenzione | <3.5 Attenzione |
| Terza soglia | >2.5 Solido (≤3.5) | <4.5 Solido |
| Quarta soglia | >3.5 Forte | ≥4.5 Eccellente |

- La prima soglia del codice (`<2`) vs Excel (`≤1.5`): un punteggio di 1.6 sarebbe "Attenzione" per Excel ma "Critico" per il codice.
- La seconda soglia del codice (`<3.5`) vs Excel (`≤2.5`): la zona tra 2.6 e 3.4 è "Solido" per Excel ma "Attenzione" per il codice.
- Il codice non ha l'equivalente di "In costruzione" o "Sufficiente" per le 7 aree.
- Il codice usa "Eccellente" (≥4.5), livello che non esiste nel foglio Excel.

---

## 8. Report: Rischio Inerzia

Fonte: foglio `5_RischioInerzia` (righe 1-38) e `Risultati` sezione 4 (righe 32-40).

Il foglio `5_RischioInerzia` contiene 7 aree × 5 bande di punteggio = 35 testi (C4–C38). Ogni testo descrive il rischio di non intervenire su una data area a un dato livello di punteggio.

**Logica di selezione (da `Risultati`!A32):**
> "4 · COSA RISCHI SE NON INTERVIENI · Soglie: ≤2.25 / <3 / <3.5 / <4 / ≤5"

Le stesse soglie delle 7 aree (sezione 7.1). Formula tipo (per Area 1, `Risultati`!B34):
```
=IFERROR(IF(F16="","",IF(F16<=2.25,'5_RischioInerzia'!C4,
  IF(F16<3,'5_RischioInerzia'!C5,
  IF(F16<3.5,'5_RischioInerzia'!C6,
  IF(F16<4,'5_RischioInerzia'!C7,'5_RischioInerzia'!C8))))),"")
```

I testi sono documentati integralmente nel `REFERENCE_RAW.md` (righe 1169–1278). Implementazione futura.

---

## 9. Report: Azioni

Fonte: foglio `6_Azioni` (righe 1-38) e `Risultati` sezione 5 (righe 42-50), `Report_Logic` sezione F (righe 72-79).

Il foglio `6_Azioni` contiene 7 aree × 5 livelli di priorità = 35 testi operativi (C4–C38). Le stesse soglie di `5_RischioInerzia` (≤2.25 Urgente / <3 Alta / <3.5 Media / <4 Bassa / ≤5 Mantenimento e sviluppo).

**Logica priorità con flag obiettivi (Report_Logic sezione F, colonna D):**
Le aree che corrispondono agli obiettivi dichiarati dall'utente in "Prima di iniziare" Blocco 2+3 ricevono il flag `★` e vengono presentate prima nel report. Questa logica non è implementata nel codice.

**Formula selezione testo azione** (tipo, per Area 1):
```
=IFERROR(IF(F16="","",IF(F16<=2.25,'6_Azioni'!C4,
  IF(F16<3,'6_Azioni'!C5,
  IF(F16<3.5,'6_Azioni'!C6,
  IF(F16<4,'6_Azioni'!C7,'6_Azioni'!C8))))),"")
```

I testi completi (molto estesi) sono nei fogli nascosti. Documentazione completa: `REFERENCE_RAW.md` righe 1280–1394. Implementazione futura.

---

## 10. Analisi Percezione vs Realtà

Fonte: foglio `4_PercAnalisi`, `Report_Logic` sezione E (righe 60–68), `Risultati` sezione 3 (righe 22–30).

**Logica generale:**
- Si calcola il gap: `Analisi − Percezione` (punteggio area F − punteggio percezione C da "Prima di iniziare").
- Il testo viene attivato solo se `|gap| ≥ 1.5`.
- Direzione negativa (Analisi < Percezione): "Ti sentivi meglio di quanto emerge" → testo tipo "Percezione > Analisi".
- Direzione positiva (Analisi > Percezione): "Stavi sottovalutando" → testo tipo "Percezione < Analisi".

**Formula tipo** (Report_Logic B62, per Area 1 "La tua voce"):
```
=IFERROR(IF(OR(B5="",B23=""),"(percezione non compilata)",
  IF(ABS(B5-B23)<1.5,"Gap < 1.5",
  IF(B5-B23<0,"Percezione > Analisi (gap="&TEXT(B5-B23,"0.00")&")",
  "Percezione < Analisi (gap="&TEXT(B5-B23,"+0.00")&")"))),"")
```

Le percezioni sono lette da `Prima di iniziare`!C8–C14 per le aree 1–7 (rispettivamente `Report_Logic`!B23–B29).

Il foglio `4_PercAnalisi` contiene 7 aree × 2 direzioni = 14 testi (C5–C24). I testi completi sono in `REFERENCE_RAW.md` righe 1106–1163. Implementazione futura.

---

## 11. Discrepanze codice vs Excel (per Fase 1)

Elenco di tutte le discrepanze trovate tra `scoring.ts` / `questions.ts` e l'Excel, phrased come finding azionabile.

### CRITICO

- **[D-01] Soglie livelli completamente diverse.** `getLevelFromScore` usa `<2 Critico / <3.5 Attenzione / <4.5 Solido / ≥4.5 Eccellente`. Excel usa per le 7 aree: `≤2.25 Vulnerabile / <3 In costruzione / <3.5 Sufficiente / <4 Solido / ≥4 Forte` (5 livelli); per i compositi: `≤1.5 Fragile / ≤2.5 Vulnerabile / >2.5 Adeguata / >3.5 Solida` (4 livelli). **Il codice deve implementare due sistemi di soglie separati** (uno per le 7 aree, uno per i compositi) e nessuno dei due corrisponde all'attuale `getLevelFromScore`.

- **[D-02] Punteggio complessivo non calcolato esplicitamente.** Excel: `F66 = AVERAGE(F16, F26, F35, F42, F50, F57, F64)`. Il codice non restituisce questo valore come campo del risultato. Il chiamante deve ricavarlo da `areaScores`, ma senza garanzia che tutte e 7 le aree abbiano risposte.

### ATTENZIONE

- **[D-03] Tipo Level "Eccellente" non esiste in Excel.** Il tipo `Level = "Critico" | "Attenzione" | "Solido" | "Eccellente"` contiene "Eccellente" che non compare in nessuno dei sistemi di soglie Excel. Il livello superiore nelle azioni è "Forte", nei compositi "Solida", nelle 7 aree "Forte".

- **[D-04] Nome indicatore: "Tenuta dell'attività" vs "Sopravvivenza".** In `Report_Logic` il nome è "Indicatore Tenuta dell'attività" (A16), in `Risultati` il nome presentato all'utente è "Sopravvivenza" (A15). Il codice usa il campo `tenutaAttivita`. Verificare quale nome deve apparire nell'UI.

- **[D-05] Nome indicatore: "Preparazione digitale" vs "Digital Readiness".** `Report_Logic` usa "Preparazione digitale" (A19), `Risultati` usa "Digital Readiness" (A18). Il codice usa `digitalReadiness`.

- **[D-06] Media CARATTERE e Media RISCHIO non implementate.** Queste due medie (`Report_Logic`!B13, B14) sono usate per la selezione del profilo di apertura del report (Profili 1–6). Non esistono in `calculateResults`. Se il report personalizzato verrà implementato, occorre aggiungere queste due variabili.

- **[D-07] Punteggio complessivo non nella firma di ritorno.** `ScoringResult` non include un campo `punteggioComplessivo`. Aggiungere `overallScore: number` come `AVERAGE(areaScores values)`.

### INFORMATIVO (non impattano Fase 1 ma da tracciare)

- **[D-08] Sezione Percezione vs Realtà non implementata.** La logica gap `|analisi − percezione| ≥ 1.5` e i 14 testi di `4_PercAnalisi` non sono nel codice. Implementazione futura.

- **[D-09] Sezione Rischio Inerzia non implementata.** I 35 testi di `5_RischioInerzia` non sono nel codice. Implementazione futura.

- **[D-10] Sezione Azioni non implementata.** I 35 testi operativi di `6_Azioni` e la logica di prioritizzazione con flag `★` non sono nel codice. Implementazione futura.

- **[D-11] Profili apertura (1_Apertura) non implementati.** La selezione del profilo da B34 di `Report_Logic` (6 profili basati su Media CARATTERE, Media RISCHIO, punteggio complessivo) non è nel codice. Implementazione futura.

- **[D-12] Gate non compensativi non implementati.** Ogni indicatore composito ha un gate (`KO` o `WARN`) che segnala criticità indipendentemente dal punteggio complessivo. I gate sono definiti in `Report_Logic`!D51–D57. Non sono esposti nel `ScoringResult`.

- **[D-13] Anomalia in H35 Excel.** La cella `La tua realtà`!H35 contiene `=IFERROR(AVERAGE(H29:H33),"")` che esclude H34 (Q3.6 normalizzato). La colonna H è la versione 0-4 dei punteggi (non usata dal codice) ma l'anomalia potrebbe indicare un errore di copia nel foglio originale. **Non impatta il codice** (che usa F35 corretto).

- **[D-14] Prodotti Alva suggeriti (foglio "Prodotti Alva") non implementati.** Il foglio contiene trigger per suggerire prodotti Alva specifici in base a punteggi singoli (es. F23≤2 → alva.travel). Non nel codice.

---

*Questo documento è la fonte di verità per le formule. Ogni formula è tracciabile a una cella specifica in `REFERENCE_RAW.md`. Non ci sono formule inventate: ove sussistesse ambiguità è stato usato il marker `⚠️ DA CHIARIRE`.*

*Nessun `⚠️ DA CHIARIRE` è stato necessario per le formule principali: tutte le 7 medie di area, tutte le 7 formule composite, le soglie di livello e il punteggio complessivo sono stati verificati cella per cella nel dump.*

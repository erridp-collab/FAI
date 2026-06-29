# Flusso Test Condiviso

Questo progetto supporta un flusso di test separato dal flusso reale dei clienti paganti.

## Obiettivo

Permettere a piu tester di compilare il questionario usando un accesso condiviso, salvando tutto su tabelle dedicate di test in Supabase.

Il flusso test:

- non salva nelle tabelle reali dei clienti
- non richiede token individuali per ogni tester
- permette di esportare tutte le compilazioni di test da un unico contenitore dati

## Tabelle usate

Flusso reale:

- `access_tokens`
- `fai_responses`

Flusso test:

- `access_tokens_test`
- `fai_responses_test`

## Regola di attivazione

Il flusso test si attiva quando il token fornito su `/start` viene trovato in `access_tokens_test`.

In pratica, la URL da usare e:

```text
/start?token=<TOKEN_TEST_CONDIVISO>
```

Non scrivere il token condiviso nei documenti pubblici o nel materiale distribuito oltre il gruppo dei tester.

## Come funziona

1. Il tester apre la route `/start` con un token condiviso di test.
2. La pagina [src/app/start/page.tsx](/C:/Users/Enrico/Desktop/FAI/src/app/start/page.tsx:1) chiama `POST /api/validate-token`.
3. L'API [src/app/api/validate-token/route.ts](/C:/Users/Enrico/Desktop/FAI/src/app/api/validate-token/route.ts:1) cerca prima il token in `access_tokens_test`.
4. Se il token e valido, la sessione browser viene marcata come test session.
5. Il questionario [src/app/questionnaire/page.tsx](/C:/Users/Enrico/Desktop/FAI/src/app/questionnaire/page.tsx:1) salva ogni avanzamento nel DB test tramite `POST /api/save-progress`.
6. L'API [src/app/api/save-progress/route.ts](/C:/Users/Enrico/Desktop/FAI/src/app/api/save-progress/route.ts:1) usa `fai_responses_test`.
7. La pagina risultati [src/app/results/[id]/page.tsx](/C:/Users/Enrico/Desktop/FAI/src/app/results/[id]/page.tsx:1) legge dal ramo test tramite `GET /api/results/[id]`.

## Comportamenti importanti

### Accesso corretto

Questa combinazione salva nel DB test:

```text
/start?token=<TOKEN_TEST_CONDIVISO>
```

### Accesso diretto al questionario

Questa combinazione non usa il token condiviso test:

```text
/questionnaire?dev=1
```

Se si entra direttamente nel questionario senza passare da `/start`, il progetto usa il fallback locale di sviluppo e non la sessione DB test.

### Token decide il ramo

La query string non decide piu se una sessione e test o reale.

La regola e:

- token trovato in `access_tokens_test` -> sessione test
- token trovato in `access_tokens` -> sessione reale

## Perche un solo token condiviso funziona

Nel flusso reale, un token e pensato per un singolo accesso cliente.

Nel flusso test, invece:

- piu persone possono usare lo stesso token
- ogni browser/sessione crea la propria risposta in `fai_responses_test`
- i tester non si sovrascrivono tra loro

Questo permette di raccogliere molte compilazioni di prova usando un solo accesso condiviso.

## Cosa esportare

Per recuperare i dati di test, esportare da:

- `fai_responses_test`

Non esportare da `fai_responses` se l'obiettivo e analizzare solo le prove dei tester.

## Requisiti ambiente locale

Per il salvataggio server-side servono:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Senza `SUPABASE_SERVICE_ROLE_KEY`, il backend non puo leggere e scrivere il ramo test su Supabase.

`NEXT_PUBLIC_ALLOW_DEV_MODE=1` serve solo se vuoi mantenere anche il fallback locale tecnico su `/questionnaire?dev=1`.

## File di supporto

Setup SQL del flusso test:

- [supabase/test-mode-setup.sql](/C:/Users/Enrico/Desktop/FAI/supabase/test-mode-setup.sql:1)

Helper di selezione tabelle/token:

- [src/utils/test-mode.ts](/C:/Users/Enrico/Desktop/FAI/src/utils/test-mode.ts:1)

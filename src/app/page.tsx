import Link from "next/link";

const isDev = process.env.NODE_ENV === "development";

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-primary">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-20">
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

        <section className="bg-surface border border-raised rounded-2xl p-8 space-y-3">
          <h2 className="text-xs font-semibold text-accent-surface uppercase tracking-wider">
            Per chi
          </h2>
          <p className="text-primary leading-relaxed">
            Per te che gestisci un&apos;attività, qualsiasi attività. Un B&amp;B, una casa
            vacanze, un ristorante, una bottega, un agriturismo, un negozio, un
            servizio collegato in maniera diretta o indiretta con il turismo.
          </p>
          <p className="text-secondary text-sm">
            Non serve esperienza tecnica: se conosci la tua attività, puoi compilarlo.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xs font-semibold text-accent-surface uppercase tracking-wider">
            Come funziona
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Prima di iniziare",
                desc: "7 domande su come ti senti rispetto alla tua attività. Circa 5 minuti.",
              },
              {
                step: "02",
                title: "La tua realtà",
                desc: "33 domande su 7 aree chiave della tua attività. Circa 10-15 minuti.",
              },
              {
                step: "03",
                title: "I risultati",
                desc: "Lo spider web dei tuoi punteggi subito. Il report completo via email entro 3 giorni lavorativi.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-surface rounded-2xl p-6 border border-raised space-y-3"
              >
                <div className="text-3xl font-bold text-accent-surface/30">{step}</div>
                <h3 className="font-semibold text-primary">{title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-accent-surface uppercase tracking-wider">
            Le 7 aree analizzate
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              "La tua voce",
              "I tuoi ricavi",
              "I tuoi margini",
              "La tua adattabilità",
              "Il tuo sistema",
              "La tua rete",
              "Il tuo apprendimento",
            ].map((area) => (
              <div
                key={area}
                className="bg-surface border border-raised rounded-xl px-4 py-3 text-sm text-accent-surface font-medium"
              >
                {area}
              </div>
            ))}
          </div>
        </section>

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
          <form
            action="/start"
            method="get"
            className="relative z-10 max-w-xl mx-auto w-full space-y-3"
          >
            <label
              htmlFor="token"
              className="block text-left text-tertiary text-xs uppercase tracking-wider"
            >
              Inserisci il tuo token
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="token"
                name="token"
                type="text"
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="ALVA-XXXXXXXX"
                className="flex-1 rounded-xl border border-raised bg-canvas/80 px-4 py-3 text-sm text-primary placeholder:text-tertiary outline-none transition-colors focus:border-accent-surface"
              />
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(74,63,140,0.4)] transition-colors hover:bg-accent/80"
              >
                Accedi
              </button>
            </div>
          </form>
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
      </div>

      {isDev && (
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <div className="border-t border-raised pt-8 text-center">
            <p className="text-tertiary text-xs mb-3 uppercase tracking-wider">
              Modalità sviluppo
            </p>
            <Link
              href="/questionnaire?dev=1"
              className="inline-block px-6 py-3 bg-gold/10 border border-gold/30 text-gold text-sm font-semibold rounded-xl hover:bg-gold/20 transition-colors"
            >
              Testa il questionario (dev mode) →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

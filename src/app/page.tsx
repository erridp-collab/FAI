import Link from "next/link";

const isDev = process.env.NODE_ENV === "development";

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-primary">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-20">

        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent-surface text-sm font-medium tracking-wide">
            Diagnosi per microimprese
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Quanto è solida<br />
            <span className="text-accent-surface">la tua attività?</span>
          </h1>
          <p className="text-secondary text-lg max-w-xl mx-auto leading-relaxed">
            Ti dice quanto regge la tua attività se qualcosa cambia o va male. Non è un esame: è una diagnosi onesta basata sui tuoi dati, costruita su misura per le piccole imprese.
          </p>
        </section>

        {/* Per chi */}
        <section className="bg-surface border border-raised rounded-2xl p-8 space-y-3">
          <h2 className="text-xs font-semibold text-accent-surface uppercase tracking-wider">Per chi</h2>
          <p className="text-primary leading-relaxed">
            Per te che gestisci un'attività — qualsiasi attività. Un B&B, una casa vacanze, un ristorante, una bottega, un agriturismo, un negozio, un servizio collegato in maniera diretta o indiretta con il turismo.
          </p>
          <p className="text-secondary text-sm">
            Non serve esperienza tecnica: se conosci la tua attività, puoi compilarlo.
          </p>
        </section>

        {/* Come funziona */}
        <section className="space-y-6">
          <h2 className="text-xs font-semibold text-accent-surface uppercase tracking-wider">Come funziona</h2>
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
                desc: "33 domande su 7 aree chiave della tua attività. Circa 10–15 minuti.",
              },
              {
                step: "03",
                title: "I risultati",
                desc: "Lo spider web dei tuoi punteggi subito. Il report completo via email entro 3 giorni lavorativi.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-surface rounded-2xl p-6 border border-raised space-y-3">
                <div className="text-3xl font-bold text-accent-surface/30">{step}</div>
                <h3 className="font-semibold text-primary">{title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7 Aree */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-accent-surface uppercase tracking-wider">Le 7 aree analizzate</h2>
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
              <div key={area} className="bg-surface border border-raised rounded-xl px-4 py-3 text-sm text-accent-surface font-medium">
                {area}
              </div>
            ))}
          </div>
        </section>

        {/* CTA accesso */}
        <section className="bg-surface border border-accent/20 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Hai già acquistato l'accesso?</h2>
          <p className="text-secondary text-sm">
            Usa il link personale ricevuto via email. Ogni link è valido per una sola diagnosi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <code className="bg-raised text-tertiary text-sm px-4 py-2 rounded-lg">
              fai-microimpresa.it/start?token=ALVA-XXXXXXXX
            </code>
          </div>
          <p className="text-tertiary text-xs pt-2">
            Non hai ancora un accesso?{" "}
            <a href="mailto:info@fai-microimpresa.it" className="text-accent-surface underline underline-offset-2">
              Contattaci
            </a>
          </p>
        </section>

      </div>

      {/* Dev mode — visibile solo in development */}
      {isDev && (
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <div className="border-t border-raised pt-8 text-center">
            <p className="text-tertiary text-xs mb-3 uppercase tracking-wider">Modalità sviluppo</p>
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

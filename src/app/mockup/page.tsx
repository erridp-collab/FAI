"use client";

// Temporary mockup page — delete after design review

const FAKE_EMAIL = "mario.rossi@gmail.com";

function ContextCard({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="bg-surface border border-raised rounded-2xl p-4 opacity-50">
      <div className="text-accent-surface font-semibold uppercase tracking-wider text-xs mb-2">
        {label}
      </div>
      <div className="w-full bg-raised rounded-full h-[3px] mb-2">
        <div className="h-[3px] rounded-full bg-accent-surface" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-tertiary text-xs">Dimensione trasversale di esempio</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center mb-4">
      <span className="text-tertiary text-xs font-bold uppercase tracking-widest border border-raised px-3 py-1 rounded-full">
        {children}
      </span>
    </div>
  );
}

// ── Variant 0: AS IS ──────────────────────────────────────────────
function Variant0() {
  return (
    <div className="bg-surface border border-accent-surface/20 rounded-2xl p-6 flex gap-4 items-start">
      <div className="w-10 h-10 rounded-xl bg-accent/30 border border-accent-surface/20 flex items-center justify-center text-xl flex-shrink-0">
        📬
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-bold mb-1">
          Report in arrivo a{" "}
          <span className="text-accent-surface">{FAKE_EMAIL}</span>
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
  );
}

// ── Variant A: Visual weight ──────────────────────────────────────
function VariantA() {
  return (
    <div
      className="rounded-2xl p-6 flex gap-4 items-start"
      style={{
        background: "linear-gradient(135deg, rgba(74,63,140,0.18) 0%, #2D2A3E 60%)",
        border: "1px solid rgba(243,207,105,0.25)",
        boxShadow: "0 0 32px rgba(154,143,224,0.12), 0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: "rgba(74,63,140,0.4)",
          border: "1px solid rgba(154,143,224,0.3)",
          boxShadow: "0 0 14px rgba(154,143,224,0.2)",
        }}
      >
        📬
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-bold mb-1">
          Report in arrivo a{" "}
          <span className="text-accent-surface">{FAKE_EMAIL}</span>
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(237,232,255,0.65)" }}>
          Stiamo elaborando tutti i dati raccolti. Riceverai un report dettagliato e
          personalizzato entro{" "}
          <span className="text-gold font-bold">3 giorni lavorativi</span>.
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(237,232,255,0.7)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-accent-surface shadow-[0_0_5px_rgba(154,143,224,0.6)]" />
            Diagnosi completata
          </div>
          <span className="text-xs" style={{ color: "rgba(237,232,255,0.3)" }}>→</span>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(237,232,255,0.7)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            Elaborazione
          </div>
          <span className="text-xs" style={{ color: "rgba(237,232,255,0.3)" }}>→</span>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(237,232,255,0.7)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            Report via email
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Variant B: Break the pattern ─────────────────────────────────
function VariantB() {
  return (
    <div>
      {/* Separatore narrativo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #3A3550)" }} />
        <span className="text-tertiary text-xs font-bold uppercase tracking-widest">cosa succede ora</span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #3A3550, transparent)" }} />
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: "linear-gradient(160deg, rgba(74,63,140,0.22) 0%, rgba(74,63,140,0.08) 50%, rgba(45,42,62,0.6) 100%)",
          border: "1px solid rgba(154,143,224,0.3)",
          boxShadow: "0 0 40px rgba(74,63,140,0.25), 0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background: "rgba(74,63,140,0.5)",
              border: "1px solid rgba(154,143,224,0.35)",
              boxShadow: "0 0 20px rgba(154,143,224,0.25)",
            }}
          >
            📬
          </div>
          <h2 className="text-lg font-bold leading-snug">
            Report in arrivo a{" "}
            <span className="text-accent-surface">{FAKE_EMAIL}</span>
          </h2>
        </div>

        <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(237,232,255,0.65)" }}>
          Stiamo elaborando tutti i dati raccolti. Riceverai un report dettagliato entro{" "}
          <span className="text-gold font-bold">3 giorni lavorativi</span>.
        </p>

        {/* Timeline in box */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ background: "rgba(58,53,80,0.5)", border: "1px solid rgba(154,143,224,0.15)" }}
        >
          {[
            { dot: "bg-accent-surface shadow-[0_0_8px_rgba(154,143,224,0.7)]", label: "Diagnosi", labelColor: "text-accent-surface font-semibold", bg: "rgba(154,143,224,0.12)" },
            { dot: "bg-accent shadow-[0_0_8px_rgba(74,63,140,0.6)]", label: "Elaborazione", labelColor: "text-primary", bg: "rgba(74,63,140,0.15)" },
            { dot: "bg-gold shadow-[0_0_8px_rgba(243,207,105,0.4)]", label: "Report email", labelColor: "text-gold", bg: "transparent" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-stretch">
              <div
                className="flex-1 flex flex-col items-center gap-1.5 py-3 px-4"
                style={{ background: step.bg }}
              >
                <div className={`w-2 h-2 rounded-full ${step.dot}`} />
                <span className={`text-[10px] ${step.labelColor}`}>{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="w-px self-stretch bg-raised" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Variant C: Hero moment ────────────────────────────────────────
function VariantC() {
  return (
    <div>
      {/* Divisore netto */}
      <div
        className="h-px mb-6"
        style={{ background: "linear-gradient(90deg, transparent 0%, #3A3550 30%, #3A3550 70%, transparent 100%)" }}
      />

      <div
        className="rounded-3xl p-8 relative overflow-hidden"
        style={{
          background: "#2D2A3E",
          border: "1px solid rgba(154,143,224,0.25)",
          boxShadow: "0 0 60px rgba(74,63,140,0.2), 0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Glow radial angolo */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -40, left: -40, width: 200, height: 200,
            background: "radial-gradient(circle, rgba(74,63,140,0.4) 0%, transparent 70%)",
          }}
        />
        {/* Gold line in cima */}
        <div
          className="absolute top-0 left-8 right-8 h-[2px] rounded-b-sm"
          style={{ background: "linear-gradient(90deg, transparent, #F3CF69, transparent)" }}
        />

        <div className="relative">
          <div className="text-gold text-xs font-bold uppercase tracking-widest mb-3">
            Prossimi passi
          </div>

          <h2 className="text-2xl font-bold leading-snug mb-3">
            Il tuo report arriverà a{" "}
            <span className="text-accent-surface">{FAKE_EMAIL}</span>
          </h2>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(237,232,255,0.6)" }}>
            Abbiamo ricevuto tutte le tue risposte. Un consulente FAI analizzerà i dati
            e ti invierà un report personalizzato entro{" "}
            <span className="text-gold font-bold">3 giorni lavorativi</span>.
          </p>

          {/* Stepper verticale */}
          <div className="flex flex-col gap-0">
            {[
              { dot: "bg-accent-surface shadow-[0_0_10px_rgba(154,143,224,0.6)]", title: "Diagnosi completata", titleColor: "text-accent-surface", sub: "Le tue risposte sono state salvate", line: true },
              { dot: "border-2 border-accent bg-transparent shadow-[0_0_10px_rgba(74,63,140,0.4)]", title: "Elaborazione in corso", titleColor: "text-primary", sub: "Analisi dei dati e costruzione del report", line: true },
              { dot: "border-2 border-gold/40 bg-transparent", title: "Report via email", titleColor: "text-tertiary", sub: "Entro 3 giorni lavorativi", line: false },
            ].map((step) => (
              <div key={step.title} className="flex items-start gap-3 py-2">
                <div className="flex flex-col items-center flex-shrink-0 w-5">
                  <div className={`w-3 h-3 rounded-full mt-0.5 ${step.dot}`} />
                  {step.line && (
                    <div
                      className="w-px flex-1 min-h-[20px] mt-1"
                      style={{ background: "linear-gradient(180deg, #3A3550, transparent)" }}
                    />
                  )}
                </div>
                <div className="pb-2">
                  <div className={`text-sm font-semibold ${step.titleColor}`}>{step.title}</div>
                  <div className="text-xs text-tertiary mt-0.5">{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function MockupPage() {
  const variants = [
    { id: "0", label: "0 — As is (attuale)", note: "La box si mimetizza con le card sopra", component: <Variant0 /> },
    { id: "A", label: "A — Visual weight", note: "Stessa struttura · gradient + gold border + shadow", component: <VariantA /> },
    { id: "B", label: "B — Break the pattern", note: "Separatore + h2 più grande + timeline in box", component: <VariantB /> },
    { id: "C", label: "C — Hero moment", note: "Eyebrow · titolo grande · stepper verticale · glow", component: <VariantC /> },
  ];

  return (
    <div className="min-h-screen bg-canvas text-primary p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-tertiary text-xs font-bold uppercase tracking-widest mb-2">Design review</p>
          <h1 className="text-2xl font-semibold">Report Box — 4 varianti</h1>
          <p className="text-secondary text-sm mt-2">Le card grigie sopra simulano gli indicatori chiave che precedono la box</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {variants.map((v) => (
            <div key={v.id} className="flex flex-col gap-4">
              {/* Label */}
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-accent-surface mb-0.5">{v.label}</div>
                <div className="text-tertiary text-xs">{v.note}</div>
              </div>

              {/* Context cards */}
              <ContextCard label="Digital Readiness" pct={62} />
              <ContextCard label="Capacità di evoluzione" pct={48} />

              {/* The box */}
              {v.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

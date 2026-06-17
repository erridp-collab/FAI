"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { getCompositeLevel, type CompositeIndicators } from "@/utils/scoring";

type AreaDefinition = {
  area: string;
  definition: string;
};

type ResultsData = {
  nome_attivita: string;
  email: string;
  area_scores?: Record<string, number>;
  composite_indicators?: CompositeIndicators;
};

type RadarPointProps = {
  cx?: number;
  cy?: number;
  payload?: {
    subject?: string;
  };
};

const AREA_DEFINITIONS: AreaDefinition[] = [
  {
    area: "La tua voce",
    definition: "Quanto sei riconoscibile e differente dai tuoi competitor.",
  },
  {
    area: "I tuoi ricavi",
    definition: "Diversificazione delle entrate e stabilità finanziaria.",
  },
  {
    area: "I tuoi margini",
    definition: "Conoscenza dei costi, margini e conformità normativa.",
  },
  {
    area: "La tua adattabilità",
    definition: "Capacità di rispondere a imprevisti e nuovi mercati.",
  },
  {
    area: "Il tuo sistema",
    definition: "Quanto l'attività funziona in modo indipendente da te.",
  },
  {
    area: "La tua rete",
    definition: "Connessioni con il territorio e altri operatori locali.",
  },
  {
    area: "Il tuo apprendimento",
    definition: "Capacità di evolvere, sperimentare e imparare dall'esterno.",
  },
];

const COMPOSITE_META: { key: keyof CompositeIndicators; label: string; description: string }[] = [
  { key: "identita", label: "Identità", description: "Riconoscibilità e differenziazione sul mercato" },
  { key: "tenutaAttivita", label: "Sopravvivenza", description: "Stabilità finanziaria e capacità di generare ricavi" },
  { key: "liquidita", label: "Liquidità", description: "Disponibilità di riserve per affrontare imprevisti" },
  { key: "resilienzaOperativa", label: "Resilienza operativa", description: "Capacità di reggere e reagire agli imprevisti" },
  { key: "digitalReadiness", label: "Digital Readiness", description: "Maturità digitale e presidio online" },
  { key: "complianceProtezione", label: "Compliance e protezione", description: "Conformità normativa e gestione dei rischi" },
  { key: "capacitaEvoluzione", label: "Capacità di evoluzione", description: "Propensione ad adattarsi e migliorare" },
];

const LEVEL_STYLES = {
  Fragile: "text-red-400 bg-red-500/15 border-red-500/20",
  Vulnerabile: "text-yellow-400 bg-yellow-500/15 border-yellow-500/20",
  Adeguata: "text-accent-surface bg-accent/15 border-accent/20",
  Solida: "text-green-400 bg-green-500/15 border-green-500/20",
};

const LEVEL_BAR_COLOR = {
  Fragile: "bg-red-400",
  Vulnerabile: "bg-yellow-400",
  Adeguata: "bg-accent",
  Solida: "bg-green-400",
};

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

export default function ResultsPage() {
  const params = useParams();
  const responseId = params?.id as string;
  const isDevResult =
    process.env.NEXT_PUBLIC_ALLOW_DEV_MODE === "1" && responseId === "__dev__";

  const [remoteData, setRemoteData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(!isDevResult);
  const [error, setError] = useState<string | null>(null);
  const sessionTokenId = useMemo(() => {
    if (isDevResult || typeof window === "undefined") {
      return null;
    }

    return sessionStorage.getItem("fai_token_id");
  }, [isDevResult]);

  const devData = useMemo(() => {
    if (!isDevResult || typeof window === "undefined") {
      return null;
    }

    const raw = sessionStorage.getItem("fai_dev_results");
    return raw ? (JSON.parse(raw) as ResultsData) : null;
  }, [isDevResult]);

  useEffect(() => {
    if (!responseId || isDevResult) {
      return;
    }

    if (!sessionTokenId) {
      return;
    }

    const loadResults = async () => {
      const response = await fetch(`/api/results/${responseId}`, {
        headers: {
          "x-fai-token-id": sessionTokenId,
        },
      });

      if (!response.ok) {
        setError("Risultati non trovati o link invalido.");
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as { data?: ResultsData };
      setRemoteData(payload.data || null);
      setIsLoading(false);
    };

    void loadResults();
  }, [isDevResult, responseId, sessionTokenId]);

  const data = isDevResult ? devData : remoteData;
  const missingSessionToken = !isDevResult && !sessionTokenId;
  const resolvedError =
    missingSessionToken
      ? "Sessione non valida. Riaccedi dal link ricevuto via email."
      : isDevResult && !devData
      ? "Nessun risultato dev trovato. Completa il questionario in modalità dev."
      : error;

  if (!isDevResult && isLoading && !missingSessionToken) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-surface animate-spin" />
      </div>
    );
  }

  if (resolvedError || !data) {
    return (
      <div className="min-h-screen bg-canvas text-primary flex items-center justify-center">
        <div className="bg-surface p-8 rounded-xl flex items-center gap-4 text-red-300">
          <AlertCircle /> {resolvedError || "Errore sconosciuto"}
        </div>
      </div>
    );
  }

  const scores = data.area_scores || {};
  const compositeIndicators = data.composite_indicators;

  const chartData = AREA_DEFINITIONS.map((definition) => ({
    subject: definition.area,
    score: scores[definition.area] || 0,
    fullMark: 5,
  }));

  let lowestArea = "";
  let lowestScore = 6;

  for (const definition of AREA_DEFINITIONS) {
    const score = scores[definition.area] || 0;
    if (score < lowestScore) {
      lowestScore = score;
      lowestArea = definition.area;
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-primary p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <header className="relative text-center space-y-4 py-4 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(74,63,140,0.12)_0%,transparent_70%)] pointer-events-none" />
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

        {/* Radar chart */}
        <div className="bg-surface rounded-3xl p-6 md:p-10 shadow-xl border border-raised relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(154,143,224,0.05),transparent)] pointer-events-none" />

          <h2 className="text-xl font-medium mb-6 text-center text-primary">
            La tua mappa della solidità
          </h2>

          <div className="w-full h-[300px] sm:h-[380px] md:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                <PolarGrid stroke="#3A3550" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#9490B8", fontSize: 11, fontWeight: 500 }}
                />
                <Radar
                  name={data.nome_attivita}
                  dataKey="score"
                  stroke="#9A8FE0"
                  strokeWidth={2}
                  fill="rgba(154,143,224,0.15)"
                  fillOpacity={1}
                  dot={(props: RadarPointProps) => {
                    const isLowest = props.payload?.subject === lowestArea;
                    return (
                      <circle
                        key={props.payload?.subject}
                        cx={props.cx}
                        cy={props.cy}
                        r={5}
                        fill={isLowest ? "#F3CF69" : "#9A8FE0"}
                        stroke="#16141F"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area scores */}
        <div>
          <h3 className="text-xl font-medium mb-4">Analisi per area</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AREA_DEFINITIONS.map((definition) => {
              const score = scores[definition.area] || 0;
              const isLowest = definition.area === lowestArea;

              return (
                <div
                  key={definition.area}
                  className={`bg-surface p-5 rounded-2xl border transition-all ${
                    isLowest
                      ? "border-gold/40 shadow-[0_0_15px_rgba(243,207,105,0.1)]"
                      : "border-raised"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-accent-surface font-semibold uppercase tracking-wider text-xs">
                      {definition.area}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        isLowest ? "text-gold" : "text-primary"
                      }`}
                    >
                      {score.toFixed(2)}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-raised rounded-full h-1.5 mb-3">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isLowest ? "bg-gold" : "bg-accent"}`}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>

                  <p className="text-secondary text-sm leading-relaxed">
                    {definition.definition}
                  </p>
                  {isLowest && (
                    <div className="mt-3 text-xs font-semibold text-gold bg-gold/10 inline-block px-2 py-1 rounded">
                      Area con maggiore margine di miglioramento
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
      </div>
    </div>
  );
}

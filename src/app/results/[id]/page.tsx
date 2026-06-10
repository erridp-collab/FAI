"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type AreaDefinition = {
  area: string;
  definition: string;
};

type ResultsData = {
  nome_attivita: string;
  email: string;
  area_scores?: Record<string, number>;
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

export default function ResultsPage() {
  const params = useParams();
  const responseId = params?.id as string;
  const isDevResult = responseId === "__dev__";

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
      <div className="max-w-4xl mx-auto space-y-12">
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

        <div className="bg-surface rounded-3xl p-6 md:p-10 shadow-xl border border-raised relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(154,143,224,0.05),transparent)] pointer-events-none" />

          <h2 className="text-xl font-medium mb-6 text-center text-primary">
            La tua mappa della solidità
          </h2>

          <div className="w-full h-[350px] md:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#3A3550" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#9490B8", fontSize: 12, fontWeight: 500 }}
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

        <div>
          <h3 className="text-2xl font-medium mb-6">Analisi per area</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AREA_DEFINITIONS.map((definition) => {
              const score = scores[definition.area] || 0;
              const isLowest = definition.area === lowestArea;

              return (
                <div
                  key={definition.area}
                  className={`bg-surface p-6 rounded-2xl border transition-all ${
                    isLowest
                      ? "border-gold/40 shadow-[0_0_15px_rgba(243,207,105,0.1)]"
                      : "border-raised"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-accent-surface font-semibold uppercase tracking-wider text-sm">
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
                  <p className="text-secondary text-sm leading-relaxed">
                    {definition.definition}
                  </p>
                  {isLowest && (
                    <div className="mt-4 text-xs font-semibold text-gold bg-gold/10 inline-block px-2 py-1 rounded">
                      Area con maggiore margine di miglioramento
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-accent to-raised p-8 rounded-3xl border border-accent-surface/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent blur-3xl opacity-50 pointer-events-none" />

          <h2 className="text-2xl font-semibold mb-3">Il tuo report completo è in arrivo</h2>
          <p className="text-primary/90 max-w-2xl text-lg leading-relaxed">
            Stiamo elaborando tutti i dati raccolti. Riceverai un report dettagliato e
            personalizzato all&apos;indirizzo email{" "}
            <span className="font-semibold text-white">{data.email}</span> entro{" "}
            <span className="text-gold font-bold">3 giorni lavorativi</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

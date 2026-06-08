"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

type AreaDefinition = {
  area: string;
  definition: string;
};

const AREA_DEFINITIONS: AreaDefinition[] = [
  { area: "La tua voce", definition: "Quanto sei riconoscibile e differente dai tuoi competitor." },
  { area: "I tuoi ricavi", definition: "Diversificazione delle entrate e stabilità finanziaria." },
  { area: "I tuoi margini", definition: "Conoscenza dei costi, margini e conformità normativa." },
  { area: "La tua adattabilità", definition: "Capacità di rispondere a imprevisti e nuovi mercati." },
  { area: "Il tuo sistema", definition: "Quanto l'attività funziona in modo indipendente da te." },
  { area: "La tua rete", definition: "Connessioni con il territorio e altri operatori locali." },
  { area: "Il tuo apprendimento", definition: "Capacità di evolvere, sperimentare e imparare dall'esterno." },
];

export default function ResultsPage() {
  const params = useParams();
  const responseId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!responseId) return;

    supabase
      .from("fai_responses")
      .select("*")
      .eq("id", responseId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("Risultati non trovati o link invalido.");
        } else {
          setData(data);
        }
        setIsLoading(false);
      });
  }, [responseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-surface animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-canvas text-primary flex items-center justify-center">
        <div className="bg-surface p-8 rounded-xl flex items-center gap-4 text-red-300">
          <AlertCircle /> {error || "Errore sconosciuto"}
        </div>
      </div>
    );
  }

  const scores = data.area_scores || {};
  
  // Format for Recharts
  const chartData = AREA_DEFINITIONS.map((def) => ({
    subject: def.area,
    A: scores[def.area] || 0,
    fullMark: 5,
  }));

  // Find lowest score
  let lowestArea = "";
  let lowestScore = 6;
  AREA_DEFINITIONS.forEach(def => {
    const s = scores[def.area] || 0;
    if (s < lowestScore) {
      lowestScore = s;
      lowestArea = def.area;
    }
  });

  return (
    <div className="min-h-screen bg-canvas text-primary p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-surface px-4 py-2 rounded-full text-sm font-semibold tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> DIAGNOSI COMPLETATA
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight">
            I risultati per <br className="md:hidden" />
            <span className="text-accent-surface font-semibold">{data.nome_attivita}</span>
          </h1>
          <p className="text-secondary text-lg max-w-xl mx-auto">
            Ecco una fotografia immediata della solidità della tua attività, basata sulle tue risposte.
          </p>
        </header>

        {/* Spider Web Chart */}
        <div className="bg-surface rounded-3xl p-6 md:p-10 shadow-xl border border-raised relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(154,143,224,0.05),transparent)] pointer-events-none" />
          
          <h2 className="text-xl font-medium mb-6 text-center text-primary">La tua mappa della solidità</h2>
          
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
                  dataKey="A"
                  stroke="#9A8FE0"
                  strokeWidth={2}
                  fill="rgba(154,143,224,0.15)"
                  fillOpacity={1}
                  dot={(props: any) => {
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

        {/* 7 Tile Aree */}
        <div>
          <h3 className="text-2xl font-medium mb-6">Analisi per area</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AREA_DEFINITIONS.map((def) => {
              const score = scores[def.area] || 0;
              const isLowest = def.area === lowestArea;
              return (
                <div 
                  key={def.area} 
                  className={`bg-surface p-6 rounded-2xl border transition-all ${
                    isLowest 
                      ? 'border-gold/40 shadow-[0_0_15px_rgba(243,207,105,0.1)]' 
                      : 'border-raised'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-accent-surface font-semibold uppercase tracking-wider text-sm">
                      {def.area}
                    </div>
                    <div className={`text-lg font-bold ${isLowest ? 'text-gold' : 'text-primary'}`}>
                      {score.toFixed(2)}
                    </div>
                  </div>
                  <p className="text-secondary text-sm leading-relaxed">
                    {def.definition}
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

        {/* Banner 3 giorni */}
        <div className="bg-gradient-to-r from-accent to-raised p-8 rounded-3xl border border-accent-surface/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent blur-3xl opacity-50 pointer-events-none" />
          
          <h2 className="text-2xl font-semibold mb-3">Il tuo report completo è in arrivo</h2>
          <p className="text-primary/90 max-w-2xl text-lg leading-relaxed">
            Stiamo elaborando tutti i dati raccolti. Riceverai un report dettagliato e personalizzato all'indirizzo email <span className="font-semibold text-white">{data.email}</span> entro <span className="text-gold font-bold">3 giorni lavorativi</span>.
          </p>
        </div>
        
      </div>
    </div>
  );
}

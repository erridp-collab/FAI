import { mainQuestions } from "@/data/questions";

export type Level = "Critico" | "Attenzione" | "Solido" | "Eccellente";

export type AreaScore = {
  area: string;
  score: number;
  level: Level;
};

export type CompositeIndicators = {
  identita: number;
  tenutaAttivita: number;
  liquidita: number;
  resilienzaOperativa: number;
  digitalReadiness: number;
  complianceProtezione: number;
  capacitaEvoluzione: number;
};

export type ScoringResult = {
  areaScores: Record<string, number>;
  compositeIndicators: CompositeIndicators;
};

export function getLevelFromScore(score: number): Level {
  if (score < 2) return "Critico";
  if (score < 3.5) return "Attenzione";
  if (score < 4.5) return "Solido";
  return "Eccellente";
}

export function calculateResults(answersMain: Record<number, number>): ScoringResult {
  // 1. Calcolo punteggi per area (Media aritmetica)
  const areaGroups: Record<string, number[]> = {};

  mainQuestions.forEach((q) => {
    const answer = answersMain[q.id];
    if (answer !== undefined) {
      if (!areaGroups[q.area]) {
        areaGroups[q.area] = [];
      }
      areaGroups[q.area].push(answer);
    }
  });

  const areaScores: Record<string, number> = {};
  for (const [area, scores] of Object.entries(areaGroups)) {
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    areaScores[area] = Number(avg.toFixed(2));
  }

  // Helper per trovare la risposta in base al numero domanda (es. "1.1")
  const getQ = (num: string): number => {
    const q = mainQuestions.find((mq) => mq.number === num);
    if (!q) return 0;
    return answersMain[q.id] || 0;
  };

  const getAreaScore = (areaName: string): number => {
    return areaScores[areaName] || 0;
  };

  // 2. Calcolo indicatori compositi
  const identita = (getQ("1.1") + getQ("1.2") + getQ("1.3") + getQ("6.2") * 0.5) / 3.5;
  
  const scoreRicavi = getAreaScore("I tuoi ricavi");
  const scoreMargini = getAreaScore("I tuoi margini");
  const tenutaAttivita = (scoreRicavi + scoreMargini) / 2;

  const liquidita = getQ("2.3");

  const resilienzaOperativa = (
    getQ("5.1") + 
    getQ("5.4") * 0.5 + 
    getQ("5.5") + 
    getQ("6.1") + 
    getQ("6.2") + 
    getQ("6.3") * 0.5 + 
    getQ("6.4")
  ) / 6;

  const digitalReadiness = (
    getQ("5.2") + 
    getQ("5.3") + 
    getQ("7.1") * 0.5 + 
    getQ("2.5") * 0.5 + 
    getQ("2.7") * 0.5
  ) / 3.5;

  const complianceProtezione = (
    getQ("3.2") + 
    getQ("3.5") + 
    getQ("3.6") + 
    getQ("5.3")
  ) / 4;

  const scoreAdattabilita = getAreaScore("La tua adattabilità");
  const scoreApprendimento = getAreaScore("Il tuo apprendimento");
  const capacitaEvoluzione = (scoreAdattabilita + scoreApprendimento) / 2;

  const compositeIndicators: CompositeIndicators = {
    identita: Number(identita.toFixed(2)),
    tenutaAttivita: Number(tenutaAttivita.toFixed(2)),
    liquidita: Number(liquidita.toFixed(2)),
    resilienzaOperativa: Number(resilienzaOperativa.toFixed(2)),
    digitalReadiness: Number(digitalReadiness.toFixed(2)),
    complianceProtezione: Number(complianceProtezione.toFixed(2)),
    capacitaEvoluzione: Number(capacitaEvoluzione.toFixed(2)),
  };

  return {
    areaScores,
    compositeIndicators
  };
}

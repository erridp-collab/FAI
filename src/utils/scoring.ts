import { mainQuestions } from "@/data/questions";

export const AREA = {
  voce: "La tua voce",
  ricavi: "I tuoi ricavi",
  margini: "I tuoi margini",
  adattabilita: "La tua adattabilità",
  sistema: "Il tuo sistema",
  rete: "La tua rete",
  apprendimento: "Il tuo apprendimento",
} as const;

export type AreaName = (typeof AREA)[keyof typeof AREA];

export type AreaLevel =
  | "Vulnerabile"
  | "In costruzione"
  | "Sufficiente"
  | "Solido"
  | "Forte";

export type CompositeLevel = "Fragile" | "Vulnerabile" | "Adeguata" | "Solida";

/**
 * Indicatori compositi (REFERENCE §6). Nome campo -> nome UI (foglio Risultati) -> cella:
 * - identita             -> "Identita"                 (Risultati!B14, Report_Logic!B15)
 * - tenutaAttivita       -> "Sopravvivenza"            (Risultati!B15, Report_Logic!B16)
 * - liquidita            -> "Liquidita"                (Risultati!B16, Report_Logic!B17)
 * - resilienzaOperativa  -> "Resilienza operativa"     (Risultati!B17, Report_Logic!B18)
 * - digitalReadiness     -> "Digital Readiness"        (Risultati!B18, Report_Logic!B19)
 * - complianceProtezione -> "Compliance e protezione"  (Risultati!B19, Report_Logic!B20)
 * - capacitaEvoluzione   -> "Capacita di evoluzione"   (Risultati!B20, Report_Logic!B21)
 */
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
  areaScores: Record<AreaName, number>;
  compositeIndicators: CompositeIndicators;
  overallScore: number;
};

function roundToTwoDecimals(value: number): number {
  return Number(value.toFixed(2));
}

// Soglie 7 aree - REFERENCE §7.1 (Report_Logic!A37, Risultati!C3-C9)
export function getAreaLevel(score: number): AreaLevel {
  if (score <= 2.25) return "Vulnerabile";
  if (score < 3) return "In costruzione";
  if (score < 3.5) return "Sufficiente";
  if (score < 4) return "Solido";
  return "Forte";
}

// Soglie indicatori compositi - REFERENCE §7.2 (Report_Logic!A49, 3_Subindici!A3)
export function getCompositeLevel(score: number): CompositeLevel {
  if (score <= 1.5) return "Fragile";
  if (score <= 2.5) return "Vulnerabile";
  if (score <= 3.5) return "Adeguata";
  return "Solida";
}

export function calculateResults(answersMain: Record<number, number>): ScoringResult {
  const missingQuestions = mainQuestions
    .filter((question) => answersMain[question.id] === undefined)
    .map((question) => question.number);

  if (missingQuestions.length > 0) {
    throw new Error(`Risposte mancanti per le domande: ${missingQuestions.join(", ")}`);
  }

  const areaGroups = Object.values(AREA).reduce(
    (groups, area) => {
      groups[area] = [];
      return groups;
    },
    {} as Record<AreaName, number[]>,
  );

  for (const question of mainQuestions) {
    const area = question.area as AreaName;
    areaGroups[area].push(answersMain[question.id]);
  }

  const areaScores = Object.fromEntries(
    Object.entries(areaGroups).map(([area, scores]) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return [area, roundToTwoDecimals(average)];
    }),
  ) as Record<AreaName, number>;

  const getQuestionScore = (number: string): number => {
    const question = mainQuestions.find((item) => item.number === number);

    if (!question) {
      throw new Error(`Domanda non trovata per il numero ${number}`);
    }

    return answersMain[question.id];
  };

  const getAreaScore = (areaName: AreaName): number => areaScores[areaName];

  const identita =
    (getQuestionScore("1.1") +
      getQuestionScore("1.2") +
      getQuestionScore("1.3") +
      getQuestionScore("6.2") * 0.5) /
    3.5;

  const tenutaAttivita = (getAreaScore(AREA.ricavi) + getAreaScore(AREA.margini)) / 2;

  const liquidita = getQuestionScore("2.3");

  const resilienzaOperativa =
    (getQuestionScore("5.1") +
      getQuestionScore("5.4") * 0.5 +
      getQuestionScore("5.5") +
      getQuestionScore("6.1") +
      getQuestionScore("6.2") +
      getQuestionScore("6.3") * 0.5 +
      getQuestionScore("6.4")) /
    6;

  const digitalReadiness =
    (getQuestionScore("5.2") +
      getQuestionScore("5.3") +
      getQuestionScore("7.1") * 0.5 +
      getQuestionScore("2.5") * 0.5 +
      getQuestionScore("2.7") * 0.5) /
    3.5;

  const complianceProtezione =
    (getQuestionScore("3.2") +
      getQuestionScore("3.5") +
      getQuestionScore("3.6") +
      getQuestionScore("5.3")) /
    4;

  const capacitaEvoluzione =
    (getAreaScore(AREA.adattabilita) + getAreaScore(AREA.apprendimento)) / 2;

  const compositeIndicators: CompositeIndicators = {
    identita: roundToTwoDecimals(identita),
    tenutaAttivita: roundToTwoDecimals(tenutaAttivita),
    liquidita: roundToTwoDecimals(liquidita),
    resilienzaOperativa: roundToTwoDecimals(resilienzaOperativa),
    digitalReadiness: roundToTwoDecimals(digitalReadiness),
    complianceProtezione: roundToTwoDecimals(complianceProtezione),
    capacitaEvoluzione: roundToTwoDecimals(capacitaEvoluzione),
  };

  const overallScore = roundToTwoDecimals(
    Object.values(areaScores).reduce((sum, score) => sum + score, 0) /
      Object.values(areaScores).length,
  );

  return {
    areaScores,
    compositeIndicators,
    overallScore,
  };
}

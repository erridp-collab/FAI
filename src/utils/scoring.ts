import { Question } from "@/data/questions";

export type AreaScore = {
  area: string;
  score: number;
  level: "Critico" | "Attenzione" | "Solido" | "Eccellente";
};

export type ScoringResult = {
  overallScore: number;
  areaScores: AreaScore[];
  strongestArea: AreaScore;
  weakestArea: AreaScore;
};

function getLevelFromScore(score: number): AreaScore["level"] {
  if (score < 2) return "Critico";
  if (score < 3.5) return "Attenzione";
  if (score < 4.5) return "Solido";
  return "Eccellente";
}

export function calculateResults(answers: Record<number, number>, questions: Question[]): ScoringResult {
  // Raggruppa le risposte per area
  const areaGroups: Record<string, number[]> = {};

  questions.forEach((q) => {
    const answer = answers[q.id];
    if (answer !== undefined) {
      if (!areaGroups[q.area]) {
        areaGroups[q.area] = [];
      }
      areaGroups[q.area].push(answer);
    }
  });

  const areaScores: AreaScore[] = [];
  let totalSum = 0;
  let totalCount = 0;

  for (const [area, scores] of Object.entries(areaGroups)) {
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    
    totalSum += sum;
    totalCount += scores.length;

    areaScores.push({
      area,
      score: Number(avg.toFixed(2)),
      level: getLevelFromScore(avg)
    });
  }

  const overallScore = totalCount > 0 ? Number((totalSum / totalCount).toFixed(2)) : 0;

  // Ordina per punteggio per trovare il più forte e il più debole
  const sortedScores = [...areaScores].sort((a, b) => a.score - b.score);
  
  return {
    overallScore,
    areaScores,
    weakestArea: sortedScores[0] || { area: "N/A", score: 0, level: "Critico" },
    strongestArea: sortedScores[sortedScores.length - 1] || { area: "N/A", score: 0, level: "Critico" },
  };
}

import { describe, expect, it } from "vitest";

import { mainQuestions } from "@/data/questions";
import {
  AREA,
  calculateResults,
  getAreaLevel,
  getCompositeLevel,
} from "@/utils/scoring";

function fullAnswers(value: number): Record<number, number> {
  const answers: Record<number, number> = {};

  for (const question of mainQuestions) {
    answers[question.id] = value;
  }

  return answers;
}

function vectorByArea(): Record<number, number> {
  const answers: Record<number, number> = {};
  const setAreaAnswers = (ids: number[], value: number) => {
    for (const id of ids) {
      answers[id] = value;
    }
  };

  setAreaAnswers([1, 2, 3], 1);
  setAreaAnswers([4, 5, 6, 7, 8, 9, 10], 2);
  setAreaAnswers([11, 12, 13, 14, 15, 16], 3);
  setAreaAnswers([17, 18, 19, 20], 4);
  setAreaAnswers([21, 22, 23, 24, 25], 5);
  setAreaAnswers([26, 27, 28, 29], 1);
  setAreaAnswers([30, 31, 32, 33], 2);

  return answers;
}

describe("AREA constants", () => {
  it("ogni area di mainQuestions corrisponde a una costante AREA", () => {
    const validAreas = new Set(Object.values(AREA));

    for (const question of mainQuestions) {
      expect(validAreas.has(question.area as (typeof AREA)[keyof typeof AREA])).toBe(true);
    }
  });

  it("ci sono esattamente 7 aree", () => {
    expect(Object.keys(AREA)).toHaveLength(7);
  });
});

describe("getAreaLevel (7 aree, 5 livelli)", () => {
  it("<=2.25 -> Vulnerabile", () => {
    expect(getAreaLevel(1)).toBe("Vulnerabile");
    expect(getAreaLevel(2.25)).toBe("Vulnerabile");
  });

  it("<3 -> In costruzione", () => {
    expect(getAreaLevel(2.26)).toBe("In costruzione");
    expect(getAreaLevel(2.99)).toBe("In costruzione");
  });

  it("<3.5 -> Sufficiente", () => {
    expect(getAreaLevel(3)).toBe("Sufficiente");
    expect(getAreaLevel(3.49)).toBe("Sufficiente");
  });

  it("<4 -> Solido", () => {
    expect(getAreaLevel(3.5)).toBe("Solido");
    expect(getAreaLevel(3.99)).toBe("Solido");
  });

  it(">=4 -> Forte", () => {
    expect(getAreaLevel(4)).toBe("Forte");
    expect(getAreaLevel(5)).toBe("Forte");
  });
});

describe("getCompositeLevel (indicatori, 4 livelli)", () => {
  it("<=1.5 -> Fragile", () => {
    expect(getCompositeLevel(1)).toBe("Fragile");
    expect(getCompositeLevel(1.5)).toBe("Fragile");
  });

  it("<=2.5 -> Vulnerabile", () => {
    expect(getCompositeLevel(1.51)).toBe("Vulnerabile");
    expect(getCompositeLevel(2.5)).toBe("Vulnerabile");
  });

  it("<=3.5 -> Adeguata", () => {
    expect(getCompositeLevel(2.51)).toBe("Adeguata");
    expect(getCompositeLevel(3.5)).toBe("Adeguata");
  });

  it(">3.5 -> Solida", () => {
    expect(getCompositeLevel(3.51)).toBe("Solida");
    expect(getCompositeLevel(5)).toBe("Solida");
  });
});

describe("calculateResults - input incompleto", () => {
  it("lancia errore se manca anche una sola risposta", () => {
    const answers = fullAnswers(4);
    delete answers[5];

    expect(() => calculateResults(answers)).toThrow();
  });

  it("non lancia se tutte le 33 risposte sono presenti", () => {
    expect(() => calculateResults(fullAnswers(4))).not.toThrow();
  });
});

describe("calculateResults - punteggio complessivo", () => {
  it("overallScore = media delle 7 aree; con tutte 4 vale 4", () => {
    const results = calculateResults(fullAnswers(4));

    expect(results.overallScore).toBe(4);
  });
});

describe("calculateResults - lock formule su vettore verificato", () => {
  const results = calculateResults(vectorByArea());

  it("calcola i punteggi area attesi", () => {
    expect(results.areaScores[AREA.voce]).toBe(1);
    expect(results.areaScores[AREA.ricavi]).toBe(2);
    expect(results.areaScores[AREA.margini]).toBe(3);
    expect(results.areaScores[AREA.adattabilita]).toBe(4);
    expect(results.areaScores[AREA.sistema]).toBe(5);
    expect(results.areaScores[AREA.rete]).toBe(1);
    expect(results.areaScores[AREA.apprendimento]).toBe(2);
  });

  it("calcola il punteggio complessivo F66", () => {
    expect(results.overallScore).toBe(2.57);
  });

  it("calcola gli indicatori compositi attesi", () => {
    expect(results.compositeIndicators.identita).toBe(1);
    expect(results.compositeIndicators.tenutaAttivita).toBe(2.5);
    expect(results.compositeIndicators.liquidita).toBe(2);
    expect(results.compositeIndicators.resilienzaOperativa).toBe(2.67);
    expect(results.compositeIndicators.digitalReadiness).toBe(3.71);
    expect(results.compositeIndicators.complianceProtezione).toBe(3.5);
    expect(results.compositeIndicators.capacitaEvoluzione).toBe(3);
  });

  it("mappa correttamente i livelli delle aree", () => {
    expect(getAreaLevel(results.areaScores[AREA.margini])).toBe("Sufficiente");
    expect(getAreaLevel(results.areaScores[AREA.sistema])).toBe("Forte");
    expect(getAreaLevel(results.areaScores[AREA.voce])).toBe("Vulnerabile");
  });

  it("mappa correttamente i livelli dei compositi", () => {
    expect(getCompositeLevel(results.compositeIndicators.identita)).toBe("Fragile");
    expect(getCompositeLevel(results.compositeIndicators.tenutaAttivita)).toBe(
      "Vulnerabile",
    );
    expect(getCompositeLevel(results.compositeIndicators.complianceProtezione)).toBe(
      "Adeguata",
    );
    expect(getCompositeLevel(results.compositeIndicators.digitalReadiness)).toBe("Solida");
  });
});

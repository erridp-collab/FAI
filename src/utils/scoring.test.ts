import { describe, it, expect } from "vitest";
import { getLevelFromScore } from "@/utils/scoring";

describe("getLevelFromScore", () => {
  it("ritorna Critico sotto 2", () => {
    expect(getLevelFromScore(1)).toBe("Critico");
    expect(getLevelFromScore(1.99)).toBe("Critico");
  });

  it("ritorna Attenzione da 2 a sotto 3.5", () => {
    expect(getLevelFromScore(2)).toBe("Attenzione");
    expect(getLevelFromScore(3.49)).toBe("Attenzione");
  });

  it("ritorna Solido da 3.5 a sotto 4.5", () => {
    expect(getLevelFromScore(3.5)).toBe("Solido");
    expect(getLevelFromScore(4.49)).toBe("Solido");
  });

  it("ritorna Eccellente da 4.5 in su", () => {
    expect(getLevelFromScore(4.5)).toBe("Eccellente");
    expect(getLevelFromScore(5)).toBe("Eccellente");
  });
});

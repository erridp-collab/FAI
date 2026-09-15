import { expect, test } from "@playwright/test";

const DEV_RESULTS = {
  nome_attivita: "Bottega Demo",
  email: "demo@example.com",
  area_scores: {
    "La tua voce": 3,
    "I tuoi ricavi": 3,
    "I tuoi margini": 3,
    "La tua adattabilità": 3,
    "Il tuo sistema": 3,
    "La tua rete": 3,
    "Il tuo apprendimento": 3,
  },
};

test.describe("layout mobile", () => {
  test.use({ viewport: { width: 320, height: 700 } });

  test("mostra per intero il nome dell'area nella barra di avanzamento", async ({
    page,
  }) => {
    await page.goto("/questionnaire?dev=1");

    const areaLabel = page.locator("span", { hasText: /^Come ti senti$/ });
    await expect(areaLabel).toBeVisible();

    const metrics = await areaLabel.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      textOverflow: getComputedStyle(element).textOverflow,
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.textOverflow).not.toBe("ellipsis");
  });

  test("mantiene tutte le etichette del radar dentro la scheda", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && message.text().includes("Hydration failed")) {
        hydrationErrors.push(message.text());
      }
    });

    await page.goto("/");
    await page.evaluate((data) => {
      sessionStorage.setItem("fai_dev_results", JSON.stringify(data));
    }, DEV_RESULTS);
    await page.goto("/results/__dev__");

    const chartHeading = page.getByRole("heading", {
      name: "La tua mappa della solidità",
    });
    await expect(chartHeading).toBeVisible();

    const chartSurface = chartHeading.locator("..").locator("svg.recharts-surface");
    const surfaceBox = await chartSurface.boundingBox();
    const tickBoxes = await page
      .locator(".recharts-polar-angle-axis-tick-value")
      .evaluateAll((ticks) =>
        ticks.map((tick) => {
          const box = tick.getBoundingClientRect();
          return {
            text: tick.textContent,
            left: box.left,
            right: box.right,
          };
        }),
      );

    expect(surfaceBox).not.toBeNull();
    expect(tickBoxes).toHaveLength(7);

    for (const tick of tickBoxes) {
      expect(tick.left, `${tick.text} supera il bordo sinistro`).toBeGreaterThanOrEqual(
        surfaceBox!.x - 1,
      );
      expect(tick.right, `${tick.text} supera il bordo destro`).toBeLessThanOrEqual(
        surfaceBox!.x + surfaceBox!.width + 1,
      );
    }

    expect(hydrationErrors).toEqual([]);
  });
});

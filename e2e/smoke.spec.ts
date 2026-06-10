import { test, expect } from "@playwright/test";

test("il questionario in dev mode carica la prima domanda", async ({ page }) => {
  await page.goto("/questionnaire?dev=1");
  await expect(page.getByText("Modalità sviluppo attiva")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /storia chiara/i })
  ).toBeVisible();
  for (const n of ["1", "2", "3", "4", "5"]) {
    await expect(page.getByRole("button", { name: n }).first()).toBeVisible();
  }
});

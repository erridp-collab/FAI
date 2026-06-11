import { expect, test } from "@playwright/test";

test("il flusso dev mode arriva fino ai risultati", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/questionnaire?dev=1");

  for (let index = 0; index < 7; index++) {
    await page.getByRole("button", { name: "Seleziona punteggio 3 su 5" }).click();
    await page.waitForTimeout(350);
  }

  await expect(
    page.getByRole("heading", { name: /3 obiettivi principali/i }),
  ).toBeVisible();

  const objectiveButtons = page
    .locator("button")
    .filter({ has: page.locator("span.text-secondary, span.text-primary") });

  await objectiveButtons.nth(0).click();
  await objectiveButtons.nth(1).click();
  await objectiveButtons.nth(2).click();
  await page.getByRole("button", { name: "Continua" }).click();

  for (let index = 0; index < 33; index++) {
    await page.getByRole("button", { name: "Seleziona punteggio 3 su 5" }).click();
    await page.waitForTimeout(350);
  }

  await expect(page.getByRole("heading", { name: /Ultimo step/i })).toBeVisible();

  await page.locator("#nome_attivita").fill("Bottega Demo");
  await page.locator("#settore").fill("Retail");
  await page.locator("#citta").fill("Roma");
  await page.locator("#email").fill("demo@example.com");

  await page.getByRole("button", { name: /Calcola i tuoi risultati/i }).click();

  await expect(page).toHaveURL(/\/results\/__dev__$/);
  await expect(page.getByRole("heading", { name: /I risultati per/i })).toBeVisible();
  await expect(page.getByText("Bottega Demo")).toBeVisible();
});

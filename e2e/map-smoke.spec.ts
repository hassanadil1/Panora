import { test, expect } from "@playwright/test";

test.describe("Panora map", () => {
  test("home loads map or config message", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Panora" }).or(page.getByText("Mapbox not configured"))
    ).toBeVisible({ timeout: 15_000 });
  });

  test("terms and privacy pages", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms of use" })).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy" })).toBeVisible();
  });
});

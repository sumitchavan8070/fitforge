import { expect, test } from "@playwright/test";

test("owner can sign in and open the sales desk", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@fitforge.demo");
  await page.getByLabel("Password").fill("FitForge#2026");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Point of Sale" }).click();
  await expect(page.getByLabel("Search by name, SKU, or barcode")).toBeVisible();
});

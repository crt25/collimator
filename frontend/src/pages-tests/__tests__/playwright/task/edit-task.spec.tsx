import { test, expect } from "playwright-test-coverage";
import { signInAndGotoPath } from "../authentication/authentication-helpers";

test.describe("/task/[taskId]/edit", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await signInAndGotoPath(page, baseURL!, `/task/5/edit`);
    await page.waitForSelector("#__next");
  });

  test("shows an iframe", async ({ page }) => {
    expect(page.locator("iframe")).toHaveCount(1);
  });
});

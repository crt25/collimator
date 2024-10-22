import { test, expect } from "playwright-test-coverage";

test.describe("/task/taskId/edit", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/task/taskId/edit`);

    await page.waitForSelector("#__next");
  });

  test("shows an iframe", async ({ page }) => {
    expect(page.locator("iframe")).toHaveCount(1);
  });
});

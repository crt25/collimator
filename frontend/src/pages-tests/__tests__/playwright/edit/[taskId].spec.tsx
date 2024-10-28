import { test, expect } from "playwright-test-coverage";

test.describe("/edit/taskId", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/edit/some-task-id`);

    await page.waitForSelector("#__next");
  });

  test("shows an iframe", async ({ page }) => {
    expect(page.locator("iframe")).toHaveCount(1);
  });
});

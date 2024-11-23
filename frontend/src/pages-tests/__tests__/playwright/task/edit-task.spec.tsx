import { test, expect } from "playwright-test-coverage";
import { useAdminUser } from "../authentication/authentication-helpers";

test.describe("/task/[taskId]/edit", () => {
  test.beforeEach(async ({ context, page, baseURL }) => {
    await useAdminUser(context);

    await page.goto(`${baseURL}/task/5/edit`);
    await page.waitForSelector("#__next");
  });

  test("shows an iframe", async ({ page }) => {
    expect(page.locator("iframe")).toHaveCount(1);
  });
});

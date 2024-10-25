import { test } from "playwright-test-coverage";
import { setupForAuthentication } from "./authentication-helpers";

test.describe("/login/student", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await setupForAuthentication(page, baseURL!);

    await page.goto(`${baseURL!}/session/3/join?key=abc`);
    await page.waitForSelector("[data-testid=signin-student-button]");
  });

  test("can authenticate as a student", async ({ page }) => {
    await page.getByTestId("signin-student-button").click();

    await page.waitForURL(/session\/3\/join/);
  });
});

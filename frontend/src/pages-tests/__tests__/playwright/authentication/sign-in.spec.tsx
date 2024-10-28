import { test } from "playwright-test-coverage";
import { setupForAuthentication } from "./authentication-helpers";

test.describe("/login", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await setupForAuthentication(page, baseURL!);

    await page.goto(`${baseURL!}/?login=test`);
    await page.waitForSelector("[data-testid=signin-button]");
  });

  test("can authenticate as a non-student", async ({ page, baseURL }) => {
    await page.getByTestId("signin-button").click();

    await page.waitForURL(`${baseURL!}/?login=test`);
  });
});

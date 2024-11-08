import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { expect, test } from "../helpers";

test.describe("/session/[sessionId]/task/[taskId]/solve", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await signInAndGotoPath(page, baseURL!, `/session/3/task/5/solve`);
    await page.waitForSelector("#__next");
  });

  test("shows an iframe", async ({ page }) => {
    expect(page.locator("iframe")).toHaveCount(1);
  });

  test("can open session menu", async ({ page }) => {
    expect(page.getByTestId("session-name")).toHaveCount(0);

    await page.getByTestId("toggle-session-menu-button").click();
    await page.waitForSelector("[data-testid=session-name]");

    await page.getByTestId("toggle-session-menu-button").click();
    expect(page.getByTestId("session-name")).toHaveCount(0);
  });
});

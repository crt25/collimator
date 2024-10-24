import { test, expect } from "playwright-test-coverage";

test.describe("ErrorPage", () => {
  test("returns the error page on non existent paths", async ({
    baseURL,
    page,
  }) => {
    await page.goto(`${baseURL!}/some-nonexistent-path`);

    await page.waitForSelector("#root");

    expect(page.getByText("ErrorPage")).toHaveCount(1);
  });
});

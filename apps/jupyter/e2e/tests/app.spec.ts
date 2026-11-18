import { expect, test } from "@playwright/test";
import { AppMode, openApp, sendRequest } from "./helpers/host";

const modes: AppMode[] = ["edit", "solve", "show"];

for (const mode of modes) {
  test.describe(`${mode} mode`, () => {
    test("starts and reports its height", async ({ page }) => {
      await openApp(page, mode);

      const response = await sendRequest(page, "getHeight");

      expect(response.error).toBeUndefined();
      expect(response.method).toBe("getHeight");
      expect(response.result).toEqual(expect.any(Number));
      expect(response.result).toBeGreaterThan(0);
    });

    test("keeps the current language without reloading", async ({ page }) => {
      await openApp(page, mode);

      // survives in-page URL updates, but not a reload of the app
      await page.evaluate(() => {
        (window as { crtNotReloaded?: boolean }).crtNotReloaded = true;
      });

      // the app starts in English, so there is nothing to change
      const response = await sendRequest(page, "setLocale", "en");

      expect(response.error).toBeUndefined();
      expect(
        await page.evaluate(
          () => (window as { crtNotReloaded?: boolean }).crtNotReloaded,
        ),
      ).toBe(true);
    });
  });
}

test.describe("edit mode", () => {
  test("loads the default task and returns it", async ({ page }) => {
    await openApp(page, "edit");

    const loaded = await sendRequest(page, "loadTask", {
      useDefaultTask: true,
      language: "en",
    });

    expect(loaded.error).toBeUndefined();

    const task = await sendRequest(page, "getTask");

    expect(task.error).toBeUndefined();
    expect(task.result).toMatchObject({
      file: { $file: { size: expect.any(Number) } },
    });
  });
});

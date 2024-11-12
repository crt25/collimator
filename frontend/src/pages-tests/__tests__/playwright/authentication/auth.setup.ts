import {
  adminFile,
  setupForAuthentication,
  userEmail,
  studentFile,
} from "./authentication-helpers";
import { test as setup, expect } from "../helpers";
import { headerCurrentUserName } from "../selectors";
import * as fs from "fs";

// Follows the pattern described at https://playwright.dev/docs/auth#multiple-signed-in-roles

setup("authenticate as admin", async ({ page, baseURL }) => {
  await setupForAuthentication(page, baseURL!);

  await page.goto(`${baseURL!}/?login=test`);
  await page.waitForSelector("[data-testid=signin-button]");

  await page.getByTestId("signin-button").click();

  await page.waitForURL(`${baseURL!}/?login=test`);

  // https://playwright.dev/docs/auth#session-storage
  const sessionStorage = await page.evaluate((): string =>
    JSON.stringify(sessionStorage),
  );
  fs.writeFileSync(adminFile, sessionStorage, "utf-8");
});

setup("authenticate as student", async ({ page, baseURL }) => {
  await setupForAuthentication(page, baseURL!);

  await page.goto(`${baseURL!}/session/3/join?key=abc`);
  await page.waitForSelector("[data-testid=signin-student-button]");

  await page.getByTestId("signin-student-button").click();

  await page.waitForURL(/session\/3\/join/);

  await expect(page.locator(headerCurrentUserName).innerText()).resolves.toBe(
    userEmail,
  );

  // https://playwright.dev/docs/auth#session-storage
  const sessionStorage = await page.evaluate((): string =>
    JSON.stringify(sessionStorage),
  );
  fs.writeFileSync(studentFile, sessionStorage, "utf-8");
});

import {
  adminFile,
  setupForAuthentication,
  userEmail,
  studentFile,
} from "./authentication-helpers";
import { test as setup, expect, jsonResponse } from "../helpers";
import { headerCurrentUserName } from "../selectors";
import * as fs from "fs";
import { getClassesControllerFindOneV0Url } from "@/api/collimator/generated/endpoints/classes/classes";
import { getClassesControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { getSessionsControllerFindOneV0Url } from "@/api/collimator/generated/endpoints/sessions/sessions";
import { getSessionsControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/sessions/sessions.msw";

// Follows the pattern described at https://playwright.dev/docs/auth#multiple-signed-in-roles

setup("authenticate as admin", async ({ page, baseURL, apiURL }) => {
  await setupForAuthentication(page, baseURL!, apiURL);

  await page.goto(`${baseURL!}/?login=test`);
  await page.waitForSelector("[data-testid=signin-button]");

  await page.getByTestId("signin-button").click();

  // generate a new key pair
  await page.getByTestId("password").fill("hunter2");
  await page.getByTestId("backupPassword").fill("hunter3");
  await page.getByTestId("submit").click();

  await page.waitForURL(`${baseURL!}/?login=test`);

  // https://playwright.dev/docs/auth#session-storage
  const sessionStorage = await page.evaluate((): string =>
    JSON.stringify(sessionStorage),
  );
  fs.writeFileSync(adminFile, sessionStorage, "utf-8");
});

setup("authenticate as student", async ({ page, baseURL, apiURL }) => {
  const teacherPublicKeyHash = await setupForAuthentication(
    page,
    baseURL!,
    apiURL,
  );

  await page.route(`${apiURL}${getClassesControllerFindOneV0Url(2)}`, (route) =>
    route.fulfill({
      ...jsonResponse,
      body: JSON.stringify(
        getClassesControllerFindOneV0ResponseMock({ id: 2 }),
      ),
    }),
  );

  const sessionResponse = getSessionsControllerFindOneV0ResponseMock({ id: 3 });

  await page.route(
    `${apiURL}${getSessionsControllerFindOneV0Url(2, 3)}`,
    (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify({
          ...sessionResponse,
          class: {
            ...sessionResponse.class,
            id: 2,
          },
        }),
      }),
  );

  await page.goto(
    `${baseURL!}/class/2/session/3/join?key=${teacherPublicKeyHash}`,
  );

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

import * as fs from "fs";
import {
  adminFile,
  setupForUserAuthentication,
  studentFile,
  setupForMockStudentAuthentication,
} from "../authentication-helpers";
import { test as setup, expect, jsonResponse } from "../helpers";
import { headerCurrentUserName } from "../selectors";
import { adminUser } from "./seeding/user";
import { getClassesControllerFindOneV0Url } from "@/api/collimator/generated/endpoints/classes/classes";
import { getClassesControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import {
  getSessionsControllerFindOneV0Url,
  getSessionsControllerGetSessionProgressV0Url,
  getSessionsControllerIsAnonymousV0Url,
} from "@/api/collimator/generated/endpoints/sessions/sessions";
import { getSessionsControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/sessions/sessions.msw";
import {
  StudentSessionProgressDto,
  TaskProgress,
} from "@/api/collimator/generated/models";

// Follows the pattern described at https://playwright.dev/docs/auth#multiple-signed-in-roles
setup.describe("authentication against a mock backend", () => {
  setup("authenticate as admin", async ({ page, baseURL, apiURL }) => {
    await setupForUserAuthentication(page, baseURL!, apiURL, adminUser);

    await page.goto(`${baseURL!}/?login=test`);
    await page.waitForSelector("[data-testid=signin-button]");

    await page.getByTestId("signin-button").click();

    // generate a new key pair
    await page.getByTestId("password").fill("hunter2");
    await page.getByTestId("backupPassword").fill("hunter3");
    await page.getByTestId("submit").click();

    await page.waitForURL(`${baseURL!}/?login=test`);
  });

  setup("authenticate as student", async ({ page, baseURL, apiURL }) => {
    const teacherPublicKeyHash = await setupForMockStudentAuthentication(
      page,
      baseURL!,
      apiURL,
    );

    await page.route(
      `${apiURL}${getClassesControllerFindOneV0Url(2)}`,
      (route) =>
        route.fulfill({
          ...jsonResponse,
          body: JSON.stringify(
            getClassesControllerFindOneV0ResponseMock({ id: 2 }),
          ),
        }),
    );

    const sessionResponse = getSessionsControllerFindOneV0ResponseMock({
      id: 3,
    });

    await page.route(
      `${apiURL}${getSessionsControllerIsAnonymousV0Url(2, 3)}`,
      (route) =>
        route.fulfill({
          ...jsonResponse,
          body: JSON.stringify({
            id: sessionResponse.id,
            isAnonymous: false,
          }),
        }),
    );

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
            isAnonymous: false,
          }),
        }),
    );

    await page.route(
      `${apiURL}${getSessionsControllerGetSessionProgressV0Url(2, 3)}`,
      (route) =>
        route.fulfill({
          ...jsonResponse,
          body: JSON.stringify({
            id: 3,
            taskProgress: sessionResponse.tasks.map((t) => ({
              id: t.id,
              taskProgress: TaskProgress.unOpened,
            })),
          } satisfies StudentSessionProgressDto),
        }),
    );

    await page.goto(
      `${baseURL!}/class/2/session/3/join?key=${teacherPublicKeyHash}`,
    );

    await page.waitForSelector("[data-testid=signin-student-button]");

    await page.getByTestId("signin-student-button").click();

    await page.waitForURL(/session\/3\/join/);

    await expect(page.locator(headerCurrentUserName).innerText()).resolves.toBe(
      adminUser.name,
    );
  });
});

setup.describe("authentication against the real backend", () => {
  setup("authenticate as admin", async ({ page, baseURL }) => {
    await setupForUserAuthentication(page, baseURL!, null, adminUser);

    await page.goto(`${baseURL!}/?login=test`);
    await page.waitForSelector("[data-testid=signin-button]");

    await page.getByTestId("signin-button").click();

    await page.getByTestId("password").fill(adminUser.passwords[0]);
    await page.getByTestId("submit").click();

    await page.waitForURL(`${baseURL!}/?login=test`);

    // wait for the authentication state to be set
    await page.waitForFunction((): boolean => {
      const authState = sessionStorage.getItem("authenticationState");
      if (!authState) {
        return false;
      }

      return "authenticationToken" in JSON.parse(authState);
    });

    // https://playwright.dev/docs/auth#session-storage
    const savedSessionStorage = await page.evaluate((): string =>
      JSON.stringify(sessionStorage),
    );
    fs.writeFileSync(adminFile, savedSessionStorage, {
      encoding: "utf-8",
    });
  });

  setup.skip("authenticate as student", async ({ page, baseURL, apiURL }) => {
    const teacherPublicKeyHash = await setupForMockStudentAuthentication(
      page,
      baseURL!,
      apiURL,
    );

    await page.goto(
      `${baseURL!}/class/2/session/3/join?key=${teacherPublicKeyHash}`,
    );

    await page.waitForSelector("[data-testid=signin-student-button]");

    await page.getByTestId("signin-student-button").click();

    await page.waitForURL(/session\/3\/join/);

    await expect(page.locator(headerCurrentUserName).innerText()).resolves.toBe(
      adminUser.email,
    );

    // https://playwright.dev/docs/auth#session-storage
    const sessionStorage = await page.evaluate((): string =>
      JSON.stringify(sessionStorage),
    );
    fs.writeFileSync(studentFile, sessionStorage, {
      encoding: "utf-8",
    });
  });
});

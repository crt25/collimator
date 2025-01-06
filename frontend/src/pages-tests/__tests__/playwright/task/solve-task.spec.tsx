import { getClassesControllerFindOneV0Url } from "@/api/collimator/generated/endpoints/classes/classes";
import { getClassesControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import {
  getSessionsControllerFindOneV0ResponseMock,
  getSessionsControllerGetSessionProgressV0ResponseMock,
} from "@/api/collimator/generated/endpoints/sessions/sessions.msw";
import {
  getSessionsControllerFindOneV0Url,
  getSessionsControllerGetSessionProgressV0Url,
} from "@/api/collimator/generated/endpoints/sessions/sessions";
import {
  getTasksControllerDownloadOneV0Url,
  getTasksControllerFindOneV0Url,
} from "@/api/collimator/generated/endpoints/tasks/tasks";
import { getTasksControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/tasks/tasks.msw";
import { useAdminUser } from "../authentication/authentication-helpers";
import { expect, jsonResponse, test } from "../helpers";
import { routeDummyApp } from "./helpers";

const taskBinary = new Blob(['{"existing": "task"}'], {
  type: "application/json",
});

test.describe("/session/[sessionId]/task/[taskId]/solve", () => {
  test.beforeEach(async ({ context, page, baseURL, apiURL, scratchURL }) => {
    await useAdminUser(context);

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

    await page.route(`${apiURL}${getTasksControllerFindOneV0Url(5)}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(
          getTasksControllerFindOneV0ResponseMock({ id: 5 }),
        ),
      }),
    );

    await page.route(
      `${apiURL}${getTasksControllerDownloadOneV0Url(5)}`,
      async (route) =>
        route.fulfill({
          ...jsonResponse,
          body: Buffer.from(await taskBinary.arrayBuffer()),
        }),
    );

    await routeDummyApp(page, `${scratchURL}/solve`);

    await page.route(
      `${apiURL}${getSessionsControllerGetSessionProgressV0Url(2, 3)}`,
      (route) =>
        route.fulfill({
          ...jsonResponse,
          body: JSON.stringify(
            getSessionsControllerGetSessionProgressV0ResponseMock({
              id: 3,
              taskProgress: sessionResponse.tasks.map((task) => ({
                id: task.id,
                taskProgress: "unOpened",
              })),
            }),
          ),
        }),
    );

    await page.goto(`${baseURL}/class/2/session/3/task/5/solve`);
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

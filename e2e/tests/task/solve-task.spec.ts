import { expect, jsonResponse, test } from "../../helpers";
import { useAdminUser } from "../../authentication-helpers";
import { SolveTaskPageModel } from "../sessions/solve-task-page-model";
import { routeDummyApp } from "./helpers";
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

  test("can open session menu", async ({ page: pwPage }) => {
    const page = SolveTaskPageModel.create(pwPage);

    expect(page.getSessionName()).toHaveCount(0);

    await page.openSessionMenu();
    await page.closeSessionMenu();
    expect(page.getSessionName()).toHaveCount(0);
  });

  test("shows error when save fails", async ({ page: pwPage, apiURL }) => {
    const page = SolveTaskPageModel.create(pwPage);

    await pwPage.route(
      `${apiURL}/classes/2/sessions/3/tasks/5/solutions`,
      (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Internal Server Error" }),
        }),
    );

    await page.waitForTaskLoad();

    await page.submit();

    await expect(page.getSaveErrorMessage()).toBeVisible();
    await expect(page.getSaveErrorMessage()).toBeDefined();
  });
});

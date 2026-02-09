import { expect, test } from "../../helpers";
import { useAdminUser } from "../../authentication-helpers";
import { SolveTaskPageModel } from "../sessions/solve-task-page-model";
import { adminUser } from "../../setup/seeding/user";
import { createClass } from "../classes/class-management";
import { createTask } from "../task/task-management";
import { SessionListPageModel } from "../sessions/session-list-page-model";
import { createSession } from "../sessions/session-management";
import { createAnonymousSubmission } from "../sessions/submission-management";
import checkXPositionWithAssertion from "../sessions/tasks/check-x-position-with-assertion";
import { getTasksControllerDownloadOneV0Url } from "@/api/collimator/generated/endpoints/tasks/tasks";
import { getSessionsControllerGetSessionTaskSolveV0Url } from "@/api/collimator/generated/endpoints/sessions/sessions";

const newClassName = "solve task test class";
let classId: number = -1;

const task = checkXPositionWithAssertion;

const newSessionName = "solve task test session";
let sessionId: number = -1;
let taskId: number = -1;
let sessionLink = "";
let page: SolveTaskPageModel;

test.describe.only("/session/[sessionId]/task/[taskId]/solve", () => {
  test.beforeEach(async ({ context }) => {
    await useAdminUser(context);
  });

  test("preparation", async ({ page, baseURL, browser }) => {
    classId = await createClass(baseURL!, page, {
      name: newClassName,
      teacherId: adminUser.id,
    }).then((r) => r.id);

    taskId = await createTask(baseURL!, page, {
      title: "Solve Task Test",
      description: "A description.",
      template: task,
    }).then((r) => r.id);

    const { id } = await createSession(baseURL!, page, {
      classId: classId,
      name: newSessionName,
      description: "A description.",
      taskIds: [taskId],
      isAnonymous: true,
    });

    sessionId = id;

    await page.goto(`${baseURL}/class/${classId}/session`);

    const sessionList = await SessionListPageModel.create(page);
    sessionLink = await sessionList.getSessionLink(sessionId);

    for (const solution of task.solutions.correct.slice(0, 2)) {
      await createAnonymousSubmission(browser, sessionLink, task, solution);
    }
  });

  test.describe("tests", () => {
    test.beforeEach(async ({ page, baseURL, apiURL }) => {
      const taskBuffer = await task.template();

      await page.route(
        `${apiURL}${getTasksControllerDownloadOneV0Url(taskId)}`,
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/x.scratch.sb3",
            body: taskBuffer,
          });
        },
      );

      await page.goto(
        `${baseURL}/class/${classId}/session/${sessionId}/task/${taskId}/solve`,
      );
      await page.waitForSelector("#__next");
    });

    test("shows an iframe", async ({ page }) => {
      expect(page.locator("iframe")).toHaveCount(1);
    });

    test("can open session menu", async ({ page: pwPage }) => {
      page = SolveTaskPageModel.create(pwPage);
      await page.waitForTaskLoad();

      expect(page.getSessionName()).toHaveCount(0);

      await page.openSessionMenu();
      await page.closeSessionMenu();
      expect(page.getSessionName()).toHaveCount(0);
    });

    test("shows error when save fails", async ({ page: pwPage, apiURL }) => {
      const page = SolveTaskPageModel.create(pwPage);

      await page.waitForTaskLoad();

      await pwPage.route(
        `${apiURL}${getSessionsControllerGetSessionTaskSolveV0Url(classId, sessionId, taskId)}`,
        (route) =>
          route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ message: "Internal Server Error" }),
          }),
      );

      page.clickSubmitButton();

      await expect(page.getSaveErrorMessage()).toBeVisible();
      await expect(page.getSaveErrorMessage()).toBeDefined();
    });
  });
});

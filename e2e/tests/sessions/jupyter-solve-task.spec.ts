import { useAdminUser } from "../../authentication-helpers";
import { expect, test } from "../../helpers";
import { adminUser } from "../../setup/seeding/user";
import { createClass } from "../classes/class-management";
import { createJupyterTaskViaApi } from "../task/jupyter-task-management";
import { JoinAnonymousSessionPageModel } from "./join-anonymous-session-page-model";
import { SessionListPageModel } from "./session-list-page-model";
import { createSession } from "./session-management";

// End-to-end coverage of the Jupyter *student* flow, which had none: a student
// joins an anonymous lesson holding a Jupyter task and the notebook opens in
// the embedded JupyterLite.
//
// The task is created through the API (see createJupyterTaskViaApi) because
// saving a Jupyter task through the UI requires a ready Pyodide kernel to run
// otter-grader, which never becomes ready in headless Chromium.
let classId: number = -1;
let sessionId: number = -1;
let sessionLink = "";

test.describe.serial("jupyter solve task", () => {
  test.beforeEach(async ({ context }) => {
    await useAdminUser(context);
  });

  test("preparation", async ({ page, baseURL, apiURL }) => {
    classId = await createClass(baseURL!, page, {
      name: "jupyter class",
      teacherId: adminUser.id,
    }).then((r) => r.id);

    // the page must be on the app's origin for the API helper to read the
    // authenticated user's token from local storage
    await page.goto(`${baseURL}/task`);

    const { id: taskId } = await createJupyterTaskViaApi(page, apiURL, {
      title: "jupyter task",
      description: "A jupyter task.",
    });

    const { id } = await createSession(baseURL!, page, {
      classId,
      name: "jupyter lesson",
      description: "A jupyter lesson.",
      taskIds: [taskId],
      isAnonymous: true,
    });

    sessionId = id;

    await page.goto(`${baseURL}/class/${classId}/session`);

    const list = await SessionListPageModel.create(page);
    sessionLink = await list.getSessionLink(sessionId);
  });

  test("a student can open the jupyter notebook of a task", async ({
    browser,
  }) => {
    const studentContext = await browser.newContext();

    try {
      const studentPage = await studentContext.newPage();

      await studentPage.goto(sessionLink);

      const joinPage = await JoinAnonymousSessionPageModel.create(studentPage);
      await joinPage.joinSession();

      await studentPage.waitForURL(
        /\/class\/\d+\/session\/\d+\/task\/\d+\/solve/,
      );

      const jupyterFrame = studentPage.frameLocator("iframe");

      // JupyterLite boots, the task is transferred and the student's copy of
      // the notebook is opened. This takes a while: the whole lab application
      // is loaded inside the iframe.
      await expect(
        jupyterFrame.locator(".jp-Notebook .jp-Cell").first(),
      ).toBeVisible({ timeout: 120 * 1000 });
    } finally {
      await studentContext.close();
    }
  });
});

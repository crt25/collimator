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
// saving a Jupyter task through the UI runs otter-grader, which does not
// complete under headless Chromium. Note that the Pyodide kernel itself starts
// and prepares fine - otter-grader installs and imports; what does not settle
// is the session context of the notebook panel opened to execute the notebook.
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

  // Submitting runs the notebook through otter-grader. Several of the promises
  // on that path are never settled when a session context cannot settle on a
  // kernel, and the last of them sits between the student pressing Submit and
  // their work being graded - so a failure there used to leave them on a
  // spinner that never stopped, with no way out and no idea what happened.
  //
  // This asserts the guarantee the code actually makes: the submission
  // TERMINATES. Grading itself does not currently complete under headless
  // Chromium, so asserting success would be asserting something we have never
  // observed; asserting termination is what protects the student, and it fails
  // if the eternal spinner ever comes back.
  test("submitting a jupyter solution always terminates", async ({
    browser,
  }) => {
    // booting JupyterLite and preparing the Pyodide kernel for otter-grader
    // does not fit in the default per-test budget
    test.setTimeout(10 * 60 * 1000);

    const studentContext = await browser.newContext();

    try {
      const studentPage = await studentContext.newPage();

      // Surface the embedded app's own errors. When this test fails it fails
      // inside JupyterLite, where the playwright trace shows only a spinner;
      // these lines are what makes such a failure diagnosable at all. Errors
      // only - the debug chatter runs to hundreds of lines per run.
      studentPage.on("console", (message) => {
        if (message.type() === "error") {
          console.log(`[jupyter console] ${message.text()}`);
        }
      });
      studentPage.on("pageerror", (error) =>
        console.log(`[jupyter pageerror] ${error.message}`),
      );

      await studentPage.goto(sessionLink);

      const joinPage = await JoinAnonymousSessionPageModel.create(studentPage);
      await joinPage.joinSession();

      await studentPage.waitForURL(
        /\/class\/\d+\/session\/\d+\/task\/\d+\/solve/,
      );

      const jupyterFrame = studentPage.frameLocator("iframe");

      await expect(
        jupyterFrame.locator(".jp-Notebook .jp-Cell").first(),
      ).toBeVisible({ timeout: 120 * 1000 });

      const submitButton = studentPage.getByTestId("submit-solution-button");

      await submitButton.click();

      // while the submission is running the button is disabled; it becoming
      // usable again is the observable end of the attempt, whichever way it
      // went. The budget is comfortably above the extension's own bound so
      // that a failure here means "never came back", not "came back slowly".
      await expect(
        submitButton,
        "the submit button never came back - the submission hung",
      ).toBeEnabled({ timeout: 5 * 60 * 1000 });
    } finally {
      await studentContext.close();
    }
  });
});

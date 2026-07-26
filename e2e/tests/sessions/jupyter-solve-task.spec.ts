import { useAdminUser } from "../../authentication-helpers";
import { expect, test } from "../../helpers";
import { adminUser } from "../../setup/seeding/user";
import { createClass } from "../classes/class-management";
import { createTask } from "../task/task-management";
import jupyterTaskTemplate from "./tasks/jupyter";
import { JoinAnonymousSessionPageModel } from "./join-anonymous-session-page-model";
import { SessionListPageModel } from "./session-list-page-model";
import { createSession } from "./session-management";

// End-to-end coverage of the Jupyter flow: a teacher authors a Jupyter task
// through the task-edit modal (which runs the otter *assign* pipeline inside the
// embedded JupyterLite), then a student joins an anonymous lesson holding that
// task, opens the notebook, and submits their work for grading (which runs the
// otter *grade* pipeline - the same kernel path as assign).
//
// Saving the notebook cold is minutes: JupyterLite boots, Pyodide loads, and
// otter-grader is downloaded and installed before either pipeline runs. That
// upfront cost is why the budgets below are generous relative to a normal e2e.
let classId: number = -1;
let sessionId: number = -1;
let sessionLink = "";

// A cold Jupyter save runs otter assign inside JupyterLite (boot Pyodide,
// install otter-grader, generate the student notebook and autograder). The wait
// is for the edit modal to close once that finishes.
const jupyterSaveTimeoutMs = 5 * 60 * 1000;

test.describe.serial("jupyter solve task", () => {
  test.beforeEach(async ({ context }) => {
    await useAdminUser(context);
  });

  test("preparation", async ({ page, baseURL }) => {
    // Authoring the task through the UI runs otter assign in the browser, so
    // this test needs far more than the default per-test budget.
    test.setTimeout(8 * 60 * 1000);

    classId = await createClass(baseURL!, page, {
      name: "jupyter class",
      teacherId: adminUser.id,
    }).then((r) => r.id);

    const { id: taskId } = await createTask(
      baseURL!,
      page,
      {
        title: "jupyter task",
        description: "A jupyter task.",
        template: jupyterTaskTemplate,
      },
      jupyterSaveTimeoutMs,
    );

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

  // Submitting runs the notebook through otter-grader in the embedded
  // JupyterLite. This asserts the submission actually SUCCEEDS: grading
  // completes, the graded solution is saved, and the submit button shows its
  // success icon - not merely that the attempt terminated.
  test("submitting a jupyter solution succeeds", async ({ browser }) => {
    // booting JupyterLite, preparing the Pyodide kernel for otter-grader, and
    // grading the notebook does not fit in the default per-test budget
    test.setTimeout(8 * 60 * 1000);

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

      // Grading completing makes the submit handler resolve, which paints the
      // success icon inside the button. The budget is comfortably above the
      // extension's own bounded wait so a failure here means grading did not
      // complete, not that it completed slowly.
      await expect(
        submitButton.getByTestId("success-icon"),
        "grading did not complete - the submit button never showed success",
      ).toBeVisible({ timeout: 5 * 60 * 1000 });

      // The submit handler swallows a grading failure into a save-error banner
      // while still resolving (so the success icon alone would show even on the
      // graceful-failure path). Its absence is what distinguishes a real
      // success from grading having failed and been handled.
      await expect(
        studentPage.getByTestId("save-error-message"),
        "grading failed - the submission fell back to the save-error path",
      ).toHaveCount(0);
    } finally {
      await studentContext.close();
    }
  });
});

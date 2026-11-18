import { expect, test } from "@playwright/test";
import { genericNotebookTask, invalidTask, isZip } from "./helpers/fixtures";
import {
  FileData,
  fileContent,
  getRequestsFromApp,
  openApp,
  sendRequest,
} from "./helpers/host";

type Task = { file: FileData; initialSolution: Submission };
type Submission = {
  file: FileData;
  passedTests: unknown[];
  failedTests: unknown[];
};

/**
 * The life of a task across the three modes: a teacher imports a notebook and
 * saves it (edit), a student opens it and submits (solve), and the result is
 * shown read-only (show).
 *
 * The tests run in order and pass the files produced by one step on to the
 * next, exactly like the platform stores what the app returns and hands it
 * back later.
 */
test.describe.configure({ mode: "serial" });

// what the app returned in edit mode: the task in the platform's own format
let savedTask: Task;
// what the app returned in solve mode
let submission: Submission;

test.describe("edit mode", () => {
  test("rejects a file that is not a task", async ({ page }) => {
    await openApp(page, "edit");

    const response = await sendRequest(page, "importTask", {
      task: invalidTask(),
      language: "en",
    });

    expect(response.error).toEqual(expect.any(String));
  });

  test("imports a notebook, exports it and saves it as a task", async ({
    page,
  }) => {
    await openApp(page, "edit");

    const imported = await sendRequest(page, "importTask", {
      task: genericNotebookTask(),
      language: "en",
    });

    expect(imported.error).toBeUndefined();

    const exported = await sendRequest(page, "exportTask");
    const exportResult = exported.result as {
      file: FileData;
      filename: string;
    };

    expect(exported.error).toBeUndefined();
    expect(exportResult.filename).toBe("ClassMosaicExportedJupyterTask.zip");
    expect(isZip(fileContent(exportResult.file))).toBe(true);

    const task = await sendRequest(page, "getTask");

    expect(task.error).toBeUndefined();

    savedTask = task.result as Task;

    expect(isZip(fileContent(savedTask.file))).toBe(true);
    expect(savedTask.initialSolution.file.$file.size).toBeGreaterThan(0);
    expect(savedTask.initialSolution.passedTests).toEqual(expect.any(Array));
    expect(savedTask.initialSolution.failedTests).toEqual(expect.any(Array));
  });
});

test.describe("solve mode", () => {
  test("loads the saved task, reports the start and returns a submission", async ({
    page,
  }) => {
    await openApp(page, "solve");

    const loaded = await sendRequest(page, "loadTask", {
      task: savedTask.file,
      language: "en",
    });

    expect(loaded.error).toBeUndefined();

    // the platform records this as the start of the student's work
    expect(await getRequestsFromApp(page, "postTaskStarted")).not.toHaveLength(
      0,
    );

    const response = await sendRequest(page, "getSubmission");

    expect(response.error).toBeUndefined();

    submission = response.result as Submission;

    expect(submission.file.$file.size).toBeGreaterThan(0);
    expect(submission.passedTests).toEqual(expect.any(Array));
    expect(submission.failedTests).toEqual(expect.any(Array));
  });

  test("loads a previous submission", async ({ page }) => {
    await openApp(page, "solve");

    const response = await sendRequest(page, "loadSubmission", {
      task: savedTask.file,
      submission: submission.file,
      language: "en",
    });

    expect(response.error).toBeUndefined();
    expect(await getRequestsFromApp(page, "postTaskStarted")).not.toHaveLength(
      0,
    );
  });
});

test.describe("show mode", () => {
  test("loads a submission read-only", async ({ page }) => {
    await openApp(page, "show");

    const response = await sendRequest(page, "loadSubmission", {
      task: savedTask.file,
      submission: submission.file,
      language: "en",
    });

    expect(response.error).toBeUndefined();
  });

  test("does not allow importing a notebook", async ({ page }) => {
    await openApp(page, "show");

    const response = await sendRequest(page, "importTask", {
      task: genericNotebookTask(),
      language: "en",
    });

    expect(response.error).toEqual(expect.any(String));
  });
});

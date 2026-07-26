import { readFile } from "fs/promises";
import path from "path";
import { Page } from "@playwright/test";

/**
 * Creates a Jupyter task through the API rather than through the task-edit
 * modal.
 *
 * The UI path cannot be used in an automated browser: saving a Jupyter task
 * runs otter-grader inside the embedded JupyterLite, which requires a ready
 * Pyodide kernel. In headless Chromium that kernel never finishes preparing,
 * so the save spins indefinitely (the modal never closes). Creating the task
 * through the API keeps the Jupyter *student* flow — the part these tests are
 * about — fully exercisable.
 *
 * The uploaded archive must be in the CRT-internal format
 * (template.ipynb + student.ipynb + autograder.zip); a bare notebook archive is
 * rejected by the app with a MissingRequiredFilesError.
 */
export const createJupyterTaskViaApi = async (
  page: Page,
  apiUrl: string,
  task: { title: string; description: string },
): Promise<{ id: number }> => {
  const authenticationToken = await page.evaluate(() => {
    const state = window.localStorage.getItem("authenticationState");

    return state === null
      ? null
      : (JSON.parse(state) as { authenticationToken?: string })
          .authenticationToken;
  });

  if (!authenticationToken) {
    throw new Error(
      "Cannot create a task via the API without an authenticated user",
    );
  }

  const taskFile = await readFile(
    path.join(
      import.meta.dirname,
      "..",
      "sessions",
      "tasks",
      "jupyter",
      "crt-internal",
      "task.zip",
    ),
  );

  const form = new FormData();
  form.append("title", task.title);
  form.append("description", task.description);
  form.append("type", "JUPYTER");
  form.append("isPublic", "false");
  // the backend requires exactly one initial reference solution
  form.append(
    "referenceSolutions",
    JSON.stringify([
      {
        title: "Initial solution",
        description: "The initial solution of the task",
        isInitial: true,
        tests: [],
      },
    ]),
  );
  form.append(
    "referenceSolutionsFiles",
    new Blob([taskFile], { type: "application/zip" }),
    "task.zip",
  );
  form.append(
    "taskFile",
    new Blob([taskFile], { type: "application/zip" }),
    "task.zip",
  );

  const response = await fetch(`${apiUrl}/api/v0/tasks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authenticationToken}` },
    body: form,
  });

  if (!response.ok) {
    throw new Error(
      `Could not create the Jupyter task: ${response.status} ${await response.text()}`,
    );
  }

  const { id } = (await response.json()) as { id: number };

  return { id };
};

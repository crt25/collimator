import { Browser } from "@playwright/test";
import { JoinAnonymousSessionPageModel } from "./join-anonymous-session-page-model";
import { SolveTaskPageModel } from "./solve-task-page-model";
import { TaskTemplateWithSolutions } from "./tasks/task-template-with-solutions";

export const createAnonymousSubmission = async (
  browser: Browser,
  sessionLink: string,
  pseudonym: string,
  task: TaskTemplateWithSolutions,
  solution: () => Promise<Buffer>,
): Promise<void> => {
  const studentContext = await browser.newContext({});

  try {
    const studentPage = await studentContext.newPage();

    await studentPage.goto(sessionLink);

    const joinPage = await JoinAnonymousSessionPageModel.create(studentPage);

    await joinPage.pseudonymInput.fill(pseudonym);
    await joinPage.submit();

    // ensure we start listening for the loadTask event before the page is loaded
    const solvePagePromise = SolveTaskPageModel.create(studentPage);

    await joinPage.joinSession();

    await studentPage.waitForURL(
      /\/class\/\d+\/session\/\d+\/task\/\d+\/solve/,
    );

    const solvePage = await solvePagePromise;

    await solvePage.loadSolution(task, solution);

    await solvePage.submit();
  } finally {
    try {
      await studentContext.close();
    } catch (e) {
      // Ignore errors where the context is already closed.
      // This may happen if the page is closed before because of an error.
      console.warn(
        "Could not close student context, probably already closed due to an exception.",
        e,
      );
    }
  }
};

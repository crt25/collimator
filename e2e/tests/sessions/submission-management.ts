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

    await joinPage.joinSession();

    await studentPage.waitForURL(
      /\/class\/\d+\/session\/\d+\/task\/\d+\/solve/,
    );

    const solvePage = await SolveTaskPageModel.create(studentPage);

    await solvePage.loadSolution(task, solution);

    await solvePage.submit();

    await studentPage.close();
  } finally {
    await studentContext.close();
  }
};

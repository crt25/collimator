import { useAdminUser } from "../../authentication-helpers";
import { expect, test } from "../../helpers";
import { adminUser } from "../../setup/seeding/user";
import { createClass } from "../classes/class-management";
import { createTask } from "../task/task-management";

import { waitUntil } from "../../setup/helpers";
import { SessionListPageModel } from "./session-list-page-model";
import { createSession } from "./session-management";
import checkXPositionWithAssertion from "./tasks/check-x-position-with-assertion";
import { createAnonymousSubmission } from "./submission-management";
import { SessionProgressPageModel } from "./session-progress-page-model";
import { SessionAnalysisPageModel } from "./session-analysis-page-model";

import { getSolutionsControllerFindCurrentAnalysesV0Url } from "@/api/collimator/generated/endpoints/solutions/solutions";
import { CurrentAnalysesDto } from "@/api/collimator/generated/models";
import { SerializedAuthenticationContextType } from "@/contexts/AuthenticationContext";

const newClassName = "new class name";
let classId: number = -1;

const task = checkXPositionWithAssertion;
const solutions = [...task.solutions.correct, ...task.solutions.incorrect];

const taskTitles = ["task 1", "task 2", "third task"];
const taskIds: number[] = [];
let firstTaskId: number = -1;

const newSessionName = "new session name";
let sessionId: number = -1;
let sessionLink = "";

test.describe("session analysis", () => {
  test.beforeEach(async ({ context }) => {
    await useAdminUser(context);
  });

  test("preparation", async ({ page, baseURL, browser }) => {
    classId = await createClass(baseURL!, page, {
      name: newClassName,
      teacherId: adminUser.id,
    }).then((r) => r.id);

    for (const taskTitle of taskTitles) {
      await createTask(baseURL!, page, {
        title: taskTitle,
        description: "A description.",
        template: task,
      }).then((r) => {
        taskIds.push(r.id);
      });
    }

    const { id, taskIds: sortedTaskIds } = await createSession(baseURL!, page, {
      classId: classId,
      name: newSessionName,
      description: "A description.",
      taskIds,
      isAnonymous: true,
    });

    sessionId = id;
    firstTaskId = sortedTaskIds[0];

    await page.waitForURL(`${baseURL}/class/${classId}/session`);

    const list = await SessionListPageModel.create(page);
    sessionLink = await list.getSessionLink(sessionId);

    // create submissions
    for (const solution of solutions) {
      await createAnonymousSubmission(browser, sessionLink, task, solution);
    }
  });

  test.describe("tests", () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/class/${classId}/session`);

      const list = await SessionListPageModel.create(page);
      await list.viewItem(sessionId);

      await page.waitForURL(
        `${baseURL}/class/${classId}/session/${sessionId}/progress`,
      );
    });

    test.describe("/class/{id}/session/{id}/progress", () => {
      test("lists all submissions", async ({ page }) => {
        const progress = await SessionProgressPageModel.create(page);

        await progress.waitForRows(solutions.length);
      });
    });

    // wait until all analyses are available - they are created asynchronously
    test("wait for analysis", async ({ page }) => {
      const url = getSolutionsControllerFindCurrentAnalysesV0Url(
        classId,
        sessionId,
        firstTaskId,
      );

      await waitUntil(
        () =>
          page.evaluate(
            async ({ url, expectedStudentAnalyses }) => {
              const authState = JSON.parse(
                localStorage.getItem("authenticationState")!,
              ) as SerializedAuthenticationContextType;

              const response = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${authState.authenticationToken}`,
                },
              });

              if (response.status !== 200) {
                return false;
              }

              const analyses = (await response.json()) as CurrentAnalysesDto;

              return (
                analyses.studentAnalyses.length === expectedStudentAnalyses
              );
            },
            { url, expectedStudentAnalyses: solutions.length },
          ),
        10,
        500,
      );
    });

    test.describe("/class/{id}/session/{id}/analysis", () => {
      test.beforeEach(async ({ page, baseURL }) => {
        await page.getByTestId(`task-${firstTaskId}`).click();

        await page.waitForURL(
          `${baseURL}/class/${classId}/session/${sessionId}/task/${firstTaskId}/student`,
        );

        await page.getByTestId("task-instance-analysis-tab").click();

        await page.waitForURL(
          `${baseURL}/class/${classId}/session/${sessionId}/task/${firstTaskId}/analysis`,
        );
      });

      test("shows expected analysis chart", async ({ page }, testInfo) => {
        const analysis = await SessionAnalysisPageModel.create(page);

        await analysis.setXAxis("statement");
        await analysis.setYAxis("test");

        // by default, the snapshot name includes the operating system
        // resulting in failing tests on different operating systems
        testInfo.snapshotSuffix = "";

        await expect(analysis.chart).toHaveScreenshot(
          "session-analysis-chart.png",
          {
            maxDiffPixelRatio: 0.2,
            threshold: 0.25,
          },
        );
      });
    });
  });
});

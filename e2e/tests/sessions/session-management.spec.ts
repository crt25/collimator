import { useAdminUser } from "../../authentication-helpers";
import { expect, test } from "../../helpers";
import { progressList, sessionList } from "../../selectors";
import { createClass } from "../classes/class-management";
import { routeDummyApp } from "../task/helpers";
import { createTask } from "../task/task-management";
import { SessionFormPageModel } from "./session-form-page-model";
import { SessionListPageModel } from "./session-list-page-model";
import { createSession } from "./session-management";
import checkXPositionWithAssertion from "./tasks/check-x-position-with-assertion";

const newClassName = "new class name";
let newClassId: number = -1;

const taskTitles = ["task 1", "task 2", "third task"];
const taskIds: number[] = [];

const newSessionName = "new session name";
let newSessionId: number = -1;

const updatedSessionName = "updated session name";

test.describe("session management", () => {
  test.beforeEach(async ({ page, context, scratchURL }) => {
    await useAdminUser(context);
    await routeDummyApp(page, `${scratchURL}/edit`);
  });

  test("preparation", async ({ page, baseURL }) => {
    newClassId = await createClass(baseURL!, page, {
      name: newClassName,
    }).then((r) => r.id);

    for (const taskTitle of taskTitles) {
      await createTask(baseURL!, page, {
        title: taskTitle,
        description: "A description.",
        template: checkXPositionWithAssertion,
      }).then((r) => {
        taskIds.push(r.id);
      });
    }
  });

  test.describe("tests", () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/class/${newClassId}/session`);
    });

    test.describe("/class/{id}/session/create", () => {
      test("can create a new session", async ({ page: pwPage, baseURL }) => {
        newSessionId = await createSession(baseURL!, pwPage, {
          classId: newClassId,
          name: newSessionName,
          description: "A description.",
          taskIds,
        }).then((r) => r.id);
      });
    });

    test.describe("/class/{id}/session/{id}/edit", () => {
      test.beforeEach(async ({ page }) => {
        const list = await SessionListPageModel.create(page);
        await list.editItem(newSessionId);
      });

      test("can update an existing session", async ({
        page: pwPage,
        baseURL,
      }) => {
        const page = await SessionFormPageModel.create(pwPage);

        // expect the form to be pre-filled
        expect(await page.inputs.title.inputValue()).toBe(newSessionName);

        const selectedTaskIds = await page.getSelectedTaskIds();
        expect(selectedTaskIds.length).toBe(taskTitles.length);

        // delete last task
        await page.removeTask(selectedTaskIds[selectedTaskIds.length - 1]);

        expect((await page.getSelectedTaskIds()).length).toBe(
          selectedTaskIds.length - 1,
        );

        await page.inputs.title.fill(updatedSessionName);
        await page.inputs.description.fill("Updated description.");
        await page.submitButton.click();

        await pwPage.waitForURL(`${baseURL}/class/${newClassId}/session`);

        const list = await SessionListPageModel.create(pwPage);

        await expect(list.getTitle(newSessionId)).toHaveText(
          updatedSessionName,
        );
      });
    });

    test.describe("/class/{id}/session/{id}/progress", () => {
      test.beforeEach(async ({ baseURL, page }) => {
        const list = await SessionListPageModel.create(page);

        await list.viewItem(newSessionId);
        await page.waitForURL(
          `${baseURL}/class/${newClassId}/session/${newSessionId}/progress`,
        );
      });

      test("renders the progress list", async ({ page }) => {
        await expect(page.locator(progressList)).toHaveCount(1);
      });
    });

    test.describe("/class/{id}/session/{id}", () => {
      test.beforeEach(async ({ page }) => {
        await SessionListPageModel.create(page);
      });

      test("renders the fetched items", async ({ page }) => {
        await expect(page.locator(sessionList).locator("tbody tr")).toHaveCount(
          1,
        );
      });

      test("can delete listed items", async ({ page: pwPage }) => {
        const page = await SessionListPageModel.create(pwPage);

        await page.deleteItem(newSessionId);

        // Wait for the deletion to be reflected in the UI
        await expect(page.getItemActions(newSessionId)).toHaveCount(0);
      });
    });
  });
});

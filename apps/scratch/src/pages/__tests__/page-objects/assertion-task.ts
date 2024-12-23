/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "playwright/test";
import { getBlockConfigButtonSelector } from "../locators";
import { ScratchEditorPage } from "./scratch-editor";
import { loadTask } from "../helpers";
import tasks, { TestTask } from "../tasks";

export class AssertionTaskPage extends ScratchEditorPage {
  private constructor(page: Page) {
    super(page);
  }

  get enabledBlockConfigButtons() {
    return {
      moveSteps: this.page.locator(
        getBlockConfigButtonSelector("motion_movesteps"),
      ),
    };
  }

  get disabledBlockConfigButtons() {
    return {
      whenTaskFinishedRunning: this.page.locator(
        getBlockConfigButtonSelector(
          "assertions_event_whenTaskFinishedRunning",
        ),
      ),
      assert: this.page.locator(
        getBlockConfigButtonSelector("assertions_noop_assert"),
      ),
    };
  }

  get taskBlocks() {
    return {
      catActor: {
        visualTopOfEditableStack: this.page.locator(
          "[data-id='HN(hP9y9,$[q0=u7VklJ']",
        ),
        visualTopOfAssertionStack: this.page.locator(
          "[data-id='4_e9[GL:|#*oG]X]FdQm']",
        ),
      },
    };
  }

  get assertionState() {
    return {
      passed: this.page.getByTestId("assertion-state").getByTestId("passed"),
      total: this.page.getByTestId("assertion-state").getByTestId("total"),
    };
  }

  static async load(
    page: Page,
  ): Promise<{ page: AssertionTaskPage; task: TestTask }> {
    await loadTask(page, tasks.assertionTask);

    return { page: new AssertionTaskPage(page), task: tasks.assertionTask };
  }
}

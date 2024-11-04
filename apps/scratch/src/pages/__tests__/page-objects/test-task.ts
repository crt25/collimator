/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "playwright/test";
import { getBlockConfigButtonSelector } from "../locators";
import { ScratchEditorPage } from "./scratch-editor";
import { loadTask } from "../helpers";
import tasks, { TestTask } from "../tasks";

export class TestTaskPage extends ScratchEditorPage {
  private constructor(page: Page) {
    super(page);
  }

  get enabledBlockConfigButtons() {
    return {
      moveSteps: this.page.locator(
        getBlockConfigButtonSelector("motion_movesteps"),
      ),
      turnRight: this.page.locator(
        getBlockConfigButtonSelector("motion_turnright"),
      ),
      goto: this.page.locator(getBlockConfigButtonSelector("motion_goto")),
    };
  }

  get disabledBlockConfigButtons() {
    return {
      turnLeft: this.page.locator(
        getBlockConfigButtonSelector("motion_turnleft"),
      ),
    };
  }

  get taskBlocks() {
    return {
      catActor: {
        topOfEditableStack: this.page.locator(
          "[data-id='DMA4vbfmH7Ag=.YTb639']",
        ),
        editableBlock: this.page.locator("[data-id='@Z24?:3gFhIy;D;=NXM*']"),
        topOfFrozenStack: this.page.locator("[data-id='*t~VMcxLD[(lt8Ja;s#-']"),
        frozenBlock: this.page.locator("[data-id='!cHbf-/Rw+|=pKw:^+M+']"),
        visualTopOfAppendableStack: this.page.locator(
          "[data-id='iY}I[=PNCjG}GzJS1G/X']",
        ),
        visualBottomOfAppendableStack: this.page.locator(
          "[data-id='6eyuS~n}^ivm:]/DnM$+']",
        ),
        insertableSlot: this.page.locator("[data-id='H{{dc|4tE3KZ#:7DEV7G']"),
      },
    };
  }

  static async load(
    page: Page,
  ): Promise<{ page: TestTaskPage; task: TestTask }> {
    await loadTask(page, tasks.testTask);

    return { page: new TestTaskPage(page), task: tasks.testTask };
  }
}

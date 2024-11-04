/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getBlockConfigButtonSelector } from "../locators";
import { ScratchEditorPage } from "./scratch-editor";

export class TestTaskPage extends ScratchEditorPage {
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
      catActor: [this.page.locator("[data-id='@Z24?:3gFhIy;D;=NXM*']")],
    };
  }
}

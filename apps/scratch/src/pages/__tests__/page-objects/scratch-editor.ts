/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Locator, Page } from "playwright/test";
import {
  getAllTargetBlocksSelector,
  getBlockCanvasSelector,
  getBlockConfigButtonSelector,
  getBlockConfigFormSelector,
  getFlyoutCanvasSelector,
} from "../locators";

export class ScratchEditorPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get stage() {
    return this.page.getByTestId("stage-selector");
  }

  get fullscreenButton() {
    return this.page.getByTestId("stage-fullscreen-button");
  }

  get unFullscreenButton() {
    return this.page.getByTestId("stage-unfullscreen-button");
  }

  get blocksOfCurrentTarget() {
    return this.page.locator(getAllTargetBlocksSelector(true));
  }

  get blocksOfCurrentTargetNonFrozen() {
    return this.page.locator(getAllTargetBlocksSelector(false));
  }

  get blockConfigForm() {
    return this.page.locator(getBlockConfigFormSelector());
  }

  get toolbox() {
    return this.page.locator(getFlyoutCanvasSelector());
  }

  get blockCanvas() {
    return this.page.locator(getBlockCanvasSelector());
  }

  get openTaskConfigButton() {
    return this.page.getByTestId("open-taskconfig-button");
  }

  get taskConfigForm() {
    return this.page.getByTestId("task-config-form");
  }

  getBlockConfigButton(opcode: string) {
    return this.page.locator(getBlockConfigButtonSelector(opcode));
  }

  openBlockConfig(opcode: string, options?: { force?: boolean }) {
    const configButton = this.getBlockConfigButton(opcode);

    return configButton.click(options);
  }

  getBlockInToolbox(opcode: string) {
    return this.page.locator(
      `${getFlyoutCanvasSelector()} [data-id='${opcode}']`,
    );
  }

  enableFullScreen() {
    return this.fullscreenButton.click();
  }

  disableFullScreen() {
    return this.unFullscreenButton.click();
  }

  selectStage() {
    return this.stage.click();
  }

  openTaskConfig() {
    return this.openTaskConfigButton.click();
  }

  async removeAllNonFrozenBlocks() {
    while ((await this.blocksOfCurrentTargetNonFrozen.count()) > 0) {
      await this.blocksOfCurrentTargetNonFrozen.first().dragTo(this.toolbox, {
        force: true,
      });

      // wait for scratch to update
      await this.page.waitForTimeout(1000);
    }
  }

  async scrollBlockIntoView(visibleBlock: Locator, scrollToBlock: Locator) {
    await visibleBlock.hover();

    const toolboxRight = await this.toolbox.evaluate(
      (toolbox) =>
        toolbox.getBoundingClientRect().x +
        toolbox.getBoundingClientRect().width,
    );

    const offsetX =
      (await scrollToBlock.evaluate(
        (canvas) => canvas.getBoundingClientRect().x,
      )) - toolboxRight;

    // scroll all the way to the right so that
    await this.page.mouse.wheel(offsetX, 0);
  }

  async countBlocksInStack(stack: Locator) {
    return stack.evaluate(
      // querySelector only looks at the subtree but we also want to match the element itself
      (el) =>
        (el
          ?.closest("g.blocklyDraggable")
          ?.querySelectorAll(".blocklyDraggable").length || -1) +
        // finally, we add 1 to account for the block matched by the closest call
        // since querySelectorAll matches only the children
        1,
    );
  }

  async countBlocksInParent(stack: Locator) {
    return stack.evaluate(
      (el) =>
        // we want to count the blocks in the parent stack, hence we look for the parent element
        // because closest also looks at the element itself, we need to go back up one level first
        (el?.parentElement
          ?.closest("g.blocklyDraggable")
          ?.querySelectorAll(".blocklyDraggable").length || -1) + 1,
    );
  }

  async countBlocksInParentStack(stack: Locator) {
    return stack.evaluate(
      (el) =>
        (el
          ?.closest("g.blocklyDraggable:not(.blocklyDraggable g)")
          // again, because querySelector only looks at the subtree, we need to go back up another level
          ?.querySelectorAll(".blocklyDraggable").length || -1) + 1,
    );
  }
}

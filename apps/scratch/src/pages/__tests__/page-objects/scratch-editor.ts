/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { randomBytes } from "crypto";
import { Locator, Page } from "playwright/test";
import {
  getAllTargetBlocksSelector,
  getBlockCanvasSelector,
  getBlockConfigButtonSelector,
  getBlockConfigFormSelector,
  getFlyoutSelector,
} from "../locators";
import {
  isBlockWitOpCodeInFlyoutCanvas,
  isScratchBlock,
  isVisualTopOfStack,
} from "../../../utilities/scratch-selectors";

export class ScratchEditorPage {
  protected readonly page: Page;

  protected constructor(page: Page) {
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
    return this.page.locator(getFlyoutSelector());
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

  getBlockFreezeButton(block: Locator) {
    return block.locator(".stack-freeze-button");
  }

  toggleBlockFreezeButton(block: Locator) {
    return this.getBlockFreezeButton(block).click();
  }

  getBlockInToolbox(opcode: string) {
    return this.page.locator(isBlockWitOpCodeInFlyoutCanvas(opcode));
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

  async pressGreenFlag() {
    return this.page
      .getByTestId("stage-controls")
      .locator("img:first-child")
      .click();
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

  async scrollBlockIntoView(scrollToBlock: Locator) {
    const toolboxMiddle = await this.toolbox.evaluate(
      (toolbox) =>
        toolbox.getBoundingClientRect().top +
        toolbox.getBoundingClientRect().height / 2,
    );

    const toolboxRight = await this.toolbox.evaluate(
      (toolbox) =>
        toolbox.getBoundingClientRect().x +
        toolbox.getBoundingClientRect().width,
    );

    await this.page.mouse.move(toolboxRight + 100, toolboxMiddle);

    const offsetX =
      (await scrollToBlock.evaluate(
        (canvas) => canvas.getBoundingClientRect().x,
      )) -
      toolboxRight -
      75; // ensure the entire block (including the freeze buttons at the top right) is visible

    // scroll all the way to the right so that
    await this.page.mouse.wheel(offsetX, 0);
  }

  async removeBlock(block: Locator) {
    await this.scrollBlockIntoView(block);

    return block.dragTo(this.toolbox, { force: true });
  }

  async appendNewBlockToBottomOfStack(opcode: string, block: Locator) {
    const randomClass = "bottom-of-stack-" + randomBytes(20).toString("hex");

    await block.evaluate(
      (el, { isScratchBlock, randomClass }) =>
        // get first blocks that does not have any child blocks
        [el, ...el.querySelectorAll(isScratchBlock)]
          .find((el) => el.querySelector(isScratchBlock) === null)
          ?.classList.add(randomClass),
      { isScratchBlock, randomClass },
    );

    const lastBlock = this.page.locator(`.${randomClass}`);

    await this.scrollBlockIntoView(lastBlock);

    await this.getBlockInToolbox(opcode).dragTo(lastBlock, {
      force: true,
      targetPosition: {
        x: 50,
        y: 50,
      },
    });
  }

  async appendNewBlockTo(opcode: string, block: Locator) {
    await this.scrollBlockIntoView(block);

    await this.getBlockInToolbox(opcode).dragTo(block, {
      force: true,
      targetPosition: {
        x: 50,
        y: 50,
      },
    });
  }

  async prependNewBlockTo(opcode: string, block: Locator) {
    await this.scrollBlockIntoView(block);

    await this.getBlockInToolbox(opcode).dragTo(block, {
      force: true,
      targetPosition: {
        x: 50,
        y: 0,
      },
    });
  }

  async countBlocksInSubStack(stack: Locator) {
    return stack.evaluate(
      (el, isScratchBlock) => el.querySelectorAll(isScratchBlock).length,
      isScratchBlock,
    );
  }

  async countBlocksInParentStack(stack: Locator) {
    return stack.evaluate(
      (el, { isScratchBlock, isVisualTopOfStack }) =>
        // find the closest parent block in the same block stack
        // which itself is not a child of another block, i.e.
        // the visual top of the stack.
        // next, query all children and count the number of draggable blocks.
        // note that we first do .parentElement because querySelectorAll
        // does not consider the element it is executed on
        el
          .closest(isVisualTopOfStack)
          ?.parentElement?.querySelectorAll(isScratchBlock).length ?? 0,
      { isVisualTopOfStack, isScratchBlock },
    );
  }

  resetZoom() {
    return this.page
      .locator('[*|href="/scratch/static/blocks-media/default/zoom-reset.svg"]')
      .click();
  }
}

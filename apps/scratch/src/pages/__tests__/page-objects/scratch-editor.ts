/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "playwright/test";
import {
  getAllTargetBlocksSelector,
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

  async removeAllNonFrozenBlocks() {
    while ((await this.blocksOfCurrentTargetNonFrozen.count()) > 0) {
      await this.blocksOfCurrentTargetNonFrozen.first().dragTo(this.toolbox, {
        force: true,
      });

      // wait for scratch to update
      await this.page.waitForTimeout(1000);
    }
  }
}

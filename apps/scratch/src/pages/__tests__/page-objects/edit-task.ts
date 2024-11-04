/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  getBlockConfigBlockLimitInputSelector,
  getBlockConfigCanBeUsedCheckboxSelector,
  getBlockConfigFormSubmitButtonSelector,
  getBlockConfigHasBlockLimitCheckboxSelector,
} from "../locators";
import { ScratchEditorPage } from "./scratch-editor";

export enum Extension {
  Assertions = 1,
}

export class EditTaskPage extends ScratchEditorPage {
  get blockConfigFormElements() {
    return {
      canBeUsedCheckbox: this.page.locator(
        getBlockConfigCanBeUsedCheckboxSelector(),
      ),
      hasBlockLimitCheckbox: this.page.locator(
        getBlockConfigHasBlockLimitCheckboxSelector(),
      ),
      blockLimitInput: this.page.locator(
        getBlockConfigBlockLimitInputSelector(),
      ),
      submitButton: this.page.locator(getBlockConfigFormSubmitButtonSelector()),

      submit() {
        return this.submitButton.click();
      },
    };
  }

  get taskConfigFormElements() {
    return {
      allowAllBlocksButton: this.page.getByTestId(
        "allow-all-standard-blocks-button",
      ),
      allowNoBlocksButton: this.page.getByTestId("allow-no-blocks-button"),
      submit: this.page.getByTestId("task-config-form-submit-button"),
    };
  }

  get addExtensionButton() {
    return this.page.getByTestId("add-extension-button");
  }

  loadExtension(extension: Extension) {
    return this.page
      .locator(".ReactModalPortal img")
      .nth(extension + 1 /* skip first image */)
      .click();
  }
}

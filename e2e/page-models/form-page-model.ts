import { Locator, Page } from "@playwright/test";

export abstract class FormPageModel {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  async selectChakraOption(
    selectLocator: Locator,
    value: string,
  ): Promise<void> {
    await selectLocator.click();
    await this.page
      .locator(`[data-part="item"][data-value="${value}"]`)
      .click();
  }
}

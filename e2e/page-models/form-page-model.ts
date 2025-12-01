import { Locator, Page } from "@playwright/test";

export abstract class FormPageModel {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  protected async selectChakraOption(
    selectLocator: Locator,
    value: string,
  ): Promise<void> {
    await selectLocator.click();
    // ChakraUI does not allow two selects to be open at the same time
    // therefore there are no possible conflicts with other select options
    await this.page
      .locator(`[data-part="item"][data-value="${value}"]`)
      .click();
  }
}

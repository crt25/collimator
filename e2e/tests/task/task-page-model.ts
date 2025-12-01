import { Locator, Page } from "@playwright/test";

export class TaskPageModel {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openSessionMenu(): Promise<void> {
    await this.page.getByTestId("toggle-session-menu-button").click();
    await this.page.waitForSelector("[data-testid=session-name]");
  }

  async closeSessionMenu(): Promise<void> {
    await this.page.getByTestId("close-session-menu-button").click();
  }

  getSessionName(): Locator {
    return this.page.getByTestId("session-name");
  }

  static async create(page: Page): Promise<TaskPageModel> {
    return new TaskPageModel(page);
  }
}

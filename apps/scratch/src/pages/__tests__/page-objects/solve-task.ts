/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "playwright/test";
import { ScratchEditorPage } from "./scratch-editor";

export class SolveTaskPage extends ScratchEditorPage {
  static async load(pwPage: Page): Promise<SolveTaskPage> {
    const page = new SolveTaskPage(pwPage);
    await page.resetZoom();

    return page;
  }
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { TaskTemplateWithSolutions } from "./tasks/task-template-with-solutions";

export class SolveTaskPageModel {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  async loadSolution(
    task: TaskTemplateWithSolutions,
    solution: () => Promise<Buffer>,
  ) {
    await this.page.route("http://example.com/my-blob", async (route) =>
      route.fulfill({
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        contentType: task.mimeType.template,
        body: await task.template(),
        status: 200,
      }),
    );

    // load the solution
    await this.page.evaluate(
      async (submission) => {
        const iframe = document.querySelector<HTMLIFrameElement>("iframe");

        const task = await fetch("http://example.com/my-blob").then((r) =>
          r.blob(),
        );

        await new Promise<void>((resolve) => {
          const id = Math.random() * 1000;

          window.addEventListener("message", (event) => {
            // wait for the iframe to load the task

            const message = event.data as AppIFrameMessage;

            if (message.type === "response" && message.id === id) {
              resolve();
            }
          });

          iframe?.contentWindow?.postMessage(
            {
              id,
              type: "request",
              procedure: "loadSubmission",
              arguments: {
                language: "en",
                submission: new Blob([submission]),
                task,
              },
            } as AppIFrameMessage,
            "*",
          );
        });
      },
      (await solution()).toString("utf-8"),
    );
  }

  async submit() {
    const waitForSuccess = this.page.waitForSelector(
      "[data-testid='submit-solution-button'] [data-testid='success-icon']",
    );

    await this.page.getByTestId("submit-solution-button").click();

    return waitForSuccess;
  }

  static async create(page: Page) {
    // wait for the iframe to load the task
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          window.addEventListener("message", (event) => {
            const message = event.data as AppIFrameMessage;

            if (
              message.type === "response" &&
              message.procedure === "loadTask"
            ) {
              resolve();
            }
          });
        }),
    );

    return new SolveTaskPageModel(page);
  }
}

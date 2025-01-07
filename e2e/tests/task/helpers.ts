import path from "path";
import fs from "fs";
import { Page } from "@playwright/test";

const __dirname = import.meta.dirname;

const dummyApp = fs.readFileSync(
  path.resolve(__dirname, "dummy-app.js"),
  "utf-8",
);

export const initialDummyTask = '{"dummy": "task"}';

export const routeDummyApp = (page: Page, url: string): Promise<void> =>
  page.route(url, async (route) =>
    route.fulfill({
      body: `
      <body>
        <div class='test'>Dummy App</div>
        <script>
          ${dummyApp}
        </script>
      </body>`,
      contentType: "text/html",
      status: 200,
    }),
  );

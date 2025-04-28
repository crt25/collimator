import { test, expect } from "@/tests/component-testing";
import EmbeddedAppStory from "./EmbeddedApp.story";

test("should work", async ({ page, mount, context }) => {
  context.route("http://localhost:3100/iframe.html", async (route) =>
    route.fulfill({
      body: `
        <body>
          <div class='test'>Ping-Pong</div>
          <script>
            window.addEventListener(
              'message',
              event => event.source.postMessage(
                {
                  ...event.data,
                  result: 300,
                },
                {
                  targetOrigin: event.origin
                }
              )
            );
          </script>
        </body>`,
      contentType: "text/html",
      status: 200,
    }),
  );

  await mount(<EmbeddedAppStory src="http://localhost:3100/iframe.html" />);

  // wait for the iframe to load
  await page.waitForFunction(() =>
    document.querySelector("iframe")?.contentDocument?.querySelector(".test"),
  );

  const response = await page.evaluate(() =>
    window.sendRequest("getHeight", undefined),
  );

  // usually we get an actual response but in this case we just get the request back
  // although with the type changed to 'response'
  expect(response).toEqual({
    jsonrpc: "2.0",
    id: expect.any(Number),
    method: "getHeight",
    parameters: undefined,
    result: 300,
  });
});

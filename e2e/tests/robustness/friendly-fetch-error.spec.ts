import { useAdminUser } from "../../authentication-helpers";
import { expect, test } from "../../helpers";

// When a data request fails because the backend cannot be reached, the app must
// show a friendly, translated message rather than the raw browser error string
// ("Failed to fetch" / "NetworkError ..."), while keeping the technical detail
// in the console for developers.
//
// MultiSwrContent renders a failed request through <ErrorMessage error={error}>.
// This aborts every data API call on the class-list page and asserts that the
// predefined connectivity message is shown, that the underlying error is logged
// to the console, and that the raw browser string never reaches the user.
const friendlyMessage =
  "The server could not be reached. Please check your internet connection and try again.";

test.describe("data-load failure shows a friendly message", () => {
  test.beforeEach(async ({ context }) => {
    await useAdminUser(context);
  });

  test("shows a friendly message and logs the technical error", async ({
    page,
    baseURL,
  }) => {
    // capture console errors before navigating so the ErrorMessage log is seen
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    // fail every data API call (auth state is already established via the admin
    // user context, so the page loads but its data requests fail)
    await page.route("**/api/v0/**", (route) => route.abort("failed"));

    await page.goto(`${baseURL}/class`);

    // the predefined, translated connectivity message is shown to the user
    // (first(): the page may render one ErrorMessage per failed data source)
    await expect(
      page.getByText(friendlyMessage).first(),
      "the friendly connectivity message is not shown",
    ).toBeVisible();

    // the underlying technical error is logged for developers (ErrorMessage
    // logs `[ErrorMessage] <name>: <message>`)
    expect(
      consoleErrors.some((line) => line.includes("[ErrorMessage]")),
      "the underlying error was not logged to the console",
    ).toBe(true);

    // the raw browser fetch-failure strings must never be shown to the user
    const bodyText = (await page.locator("body").innerText()).toLowerCase();
    expect(
      bodyText,
      "the raw browser fetch error is shown to the user instead of a friendly message",
    ).not.toContain("failed to fetch");
    expect(bodyText).not.toContain("networkerror");
    expect(bodyText).not.toContain("load failed");
  });
});

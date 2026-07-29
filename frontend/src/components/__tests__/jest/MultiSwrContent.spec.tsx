import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/helpers/render-with-providers";
import MultiSwrContent from "@/components/MultiSwrContent";

// ErrorMessage deliberately hides technical error messages from users. Mock it
// here because these tests verify which source error MultiSwrContent forwards,
// not the translated presentation covered by ErrorMessage's own tests.
jest.mock("@/components/ErrorMessage", () => ({
  __esModule: true,
  default: ({ error }: { error: Error }) => <div>{error.message}</div>,
}));

// MultiSwrContent renders several SWR sources at once. When one of them fails
// with no cached data it must surface the error - otherwise the page renders
// nothing at all and the user (a teacher looking at student data) cannot tell
// "there is no data" from "the data failed to load".
describe("MultiSwrContent", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  const renderChild = (): React.ReactNode => <div>the loaded content</div>;

  it("shows the error when the FIRST source fails", () => {
    renderWithProviders(
      <MultiSwrContent
        data={[undefined, "second"]}
        isLoading={[false, false]}
        errors={[new Error("first source failed"), undefined]}
      >
        {renderChild}
      </MultiSwrContent>,
    );

    expect(screen.getByText("first source failed")).toBeInTheDocument();
    expect(screen.queryByText("the loaded content")).not.toBeInTheDocument();
  });

  // The regression: an error on a LATER source, once an earlier source has
  // already resolved, was matched against the wrong data slot (the compacted
  // error array was indexed into the original data array), so the error was
  // dropped and the component rendered null - a blank panel. This is the exact
  // shape of the teacher progress view: data={[klass, session, solutions]},
  // where klass and session resolve but the student solutions fail.
  it("shows the error when a LATER source fails after earlier ones resolved", () => {
    renderWithProviders(
      <MultiSwrContent
        data={["klass", "session", undefined]}
        isLoading={[false, false, false]}
        errors={[undefined, undefined, new Error("solutions failed to load")]}
      >
        {renderChild}
      </MultiSwrContent>,
    );

    expect(screen.getByText("solutions failed to load")).toBeInTheDocument();
    expect(screen.queryByText("the loaded content")).not.toBeInTheDocument();
  });

  // Guard the intended behaviour: when the failed source still has stale cached
  // data, the error is deliberately suppressed and the children render.
  it("keeps rendering children when the failed source has stale data", () => {
    renderWithProviders(
      <MultiSwrContent
        data={["klass", "stale session"]}
        isLoading={[false, false]}
        errors={[undefined, new Error("refresh failed")]}
      >
        {renderChild}
      </MultiSwrContent>,
    );

    expect(screen.getByText("the loaded content")).toBeInTheDocument();
    expect(screen.queryByText("refresh failed")).not.toBeInTheDocument();
  });

  it("keeps showing the spinner while the failed source is still loading", () => {
    const { container } = renderWithProviders(
      <MultiSwrContent
        data={["klass", undefined]}
        isLoading={[false, true]}
        errors={[undefined, new Error("request still retrying")]}
      >
        {renderChild}
      </MultiSwrContent>,
    );

    expect(
      screen.queryByText("request still retrying"),
    ).not.toBeInTheDocument();

    expect(screen.queryByText("the loaded content")).not.toBeInTheDocument();

    expect(container.querySelector(".p-progress-spinner")).toBeInTheDocument();
  });
});

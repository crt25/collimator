import { createMockedEmbeddedApp } from "@/components/__mocks__/EmbeddedAppMock";
import { EmbeddedAppRef } from "@/components/EmbeddedApp";
import SolveTaskPage from "@/pages/solve/[sessionId]/[taskId]";
import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import English from "../../../../../content/compiled-locales/en.json";

const renderComponent = () => (
  <IntlProvider locale="en" messages={English}>
    <SolveTaskPage />
  </IntlProvider>
);

jest.mock("@/components/EmbeddedApp", () => ({
  __esModule: true,
  _getMockComponent: jest.fn(() => {
    throw new Error("Not implemented");
  }),
  get default() {
    return this._getMockComponent();
  },
}));

const EmbeddedAppMock = jest.requireMock("@/components/EmbeddedApp")
  ._getMockComponent as jest.Mock;

const EmbeddedApp = jest.requireActual("@/components/EmbeddedApp").default;

jest.mock("@/utilities/download", () => ({
  downloadBlob: jest.fn(),
}));

const downloadBlob = jest.requireMock("@/utilities/download")
  .downloadBlob as jest.Mock;

jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    query: { sessionId: "sessionId", taskId: "taskId" },
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Solve Task Page", () => {
  it("renders page unchanged", () => {
    EmbeddedAppMock.mockImplementation(() => EmbeddedApp);

    const { container } = render(renderComponent());
    expect(container).toMatchSnapshot();
  });

  it("can obtain submissions from the app", async () => {
    const mockSendRequest = jest.fn<
      ReturnType<EmbeddedAppRef["sendRequest"]>,
      Parameters<EmbeddedAppRef["sendRequest"]>
    >(async () => ({
      id: 1,
      type: "response",
      procedure: "getSubmission",
      result: new Blob(["{}"], { type: "application/json" }),
    })) as EmbeddedAppRef["sendRequest"];

    EmbeddedAppMock.mockImplementation(() =>
      createMockedEmbeddedApp(mockSendRequest),
    );

    const { findByTestId } = render(renderComponent());

    const submitButton = await findByTestId("submit-solution-button");
    expect(submitButton).toBeTruthy();

    submitButton.click();

    expect(mockSendRequest).toHaveBeenCalledTimes(1);
    expect(mockSendRequest).toHaveBeenCalledWith({
      procedure: "getSubmission",
    });
  });

  describe("while the iframe is loading", () => {
    const NeverLoadingIFrame = () => <div />;

    it("clicking the submit button is a noop", async () => {
      EmbeddedAppMock.mockImplementation(() => NeverLoadingIFrame);

      const { findByTestId } = render(renderComponent());

      const submitButton = await findByTestId("submit-solution-button");
      expect(submitButton).toBeTruthy();

      submitButton.click();

      expect(downloadBlob).toHaveBeenCalledTimes(0);
    });
  });
});

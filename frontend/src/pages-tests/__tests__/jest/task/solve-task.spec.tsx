import { createMockedEmbeddedApp } from "@/components/__mocks__/EmbeddedAppMock";
import { EmbeddedAppRef } from "@/components/EmbeddedApp";
import SolveTaskPage from "@/pages/session/[sessionId]/task/[taskId]/solve";
import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import English from "../../../../../content/compiled-locales/en.json";
import {
  AuthenticationContext,
  AuthenticationContextType,
} from "@/contexts/AuthenticationContext";
import { getFullyAuthenticatedStudentContext } from "@/contexts/__tests__/mock-contexts";
import { subtle } from "crypto";

const renderComponent = (context: AuthenticationContextType) => (
  <IntlProvider locale="en" messages={English}>
    <AuthenticationContext.Provider value={context}>
      <SolveTaskPage />
    </AuthenticationContext.Provider>
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
    query: { sessionId: 10, taskId: 5 },
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const crypto = subtle as SubtleCrypto;

describe("Solve Task Page", () => {
  it("renders page unchanged", async () => {
    EmbeddedAppMock.mockImplementation(() => EmbeddedApp);
    const context = await getFullyAuthenticatedStudentContext(crypto);

    const { container } = render(renderComponent(context));
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

    const context = await getFullyAuthenticatedStudentContext(crypto);

    const { findByTestId } = render(renderComponent(context));

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

      const context = await getFullyAuthenticatedStudentContext(crypto);

      const { findByTestId } = render(renderComponent(context));

      const submitButton = await findByTestId("submit-solution-button");
      expect(submitButton).toBeTruthy();

      submitButton.click();

      expect(downloadBlob).toHaveBeenCalledTimes(0);
    });
  });
});

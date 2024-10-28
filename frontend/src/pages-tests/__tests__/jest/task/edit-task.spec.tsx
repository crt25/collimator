import { createMockedEmbeddedApp } from "@/components/__mocks__/EmbeddedAppMock";
import { EmbeddedAppRef } from "@/components/EmbeddedApp";
import EditTaskPage from "@/pages/task/[taskId]/edit";
import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import English from "../../../../../content/compiled-locales/en.json";
import waitForExpect from "wait-for-expect";

const renderComponent = () => (
  <IntlProvider locale="en" messages={English}>
    <EditTaskPage />
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

jest.mock("@/utilities/file-from-disk", () => ({
  readSingleFileFromDisk: jest.fn(),
}));

const readSingleFileFromDisk = jest.requireMock("@/utilities/file-from-disk")
  .readSingleFileFromDisk as jest.Mock;

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

describe("Edit Task Page", () => {
  it("renders page unchanged", () => {
    EmbeddedAppMock.mockImplementation(() => EmbeddedApp);

    const { container } = render(renderComponent());
    expect(container).toMatchSnapshot();
  });

  it("can load a task", async () => {
    const mockSendRequest = jest.fn<
      ReturnType<EmbeddedAppRef["sendRequest"]>,
      Parameters<EmbeddedAppRef["sendRequest"]>
    >(async () => ({
      id: 1,
      type: "response",
      procedure: "loadTask",
    })) as EmbeddedAppRef["sendRequest"];

    const fakeBlob = new Blob(["{}"], { type: "application/json" });

    readSingleFileFromDisk.mockImplementation(() => Promise.resolve(fakeBlob));

    EmbeddedAppMock.mockImplementation(() =>
      createMockedEmbeddedApp(mockSendRequest),
    );

    const { findByTestId } = render(renderComponent());

    const loadTaskButton = await findByTestId("load-task-button");
    expect(loadTaskButton).toBeTruthy();

    loadTaskButton.click();

    expect(readSingleFileFromDisk).toHaveBeenCalledTimes(1);

    // wait for the message to be sent
    await waitForExpect(() => {
      expect(mockSendRequest).toHaveBeenCalledTimes(1);
    });

    expect(mockSendRequest).toHaveBeenCalledWith({
      procedure: "loadTask",
      arguments: fakeBlob,
    });
  });

  it("can get the task contents of an app", async () => {
    const mockSendRequest = jest.fn<
      ReturnType<EmbeddedAppRef["sendRequest"]>,
      Parameters<EmbeddedAppRef["sendRequest"]>
    >(async () => ({
      id: 1,
      type: "response",
      procedure: "getTask",
      result: new Blob(["{}"], { type: "application/json" }),
    })) as EmbeddedAppRef["sendRequest"];

    EmbeddedAppMock.mockImplementation(() =>
      createMockedEmbeddedApp(mockSendRequest),
    );

    const { findByTestId } = render(renderComponent());

    const submitButton = await findByTestId("save-task-button");
    expect(submitButton).toBeTruthy();

    submitButton.click();

    expect(mockSendRequest).toHaveBeenCalledTimes(1);
    expect(mockSendRequest).toHaveBeenCalledWith({
      procedure: "getTask",
    });

    // wait for the task to be downloaded
    await waitForExpect(() => {
      expect(downloadBlob).toHaveBeenCalledTimes(1);
    });
  });

  describe("while the iframe is loading", () => {
    const NeverLoadingIFrame = () => <div />;

    it("clicking the load task button is a noop", async () => {
      EmbeddedAppMock.mockImplementation(() => NeverLoadingIFrame);

      const { findByTestId } = render(renderComponent());

      const submitButton = await findByTestId("load-task-button");
      expect(submitButton).toBeTruthy();

      submitButton.click();

      expect(downloadBlob).toHaveBeenCalledTimes(0);
    });

    it("clicking the save task button is a noop", async () => {
      EmbeddedAppMock.mockImplementation(() => NeverLoadingIFrame);

      const { findByTestId } = render(renderComponent());

      const submitButton = await findByTestId("save-task-button");
      expect(submitButton).toBeTruthy();

      submitButton.click();

      expect(downloadBlob).toHaveBeenCalledTimes(0);
    });
  });
});

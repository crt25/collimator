import { installOtter } from "../packages";
import { createMockKernel, executedCode } from "./helpers/kernel";

jest.mock("../iframe-api", () => ({ EmbeddedPythonCallbacks: {} }));
jest.mock("../loading-state", () => ({ LoadingStateManager: class {} }));

describe("installOtter", () => {
  beforeEach(() => {
    jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("installs Otter from the bundled wheels", async () => {
    const kernel = createMockKernel();

    await installOtter(kernel);

    const code = executedCode(kernel).join("\n");
    expect(code).toMatch(/piplite\.install\("otter-grader"/);
    expect(code).not.toMatch(/micropip\.install/);
  });

  it("allows replacing packages that Pyodide preloaded", async () => {
    const kernel = createMockKernel();

    await installOtter(kernel);

    expect(executedCode(kernel).join("\n")).toMatch(/reinstall=True/);
  });
});

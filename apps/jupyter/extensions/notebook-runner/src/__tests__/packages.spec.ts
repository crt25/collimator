import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { installOtter } from "../packages";

// the modules that packages.ts uses to talk to the embedding app are not what is tested here
jest.mock("../iframe-api", () => ({ EmbeddedPythonCallbacks: {} }));
jest.mock("../loading-state", () => ({ LoadingStateManager: class {} }));

const createKernel = (): {
  kernel: IKernelConnection;
  executedCode: () => string[];
} => {
  const requestExecute = jest.fn((content: { code: string }) => ({
    content,
    done: Promise.resolve({ content: { status: "ok" } }),
  }));

  return {
    kernel: { requestExecute } as unknown as IKernelConnection,
    executedCode: (): string[] =>
      requestExecute.mock.calls.map(([content]) => content.code),
  };
};

describe("installOtter", () => {
  beforeEach(() => {
    jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Pyodide preloads packaging 24.2 while a (transitive) dependency of Otter
  // can require packaging>=25.0. micropip only replaces an installed package
  // if it is explicitly told to.
  it("lets micropip replace packages that Pyodide preloaded", async () => {
    const { kernel, executedCode } = createKernel();

    await installOtter(kernel);

    const code = executedCode();
    expect(code).toHaveLength(1);
    expect(code[0]).toMatch(
      /micropip\.install\(\s*"[^"]*otter_grader[^"]*\.whl",\s*reinstall=True,/,
    );
  });

  // Otter's dependencies that are not part of Pyodide are resolved against
  // PyPI, so new releases must not change what gets installed.
  it("pins the dependencies that are resolved against PyPI", async () => {
    const { kernel, executedCode } = createKernel();

    await installOtter(kernel);

    const constraints = executedCode()[0].match(/constraints=(\[.*?\])/s);
    expect(constraints).not.toBeNull();

    const pins: string[] = JSON.parse(constraints![1]);
    expect(pins).toContain("sphinx==9.1.1");
    expect(pins.every((pin) => /^[\w.-]+==[\w.]+$/.test(pin))).toBe(true);
  });
});

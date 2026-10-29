import { installOtter } from "../packages";
import { createMockKernel, executedCode } from "./helpers/kernel";

// the modules that packages.ts uses to talk to the embedding app are not what is tested here
jest.mock("../iframe-api", () => ({ EmbeddedPythonCallbacks: {} }));
jest.mock("../loading-state", () => ({ LoadingStateManager: class {} }));

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
    const kernel = createMockKernel();

    await installOtter(kernel);

    const code = executedCode(kernel).join("\n");
    expect(code).toMatch(/micropip\.install\(\s*"[^"]*otter_grader[^"]*\.whl"/);
    expect(code).toMatch(/reinstall=True/);
  });

  // Otter's dependencies that are not part of Pyodide are resolved against
  // PyPI, so new releases must not change what gets installed.
  it("pins the dependencies that are resolved against PyPI", async () => {
    const kernel = createMockKernel();

    await installOtter(kernel);

    const [, constraints = "[]"] =
      executedCode(kernel)
        .join("\n")
        .match(/constraints=(\[.*?\])/s) ?? [];

    const pins: string[] = JSON.parse(constraints);
    // sphinx is the dependency whose new release broke installing Otter
    expect(pins).toContainEqual(expect.stringMatching(/^sphinx==/));
    // names the pins that are not exact versions if there are any
    expect(pins.filter((pin) => !/^[\w.-]+==[\w.]+$/.test(pin))).toEqual([]);
  });
});

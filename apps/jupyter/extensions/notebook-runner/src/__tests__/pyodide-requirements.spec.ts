import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";

// When this test fails, update pyodide-requirements.txt (see the README of the
// Jupyter app) and then the values below.
const expected = {
  otterGrader: "6.1.3",
  jupyterlitePyodideKernel: "0.7.0",
  pyodideRequirements:
    "5109f5e2c92f30178fdad54b4add69671608d6dc5976fe21081fde19df66768d",
};

const appRoot = path.resolve(__dirname, "../../../..");

const readAppFile = (file: string): string =>
  readFileSync(path.join(appRoot, file), "utf8").replace(/\r\n/g, "\n");

describe("pyodide-requirements.txt", () => {
  it("is updated together with Otter and jupyterlite-pyodide-kernel", () => {
    expect({
      otterGrader: readAppFile("otter-grader/otter/version.py").match(
        /__version__ = "([^"]+)"/,
      )?.[1],
      jupyterlitePyodideKernel: readAppFile("poetry.lock").match(
        /name = "jupyterlite-pyodide-kernel"\nversion = "([^"]+)"/,
      )?.[1],
      pyodideRequirements: createHash("sha256")
        .update(readAppFile("pyodide-requirements.txt"))
        .digest("hex"),
    }).toEqual(expected);
  });
});

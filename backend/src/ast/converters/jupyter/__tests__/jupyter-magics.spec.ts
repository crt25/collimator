import { convertJupyterToGeneralAst } from "..";

const notebookWithCell = (
  source: string,
): Parameters<typeof convertJupyterToGeneralAst>[0] => ({
  nbformat: 4,
  nbformat_minor: 0,
  metadata: { language_info: { name: "python", version: "3.10.4" } },
  cells: [
    {
      id: "c1",
      cell_type: "code",
      source,
      outputs: [],
      execution_count: 0,
      metadata: {},
    },
  ],
});

// The statements the converter produced for the single code cell.
const statementsOf = (source: string): unknown[] => {
  const ast = convertJupyterToGeneralAst(
    notebookWithCell(source),
  ) as unknown as [
    {
      eventListeners?: {
        action: { statements?: unknown[] } & Record<string, unknown>;
      }[];
    },
  ];

  const actor = ast[0];

  if (!actor?.eventListeners?.length) {
    return [];
  }

  const action = actor.eventListeners[0].action;

  return action.statements ?? [action];
};

describe("Jupyter converter — IPython magics", () => {
  it("drops a line magic instead of turning it into a phantom variable", () => {
    const statements = statementsOf("%matplotlib inline\nx = 1\ny = x + 2\n");

    const expected = statementsOf("x = 1\ny = x + 2\n");

    // the real code survives
    expect(statements).toEqual(expected);
  });

  it("drops a shell escape line", () => {
    const statements = statementsOf("!pip install numpy\nz = 3\n");

    const expected = statementsOf("z = 3\n");

    expect(statements).toEqual(expected);
  });

  it("skips a whole cell that is a cell magic", () => {
    const statements = statementsOf("%%bash\necho hello\nls -la\n");

    const expected = statementsOf("");

    expect(statements).toEqual(expected);
  });

  it("keeps a real multi-target import (not a magic)", () => {
    const statements = statementsOf("import os, sys\nx = 1\n");

    const expected = statementsOf("import os, sys\nx = 1\n");

    expect(statements).toEqual(expected);
  });

  it("keeps a modulo operator that leads a bracketed continuation line", () => {
    // `% 3` begins the continuation line of `(10 % 3)`. It is Python, not a
    // line magic (a magic name is an identifier, never a space or digit). A
    // naive `startsWith("%")` filter drops it, leaving the broken `x = (10`.
    const statements = statementsOf("x = (10\n% 3)\n");

    // the modulo operation must survive
    const expected = statementsOf("x = (10 % 3)\n");

    expect(statements).toEqual(expected);
  });

  it("keeps a `!=` comparison that leads a continuation line", () => {
    // `!= b` begins the continuation line of `(a != b)`. `!=` is the inequality
    // operator, not a shell escape.
    const statements = statementsOf("x = (a\n!= b)\n");

    // the inequality operation must survive
    const expected = statementsOf("x = (a != b)\n");

    expect(statements).toEqual(expected);
  });

  it("strips several line magics and a shell escape interleaved with code in one cell", () => {
    // A single cell may freely mix multiple magics with real Python. Each
    // magic / shell-escape line is dropped independently; every surrounding
    // code line survives untouched.
    const statements = statementsOf(
      [
        "%pip install -q pandas numpy",
        "import numpy as np",
        "%matplotlib inline",
        "arr = np.array([1, 2, 3])",
        "!echo done",
        "total = arr.sum()",
      ].join("\n"),
    );

    const expected = statementsOf(
      [
        "import numpy as np",
        "arr = np.array([1, 2, 3])",
        "total = arr.sum()",
      ].join("\n"),
    );

    expect(statements).toEqual(expected);
  });

  it("converts the real task-template setup cell (two magics + two imports) correctly", () => {
    // The exact setup cell shipped in apps/jupyter/files/task.ipynb: two line
    // magics interleaved with two imports in one cell.
    const statements = statementsOf(
      [
        "%pip install -q pandas numpy matplotlib",
        "import pandas as pd",
        "import numpy as np",
        "%matplotlib inline",
      ].join("\n"),
    );

    const expected = statementsOf(
      ["import pandas as pd", "import numpy as np"].join("\n"),
    );

    expect(statements).toEqual(expected);
  });

  it("keeps code lines that sit before, between and after magic lines", () => {
    // Magics need not be at the top of the cell; code interleaved with them is
    // preserved in order.
    const statements = statementsOf(
      ["a = 1", "%time", "b = a + 1", "%reset -f", "c = b + 1"].join("\n"),
    );

    const expected = statementsOf(
      ["a = 1", "b = a + 1", "c = b + 1"].join("\n"),
    );

    expect(statements).toEqual(expected);
  });
});

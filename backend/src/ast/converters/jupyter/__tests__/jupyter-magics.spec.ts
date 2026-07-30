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

  describe("cell magics with a Python body", () => {
    // Per https://ipython.readthedocs.io/en/stable/interactive/magics.html
    // these cell magics execute the cell body as ordinary Python; only the
    // magic line itself must be removed, not the whole cell.
    it.each([
      "%%capture",
      "%%debug",
      "%%prun",
      "%%pypy",
      "%%python",
      "%%python2",
      "%%python3",
      "%%time",
      "%%timeit",
    ])("keeps the body of a %s cell", (magic) => {
      const statements = statementsOf(
        [magic, "a = 1", "b = a + 1", "c = b + 1"].join("\n"),
      );

      const expected = statementsOf(
        ["a = 1", "b = a + 1", "c = b + 1"].join("\n"),
      );

      expect(statements).toEqual(expected);
    });

    it("keeps the body when the magic line carries arguments", () => {
      const statements = statementsOf(
        ["%%timeit -n 100 -r 5", "total = sum(range(10))"].join("\n"),
      );

      const expected = statementsOf("total = sum(range(10))\n");

      expect(statements).toEqual(expected);
    });

    it("still strips line magics inside the kept body", () => {
      const statements = statementsOf(
        ["%%capture out", "%matplotlib inline", "x = 1"].join("\n"),
      );

      const expected = statementsOf("x = 1\n");

      expect(statements).toEqual(expected);
    });

    it.each(["%%bash", "%%html", "%%writefile out.txt", "%%javascript"])(
      "still skips the whole cell for the non-Python %s magic",
      (magic) => {
        const statements = statementsOf(
          [magic, "a = 1", "b = a + 1"].join("\n"),
        );

        expect(statements).toHaveLength(0);
      },
    );

    it("keeps the first-line setup statement of a %%timeit cell", () => {
      // %%timeit executes the statement on its own line as setup code; the
      // body then uses what it defined.
      const statements = statementsOf(
        ["%%timeit -n 100 x = 5", "x + 1"].join("\n"),
      );

      const expected = statementsOf(["x = 5", "x + 1"].join("\n"));

      expect(statements).toEqual(expected);
    });
  });

  describe("line magics with a Python payload", () => {
    // In line mode, %time/%timeit/%prun/%debug execute the rest of the line
    // as ordinary Python; only the magic (and its options) must be removed.
    it.each(["%time", "%timeit", "%prun", "%debug"])(
      "keeps the inline statement of %s",
      (magic) => {
        const statements = statementsOf(
          ["a = 2", `${magic} total = sum(range(a))`].join("\n"),
        );

        const expected = statementsOf(
          ["a = 2", "total = sum(range(a))"].join("\n"),
        );

        expect(statements).toEqual(expected);
      },
    );

    it("consumes option flags before the payload", () => {
      const statements = statementsOf("%timeit -n 100 -r 5 sum(range(10))\n");

      const expected = statementsOf("sum(range(10))\n");

      expect(statements).toEqual(expected);
    });

    it("consumes an option with a separate value before the payload", () => {
      const statements = statementsOf("%prun -s cumulative compute()\n");

      const expected = statementsOf("compute()\n");

      expect(statements).toEqual(expected);
    });

    it("treats %prun's -r as a flag, not a value-taking option", () => {
      // -r takes a value for %timeit (repeat count) but is a standalone
      // return-Stats flag for %prun; it must not swallow the statement.
      const statements = statementsOf("%prun -r compute()\n");

      const expected = statementsOf("compute()\n");

      expect(statements).toEqual(expected);
    });

    it("consumes a quoted option value containing spaces", () => {
      const statements = statementsOf(
        '%prun -T "profile output.txt" compute()\n',
      );

      const expected = statementsOf("compute()\n");

      expect(statements).toEqual(expected);
    });

    it("drops the line when there is no payload", () => {
      const statements = statementsOf(
        ["a = 1", "%timeit -n 100", "b = a + 1"].join("\n"),
      );

      const expected = statementsOf(["a = 1", "b = a + 1"].join("\n"));

      expect(statements).toEqual(expected);
    });

    it("preserves the indentation of an indented magic's payload", () => {
      // IPython allows line magics inside indented blocks; the payload must
      // keep the indentation to stay syntactically part of the block.
      const statements = statementsOf(
        ["for i in range(3):", "    %time run(i)", ""].join("\n"),
      );

      const expected = statementsOf(
        ["for i in range(3):", "    run(i)", ""].join("\n"),
      );

      expect(statements).toEqual(expected);
    });

    it("still drops a non-payload line magic with arguments entirely", () => {
      // `inline` is an argument of %matplotlib, not Python to execute.
      const statements = statementsOf(
        ["%matplotlib inline", "x = 1"].join("\n"),
      );

      const expected = statementsOf("x = 1\n");

      expect(statements).toEqual(expected);
    });
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

  describe("documented limitations", () => {
    // Deliberate trade-offs for classroom-scale code: handling these would
    // require a Python tokenizer / per-magic argument parser, whose own bugs
    // would be worse than the limitation.
    it("a magic-looking line inside a multi-line string is still stripped", () => {
      // The stripping is line-local: it cannot know the line sits inside a
      // string literal. Only the literal's text changes; the code structure
      // the similarity analysis compares is unaffected.
      const statements = statementsOf(
        ['doc = """usage:', "%matplotlib inline", '"""', "x = 1"].join("\n"),
      );

      const expected = statementsOf(
        ['doc = """usage:', '"""', "x = 1"].join("\n"),
      );

      expect(statements).toEqual(expected);
    });

    it("%%script cells are skipped even for a python interpreter", () => {
      // `%%script python` is an alias of %%python, but recognizing it would
      // special-case one argument of the generic %%script family; skipping
      // the whole family is the conservative default.
      const statements = statementsOf(
        ["%%script python", "a = 1", "b = a + 1"].join("\n"),
      );

      expect(statements).toHaveLength(0);
    });
  });
});

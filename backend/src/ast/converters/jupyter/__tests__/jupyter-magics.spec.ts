import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
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

const referencesVariable = (statements: unknown[], name: string): boolean =>
  JSON.stringify(statements).includes(
    `"expressionType":"${ExpressionNodeType.variable}","name":"${name}"`,
  );

describe("Jupyter converter — IPython magics", () => {
  it("drops a line magic instead of turning it into a phantom variable", () => {
    const statements = statementsOf("%matplotlib inline\nx = 1\ny = x + 2\n");

    // the real code survives
    expect(referencesVariable(statements, "x")).toBe(true);
    expect(referencesVariable(statements, "y")).toBe(true);
    // the magic must NOT have leaked in as a `matplotlib` reference
    expect(referencesVariable(statements, "matplotlib")).toBe(false);
  });

  it("drops a shell escape line", () => {
    const statements = statementsOf("!pip install numpy\nz = 3\n");

    expect(referencesVariable(statements, "z")).toBe(true);
    expect(referencesVariable(statements, "pip")).toBe(false);
    expect(referencesVariable(statements, "numpy")).toBe(false);
  });

  it("skips a whole cell that is a cell magic", () => {
    const statements = statementsOf("%%bash\necho hello\nls -la\n");

    expect(statements).toHaveLength(0);
  });

  it("keeps a real multi-target import (not a magic)", () => {
    const statements = statementsOf("import os, sys\nx = 1\n");

    const asJson = JSON.stringify(statements);
    expect(asJson).toContain(AstNodeType.statement);
    expect(asJson).toContain("@import");
    expect(referencesVariable(statements, "x")).toBe(true);
  });

  it("keeps a modulo operator that leads a bracketed continuation line", () => {
    // `% 3` begins the continuation line of `(10 % 3)`. It is Python, not a
    // line magic (a magic name is an identifier, never a space or digit). A
    // naive `startsWith("%")` filter drops it, leaving the broken `x = (10`.
    const statements = statementsOf("x = (10\n% 3)\n");

    expect(referencesVariable(statements, "x")).toBe(true);
    // the modulo operation must survive
    expect(JSON.stringify(statements)).toContain('"operator":"%"');
  });

  it("keeps a `!=` comparison that leads a continuation line", () => {
    // `!= b` begins the continuation line of `(a != b)`. `!=` is the inequality
    // operator, not a shell escape. A naive `startsWith("!")` filter drops it,
    // leaving `x = (a` (recovered as `x = a`) and losing `b` entirely.
    const statements = statementsOf("x = (a\n!= b)\n");

    expect(referencesVariable(statements, "a")).toBe(true);
    expect(referencesVariable(statements, "b")).toBe(true);
    expect(JSON.stringify(statements)).toContain('"operator":"!="');
  });
});

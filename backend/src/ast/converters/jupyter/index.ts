import {
  AstNodeType,
  GeneralAst,
  StatementNode,
} from "src/ast/types/general-ast";
import JupyterInput from "src/ast/types/input/jupyter";
import {
  ActorNode,
  EventListenerNode,
  FunctionDeclarationNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { match } from "ts-pattern";
import { convertPythonToStatement } from "../python";
import { StatementWithFunctions } from "../statement-with-functions";
import { SupportedLanguage } from "./supported-languages";

export const convertJupyterToGeneralAst = (input: JupyterInput): GeneralAst => {
  if (!input.metadata.language_info) {
    throw new Error("Jupyter notebook is missing language info in metadata");
  }

  const language = input.metadata.language_info.name as SupportedLanguage;

  if (!Object.values(SupportedLanguage).includes(language)) {
    throw new Error(`Language ${language} is not supported`);
  }

  const version = input.metadata.language_info.version;

  if (typeof version !== "string" && version !== undefined) {
    throw new Error(`Language version ${version} is not supported`);
  }

  const getCellSource = (cell: { source: string | string[] }): string =>
    Array.isArray(cell.source) ? cell.source.join("\n") : cell.source;

  // IPython magics (`%matplotlib inline`, `%pip install ...`) and shell escapes
  // (`!pip install ...`) are not Python. The parser does not reject them - it
  // error-recovers, turning e.g. `%matplotlib inline` into a phantom reference
  // to a variable `matplotlib` that pollutes the structural representation used
  // for the similarity analysis. Strip them the way Jupyter itself does before
  // handing a cell to Python: a `%%` cell magic replaces the cell's language
  // (skip the cell entirely) unless it merely wraps a Python body, and a
  // leading line magic or shell escape is dropped.

  // Cell magics whose body IPython executes as ordinary Python (timed,
  // profiled, captured, run under a debugger or a separate interpreter); see
  // https://ipython.readthedocs.io/en/stable/interactive/magics.html. For
  // these, only the magic line is removed. Every other cell magic (%%bash,
  // %%html, %%writefile, ...) turns the cell into something that is not
  // Python, so such cells are skipped wholesale.
  const pythonBodyCellMagics = new Set([
    "capture",
    "debug",
    "prun",
    "pypy",
    "python",
    "python2",
    "python3",
    "time",
    "timeit",
  ]);

  const isNonPythonCellMagic = (source: string): boolean => {
    const firstLine = source
      .split("\n")
      .find((line) => line.trim() !== "")
      ?.trimStart();

    if (!firstLine?.startsWith("%%")) {
      return false;
    }

    const name = /^%%([A-Za-z_]\w*)/.exec(firstLine)?.[1];

    return name === undefined || !pythonBodyCellMagics.has(name);
  };

  // A line magic (`%name`) or shell escape (`!cmd`) has its sigil immediately
  // followed by the magic/command name. That is what separates it from real
  // Python that merely begins a line with the same character: the modulo
  // operator (`% 3`) or the inequality operator (`!= b`), which PEP 8 even
  // recommends wrapping to the start of a continuation line. Matching only the
  // sigil form keeps such continuations from being mistaken for magics. The
  // check is line-local, so a `%name`/`!cmd` line inside a multi-line string is
  // still dropped - but that only edits a string literal's text, not the code
  // structure the similarity analysis compares.
  const isLineMagic = (line: string): boolean => /^\s*%%?[A-Za-z_]/.test(line);
  const isShellEscape = (line: string): boolean => /^\s*!(?!=)/.test(line);

  const stripLineMagics = (source: string): string =>
    source
      .split("\n")
      .filter((line) => !isLineMagic(line) && !isShellEscape(line))
      .join("\n");

  const hasExecutableCode = (source: string): boolean =>
    source
      .split("\n")
      // check if there's any line that isn't empty or a comment
      .map((line) => line.trim())
      .some((line) => !!line && !line.startsWith("#"));

  const codeCells = input.cells
    .filter((c) => c.cell_type === "code")
    // a non-Python `%%` cell magic (e.g. %%bash, %%html) is not Python at all;
    // a Python-body one (e.g. %%timeit) only loses its magic line via
    // stripLineMagics below
    .filter((c) => !isNonPythonCellMagic(getCellSource(c)))
    .map((c) => ({ ...c, source: stripLineMagics(getCellSource(c)) }))
    .filter((c) => hasExecutableCode(c.source));

  const conversionFunction = match(language)
    .returnType<(input: string, version?: string) => StatementWithFunctions>()
    .with(SupportedLanguage.python, () => convertPythonToStatement)
    .exhaustive();

  const convertedCodeCells = codeCells.map((cell) => {
    const { node, functionDeclarations } = conversionFunction(
      getCellSource(cell),
      version,
    );

    if (node.statementType === StatementNodeType.sequence) {
      return {
        id: cell.id,
        code: node.statements,
        functionDeclarations: functionDeclarations,
      };
    }

    return {
      id: cell.id,
      code: [node],
      functionDeclarations: functionDeclarations,
    };
  });

  return createTopLevelJupyterStatementOutput(convertedCodeCells);
};

export const createTopLevelJupyterStatementOutput = (
  cells: {
    id: string;
    code: StatementNode[];
    functionDeclarations: FunctionDeclarationNode[];
  }[],
): GeneralAst => [
  {
    nodeType: AstNodeType.actor,
    componentId: "notebook",
    eventListeners: cells.map(
      (cell) =>
        ({
          nodeType: AstNodeType.eventListener,
          condition: {
            event: `cell:${cell.id}`,
            parameters: [],
          },
          action: {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.sequence,
            statements: cell.code,
          },
        }) satisfies EventListenerNode,
    ),
    functionDeclarations: cells.flatMap((c) => c.functionDeclarations),
  } satisfies ActorNode,
];

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
  // Python, so such cells are skipped wholesale. That deliberately includes
  // `%%script python` (an alias of %%python): special-casing one argument of
  // the generic %%script family isn't worth it for code we expect to see in
  // a classroom, and skipping is the conservative default.
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
  // still dropped - a documented trade-off: it only edits a string literal's
  // text, never the code structure the similarity analysis compares, whereas
  // tracking string state would need a real tokenizer whose own mistakes would
  // let magics through as phantom variables - a worse failure mode.
  const isLineMagic = (line: string): boolean => /^\s*%%?[A-Za-z_]/.test(line);
  const isShellEscape = (line: string): boolean => /^\s*!(?!=)/.test(line);

  // Magics whose argument is itself Python that IPython executes: in line mode
  // (`%timeit expr` times expr) and equally on the first line of their cell
  // form (`%%timeit x = 5` runs `x = 5` as setup code, `%%prun stmt` appends
  // stmt to the profiled code). For these, only the magic and its option flags
  // are removed; the trailing Python payload is kept. Not %capture: its
  // argument is the name of a variable to bind, not code to run.
  // Per magic, the options that consume a separate value token (e.g. `-n 100`,
  // `-s cumulative`); every other option is a standalone flag. The arity
  // differs between magics: -r takes a repeat count for %timeit but is a
  // return-Stats flag for %prun.
  const pythonPayloadMagics = new Map<string, Set<string>>([
    ["time", new Set()],
    ["timeit", new Set(["-n", "-r", "-p"])],
    ["prun", new Set(["-l", "-s", "-T", "-D"])],
    ["debug", new Set(["-b", "--breakpoint"])],
  ]);

  // A value token may be shell-quoted to contain spaces (`-T "profile out.txt"`).
  const optionValue = /^(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\S+)\s*/;

  // For a `%name ...` / `%%name ...` line of a payload magic, returns the
  // Python payload (keeping the line's indentation, so a magic inside an
  // indented block stays part of it); null if the line carries no payload or
  // is not a payload magic.
  const extractPythonPayload = (magicLine: string): string | null => {
    const match = /^(\s*)%%?([A-Za-z_]\w*)\s*(.*)$/.exec(magicLine);
    const valueTakingOptions = match && pythonPayloadMagics.get(match[2]);

    if (!match || !valueTakingOptions) {
      return null;
    }

    const [, indentation, , argument] = match;
    let rest = argument;

    for (let option = /^(-\S+)\s*/.exec(rest); option !== null; ) {
      rest = rest.slice(option[0].length);

      if (valueTakingOptions.has(option[1])) {
        rest = rest.replace(optionValue, "");
      }

      option = /^(-\S+)\s*/.exec(rest);
    }

    return rest.trim() === "" ? null : indentation + rest;
  };

  const stripLineMagics = (source: string): string =>
    source
      .split("\n")
      .flatMap((line) => {
        if (!isLineMagic(line) && !isShellEscape(line)) {
          return [line];
        }

        const payload = extractPythonPayload(line);
        return payload === null ? [] : [payload];
      })
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

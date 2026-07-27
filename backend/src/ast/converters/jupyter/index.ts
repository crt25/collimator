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
  // handing a cell to Python: a `%%` cell magic makes the whole cell non-Python
  // (skip it entirely), and a leading `%` or `!` line is dropped.
  const isCellMagic = (source: string): boolean =>
    source
      .split("\n")
      .find((line) => line.trim() !== "")
      ?.trimStart()
      .startsWith("%%") ?? false;

  const stripLineMagics = (source: string): string =>
    source
      .split("\n")
      .filter((line) => {
        const trimmed = line.trimStart();
        return !trimmed.startsWith("%") && !trimmed.startsWith("!");
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
    // a `%%` cell magic (e.g. %%bash, %%html) is not Python at all
    .filter((c) => !isCellMagic(getCellSource(c)))
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

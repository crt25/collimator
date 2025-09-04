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

  const codeCells = input.cells.filter((c) => c.cell_type === "code");

  const conversionFunction = match(language)
    .returnType<(input: string, version?: string) => StatementWithFunctions>()
    .with(SupportedLanguage.python, () => convertPythonToStatement)
    .exhaustive();

  const convertedCodeCells = codeCells.map((cell) => {
    const { node, functionDeclarations } = conversionFunction(
      Array.isArray(cell.source) ? cell.source.join("\n") : cell.source,
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

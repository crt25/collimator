import { AstNodeType, GeneralAst } from "src/ast/types/general-ast";
import { match } from "ts-pattern";
import { CharStream, CommonTokenStream } from "antlr4";
import {
  ActorNode,
  EventListenerNode,
  FunctionDeclarationNode,
  StatementNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { isExpressionNode } from "src/ast/types/general-ast/helpers/node-type-checks";
import { ExpressionAsStatementNode } from "src/ast/types/general-ast/ast-nodes/statement-node/expression-as-statement";
import { StatementWithFunctions } from "../statement-with-functions";
import { PythonVersion } from "./python-version";
import PythonLexer from "./generated/PythonLexer";
import PythonParser from "./generated/PythonParser";
import { PythonAstVisitor } from "./python-ast-visitor";

const versionRegex = /^(\d+)(?:\.(\d+)(?:\.(\d+))?)?$/;

export const convertPythonToStatement = (
  input: string,
  versionString = "3.9.1",
): StatementWithFunctions => {
  const version = getPythonVersion(versionString);

  const converter = match(version)
    .returnType<
      (input: string) => {
        node: StatementNode;
        functionDeclarations: FunctionDeclarationNode[];
      }
    >()
    .with(PythonVersion.V3, () => convertPythonV3ToStatement)
    .exhaustive();

  return converter(input);
};

export const convertPythonToGeneralAst = (
  input: string,
  versionString = "3.9.1",
): GeneralAst => {
  const version = getPythonVersion(versionString);

  const converter = match(version)
    .returnType<(input: string) => GeneralAst>()
    .with(PythonVersion.V3, () => convertPythonV3ToGeneralAst)
    .exhaustive();

  return converter(input);
};

export const convertPythonV3ToStatement = (
  input: string,
): StatementWithFunctions => {
  const chars = new CharStream(input);
  const lexer = new PythonLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new PythonParser(tokens);
  parser.buildParseTrees = true;

  // Use the file input entrypoint
  const tree = parser.file_input();

  const { node, functionDeclarations } = new PythonAstVisitor().visit(tree);

  if (node == undefined) {
    throw new Error(
      "Failed to convert Python AST to general AST, received undefined node.",
    );
  }

  if (functionDeclarations.length > 0) {
    // python functions are not hoisted
    throw new Error(
      "Python functions are not hoisted but AST translation tries to do so",
    );
  }

  if (isExpressionNode(node)) {
    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.expressionAsStatement,
        expression: node,
      } satisfies ExpressionAsStatementNode,
      functionDeclarations,
    };
  }

  return { node, functionDeclarations };
};

export const convertPythonV3ToGeneralAst = (input: string): GeneralAst => {
  const { node, functionDeclarations } = convertPythonV3ToStatement(input);

  if (
    node.nodeType === AstNodeType.statement &&
    node.statementType === StatementNodeType.sequence
  ) {
    return createTopLevelPythonStatementOutput(
      node.statements,
      functionDeclarations,
    );
  }

  return createTopLevelPythonStatementOutput([node], functionDeclarations);
};

const getPythonVersion = (versionString: string): PythonVersion => {
  const match = versionRegex.exec(versionString);
  if (!match) {
    throw new Error(`Invalid Python version string: ${versionString}`);
  }

  const major = parseInt(match[1], 10);
  const _minor = match.length > 2 ? parseInt(match[2], 10) : null;
  const _patch = match.length > 3 ? parseInt(match[3], 10) : null;

  if (major === 3) {
    return PythonVersion.V3;
  }

  throw new Error(`Unsupported Python version: ${versionString}`);
};

export const createTopLevelPythonStatementOutput = (
  statements: StatementNode[],
  functionDeclarations: FunctionDeclarationNode[],
): GeneralAst => [
  {
    nodeType: AstNodeType.actor,
    componentId: "executable",
    eventListeners: [
      {
        nodeType: AstNodeType.eventListener,
        condition: {
          event: "main",
          parameters: [],
        },
        action: {
          nodeType: AstNodeType.statement,
          statementType: StatementNodeType.sequence,
          statements,
        },
      } satisfies EventListenerNode,
    ],
    functionDeclarations,
  } satisfies ActorNode,
];

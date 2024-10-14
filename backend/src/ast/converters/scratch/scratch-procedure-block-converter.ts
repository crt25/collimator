import {
  StatementNode,
  StatementNodeType,
  FunctionDeclarationNode,
} from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
import { NonHatBlock, NonHatBlockTree, TreeNode } from "./types";
import {
  ArgumentBooleanBlock,
  ArgumentStringNumberBlock,
  CallBlock,
  DefinitionBlock,
  isArgumentBooleanBlock,
  isArgumentStringNumberBlock,
  isCallBlock,
  isPrototypeBlock,
  ProcedureStatementBlock,
  ProcedureExpressionBlock,
  PrototypeBlock,
} from "src/ast/types/input/scratch/blocks/procedure";
import {
  convertChildWithReferenceId,
  createFunctionCallBlock,
  createVariableExpressionBlock,
} from "./helpers";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { convertBlockTreeToStatement } from "./scratch-block-statement-converter";

type ProcedureCodeTreeNode = ProcedureStatementBlock & TreeNode;
type ProcedureExpressionTreeNode = ProcedureExpressionBlock & TreeNode;

export const isProcedureStatementBlock = (
  block: NonHatBlock,
): block is ProcedureStatementBlock =>
  isCallBlock(block) || isPrototypeBlock(block);

export const isProcedureExpressionBlock = (
  block: NonHatBlock,
): block is ProcedureExpressionTreeNode =>
  isArgumentBooleanBlock(block) || isArgumentStringNumberBlock(block);

export const convertProcedureBlockTreeToStatement = (
  procedureBlock: ProcedureCodeTreeNode,
): StatementNode[] =>
  match(procedureBlock)
    .returnType<StatementNode[]>()
    .with(
      P.when(isPrototypeBlock),
      (_block: PrototypeBlock & ProcedureCodeTreeNode) => {
        throw new Error(
          "A procedure prototype should only ever show up as a child of a top-level hat definition block",
        );
      },
    )
    .with(P.when(isCallBlock), (block: CallBlock & ProcedureCodeTreeNode) => [
      createFunctionCallBlock(block, block.mutation.proccode),
    ])
    .exhaustive();

export const convertProcedureBlockTreeToExpression = (
  procedureBlock: ProcedureExpressionTreeNode,
): ExpressionNode =>
  match(procedureBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isArgumentBooleanBlock),
      P.when(isArgumentStringNumberBlock),
      (
        block: (ArgumentBooleanBlock | ArgumentStringNumberBlock) &
          ProcedureExpressionTreeNode,
      ) => createVariableExpressionBlock(block.fields.VALUE[0]),
    )
    .exhaustive();

const convertProcedurePrototype = (
  block: NonHatBlockTree,
): {
  name: string;
  parameterNames: string[];
} => {
  if (!isPrototypeBlock(block)) {
    throw new Error("Expected a definition block");
  }

  return {
    name: block.mutation.proccode,
    parameterNames: JSON.parse(block.mutation.argumentnames) as string[],
  };
};

export const convertProcedureDefinitionTree = (
  block: DefinitionBlock & TreeNode,
): FunctionDeclarationNode => {
  // find prototype
  const { name, parameterNames } = convertChildWithReferenceId(
    block,
    (block) => block.inputs.custom_block,
    convertProcedurePrototype,
  );

  return {
    nodeType: AstNodeType.statement,
    statementType: StatementNodeType.functionDeclaration,
    name,
    parameterNames,
    body: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.sequence,
      statements: block.__next ? convertBlockTreeToStatement(block.__next) : [],
    },
  };
};

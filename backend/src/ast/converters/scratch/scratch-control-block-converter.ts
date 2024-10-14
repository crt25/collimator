import { CodeNode, CodeNodeType } from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
import {
  CreateCloneOfBlock,
  isCreateCloneOfBlock,
} from "src/ast/types/input/scratch/blocks/control/create-clone-of";
import {
  CreateCloneOfMenuBlock,
  isCreateCloneOfMenuBlock,
} from "src/ast/types/input/scratch/blocks/control/create-clone-of-menu";
import {
  ExpressionNode,
  ExpressionNodeType,
} from "src/ast/types/general-ast/ast-nodes/code-node/expression-node";
import {
  DeleteThisCloneBlock,
  isDeleteThisCloneBlock,
} from "src/ast/types/input/scratch/blocks/control/delete-this-clone";
import {
  ForeverBlock,
  isForeverBlock,
  IfElseBlock,
  isIfElseBlock,
  IfBlock,
  isIfBlock,
  isRepeatUntilBlock,
  RepeatUntilBlock,
  isRepeatBlock,
  RepeatBlock,
  isStopBlock,
  isWaitUntilBlock,
  WaitUntilBlock,
  isWaitBlock,
  WaitBlock,
  ControlCodeBlock,
  StopBlock,
  ControlExpressionBlock,
} from "src/ast/types/input/scratch/blocks/control";

import { AstNodeType } from "src/ast/types/general-ast";
import { NonHatBlock, TreeNode } from "./types";
import {
  convertChildWithReferenceId,
  createFunctionCallBlock,
  createLiteralNode,
} from "./helpers";
import { convertBlockTreeToExpression } from "./scratch-block-expression-converter";
import { convertBlockTreeToCode } from "./scratch-block-code-converter";
import { convertInputsToExpression } from "./scratch-block-input-converter";

type ControlCodeTreeNode = ControlCodeBlock & TreeNode;
type ControlExpressionTreeNode = ControlExpressionBlock & TreeNode;

export const isControlCodeBlock = (
  block: NonHatBlock,
): block is ControlCodeBlock =>
  isForeverBlock(block) ||
  isIfElseBlock(block) ||
  isIfBlock(block) ||
  isRepeatUntilBlock(block) ||
  isRepeatBlock(block) ||
  isStopBlock(block) ||
  isWaitUntilBlock(block) ||
  isWaitBlock(block) ||
  isCreateCloneOfBlock(block) ||
  isDeleteThisCloneBlock(block);

export const isControlExpressionBlock = (
  block: NonHatBlock,
): block is ControlExpressionBlock => isCreateCloneOfMenuBlock(block);

export const convertControlBlockTreeToCode = (
  controlBlock: ControlCodeTreeNode,
): CodeNode[] =>
  match(controlBlock)
    .returnType<CodeNode[]>()
    .with(
      P.when(isCreateCloneOfBlock),
      (block: CreateCloneOfBlock & ControlCodeTreeNode) => [
        createFunctionCallBlock(block),
      ],
    )
    .with(
      P.when(isForeverBlock),
      (block: ForeverBlock & ControlCodeTreeNode) => [
        // convert a forever block into a while(true) loop
        {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.loop,
          condition: {
            nodeType: AstNodeType.code,
            codeType: CodeNodeType.expression,
            expressionType: ExpressionNodeType.literal,
            type: "boolean",
            value: "true",
          },
          body: {
            nodeType: AstNodeType.code,
            codeType: CodeNodeType.sequence,
            statements: convertChildWithReferenceId(
              block,
              (block) => block.inputs.SUBSTACK,
              convertBlockTreeToCode,
              [],
            ),
          },
        },
      ],
    )
    .with(P.when(isIfElseBlock), (block: IfElseBlock & ControlCodeTreeNode) => [
      {
        nodeType: AstNodeType.code,
        codeType: CodeNodeType.condition,
        condition: convertChildWithReferenceId(
          block,
          (block) => block.inputs.CONDITION,
          convertBlockTreeToExpression,
          null,
        ),
        whenTrue: {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.sequence,
          statements: convertChildWithReferenceId(
            block,
            (block) => block.inputs.SUBSTACK,
            convertBlockTreeToCode,
            [],
          ),
        },
        whenFalse: {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.sequence,
          statements: convertChildWithReferenceId(
            block,
            (block) => block.inputs.SUBSTACK2,
            convertBlockTreeToCode,
            [],
          ),
        },
      },
    ])
    .with(P.when(isIfBlock), (block: IfBlock & ControlCodeTreeNode) => [
      {
        nodeType: AstNodeType.code,
        codeType: CodeNodeType.condition,
        condition: convertChildWithReferenceId(
          block,
          (block) => block.inputs.CONDITION,
          convertBlockTreeToExpression,
          null,
        ),
        whenTrue: {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.sequence,
          statements: convertChildWithReferenceId(
            block,
            (block) => block.inputs.SUBSTACK,
            convertBlockTreeToCode,
            [],
          ),
        },
        whenFalse: {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.sequence,
          statements: [],
        },
      },
    ])
    .with(
      P.when(isRepeatUntilBlock),
      (block: RepeatUntilBlock & ControlCodeTreeNode) => [
        // a repeat until block is a  negated while loop, *not* a negated do-while loop as the name may suggest
        {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.loop,
          condition: {
            nodeType: AstNodeType.code,
            codeType: CodeNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_not",
            operands: [
              convertChildWithReferenceId(
                block,
                (block) => block.inputs.CONDITION,
                convertBlockTreeToExpression,
              ),
            ],
          },
          body: {
            nodeType: AstNodeType.code,
            codeType: CodeNodeType.sequence,
            statements: convertChildWithReferenceId(
              block,
              (block) => block.inputs.SUBSTACK,
              convertBlockTreeToCode,
              [],
            ),
          },
        },
      ],
    )
    .with(P.when(isRepeatBlock), (block: RepeatBlock & ControlCodeTreeNode) => [
      // a repeat until block is a  negated while loop, *not* a negated do-while loop as the name may suggest
      {
        nodeType: AstNodeType.code,
        codeType: CodeNodeType.loop,
        condition: {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.expression,
          expressionType: ExpressionNodeType.functionCall,
          name: "loop_count_smaller_than",
          arguments: [convertInputsToExpression(block, "TIMES")],
        },
        body: {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.sequence,
          statements: convertChildWithReferenceId(
            block,
            (block) => block.inputs.SUBSTACK,
            convertBlockTreeToCode,
            [],
          ),
        },
      },
    ])
    .with(
      P.when(isStopBlock),
      P.when(isWaitUntilBlock),
      P.when(isWaitBlock),
      P.when(isDeleteThisCloneBlock),
      (
        block: (StopBlock | WaitUntilBlock | WaitBlock | DeleteThisCloneBlock) &
          ControlCodeTreeNode,
      ) => [createFunctionCallBlock(block)],
    )
    .exhaustive();

export const convertControlBlockTreeToExpression = (
  controlBlock: ControlExpressionTreeNode,
): ExpressionNode =>
  match(controlBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isCreateCloneOfMenuBlock),
      (block: CreateCloneOfMenuBlock & ControlExpressionTreeNode) =>
        createLiteralNode("string", block.fields.CLONE_OPTION[0] || ""),
    )
    .exhaustive();

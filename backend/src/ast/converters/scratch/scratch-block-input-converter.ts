import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/code-node/expression-node";
import { BlockInputValue, NonHatBlockTree } from "./types";
import { match, P } from "ts-pattern";
import { createLiteralNode, createVariableExpressionBlock } from "./helpers";
import { convertBlockTreeToExpression } from "./scratch-block-expression-converter";

export const convertInputsToExpression = <
  TBlock extends {
    __children: NonHatBlockTree[];
    inputs?: {
      [key in TKey]?: BlockInputValue | string;
    };
  },
  TKey extends string,
>(
  block: TBlock,
  inputName: TKey,
): ExpressionNode =>
  _convertInputsToExpression(block.__children, block.inputs, inputName);

const _convertInputsToExpression = <TKey extends string>(
  children: NonHatBlockTree[],
  inputs:
    | {
        [key in TKey]?: BlockInputValue | string;
      }
    | undefined,
  inputName: TKey,
): ExpressionNode => {
  if (!inputs) {
    throw new Error("inputs are required");
  }

  const input = inputs[inputName] as BlockInputValue | undefined;

  return convertInputToExpression(children, input);
};

const convertInputToExpression = (
  children: NonHatBlockTree[],
  input: BlockInputValue | string | undefined,
): ExpressionNode =>
  match(input)
    .returnType<ExpressionNode>()
    .with([P.number.between(1, 3), ...P.array()], ([_, value]) =>
      match(value)
        .returnType<ExpressionNode>()
        .with(P.union(null, [], [P.number]), () =>
          createLiteralNode("unknown", ""),
        )
        .with(P.string, (blockReference) => {
          const childBlock = children.find(
            (child) => child.__id === blockReference,
          );

          if (!childBlock) {
            throw new Error(`could not find block with id ${blockReference}`);
          }

          return convertBlockTreeToExpression(childBlock);
        })
        .with(
          [P.union(4, 5, 6, 7, 8), P.union(P.string, P.number)],
          ([_, value]) => createLiteralNode("number", value.toString()),
        )
        .with([9, P.string], ([_, value]) => createLiteralNode("color", value))
        .with([10, P.union(P.string, P.number)], ([_, value]) =>
          createLiteralNode("string", value.toString()),
        )
        .with([11, P.string], ([_, value]) =>
          createVariableExpressionBlock(value),
        )
        .with([11, P.string, P.string], ([_, value]) =>
          createVariableExpressionBlock(value),
        )
        .with(
          [P.union(12, 13), P.string, P.string, ...P.array()],
          ([_, value]) => createVariableExpressionBlock(value),
        )
        .exhaustive(),
    )
    .otherwise(() => createLiteralNode("unknown", ""));

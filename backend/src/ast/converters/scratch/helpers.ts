import { AstNodeType } from "src/ast/types/general-ast";
import { CodeNode, CodeNodeType } from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNode,
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/code-node/expression-node";
import { Block } from "src/ast/types/input/scratch/generated/sb3";
import {
  BlockInputValue,
  BlockTreeWithEventHatRoot,
  NonHatBlock,
  NonHatBlockTree,
  TreeNode,
} from "./types";
import { isWhenBackdropSwitchesToBlock } from "src/ast/types/input/scratch/blocks/event/when-backdrop-switches-to";
import { isWhenBroadcastReceivedBlock } from "src/ast/types/input/scratch/blocks/event/when-broadcast-received";
import {
  isWhenGreaterThanBlock,
  WhenGreaterThanBlock,
} from "src/ast/types/input/scratch/blocks/event/when-greater-than";
import { isWhenKeyPressedBlock } from "src/ast/types/input/scratch/blocks/event/when-key-pressed";
import { isWhenFlagClickedBlock } from "src/ast/types/input/scratch/blocks/event/when-flag-clicked";
import { isWhenStageIsClickedBlock } from "src/ast/types/input/scratch/blocks/event/when-stage-is-clicked";
import { iswhenThisSpriteIsClickedBlock } from "src/ast/types/input/scratch/blocks/event/when-this-sprite-is-clicked";
import { isStartAsCloneBlock } from "src/ast/types/input/scratch/blocks/control";
import { match, P } from "ts-pattern";
import { BlockReferenceInput } from "src/ast/types/input/scratch/blocks/block-reference-input";
import { BlockInputType } from "src/ast/types/input/scratch/block-input-type";
import { isDefinitionBlock } from "src/ast/types/input/scratch/blocks/procedure/definition";
import { convertInputsToExpression } from "./scratch-block-input-converter";
import {
  KnownBuiltinScratchCodeBlock,
  KnownBuiltinScratchExpressionBlock,
  KnownBuiltinScratchHatBlock,
} from "src/ast/types/input/scratch/blocks";
import {
  isControlCodeBlock,
  isControlExpressionBlock,
} from "./scratch-control-block-converter";
import {
  isDataCodeBlock,
  isDataExpressionBlock,
} from "./scratch-data-block-converter";
import {
  isEventCodeBlock,
  isEventExpressionBlock,
} from "./scratch-event-block-converter";
import {
  isLooksCodeBlock,
  isLooksExpressionBlock,
} from "./scratch-looks-block-converter";
import {
  isMotionCodeBlock,
  isMotionExpressionBlock,
} from "./scratch-motion-block-converter";
import {
  isOperatorCodeBlock,
  isOperatorExpressionBlock,
} from "./scratch-operator-block-converter";
import {
  isProcedureCodeBlock,
  isProcedureExpressionBlock,
} from "./scratch-procedure-block-converter";
import {
  isSensingCodeBlock,
  isSensingExpressionBlock,
} from "./scratch-sensing-block-converter";
import {
  isSoundCodeBlock,
  isSoundExpressionBlock,
} from "./scratch-sound-block-converter";

export const createLiteralNode = (type: string, value: string): LiteralNode => {
  return {
    nodeType: AstNodeType.code,
    codeType: CodeNodeType.expression,
    expressionType: ExpressionNodeType.literal,
    type,
    value,
  };
};

const createArgumentsFromInputsAndFields = <TKey extends string>(
  block: {
    fields?: Block["fields"];
    inputs?: {
      [key in TKey]?: BlockInputValue | string;
    };
    __children: NonHatBlockTree[];
  },
  inputKeys: TKey[] | null = null,
): ExpressionNode[] => {
  if (!inputKeys) {
    if (block.inputs) {
      inputKeys = Object.keys(block.inputs) as TKey[];
    } else {
      inputKeys = [];
    }
  }

  const inputs = inputKeys
    .sort((a, b) => a.localeCompare(b))
    .map((inputKey) => convertInputsToExpression(block, inputKey));

  const fields = getParametersFromFields(block.fields)
    .sort((a, b) => a.parameterName.localeCompare(b.parameterName))
    .map((field) =>
      "value" in field
        ? createLiteralNode("string", field.value)
        : createVariableExpressionBlock(field.variableName),
    );

  return [...inputs, ...fields];
};

export const createFunctionCallBlock = <TKey extends string>(
  block: {
    opcode: string;
    fields?: Block["fields"];
    inputs?: {
      [key in TKey]?: BlockInputValue | string;
    };
    __children: NonHatBlockTree[];
  },
  functionName?: string,
): CodeNode => ({
  nodeType: AstNodeType.code,
  codeType: CodeNodeType.functionCall,
  name: functionName || block.opcode,
  arguments: createArgumentsFromInputsAndFields(block),
});

export const createFunctionCallExpressionBlock = <TKey extends string>(block: {
  opcode: string;
  fields?: Block["fields"];
  inputs?: {
    [key in TKey]?: BlockInputValue | string;
  };
  __children: NonHatBlockTree[];
}): ExpressionNode => ({
  nodeType: AstNodeType.code,
  codeType: CodeNodeType.expression,
  expressionType: ExpressionNodeType.functionCall,
  name: block.opcode,
  arguments: createArgumentsFromInputsAndFields(block),
});

export const createVariableExpressionBlock = (
  variableName: string,
): ExpressionNode => ({
  nodeType: AstNodeType.code,
  codeType: CodeNodeType.expression,
  expressionType: ExpressionNodeType.variable,
  name: variableName,
});

export const createOperatorExpressionBlock = <TKey extends string>(block: {
  opcode: string;
  fields?: Block["fields"];
  inputs?: {
    [key in TKey]?: BlockInputValue | string;
  };
  __children: NonHatBlockTree[];
}): ExpressionNode => ({
  nodeType: AstNodeType.code,
  codeType: CodeNodeType.expression,
  expressionType: ExpressionNodeType.operator,
  operator: block.opcode,
  operands: createArgumentsFromInputsAndFields(block),
});

export const getEventParameters = (
  block: BlockTreeWithEventHatRoot,
): ExpressionNode[] => {
  return match(block)
    .returnType<ExpressionNode[]>()
    .with(P.when(isWhenBackdropSwitchesToBlock), (block) => [
      createLiteralNode("string", block.fields.BACKDROP[0]),
    ])
    .with(P.when(isWhenBroadcastReceivedBlock), (block) => [
      createLiteralNode("string", block.fields.BROADCAST_OPTION[0]),
    ])
    .with(
      P.when(isWhenGreaterThanBlock),
      (block: WhenGreaterThanBlock & BlockTreeWithEventHatRoot) => [
        convertInputsToExpression(block, "VALUE"),
        createLiteralNode("string", block.fields.WHENGREATERTHANMENU[0]),
      ],
    )
    .with(P.when(isWhenKeyPressedBlock), (block) => [
      createLiteralNode("string", block.fields.KEY_OPTION[0]),
    ])
    .with(
      P.when(isWhenFlagClickedBlock),
      P.when(isWhenStageIsClickedBlock),
      P.when(iswhenThisSpriteIsClickedBlock),
      P.when(isStartAsCloneBlock),
      () => [],
    )
    .exhaustive();
};

export const getParametersFromFields = (
  fields: Block["fields"],
): ({ parameterName: string } & (
  | { value: string }
  | { variableName: string }
))[] => {
  if (!fields) {
    return [];
  }

  return Object.entries(fields).map(([parameterName, value]) => {
    if (!Array.isArray(value)) {
      throw new Error(
        `Unexpected field value for name '${parameterName}': '${JSON.stringify(value)}'`,
      );
    }

    // while I could not find any documentation on this, it seems that fields are always an array
    // consisting of two elements where the first one is the value or variable name
    // and the second one is either null of the value is a literal or a block id if the value is a variable
    // however for variables the variable name is enough for us and we don't need the block id
    // therefore we only take the first element

    if (value.length !== 2) {
      throw new Error(
        `Unexpected number of values for name '${parameterName}': '${JSON.stringify(value)}'`,
      );
    }

    if (value[1] == null) {
      return {
        parameterName,
        value: value[0],
      };
    } else {
      return {
        parameterName,
        variableName: value[0],
      };
    }
  });
};

export const convertChildWithReferenceId = <T extends TreeNode, ReturnType>(
  block: T,
  getReference: (block: T) => [BlockInputType, BlockReferenceInput] | undefined,
  compute: (child: NonHatBlockTree) => ReturnType,
  fallbackValue?: ReturnType,
): ReturnType => {
  const reference = getReference(block);
  if (!reference) {
    if (fallbackValue) {
      return fallbackValue;
    }

    throw new Error(`Reference was undefined`);
  }

  const id = reference[1];
  const child = block.__children.find((b) => b.__id === id);

  if (!child) {
    if (fallbackValue) {
      return fallbackValue;
    }

    throw new Error(`Child with id '${id}' not found`);
  }

  return compute(child);
};

export const isNonHatBlock = (block: Block): block is NonHatBlock => {
  return !isHatBlock(block);
};

export const isHatBlock = (
  block: Block,
): block is KnownBuiltinScratchHatBlock => {
  return (
    isWhenBackdropSwitchesToBlock(block) ||
    isWhenBroadcastReceivedBlock(block) ||
    isWhenFlagClickedBlock(block) ||
    isWhenGreaterThanBlock(block) ||
    isWhenKeyPressedBlock(block) ||
    isWhenStageIsClickedBlock(block) ||
    iswhenThisSpriteIsClickedBlock(block) ||
    isStartAsCloneBlock(block) ||
    isDefinitionBlock(block)
  );
};

export const isCodeBlock = (
  block: NonHatBlock,
): block is KnownBuiltinScratchCodeBlock => {
  return (
    isControlCodeBlock(block) ||
    isDataCodeBlock(block) ||
    isEventCodeBlock(block) ||
    isLooksCodeBlock(block) ||
    isMotionCodeBlock(block) ||
    isOperatorCodeBlock(block) ||
    isProcedureCodeBlock(block) ||
    isSensingCodeBlock(block) ||
    isSoundCodeBlock(block)
  );
};

export const isExpressionBlock = (
  block: NonHatBlock,
): block is KnownBuiltinScratchExpressionBlock => {
  return (
    isControlExpressionBlock(block) ||
    isDataExpressionBlock(block) ||
    isEventExpressionBlock(block) ||
    isLooksExpressionBlock(block) ||
    isMotionExpressionBlock(block) ||
    isOperatorExpressionBlock(block) ||
    isProcedureExpressionBlock(block) ||
    isSensingExpressionBlock(block) ||
    isSoundExpressionBlock(block)
  );
};

import { ActorNode, AstNodeType, GeneralAst } from "src/ast/types/general-ast";
import {
  CodeNode,
  CodeNodeType,
  EventListenerNode,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNode,
  ExpressionNodeType,
} from "src/ast/types/general-ast/ast-nodes/code-node/expression-node";
import ScratchInput from "src/ast/types/input/scratch";
import { Block, Target } from "src/ast/types/input/scratch/generated/sb3";

export const createScratchBlockInput = (
  blocks: Target["blocks"],
): ScratchInput => ({
  targets: [
    {
      isStage: true,
      name: "Stage",
      variables: {},
      lists: {},
      broadcasts: {},
      comments: {},
      currentCostume: 0,
      costumes: [
        {
          name: "backdrop1",
          dataFormat: "svg",
          assetId: "cd21514d0531fdffb22204e0ec5ed84a",
          md5ext: "cd21514d0531fdffb22204e0ec5ed84a.svg",
          rotationCenterX: 240,
          rotationCenterY: 180,
        },
      ],
      sounds: [],
      volume: 100,
      layerOrder: 0,
      tempo: 60,
      videoTransparency: 50,
      videoState: "on",
      textToSpeechLanguage: null,
      blocks: blocks,
    },
  ],
  monitors: [],
  extensions: [],
  meta: {
    semver: "3.0.0",
    vm: "4.5.471",
    agent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
  },
});

export const createScratchHatOutput = (
  eventListenerNode: EventListenerNode,
): GeneralAst => [
  {
    nodeType: AstNodeType.actor,
    eventListeners: [eventListenerNode],
    functionDeclarations: [],
  } as ActorNode,
];

export const createScratchCodeInput = (
  blocks: { [P in keyof Block as Exclude<P, "next" | "parent">]: Block[P] }[],
  extraBlocks: (Block & { id: string })[] = [],
): ScratchInput =>
  createScratchBlockInput({
    __start__: {
      opcode: "event_whengreaterthan",
      next: "0",
      parent: null,
      inputs: { VALUE: [1, [4, "10"]] },
      fields: { WHENGREATERTHANMENU: ["LOUDNESS", null] },
      shadow: false,
      topLevel: true,
      x: 213,
      y: -34,
    },
    ...blocks.reduce(
      (acc, block, index) => {
        const properBlock: Block = {
          ...block,
          parent: "__start__",
          next: null,
        };

        if (index > 0) {
          properBlock.parent = (index - 1).toString();
        }

        if (index < blocks.length - 1) {
          // set the next block if this is not the last block
          properBlock.next = (index + 1).toString();
        }

        acc[index.toString()] = properBlock;

        return acc;
      },
      {} as Target["blocks"],
    ),
    ...extraBlocks.reduce(
      (acc, block) => {
        acc[block.id] = block;

        return acc;
      },
      {} as Target["blocks"],
    ),
  });

export const createScratchCodeOutput = (codeNodes: CodeNode[]): GeneralAst => [
  {
    nodeType: AstNodeType.actor,
    eventListeners: [
      {
        nodeType: AstNodeType.eventListener,
        condition: {
          event: "event_whengreaterthan",
          parameters: [
            {
              nodeType: AstNodeType.code,
              codeType: CodeNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "number",
              value: "10",
            },
            {
              nodeType: AstNodeType.code,
              codeType: CodeNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "string",
              value: "LOUDNESS",
            },
          ],
        },
        action: {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.sequence,
          statements: codeNodes,
        },
      },
    ],
    functionDeclarations: [],
  } as ActorNode,
];

export const createScratchExpressionInput = ([firstBlock, ...remainingBlocks]: [
  { [P in keyof Block as Exclude<P, "next" | "parent">]: Block[P] },
  ...(Block & { id: string })[],
]): ScratchInput =>
  createScratchBlockInput({
    __start__: {
      opcode: "event_whengreaterthan",
      next: "functionCall",
      parent: null,
      inputs: { VALUE: [1, [4, "10"]] },
      fields: { WHENGREATERTHANMENU: ["LOUDNESS", null] },
      shadow: false,
      topLevel: true,
      x: 213,
      y: -34,
    },
    functionCall: {
      opcode: "motion_movesteps",
      next: null,
      parent: "__start__",
      inputs: { STEPS: [3, "expressionBlock", [4, "10"]] },
      fields: {},
      shadow: false,
      topLevel: false,
    },
    expressionBlock: {
      ...firstBlock,
      next: null,
      parent: "functionCall",
    },
    ...remainingBlocks.reduce(
      (acc, block) => {
        acc[block.id] = block;

        return acc;
      },
      {} as Target["blocks"],
    ),
  });

export const createScratchExpressionOutput = (
  expressionNode: ExpressionNode,
): GeneralAst => [
  {
    nodeType: AstNodeType.actor,
    eventListeners: [
      {
        nodeType: AstNodeType.eventListener,
        condition: {
          event: "event_whengreaterthan",
          parameters: [
            {
              nodeType: AstNodeType.code,
              codeType: CodeNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "number",
              value: "10",
            },
            {
              nodeType: AstNodeType.code,
              codeType: CodeNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "string",
              value: "LOUDNESS",
            },
          ],
        },
        action: {
          nodeType: AstNodeType.code,
          codeType: CodeNodeType.sequence,
          statements: [
            {
              nodeType: AstNodeType.code,
              codeType: CodeNodeType.functionCall,
              name: "motion_movesteps",
              arguments: [expressionNode],
            },
          ],
        },
      },
    ],
    functionDeclarations: [],
  } as ActorNode,
];

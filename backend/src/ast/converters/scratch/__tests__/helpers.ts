import { ActorNode, AstNodeType, GeneralAst } from "src/ast/types/general-ast";
import {
  StatementNode,
  StatementNodeType,
  EventListenerNode,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNode,
  ExpressionNodeType,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import ScratchInput from "src/ast/types/input/scratch";
import { Block, Target } from "src/ast/types/input/scratch/generated/sb3";

/**
 * Creates a Scratch input object with the given blocks.
 * This allows us to generate a valid Scratch AST with arbitrary blocks, to support the AST conversion tests.
 * @param blocks The blocks to be used in the Scratch input. They are put on the blocks object of the stage.
 */
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

/**
 * Creates the expected output of the conversion of a single hat block.
 */
export const createScratchHatOutput = (
  eventListenerNode: EventListenerNode,
): GeneralAst => [
  {
    nodeType: AstNodeType.actor,
    eventListeners: [eventListenerNode],
    functionDeclarations: [],
  } as ActorNode,
];

/**
 * Creates scratch input to test the AST conversions of code blocks.
 * @param blocks An array of blocks without next and parent keys - they are automatically set to the respective array index by this function.
 * @param extraBlocks An additional set of blocks that are children of the code blocks. These blocks must have the parent/next keys (to the index of the respective code blocks).
 */
export const createScratchCodeInput = (
  // blocks is an array of blocks without the next and parent keys - Omit seems limited in this situation
  // see https://stackoverflow.com/a/76616671/2897827
  blocks: { [P in keyof Block as Exclude<P, "next" | "parent">]: Block[P] }[],
  extraBlocks: (Block & { id: string })[] = [],
): ScratchInput =>
  createScratchBlockInput({
    // add a hat block at the beginning
    __start__: {
      opcode: "event_whengreaterthan",
      // reference the first block passed to this function via its index
      next: "0",
      parent: null,
      inputs: { VALUE: [1, [4, "10"]] },
      fields: { WHENGREATERTHANMENU: ["LOUDNESS", null] },
      shadow: false,
      topLevel: true,
      x: 213,
      y: -34,
    },
    // and then the actual code blocks.
    ...blocks.reduce(
      (acc, block, index) => {
        // automatically set the parent and next keys based on the index
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
    // finally add the extra blocks (optional children of a code block)
    // these blocks must have an id and its parent/next keys properly set
    ...extraBlocks.reduce(
      (acc, block) => {
        acc[block.id] = block;

        return acc;
      },
      {} as Target["blocks"],
    ),
  });

/**
 * Creates the expected output of the AST conversion of a sequence of code blocks.
 * @param statementNodes The expected statement nodes in the output AST.
 */
export const createScratchCodeOutput = (
  statementNodes: StatementNode[],
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
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "number",
              value: "10",
            },
            {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "string",
              value: "LOUDNESS",
            },
          ],
        },
        action: {
          nodeType: AstNodeType.statement,
          codeType: StatementNodeType.sequence,
          statements: statementNodes,
        },
      },
    ],
    functionDeclarations: [],
  } as ActorNode,
];

/**
 * Creates scratch input to test the AST conversions of exression blocks.
 * The expression block will be assigned the id "expressionBlock".
 * @param blocks A non-empty array starting with an expression block, followed by optional blocks that are children of the expression block.
 */
export const createScratchExpressionInput = ([firstBlock, ...remainingBlocks]: [
  { [P in keyof Block as Exclude<P, "next" | "parent">]: Block[P] },
  ...(Block & { id: string })[],
]): ScratchInput =>
  createScratchBlockInput({
    // add a hat block at the beginning
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
    // as well as some block accepting an expression
    functionCall: {
      opcode: "motion_movesteps",
      next: null,
      parent: "__start__",
      inputs: { STEPS: [3, "expressionBlock", [4, "10"]] },
      fields: {},
      shadow: false,
      topLevel: false,
    },
    // then put the expression block as a child of the function call
    expressionBlock: {
      ...firstBlock,
      next: null,
      parent: "functionCall",
    },
    // and the rest of the blocks (optional children of the expression block)
    ...remainingBlocks.reduce(
      (acc, block) => {
        acc[block.id] = block;

        return acc;
      },
      {} as Target["blocks"],
    ),
  });

/**
 * Creates the expected output of the AST conversion of an expression block.
 * @param expressionNode The expected expression node in the output AST.
 */
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
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "number",
              value: "10",
            },
            {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "string",
              value: "LOUDNESS",
            },
          ],
        },
        action: {
          nodeType: AstNodeType.statement,
          codeType: StatementNodeType.sequence,
          statements: [
            {
              nodeType: AstNodeType.statement,
              codeType: StatementNodeType.functionCall,
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

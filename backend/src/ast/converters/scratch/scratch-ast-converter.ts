import {
  ActorNode,
  AstNodeType,
  EventListenerNode,
} from "src/ast/types/general-ast";
import {
  Block,
  ListPrimitive,
  Target,
  VariablePrimitive,
} from "src/ast/types/input/scratch/generated/sb3";
import { isDefinitionBlock } from "src/ast/types/input/scratch/blocks/procedure/definition";
import { CodeNodeType } from "src/ast/types/general-ast/ast-nodes";
import {
  BlockTree,
  BlockTreeWithEventHatRoot,
  BlockTreeWithProcedureDefinitionRoot,
} from "./types";
import {
  getEventParameters,
  isNonHatBlock,
  isCodeBlock,
  isHatBlock,
} from "./helpers";
import { convertBlockTreeToCode } from "./scratch-block-code-converter";
import { convertProcedureDefinitionTree } from "./scratch-procedure-block-converter";

export const convertTarget = (target: Target): ActorNode => {
  const blockById = target.blocks;
  // scratch blocks are flat but we want to represent them as a tree
  // so first build a tree structure

  const targetBlocks: [string, Block | VariablePrimitive | ListPrimitive][] =
    Object.entries(blockById);

  // partition the list based on the type
  const {
    blocks,
    listPrimitives: _listPrimitives,
    variablePrimitives: _variablePrimitives,
  } = partitionTargetBlocks(targetBlocks);

  // build the tree where each (used) instruction tree is a reaction to an event
  const treeRoots = buildBlockTrees(blocks);

  // however, there may be code blocks lying around where the root is not an event block or a procedure definition
  // we want to ignore these
  const { eventHatRoots, procedureDefinitionRoots } =
    partitionRootBlocks(treeRoots);

  return {
    nodeType: AstNodeType.actor,
    eventListeners: eventHatRoots.map((root) => convertEventHatTree(root)),
    functionDeclarations: procedureDefinitionRoots.map(
      convertProcedureDefinitionTree,
    ),
  };
};

/**
 * Partition the list based on the type
 */
const partitionTargetBlocks = (
  targetBlocks: [string, Block | VariablePrimitive | ListPrimitive][],
): {
  blocks: { [id: string]: Block };
  variablePrimitives: { [id: string]: VariablePrimitive };
  listPrimitives: { [id: string]: ListPrimitive };
} => {
  // partition the list based on the type
  const blocks: { [id: string]: Block } = {};
  const variablePrimitives: { [id: string]: VariablePrimitive } = {};
  const listPrimitives: { [id: string]: ListPrimitive } = {};

  for (const [id, block] of targetBlocks) {
    if (!Array.isArray(block)) {
      // add a children array to the block
      blocks[id] = block;
      continue;
    }

    const [type] = block;
    if (type == 12) {
      variablePrimitives[id] = block;
      continue;
    }

    if (type == 13) {
      listPrimitives[id] = block;
      continue;
    }

    throw new Error(`Unknown block type: ${type}`);
  }

  return { blocks, variablePrimitives, listPrimitives };
};

/**
 * Based on a key-value map of blocks, build a tree structure
 */
const buildBlockTrees = (blocks: { [id: string]: Block }): BlockTree[] => {
  const blockTreeNodeById: { [id: string]: BlockTree } = Object.fromEntries(
    Object.entries(blocks).map(([id, block]) => [
      id,
      {
        ...block,

        // include the id in the block
        __id: id,

        // build the tree with the blocks by widening the type and adding a children array
        __children: [],

        // and a next pointer which is null if there is no next block
        __next: null,
      },
    ]),
  );

  const roots: BlockTree[] = [];

  for (const block of Object.values(blockTreeNodeById)) {
    const next = block.next;

    if (next) {
      const nextBlock = blockTreeNodeById[next];

      if (!isNonHatBlock(nextBlock)) {
        throw new Error(
          "Hat blocks cannot be the next block of some other block",
        );
      }

      if (!isCodeBlock(nextBlock)) {
        throw new Error(
          `The non-code block '${nextBlock.opcode}' cannot be the next block of some other block`,
        );
      }

      block.__next = nextBlock;
    }

    const parent = block.parent;

    if (parent) {
      if (!isNonHatBlock(block)) {
        throw new Error("Hat blocks cannot have a parent");
      }

      const parentBlock = blockTreeNodeById[parent];

      if (parentBlock.next !== block.__id) {
        // add it as a child as long as it is not the next block
        blockTreeNodeById[parent].__children.push(block);
      }
    } else {
      roots.push(block);
    }
  }

  return roots;
};

const partitionRootBlocks = (
  blocks: BlockTree[],
): {
  eventHatRoots: BlockTreeWithEventHatRoot[];
  procedureDefinitionRoots: BlockTreeWithProcedureDefinitionRoot[];
} => {
  const eventRoots: BlockTreeWithEventHatRoot[] = [];
  const procedureDefinitionRoots: BlockTreeWithProcedureDefinitionRoot[] = [];

  for (const block of blocks) {
    if (isHatBlock(block) && !isDefinitionBlock(block)) {
      eventRoots.push(block);
    } else if (isDefinitionBlock(block)) {
      procedureDefinitionRoots.push(block);
    } else {
      throw new Error("Unexpected top-level block type");
    }
  }

  return { eventHatRoots: eventRoots, procedureDefinitionRoots };
};

const convertEventHatTree = (
  block: BlockTreeWithEventHatRoot,
): EventListenerNode => {
  return {
    nodeType: AstNodeType.eventListener,
    condition: {
      event: block.opcode,
      parameters: getEventParameters(block),
    },
    action: {
      nodeType: AstNodeType.code,
      codeType: CodeNodeType.sequence,
      statements: block.__next ? convertBlockTreeToCode(block.__next) : [],
    },
  };
};

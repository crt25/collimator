/* eslint-disable no-undef */
import { Buffer } from "buffer";
import * as path from "path";
import * as fs from "fs";
import { BlockFreezeStates } from "../../../blocks/types";
import { ScratchCrtConfig } from "../../../types/scratch-vm-custom";
import { zipDirectory } from "./helpers";
import {
  createMissingAssetsTask,
  createNoCostumesOrSoundsTask,
  createNoTargetsTask,
} from "./invalid-tasks";

export type TestTask = {
  blocksOfMainTarget: number;
  frozenBlocksOfMainTarget: number;

  crtConfig: ScratchCrtConfig;
  file: Promise<Buffer>;
};

interface Sb3Block {
  opcode: string;
  parent: string | null;
}

interface Sb3BlockWithChildren extends Sb3Block {
  children: Sb3BlockWithChildren[];
}

interface Sb3Target {
  blocks: {
    [blockId: string]: Sb3Block;
  };
}

interface ScratchSb3 {
  targets: Sb3Target[];
}

const cache: { [path: string]: Buffer } = {};

const getTaskFile = async (path: string): Promise<Buffer> => {
  if (cache[path]) {
    return cache[path];
  }

  const file = await zipDirectory(path);
  cache[path] = file;

  return file;
};

const onlyFrozenBlocks = (
  crtConfig: ScratchCrtConfig,
  blocks: { [blockId: string]: Sb3Block },
): Sb3Block[] => {
  const blocksWithChildren = Object.fromEntries(
    Object.entries(blocks).map(([blockId, block]) => [
      blockId,
      {
        ...block,
        children: [] as Sb3BlockWithChildren[],
      } as Sb3BlockWithChildren,
    ]),
  );

  for (const [blockId, block] of Object.entries(blocksWithChildren)) {
    if (block.parent !== null) {
      blocksWithChildren[blockId].children.push(block);
    }
  }

  const frozenBlocks: Sb3Block[] = [];

  for (const [blockId, freezeState] of Object.entries(
    crtConfig.freezeStateByBlockId,
  )) {
    if (freezeState === BlockFreezeStates.editable) {
      continue;
    }

    const stack = blocksWithChildren[blockId];
    // add the top level block and all its children to the frozenBlocks array
    frozenBlocks.push(stack);

    const getChildren = (block: Sb3BlockWithChildren): Sb3BlockWithChildren[] =>
      block.children.flatMap(getChildren);

    frozenBlocks.push(...stack.children.flatMap(getChildren));
  }

  return frozenBlocks;
};

const getBlocksOfTarget = (
  sb3: ScratchSb3,
  targetIndex: number,
): { [blockId: string]: Sb3Block } =>
  Object.fromEntries(
    Object.entries(sb3.targets[targetIndex].blocks).filter(
      ([_blockId, block]) => !block.opcode.endsWith("_menu"),
    ),
  );

const getTask = (taskPath: string): TestTask => {
  const sb3 = JSON.parse(
    fs.readFileSync(path.resolve(taskPath, "project.json"), "utf-8"),
  );

  const crtConfig = JSON.parse(
    fs.readFileSync(path.resolve(taskPath, "crt.json"), "utf-8"),
  ) as ScratchCrtConfig;

  return {
    blocksOfMainTarget: Object.keys(getBlocksOfTarget(sb3, 1)).length,
    frozenBlocksOfMainTarget: onlyFrozenBlocks(
      crtConfig,
      getBlocksOfTarget(sb3, 1),
    ).length,
    crtConfig,
    file: getTaskFile(taskPath),
  };
};

const tasks = {
  get testTask(): TestTask {
    return getTask(path.resolve(__dirname, "test-task"));
  },
  get assertionTask(): TestTask {
    return getTask(path.resolve(__dirname, "assertion-task"));
  },
  get testFailingTask(): TestTask {
    return getTask(path.resolve(__dirname, "test-failing-task"));
  },
  createMissingAssetsTask,
  createNoTargetsTask,
  createNoCostumesOrSoundsTask,
};

export default tasks;

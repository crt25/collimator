import VM from "scratch-vm";
import { ModifyBlockConfigEvent } from "../events/modify-block-config";
import { isBlockInFlyoutCanvas } from "../utilities/scratch-selectors";
import { ScratchCrtConfig } from "../types/scratch-vm-custom";
import { ignoreEvent, svgNamespace } from "./helpers";

const buttonHeight = 20;
const buttonWidth = 60;

const blockConfigClass = "block-config-button";
const blockConfigTestId = "block-config-button";

const enabledButtonClass = "enabled-block-button";
const disabledButtonClass = "disabled-block-button";

const getBlockId = (dataId: string): string => {
  // some blocks prefix the block type with the target id followed by a double underscore
  // e.g. "someId__motion_xposition"
  // if so, remove this prefix

  const colonIndex = dataId.indexOf("__");
  if (colonIndex !== -1) {
    return dataId.slice(colonIndex + 2);
  }

  return dataId;
};

const getBlockLimit = (
  config: ScratchCrtConfig,
  block: SVGGElement,
): number | boolean | undefined => {
  if (isDataBlock(block)) {
    return config.allowedBlocks.variables ? -1 : 0;
  }
  if (isProcedureBlock(block)) {
    return config.allowedBlocks.customBlocks ? -1 : 0;
  }

  const dataId = getBlockId(block.getAttribute("data-id") as string);
  return config.allowedBlocks[dataId];
};

const isDataBlock = (block: SVGGElement): boolean => {
  const blockCategory = block.getAttribute("data-category") as string;

  // We can't only use the data_ prefix, as variables have arbitrary strings as ID
  return blockCategory === "data" || blockCategory === "data-lists";
};

const isProcedureBlock = (block: SVGGElement): boolean => {
  const dataId = getBlockId(block.getAttribute("data-id") as string);
  const blockShape = block.getAttribute("data-shapes") as string;
  const blockCategory = block.getAttribute("data-category");

  return (
    dataId.startsWith("procedures_") ||
    (blockShape === "stack" && blockCategory === null)
  );
};

/**
 * Whether to show the block configuration button for a given block id.
 * For data and procedure blocks, we cannot limit the number of blocks,
 * but only enable or disable them entirely.
 */
const showBlockConfig = (block: SVGGElement): boolean =>
  !isProcedureBlock(block) && !isDataBlock(block);

/**
 * Count the number of blocks used in the VM for each opcode.
 * Only counts the blocks used by the student and disregards the initial task blocks.
 */
export const countUsedBlocks = (
  vm: VM,
  opcode?: string,
): Record<string, number> =>
  vm.runtime.targets.reduce(
    (acc, target) => {
      // iterate all blocks and for each block, increment the counter for the opcode
      Object.values(target.blocks._blocks)
        .filter((block) => !block.isTaskBlock)
        .filter((block) => (opcode ? block.opcode === opcode : true))
        .map((block) => block.opcode)
        .forEach((opcode) => {
          if (acc[opcode] === undefined) {
            acc[opcode] = 0;
          }

          acc[opcode]++;
        });

      return acc;
    },
    {} as Record<string, number>,
  );

const getBlockElements = (container: HTMLElement): SVGGElement[] => [
  ...container.querySelectorAll<SVGGElement>(isBlockInFlyoutCanvas),
];

const updateBlockConfigButton = (
  block: SVGGElement,
  allowedCount: number | boolean | undefined,
  usedBlocks: number | undefined,
  canEditTask?: boolean,
): void => {
  const blockId = getBlockId(block.getAttribute("data-id") as string);

  if (typeof allowedCount === "boolean") {
    console.error(
      `Trying to limit the number of visible blocks for ${blockId} which is not configured for this`,
    );
    return;
  }

  const allowInfinite = typeof allowedCount === "number" && allowedCount < 0;

  const allowedNumberOfBlocks = allowedCount ?? 0;

  // if the user edits the task, they can use as many blocks as they want
  // but we want the allow count to be displayed
  const remainingCount = canEditTask
    ? allowedNumberOfBlocks
    : allowedNumberOfBlocks - (usedBlocks ?? 0);

  const isBlockEnabled = allowInfinite || remainingCount > 0;

  const group = block.querySelector<SVGGElement>("g.block-config-button");

  if (!group) {
    return;
  }

  group.setAttribute(
    "class",
    blockConfigClass +
      " " +
      (isBlockEnabled ? enabledButtonClass : disabledButtonClass),
  );

  if (isBlockEnabled || canEditTask) {
    block.classList.remove("non-interactive");
  } else {
    block.classList.add("non-interactive");
  }

  const text = group.querySelector<SVGTextElement>("text");
  if (text) {
    text.textContent = allowInfinite ? "∞" : `${remainingCount}`;
  }
};

export const updateSingleBlockConfigButton = (
  vm: VM,
  container: HTMLElement,
  opcode: string,
  canEditTask?: boolean,
): void => {
  if (!vm.crtConfig) {
    return;
  }

  const config = vm.crtConfig;

  if (opcode === "procedures_definition") {
    // Hack to ensure that the procedure block is found when a procedure
    // definition is added. Scratch maps a new procedure to 3 blocks:
    // - procedures_definition: the existence of the procedure
    // - procedures_prototype: its name and parameters
    // - procedures_call: the call itself, shown in the blocks palette
    opcode = "procedures_call";

    if (canEditTask) {
      config.allowedBlocks.customBlocks = true;
    }
  } else if (opcode.startsWith("data_")) {
    if (canEditTask) {
      config.allowedBlocks.variables = true;
    }
  }

  const block = container.querySelector<SVGGElement>(
    `g.blocklyDraggable[data-id$='${opcode}']`,
  );

  if (!block) {
    // this may happen if the block is part of the initial task
    // but cannot be used by students
    return;
  }

  const blockId = getBlockId(block.getAttribute("data-id") as string);

  updateBlockConfigButton(
    block,
    getBlockLimit(config, block),
    countUsedBlocks(vm, blockId)[blockId],
    canEditTask,
  );
};

const updateBlockConfigButtons = (
  vm: VM,
  blocks: SVGGElement[],
  canEditTask?: boolean,
): void => {
  if (!vm.crtConfig) {
    return;
  }

  const config = vm.crtConfig;
  const usedBlocks = countUsedBlocks(vm);

  blocks.forEach((block) => {
    const blockId = getBlockId(block.getAttribute("data-id") as string);

    const allowedCount = getBlockLimit(config, block);

    updateBlockConfigButton(
      block,
      allowedCount,
      usedBlocks[blockId],
      canEditTask,
    );
  });
};

const onSetCount = (event: MouseEvent): void => {
  ignoreEvent(event);

  if (event.currentTarget instanceof Element) {
    const parent = event.currentTarget.parentElement;
    const dataId = parent?.getAttribute("data-id");

    if (dataId) {
      window.dispatchEvent(new ModifyBlockConfigEvent(getBlockId(dataId)));
    }
  }
};

/**
 * Add block configuration buttons to all blocks in a container.
 * @param vm
 * @param container
 * @param canEditTask
 */
export const addBlockConfigButtons = (
  vm: VM,
  container: HTMLElement,
  canEditTask?: boolean,
): void => {
  const blocks = getBlockElements(container);

  // add a config button to each block
  blocks.forEach((block) => {
    addBlockConfigButton(block, canEditTask);
  });

  // update the buttons
  updateBlockConfigButtons(vm, blocks, canEditTask);
};

/**
 * Add a block configuration button to a block.
 * @param block
 * @param canEditTask
 */
const addBlockConfigButton = (
  block: SVGGElement,
  canEditTask: undefined | boolean,
): void => {
  if (!showBlockConfig(block)) {
    return;
  }

  // ensure the buttons are not already present
  if (block.querySelector(`g.${blockConfigClass}`)) {
    return;
  }

  const group = document.createElementNS(svgNamespace, "g");

  group.setAttribute("class", blockConfigClass);
  group.setAttribute("data-testid", blockConfigTestId);
  group.setAttribute("transform", `translate(0, -10)`);
  group.addEventListener("click", canEditTask ? onSetCount : ignoreEvent);
  group.addEventListener("mousedown", ignoreEvent);
  group.addEventListener("mouseup", ignoreEvent);

  // create svg rect element with text inside
  const rect = document.createElementNS(svgNamespace, "rect");
  rect.setAttribute("class", "interactive");
  rect.setAttribute("width", buttonWidth.toString());
  rect.setAttribute("height", buttonHeight.toString());
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("rx", "5");
  rect.setAttribute("ry", "5");

  const text = document.createElementNS(svgNamespace, "text");
  text.setAttribute("x", "5");
  text.setAttribute("y", "15");
  text.textContent = ``;

  group.appendChild(rect);
  group.appendChild(text);
  block.appendChild(group);
};

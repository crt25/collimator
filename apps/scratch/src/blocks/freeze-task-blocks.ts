import VM from "scratch-vm";

export const freezeTaskBlocks = (vm: VM, container: HTMLElement): void => {
  // by default freeze the task blocks
  const freezeTaskBlocks = !(vm.crtConfig?.canEditTaskBlocks ?? false);

  const taskBlockIds = vm.runtime.targets
    .flatMap((target) => Object.values(target.blocks._blocks))
    .filter((block) => block.isTaskBlock)
    .map((block) => block.id);

  for (const taskBlockId of taskBlockIds) {
    const block = container.querySelector<SVGGElement>(
      `svg.blocklySvg .blocklyBlockCanvas g.blocklyDraggable[data-id='${taskBlockId}']`,
    );

    if (freezeTaskBlocks) {
      block?.classList.add("frozen-block");
    } else {
      block?.classList.remove("frozen-block");
    }
  }
};

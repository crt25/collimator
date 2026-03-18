import ScratchBlocks from "scratch-blocks";

interface OverrideOptions {
  canEditTask: boolean;
}

type OriginalDuplicateOptionType = ReturnType<
  typeof ScratchBlocks.ContextMenu.blockDuplicateOption
>;

export const overrideBlockDuplicateOption = (
  options: OverrideOptions,
): void => {
  const { canEditTask } = options;

  const originalDuplicateOption =
    ScratchBlocks.ContextMenu.blockDuplicateOption;

  ScratchBlocks.ContextMenu.blockDuplicateOption = function (
    block: ScratchBlocks.Block,
    event: Event,
  ): OriginalDuplicateOptionType {
    const option: OriginalDuplicateOptionType = originalDuplicateOption.call(
      ScratchBlocks.ContextMenu,
      block,
      event,
    );

    if (!canEditTask) {
      option.enabled = false;
    }

    return option;
  };
};

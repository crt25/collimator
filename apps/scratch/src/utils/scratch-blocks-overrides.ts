import ScratchBlocks from "scratch-blocks";

interface OverrideOptions {
  canEditTask: boolean;
}

export const overrideBlockDuplicateOption = (options: OverrideOptions) => {
  const { canEditTask } = options;

  const originalDuplicateOption =
    ScratchBlocks.ContextMenu.blockDuplicateOption;

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  ScratchBlocks.ContextMenu.blockDuplicateOption = function (
    block: ScratchBlocks.Block,
    event: Event,
  ) {
    const option = originalDuplicateOption.call(
      ScratchBlocks.ContextMenu,
      block,
      event,
    );

    if (!canEditTask) {
      option.enabled = false;
    }

    return option;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return () => {
    ScratchBlocks.ContextMenu.blockDuplicateOption = originalDuplicateOption;
  };
};

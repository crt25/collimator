export const getBlockSelector = (blockId: string): string =>
  `[data-id='${blockId}']`;

export const getBlockShownButtonSelector = (blockId: string): string =>
  `${getBlockSelector(blockId)} [data-testid='shown-block-button']`;

export const getBlockHiddenButtonSelector = (blockId: string): string =>
  `${getBlockSelector(blockId)} [data-testid='hidden-block-button']`;

export const getBlockShownButtonSelector = (blockId: string): string =>
  `[data-id='${blockId}'] [data-testid='shown-block-button']`;

export const getBlockHiddenButtonSelector = (blockId: string): string =>
  `[data-id='${blockId}'] [data-testid='hidden-block-button']`;

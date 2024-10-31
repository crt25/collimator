export const getBlockSelector = (blockId: string): string =>
  `[data-id='${blockId}']`;

export const getBlockConfigButtonSelector = (blockId: string): string =>
  `${getBlockSelector(blockId)} [data-testid='block-config-button']`;

export const getBlockConfigFormSelector = (): string =>
  `[data-testid='block-config-form']`;

export const getBlockConfigCanBeUsedCheckboxSelector = (): string =>
  `${getBlockConfigFormSelector()} [data-testid='can-be-used-checkbox']`;

export const getBlockConfigHasBlockLimitCheckboxSelector = (): string =>
  `${getBlockConfigFormSelector()} [data-testid='has-block-limit-checkbox']`;

export const getBlockConfigBlockLimitInputSelector = (): string =>
  `${getBlockConfigFormSelector()} [data-testid='block-limit-input']`;

export const getBlockConfigFormSubmitButtonSelector = (): string =>
  `${getBlockConfigFormSelector()} [data-testid='block-config-form-submit-button']`;

export const getBlockCanvasSelector = (): string => "svg.blocklySvg";

export const getAllTargetBlocksSelector = (): string =>
  `${getBlockCanvasSelector()} g.blocklyDraggable[data-id]`;

export const getFlyoutCanvasSelector = (): string =>
  "svg.blocklyFlyout .blocklyBlockCanvas";

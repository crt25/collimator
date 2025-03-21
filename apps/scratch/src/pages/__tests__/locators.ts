import {
  isBlockFlyout,
  isBlocksContainer,
  isBlockWithId,
} from "../../utilities/scratch-selectors";

export const getBlockSelector = (blockId: string): string =>
  isBlockWithId(blockId);

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

export const getBlockCanvasSelector = (): string => isBlocksContainer;

export const getAllTargetBlocksSelector = (includeFrozen: boolean): string =>
  `${getBlockCanvasSelector()} g.blocklyDraggable[data-id]${includeFrozen ? "" : ":not(.frozen-block-frozen,.frozen-block-appendable)"}`;

export const getFlyoutSelector = (): string => isBlockFlyout;

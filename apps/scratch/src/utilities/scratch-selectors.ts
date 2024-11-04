const scratchBlockElement = "g";

export const isBlockInsertionMarker = ".blocklyInsertionMarker";

export const isBlockBeingDragged = ".blocklyDragging";

export const isBlockFlyout = "svg.blocklyFlyout";
export const isBlocksContainer = "svg.blocklySvg";

export const isBlockFlyoutCanvas = `${isBlockFlyout} .blocklyBlockCanvas`;
export const isBlocksCanvas = `${isBlocksContainer} .blocklyBlockCanvas`;

export const isScratchBlock = `${scratchBlockElement}.blocklyDraggable[data-id]`;

export const isBlockWithId = (id: string): string =>
  `${scratchBlockElement}.blocklyDraggable[data-id='${id}']`;

export const isBlockInFlyoutCanvas = `${isBlockFlyoutCanvas} ${isScratchBlock}`;

export const isBlockWitOpCodeInFlyoutCanvas = (opcode: string): string =>
  `${isBlockFlyoutCanvas} ${isBlockWithId(opcode)}`;

export const isVisualTopOfStack = `${isScratchBlock}:not(${isScratchBlock} ${scratchBlockElement})`;

export const isVisualTopOfStackWithId = (id: string): string =>
  `${isBlockWithId(id)}:not(${isScratchBlock} ${scratchBlockElement})`;

export const isWithinStack = `${isScratchBlock} ${isScratchBlock}`;

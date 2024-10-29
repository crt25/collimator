/**
 * Filter out blocks that are not allowed to be used at all.
 */
export const filterNotAllowedBlocks = <T>([_blockType, allowedBlocksOfType]: [
  T,
  number,
]): boolean => allowedBlocksOfType !== 0;

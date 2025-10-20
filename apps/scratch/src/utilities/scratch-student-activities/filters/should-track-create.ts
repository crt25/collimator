import type { Block } from "scratch-blocks";

export const shouldTrackCreateBlock = (block: Block): boolean => {
  if (!block) return false;

  return true;
};

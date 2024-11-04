import { ScratchCrtConfig } from "scratch-vm";

export const getExpectedBlockConfigButtonLabel = (
  crtConfig: ScratchCrtConfig,
  opcode: string,
): string => {
  const count = crtConfig.allowedBlocks[opcode] ?? 0;

  if (count === -1) {
    return "∞";
  }

  return count.toString();
};

import { ScratchCrtConfig } from "../types/scratch-vm-custom";
import { defaultMaximumExecutionTimeInMs } from "../utilities/constants";

export const defaultCrtConfig: ScratchCrtConfig = {
  allowedBlocks: {},
  freezeStateByBlockId: {},
  maximumExecutionTimeInMs: defaultMaximumExecutionTimeInMs,
  enableStageInteractions: true,
};

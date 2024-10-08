// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/lib/screen-utils.js
declare module "@scratch-submodule/scratch-gui/src/lib/screen-utils" {
  export type StageSizeMode = "small" | "large";
  export type StageDisplaySize = "small" | "large" | "largeConstrained";
  export interface StageDimension {
    heightDefault: number;
    widthDefault: number;
    height: number;
    width: number;
    scale: number;
  }

  export const resolveStageSize: (
    stageSizeMode: StageSizeMode,
    isFullScreen: boolean,
  ) => StageDisplaySize;

  export const getStageDimensions: (
    stageSize: StageDisplaySize,
    isFullScreen: boolean,
  ) => StageDimension;

  export const stageSizeToTransform: (sizeInfo: {
    width: number;
    height: number;
    widthDefault: number;
    heightDefault: number;
  }) => { transform: string };
}

// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/containers/stage-wrapper.jsx
declare module "@scratch-submodule/scratch-gui/src/containers/stage-wrapper.jsx" {
  import { StageDisplaySize } from "@scratch-submodule/scratch-gui/src/lib/screen-utils";
  import { FunctionComponent } from "react";
  import VM from "scratch-vm";

  const StageWrapper: FunctionComponent<{
    vm: VM;
    isRendererSupported: boolean;
    stageSize: StageDisplaySize;

    isFullScreen?: boolean;
    isRendererSupported: boolean;
    isRtl: boolean;
    loading?: boolean;
  }>;

  export default StageWrapper;
}

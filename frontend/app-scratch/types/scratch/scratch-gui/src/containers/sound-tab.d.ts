// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/containers/sound-tab.jsx
declare module "@scratch-submodule/scratch-gui/src/containers/sound-tab.jsx" {
  import { FunctionComponent } from "react";
  import VM from "scratch-vm";

  const SoundTab: FunctionComponent<{
    vm: VM;
  }>;

  export default SoundTab;
}

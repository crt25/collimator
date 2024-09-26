// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/lib/blocks.js
declare module "@scratch-submodule/scratch-gui/src/lib/blockss" {
  import VM from "scratch-vm";
  import ScratchBlocks from "scratch-blocks";

  const VMScratchBlocks: (
    vm: VM,
    useCatBlocks: boolean,
  ) => typeof ScratchBlocks;

  export default VMScratchBlocks;
}

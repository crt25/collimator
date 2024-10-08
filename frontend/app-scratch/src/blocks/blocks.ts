import Blockly from "scratch-blocks";
import VM, { BlockPackage, BlockPackageClass } from "scratch-vm";

class TestBlockPackage implements BlockPackage {
  constructor(private runtime: VM.RuntimeExtended) {}

  getHats = undefined;
  getMonitored = undefined;

  getPrimitives() {
    return {
      test_block: (args: Record<string, unknown>, util: unknown) => {
        console.log("test block called with args", args, util);
      },
    };
  }
}

const customBlockPackages: Record<string, BlockPackageClass> = {
  test: TestBlockPackage,
};

export const registerCustomBlocks = (vm: VM) => {
  // follows example at https://github.com/scratchfoundation/scratch-blocks/blob/2e3a31e555a611f0c48d7c57074e2e54104c04ce/blocks_vertical/motion.js#L31
  // may also be of interest: https://www.reddit.com/r/scratch/comments/1c77iq4/how_do_you_add_blocks_on_scratch_through/

  // this defines a new block
  // without adding it to the library, this must be done in the toolbox
  Blockly.Blocks["test_block"] = {
    /**
     * Block to move steps.
     * @this Blockly.Block
     */
    init: function () {
      this.jsonInit({
        message0: "this is a new block with %1 steps",
        args0: [
          {
            type: "input_value",
            name: "STEPS",
          },
        ],
        category: Blockly.Categories.motion,
        extensions: ["colours_motion", "shape_statement"],
      });
    },
  };

  // the functionality for default blocks is defined here: https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/src/blocks/scratch3_motion.js#L20
  // and registered here: https://github.com/scratchfoundation/scratch-vm/blob/e15809697de82760a6f13e03c502251de5bdd8c7/src/engine/runtime.js#L765
  // the easiest way to extend this is to add a new key to that dictionary
  for (const packageSet of [customBlockPackages]) {
    for (const packageName in packageSet) {
      if (Object.prototype.hasOwnProperty.call(packageSet, packageName)) {
        // @todo pass a different runtime depending on package privilege?
        const packageObject = new packageSet[packageName](vm.runtime);
        // Collect primitives from package.
        if (packageObject.getPrimitives) {
          const packagePrimitives = packageObject.getPrimitives();
          for (const op in packagePrimitives) {
            if (Object.prototype.hasOwnProperty.call(packagePrimitives, op)) {
              vm.runtime._primitives[op] =
                packagePrimitives[op].bind(packageObject);
            }
          }
        }
        // Collect hat metadata from package.
        if (packageObject.getHats) {
          const packageHats = packageObject.getHats();
          for (const hatName in packageHats) {
            if (Object.prototype.hasOwnProperty.call(packageHats, hatName)) {
              vm.runtime._hats[hatName] = packageHats[hatName];
            }
          }
        }
        // Collect monitored from package.
        if (packageObject.getMonitored) {
          vm.runtime.monitorBlockInfo = Object.assign(
            {},
            vm.runtime.monitorBlockInfo,
            packageObject.getMonitored(),
          );
        }
      }
    }
  }

  return vm;
};

import VM from "scratch-vm";
import { ExtensionId } from "../extensions";
import ExampleExtension from "../extensions/example";

export const patchScratchVm = (vm: VM): void => {
  // patch extension manager load function with a custom implementation
  vm.extensionManager.loadExtensionURL = async (
    id: string,
  ): Promise<number> => {
    // modified logic from https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/extension-support/extension-manager.js#L142

    switch (id) {
      case ExtensionId.Example: {
        const extensionInstance = new ExampleExtension(vm.runtime);

        const serviceName =
          vm.extensionManager._registerInternalExtension(extensionInstance);

        vm.extensionManager._loadedExtensions.set(id, serviceName);
        break;
      }
      default:
        break;
    }

    return Promise.resolve(0);
  };

  // add custom callback to when the greenFlag event is triggered
  vm.runtime.on("PROJECT_START", () => {
    console.log("Green flag clicked");
  });

  vm.runtime.on("PROJECT_LOADED", () => {
    // iterate over all the blocks in the runtime
    // and mark them as initial blocks
    for (const target of vm.runtime.targets) {
      for (const block of Object.values(target.blocks._blocks)) {
        block.isTaskBlock = true;
      }
    }

    console.log("loaded", { ...vm.crtConfig });
  });

  vm.runtime.on("PROJECT_RUN_STOP", () => {
    console.log("stopped");
  });
};

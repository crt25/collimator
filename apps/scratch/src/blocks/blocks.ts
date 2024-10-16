import VM from "scratch-vm";
import { ExtensionId } from "../extensions";
import ExampleExtension from "../extensions/example";

export const registerCustomBlocks = (vm: VM): void => {
  // patch extension manager load function with a custom implementation
  vm.extensionManager.loadExtensionURL = async (
    id: string,
  ): Promise<number> => {
    // modified logic from https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/extension-support/extension-manager.js#L142
    console.log("loadExtensionURL", id);

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
};

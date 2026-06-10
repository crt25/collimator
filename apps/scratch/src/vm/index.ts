import VM from "@scratch/scratch-vm";
import { ExtensionId } from "../extensions";
import AssertionExtension from "../extensions/assertions";

export const patchScratchVm = (vm: VM): void => {
  // patch extension manager load function with a custom implementation
  vm.extensionManager.loadExtensionURL = async (
    id: string,
  ): Promise<number> => {
    // modified logic from https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/extension-support/extension-manager.js#L142

    if (vm.extensionManager._loadedExtensions.has(id)) {
      return Promise.resolve(0);
    }

    switch (id) {
      case ExtensionId.Assertions: {
        const extensionInstance = new AssertionExtension(vm);

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

  vm.runtime.on("PROJECT_LOADED", () => {
    // iterate over all the blocks in the runtime and mark the ones that belong
    // to the task itself. PROJECT_LOADED fires on the initial load AND again
    // whenever the project is saved and re-loaded mid-session
    // (prepareCrtProjectForExport during getSubmission/getTask, and setLocale).
    //
    // vm.taskBlockIds is assigned before every load (see loadTask /
    // loadSubmission in src/hooks/useEmbeddedScratch.ts). If it is somehow
    // missing we must default to `false`: marking an unknown block as a task
    // block makes it permanently undeletable (shouldPreventBlockDeletion undoes
    // the deletion), so we fail safe and treat unknown blocks as student blocks.
    for (const target of vm.runtime.targets) {
      for (const block of Object.values(target.blocks._blocks)) {
        block.isTaskBlock = vm.taskBlockIds
          ? vm.taskBlockIds.has(block.id)
          : false;
      }
    }
  });
};

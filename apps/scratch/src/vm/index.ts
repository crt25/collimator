import VM from "@scratch/scratch-vm";
import { ExtensionId } from "../extensions";
import AssertionExtension from "../extensions/assertions";
import {
  RememberedSpriteState,
  rememberSpriteState,
  restoreSpriteStateForExecution,
  restoreSpriteStateForSerialization,
} from "./target-state";

const startStateByVm = new Map<VM, Map<string, RememberedSpriteState>>();

export const getTargetStartState = (
  vm: VM,
): Map<string, RememberedSpriteState> => {
  let map = startStateByVm.get(vm);

  if (!map) {
    map = new Map();
    startStateByVm.set(vm, map);
  }

  return map;
};

const clearStartState = (vm: VM): void => {
  getTargetStartState(vm).clear();
};

/**
 * Temporarily set each target's mutable sprite state to its tracked
 * starting state so the serializer doesn't capture runtime drift caused
 * by scripts. Returns a restore callback.
 */
export const swapToStartState = (vm: VM): (() => void) => {
  const snapshot = getTargetStartState(vm);
  if (snapshot.size === 0) {
    return () => {};
  }

  const runtimeState: Array<{
    target: VM.Target;
    runtime: RememberedSpriteState;
  }> = [];

  for (const target of vm.runtime.targets) {
    const start = snapshot.get(target.id);

    if (!start) {
      continue;
    }

    runtimeState.push({
      target,
      runtime: rememberSpriteState(target),
    });

    restoreSpriteStateForSerialization(target, start);
  }

  return () => {
    for (const { target, runtime } of runtimeState) {
      restoreSpriteStateForSerialization(target, runtime);
    }
  };
};

const isTrackableSprite = (target: VM.Target): boolean =>
  // track every sprite the project file defines whether shown or hidden, skip the stage and runtime clones.
  !target.isStage && target.isOriginal !== false;

const patchExtensionManager = (vm: VM): void => {
  // patch extension manager load function with a custom implementation
  vm.extensionManager.loadExtensionURL = async (
    id: string,
  ): Promise<number> => {
    // modified logic from https://github.com/scratchfoundation/scratch-vm/blob/766c767c7a2f3da432480ade515de0a9f98804ba/src/extension-support/extension-manager.js#L142

    if (vm.extensionManager._loadedExtensions.has(id)) {
      return 0;
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

    return 0;
  };
};

const initializeTaskBlocksOnLoad = (vm: VM): void => {
  vm.runtime.on("PROJECT_LOADED", () => {
    // iterate over all the blocks in the runtime
    // and mark them as initial blocks
    for (const target of vm.runtime.targets) {
      for (const block of Object.values(target.blocks._blocks)) {
        block.isTaskBlock = vm.taskBlockIds
          ? vm.taskBlockIds.has(block.id)
          : true;
      }
    }

    clearStartState(vm);
  });
};

const snapshotOnRunStart = (vm: VM): void => {
  const startState = getTargetStartState(vm);

  vm.runtime.on("PROJECT_RUN_START", () => {
    startState.clear();
    for (const target of vm.runtime.targets) {
      if (!isTrackableSprite(target)) {
        continue;
      }

      startState.set(target.id, rememberSpriteState(target));
    }
  });
};

const resetOnRunStop = (vm: VM): void => {
  const startState = getTargetStartState(vm);

  vm.runtime.on("PROJECT_RUN_STOP", () => {
    for (const target of vm.runtime.targets) {
      const snap = startState.get(target.id);

      if (snap) {
        // restore all sprites to the state they had when the project started running
        restoreSpriteStateForExecution(target, snap);
      }
    }

    clearStartState(vm);
  });
};

// temporarily swap to start state during serialization to ensure
// the project is saved with original positions, not changes occured in runtime.
// immediately restore the current runtime state after serialization.
const patchSerialization = (vm: VM): void => {
  const originalToJSON = vm.toJSON.bind(vm);
  vm.toJSON = (optTargetId?: string): string => {
    const restore = swapToStartState(vm);

    try {
      return originalToJSON(optTargetId);
    } finally {
      restore();
    }
  };
};

export const patchScratchVm = (vm: VM): void => {
  patchExtensionManager(vm);
  initializeTaskBlocksOnLoad(vm);
  snapshotOnRunStart(vm);
  resetOnRunStop(vm);
  patchSerialization(vm);
};

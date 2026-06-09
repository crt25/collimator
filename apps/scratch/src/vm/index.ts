import VM from "@scratch/scratch-vm";
import { ExtensionId } from "../extensions";
import AssertionExtension from "../extensions/assertions";
import {
  RememberedSpriteState,
  RememberedStageState,
  rememberSpriteState,
  rememberStageState,
  restoreSpriteStateForSerialization,
  restoreStageStateForSerialization,
} from "./target-state";

const spriteStartStateByVm = new Map<VM, Map<string, RememberedSpriteState>>();
const stageStartStateByVm = new Map<VM, RememberedStageState>();

export const getSpriteStartState = (
  vm: VM,
): Map<string, RememberedSpriteState> => {
  let map = spriteStartStateByVm.get(vm);

  if (!map) {
    map = new Map();
    spriteStartStateByVm.set(vm, map);
  }

  return map;
};

export const getStageStartState = (vm: VM): RememberedStageState | undefined =>
  stageStartStateByVm.get(vm);

const clearStartState = (vm: VM): void => {
  getSpriteStartState(vm).clear();
  stageStartStateByVm.delete(vm);
};

const isStageWithStartState = (
  target: VM.Target,
  vm: VM,
  stage: RememberedStageState | undefined,
): stage is RememberedStageState =>
  target.isStage && stageStartStateByVm.has(vm) && stage !== undefined;

export const swapToStartState = (vm: VM): (() => void) => {
  const sprites = getSpriteStartState(vm);
  const stage = getStageStartState(vm);

  // if there is no stage or trackable sprites with start state, we don't need to do anything
  if (sprites.size === 0 && !stage) {
    return () => {};
  }

  const spriteRuntimeState: Array<{
    target: VM.Target;
    runtime: RememberedSpriteState;
  }> = [];

  let stageRuntime: {
    target: VM.Target;
    runtime: RememberedStageState;
  } | null = null;

  for (const target of vm.runtime.targets) {
    if (isStageWithStartState(target, vm, stage)) {
      // store the current stage state before restoring so we can put it back later
      stageRuntime = { target, runtime: rememberStageState(target) };
      restoreStageStateForSerialization(target, stage);
      continue;
    }

    const start = sprites.get(target.id);

    if (!start) {
      continue;
    }

    spriteRuntimeState.push({
      target,
      runtime: rememberSpriteState(target),
    });

    restoreSpriteStateForSerialization(target, start);
  }

  return () => {
    // restore the current runtime state after serialisation
    for (const { target, runtime } of spriteRuntimeState) {
      restoreSpriteStateForSerialization(target, runtime);
    }

    // restore the stage state after serialisation if we modified it
    if (stageRuntime) {
      restoreStageStateForSerialization(
        stageRuntime.target,
        stageRuntime.runtime,
      );
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

const snapshotBeforeHats = (vm: VM): void => {
  const sprites = getSpriteStartState(vm);
  const originalStartHats = vm.runtime.startHats.bind(vm.runtime);

  vm.runtime.startHats = (
    requestedHatOpcode: string,
    optMatchFields?: Record<string, unknown>,
    optTarget?: VM.Target,
  ): globalThis.VM.Thread[] | undefined => {
    // snapshot only on the first hat-start of a new run sequence
    if (sprites.size === 0 && !stageStartStateByVm.has(vm)) {
      for (const target of vm.runtime.targets) {
        if (target.isStage) {
          stageStartStateByVm.set(vm, rememberStageState(target));
          continue;
        }

        if (!isTrackableSprite(target)) {
          continue;
        }

        sprites.set(target.id, rememberSpriteState(target));
      }
    }

    return originalStartHats(requestedHatOpcode, optMatchFields, optTarget);
  };
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
  snapshotBeforeHats(vm);
  patchSerialization(vm);
};

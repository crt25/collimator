import VM from "@scratch/scratch-vm";
import { ExtensionId } from "../extensions";
import AssertionExtension from "../extensions/assertions";
import {
  RememberedSpriteState,
  RememberedStageState,
  StartState,
  backupTargetsState,
  rememberSpriteState,
  rememberStageState,
  restoreSpriteStateForSerialization,
  restoreStageStateForSerialization,
} from "./target-state";

const clearStartState = (startState: StartState): void => {
  startState.sprites.clear();
  startState.stage = undefined;
};

const isStageWithStartState = (
  target: VM.Target,
  stage: RememberedStageState | undefined,
): stage is RememberedStageState => target.isStage && stage !== undefined;

const swapToStartState = (vm: VM, startState: StartState): (() => void) => {
  // if there is no stage or trackable sprites with start state, we don't need to do anything
  if (startState.sprites.size === 0 && !startState.stage) {
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
    if (isStageWithStartState(target, startState.stage)) {
      // store the current stage state before restoring so we can put it back later
      stageRuntime = { target, runtime: rememberStageState(target) };
      restoreStageStateForSerialization(target, startState.stage);
      continue;
    }

    const start = startState.sprites.get(target.id);

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

const initializeTaskBlocksOnLoad = (vm: VM, startState: StartState): void => {
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

    clearStartState(startState);
  });
};

const snapshotOnGreenFlag = (vm: VM, startState: StartState): void => {
  const originalGreenFlag = vm.greenFlag.bind(vm);

  // depends on the fact that we listen on PROJECT_STOP_ALL in the assertion extension to reset the position of the sprite
  // this ensures that when the green flag is clicked, we snapshot the position of the sprites when the project is in its original state
  vm.runtime.emit("PROJECT_STOP_ALL");
  vm.greenFlag = (): void => {
    backupTargetsState(vm, startState);
    originalGreenFlag();
  };
};

// temporarily swap to start state during serialization to ensure
// the project is saved with original positions, not changes occured in runtime.
// immediately restore the current runtime state after serialization.
const patchSerialization = (vm: VM, startState: StartState): void => {
  const originalToJSON = vm.toJSON.bind(vm);
  vm.toJSON = (optTargetId?: string): string => {
    const restore = swapToStartState(vm, startState);

    try {
      return originalToJSON(optTargetId);
    } finally {
      restore();
    }
  };
};

export const patchScratchVm = (vm: VM): void => {
  const startState: StartState = {
    sprites: new Map(),
    stage: undefined,
  };

  patchExtensionManager(vm);
  initializeTaskBlocksOnLoad(vm, startState);
  snapshotOnGreenFlag(vm, startState);
  patchSerialization(vm, startState);
};

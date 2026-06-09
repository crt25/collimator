import VM from "@scratch/scratch-vm";
import { ExtensionId } from "../extensions";
import AssertionExtension from "../extensions/assertions";
import {
  RememberedSpriteState,
  rememberSpriteState,
  restoreSpriteStateForSerialization,
} from "./target-state";

const startStateByVm = new Map<VM, Map<string, RememberedSpriteState>>();

/**
 * Snapshot on project load, on `targetWasCreated`, and on user-initiated
 * postSpriteInfo calls (stage drag, sprite-info pane). Used by the
 * vm.toJSON wrap below so that running a script and then serialising
 * doesn't introduce runtime differences into the
 * project as the new starting point.
 */
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

const wrapPostSpriteInfo = (vm: VM): void => {
  const startState = getTargetStartState(vm);
  const originalPostSpriteInfo = vm.postSpriteInfo.bind(vm);
  vm.postSpriteInfo = (data: VM.PostedSpriteInfo): void => {
    originalPostSpriteInfo(data);

    const target = vm._dragTarget ?? vm.editingTarget;

    if (!target || target.isStage) {
      return;
    }

    const snap = startState.get(target.id);

    if (!snap) {
      return;
    }

    if (typeof data.x === "number") {
      snap.x = target.x;
    }

    if (typeof data.y === "number") {
      snap.y = target.y;
    }

    if (typeof data.direction === "number") {
      snap.direction = target.direction;
    }

    if (typeof data.size === "number") {
      snap.size = target.size;
    }

    if (typeof data.visible === "boolean") {
      snap.visible = target.visible;
    }

    if (typeof data.draggable === "boolean") {
      snap.draggable = target.draggable;
    }

    if (typeof data.rotationStyle === "string") {
      snap.rotationStyle = target.rotationStyle;
    }
  };
};

const wrapEditorMutators = (vm: VM): void => {
  wrapPostSpriteInfo(vm);
};

const snapshotOnTargetLifecycle = (vm: VM): void => {
  const startState = getTargetStartState(vm);

  const trackTargetStartState = (target: VM.Target): void => {
    if (!isTrackableSprite(target)) {
      return;
    }

    startState.set(target.id, rememberSpriteState(target));
  };

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

    startState.clear();
    for (const target of vm.runtime.targets) {
      trackTargetStartState(target);
    }
  });

  // Sprites added or duplicated after project load also need a starting snapshot
  vm.runtime.on("targetWasCreated", (newTarget: VM.Target) => {
    trackTargetStartState(newTarget);
  });
};

// Wrap vm.toJSON so every serialisation path uses the tracked starting
// state: saveProjectSb3 (calls this.toJSON internally), exportSprite,
// and the direct callers in Controls.tsx (postSolutionRun) and
// Blocks.tsx (student activity tracking). Without this, those direct
// callers serialise runtime drift caused by scripts and end up sending
// the runtime sprite position to the backend as the new starting point.
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
  snapshotOnTargetLifecycle(vm);
  wrapEditorMutators(vm);
  patchSerialization(vm);
};

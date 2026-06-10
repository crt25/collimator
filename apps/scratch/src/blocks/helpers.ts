import { WorkspaceChangeEvent } from "../types/scratch-workspace";
import { countUsedBlocks } from "./block-config";

export const svgNamespace = "http://www.w3.org/2000/svg";

export const ignoreEvent = (event: MouseEvent): void => {
  event.stopImmediatePropagation();
  event.preventDefault();
};

const pendingRejectionBlockIds = new Set<string>();

/**
 * Forget any over-limit block removals that were deferred to a future endDrag
 * (see shouldPreventBlockCreation). A workspace reload disposes the affected
 * blocks and cancels any in-flight flyout gesture, so those deferred rejections
 * can never be drained by their endDrag — clear them here so the module-level
 * set cannot leak across reloads.
 */
export const clearPendingBlockRejections = (): void => {
  pendingRejectionBlockIds.clear();
};

const shouldPreventBlockCreation = (
  event: WorkspaceChangeEvent,
  vm: VMExtended,
  workspace: ScratchBlocksExtended.Workspace,
): boolean => {
  // when a block is dragged outside the workspace onto a sprite thumbnail, scratch-blocks fires an endDrag event with the serialized block XML
  // the vm uses this event to copy the blocks to the target sprite's workspace
  const isBlockDraggedToSprite =
    event.type === "endDrag" &&
    // see EndBlockDrag in /scratch_blocks/core/scratch_events.js
    event.isOutside &&
    // see BlockDragger.prototype.endBlockDrag in /scratch_blocks/core/block_dragger.js
    event.xml;

  const isBlockCreated = event.type === "create";
  const isEndDrag = event.type === "endDrag";
  const isEndDragInside = isEndDrag && !event.isOutside;

  // remove the block on endDrag rather than during the flyout drag to prevent weird behaviors
  if (isEndDrag) {
    const blockId = event.blockId ?? "";

    // Always drain the deferred-rejection id on endDrag — including drags that
    // end outside the workspace. Otherwise an over-limit block whose drag ends
    // outside (dropped on a sprite / out of bounds), or whose gesture is
    // cancelled by a mid-drag workspace reload, leaves its id stranded in this
    // module-level set for the rest of the session.
    const wasPendingRejection = pendingRejectionBlockIds.delete(blockId);

    if (isEndDragInside) {
      if (wasPendingRejection) {
        // the block is still on the workspace; now that the gesture is gone,
        // undo to remove it
        workspace.undo(false);
        return true;
      }

      return false;
    }
    // endDrag outside the workspace falls through to the dragged-to-sprite
    // handling below; the pending id (if any) has already been drained
  }

  if (!isBlockDraggedToSprite && !isBlockCreated) {
    return false;
  }

  const block = workspace.getBlockById(event.blockId || "");

  if (!block) {
    return false;
  }

  if (!wouldExceedLimits(vm, block)) {
    return false;
  }

  if (isBlockCreated) {
    // Calling workspace.undo() while a flyout drag gesture is active disposes the block,
    // but the gesture still holds a reference to it and calls moveDuringDrag() on the disposed block
    // This caused the workspace.blockDragSurface_ to be null and throwing on every mouse move
    // To avoid this, we skip the undo when there's an active gesture and store the block id in a set to be removed on the endDrag event
    // by which time the gesture is gone and undo becomes safe.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasActiveGesture = !!(workspace as any).currentGesture_;
    if (hasActiveGesture) {
      pendingRejectionBlockIds.add(event.blockId ?? "");
    } else {
      // the block is already on the workspace, so we must explicitly undo to remove it
      // see Blockly.onKeyDown_ in scratch-blocks/core/blockly.js
      workspace.undo(false);
    }
  }

  return true;
};

const findBlockInRuntime = (
  vm: VMExtended,
  blockId: string,
): VMExtended.BlockExtended | undefined => {
  for (const target of vm.runtime.targets) {
    const block = target.blocks._blocks[blockId];
    if (block) {
      return block;
    }
  }

  return undefined;
};

const shouldPreventBlockDeletion = (
  event: WorkspaceChangeEvent,
  vm: VMExtended,
  blockId: string,
): boolean => {
  if (event.type !== "delete") {
    return false;
  }

  const block = findBlockInRuntime(vm, blockId);
  if (!block) {
    return false;
  }

  if (block.isTaskBlock) {
    return true;
  }

  return false;
};

export const shouldPreventBlocksActions = (
  event: WorkspaceChangeEvent,
  props: {
    canEditTask: boolean | undefined;
    vm: VMExtended;
    workspace: ScratchBlocksExtended.Workspace | null;
    blockId: string | undefined;
  },
): boolean => {
  const { canEditTask, vm, workspace, blockId } = props;

  if (canEditTask) {
    return false;
  }

  if (!workspace) {
    return false;
  }

  if (shouldPreventBlockCreation(event, vm, workspace)) {
    return true;
  }

  if (!blockId) {
    return false;
  }

  if (shouldPreventBlockDeletion(event, vm, blockId)) {
    workspace.undo(false);
    return true;
  }

  return false;
};

/**
 * Check if adding blocks from the flyout would exceed the limits set in the config.
 * It checks the number of blocks currently used in the workspace and the number of blocks being added, and compares it to the limits set in the config.
 */
export const wouldExceedLimits = (
  vm: VMExtended,
  block: ScratchBlocksExtended.Block,
): boolean => {
  const config = vm.crtConfig;
  if (!config) {
    console.debug("No config found, not blocking any blocks");
    return false;
  }

  // use the vm's block counts rather than workspace.getAllBlocks() because
  // when a create event fires, the block is already on the workspace but the vm hasn't processed it yet
  // using the workspace count would always include the new block, this causes the flyout drags to be blocked
  const usedBlocks = countUsedBlocks(vm);

  const allowed = config.allowedBlocks[block.type];
  const count = usedBlocks[block.type];

  const isPreventedEntirely = allowed === 0 || allowed === false;

  if (isPreventedEntirely) {
    console.debug(
      `Block ${block.type} is not allowed, blocking addition of blocks`,
    );
    return true;
  }

  // if allowed is a number, the block has a limit, it doesn't for every other type
  const hasLimit = typeof allowed === "number" && allowed >= 0;

  // the create event fires on the main workspace before vm.blockListener updates target.blocks._blocks, so
  // countUsedBlocks does not yet include the new block.
  // we use >= to prevent going over the limit by one.
  if (hasLimit && count >= allowed) {
    console.debug(
      `Block limit reached for ${block.type}: ${count} >= ${allowed}`,
    );
    return true;
  }

  return false;
};

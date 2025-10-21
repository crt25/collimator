import VM from "scratch-vm";
import { StudentActionType } from "../types/scratch-student-activities";
import {
  DeletedBlockInfo,
  DeletedBlockRecord,
} from "../types/scratch-student-activities/delete/types";
import { WorkspaceChangeEvent } from "../types/scratch-workspace";
import { BlockLifecycleParams } from "../types/scratch-blocks";
import type { Block } from "scratch-blocks";

const minStackSize = 2;

function getStackSize(topBlock: Block): number {
  let size = 0;
  let current: Block | null = topBlock;

  while (current) {
    size++;
    current = current.getNextBlock();
  }
  return size;
}

export function isBlockPartOfLargeStack(block: Block): boolean {
  if (!block) {
    return false;
  }

  let current: Block | null = block;

  while (current?.getParent()) {
    current = current.getParent();
  }

  if (!current) {
    return false;
  }

  const size = getStackSize(current);
  return size >= minStackSize;
}

export const wasPartOfLargeStack = (event: WorkspaceChangeEvent): boolean => {
  return event.oldParentId != null;
};

export const mapXmlBlockToBlock = (
  xmlElement: Element,
): DeletedBlockRecord | null => {
  // Extract the block ID and type from the XML element
  const blockId = xmlElement.getAttribute("id");
  const blockType = xmlElement.getAttribute("type");

  if (!blockId || !blockType) {
    return null;
  }

  const blocks = xmlElement.querySelectorAll("block[id][type]");

  // Find all child blocks within the XML element
  const blockIdArray = Array.from(blocks)
    .map((blockElement) => {
      const id = blockElement.getAttribute("id");
      const type = blockElement.getAttribute("type");

      if (!id || !type) {
        return null;
      }

      return { id, type };
    })

    // Filter out any null values in case of missing attributes
    .filter((block): block is DeletedBlockInfo[number] => block !== null);

  return {
    id: blockId,
    type: blockType,
    deletedBlocks: blockIdArray,
  };
};

export const hasValidBlockContext = (
  event: WorkspaceChangeEvent,
): event is WorkspaceChangeEvent & { blockId: string } => !!event.blockId;

export const handleBlockLifecycle = ({
  event,
  eventAction,
  vm,
  canEditTask,
  blocks,
  filterNonNull,
  updateSingleBlockConfigButton,
}: BlockLifecycleParams): void => {
  switch (eventAction) {
    case StudentActionType.Create:
    case StudentActionType.Delete:
      {
        // get the xml representing the block change
        const xml = getXmlFromEvent(event, eventAction, undefined);

        if (!xml) {
          // no xml found, cannot proceed
          return;
        }

        // create a new element to be able to use querySelectorAll on it, otherwise
        // only the children are matched against the selector
        const el = document.createElement("div");
        el.appendChild(xml);

        const opcodes = [...el.querySelectorAll("block[type]")]
          .map((element) => element.getAttribute("type"))
          .filter(filterNonNull);

        // update the block config button for the blocks
        for (const opcode of opcodes) {
          updateSingleBlockConfigButton(vm, blocks, opcode, canEditTask);
        }

        // Cleanup any freeze state associated with deleted blocks
        cleanupDeletedBlockFreezeState(vm, event, eventAction, canEditTask);
      }
      break;
  }
};

const getXmlFromEvent = (
  event: WorkspaceChangeEvent,
  eventAction: StudentActionType,
  xmlElement: Element | undefined,
): Element | undefined => {
  switch (eventAction) {
    case StudentActionType.Create:
      return event.xml;

    case StudentActionType.Delete:
      return event.oldXml;

    default:
      console.error("Could not find xml in event", event);
      return xmlElement;
  }
};

const cleanupDeletedBlockFreezeState = (
  vm: VM,
  event: WorkspaceChangeEvent,
  eventAction: StudentActionType,
  canEditTask: boolean | undefined,
): void => {
  if (
    eventAction === StudentActionType.Delete &&
    event.recordUndo &&
    event.blockId &&
    canEditTask
  ) {
    // When switching sprites, blocks are deleted with recordUndo set to false
    // Only remove config for explicitly deleted blocks
    delete vm.crtConfig?.freezeStateByBlockId[event.blockId];
  }
};

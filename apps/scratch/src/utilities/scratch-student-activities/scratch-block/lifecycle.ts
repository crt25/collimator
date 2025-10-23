import VM from "scratch-vm";
import { filterNonNull } from "../../filter-non-null";
import type { WorkspaceChangeEvent } from "../../../types/scratch-workspace";

interface BlockLifecycleParams {
  event: WorkspaceChangeEvent;
  vm: VM;
  canEditTask: boolean | undefined;
  blocks: HTMLElement;
  filterNonNull: typeof filterNonNull;
  updateSingleBlockConfigButton: (
    vm: VM,
    blocks: HTMLElement,
    opcode: string,
    canEditTask: boolean | undefined,
  ) => void;
}

export const handleBlockLifecycle = ({
  event,
  vm,
  canEditTask,
  blocks,
  filterNonNull,
  updateSingleBlockConfigButton,
}: BlockLifecycleParams): void => {
  switch (event.type) {
    case "create":
    case "delete":
      {
        // Get the xml representing the block change
        const xml = getXmlFromEvent(event, undefined);

        if (!xml) {
          // No xml found, cannot proceed
          return;
        }

        // Create a new element to be able to use querySelectorAll on it, otherwise
        // Only the children are matched against the selector
        const el = document.createElement("div");
        el.appendChild(xml);

        const opcodes = [...el.querySelectorAll("block[type]")]
          .map((element) => element.getAttribute("type"))
          .filter(filterNonNull);

        // Update the block config button for the blocks
        for (const opcode of opcodes) {
          updateSingleBlockConfigButton(vm, blocks, opcode, canEditTask);
        }

        // Cleanup any freeze state associated with deleted blocks
        cleanupDeletedBlockFreezeState(vm, event, canEditTask);
      }
      break;
  }
};

const getXmlFromEvent = (
  event: WorkspaceChangeEvent,
  xmlElement: Element | undefined,
): Element | undefined => {
  switch (event.type) {
    case "create":
      return event.xml;

    case "delete":
      return event.oldXml;

    default:
      console.error("Could not find xml in event", event);
      return xmlElement;
  }
};

const cleanupDeletedBlockFreezeState = (
  vm: VM,
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): void => {
  if (
    event.type === "delete" &&
    // When switching sprites, blocks are deleted with recordUndo set to false
    // Only remove config for explicitly deleted blocks
    event.recordUndo &&
    event.blockId &&
    canEditTask
  ) {
    delete vm.crtConfig?.freezeStateByBlockId[event.blockId];
  }
};

import VM from "@scratch/scratch-vm";
import { filterNonNull } from "../../filter-non-null";
import { logBaseModule } from "../log-module";
import { updateSingleBlockConfigButton } from "../../../blocks/block-config";
import type { WorkspaceChangeEvent } from "../../../types/scratch-workspace";

const logModule = `${logBaseModule}[scratch-block/lifecycle]`;

interface BlockLifecycleParams {
  event: WorkspaceChangeEvent;
  vm: VM;
  canEditTask: boolean | undefined;
  blocks: HTMLElement;
}

export const handleBlockLifecycle = ({
  event,
  vm,
  canEditTask,
  blocks,
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

        refreshBlockConfigButtonsFromXml(vm, xml, blocks, canEditTask);

        // Cleanup any freeze state associated with deleted blocks
        cleanupDeletedBlockFreezeState(vm, event, canEditTask);
      }
      break;

    case "endDrag":
      {
        // When a block is dragged onto another sprite, the VM copies it into
        // that target after this event is processed (BLOCK_DRAG_END ->
        // shareBlocksToTarget resolves in a promise callback), so no
        // create/delete event fires on the active workspace. Defer the
        // counter refresh until the copy is registered in the runtime.
        if (!event.isOutside || !event.xml) {
          return;
        }

        refreshBlockConfigButtonsFromXml(vm, event.xml, blocks, canEditTask);
      }
      break;
  }
};

const refreshBlockConfigButtonsFromXml = (
  vm: VM,
  xml: Element,
  blocks: HTMLElement,
  canEditTask: boolean | undefined,
): void => {
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
      console.error(`${logModule} Could not find xml in event`, event);
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

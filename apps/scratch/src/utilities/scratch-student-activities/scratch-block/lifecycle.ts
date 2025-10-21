import VM from "scratch-vm";
import { BlockLifecycleParams } from "../../../types/scratch-blocks";
import { StudentActionType } from "../../../types/scratch-student-activities";
import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";

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

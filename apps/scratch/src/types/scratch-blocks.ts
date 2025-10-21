import { filterNonNull } from "../utilities/filter-non-null";
import { StudentActionType } from "./scratch-student-activities";
import { WorkspaceChangeEvent } from "./scratch-workspace";
import type VM from "scratch-vm";

export interface BlockLifecycleParams {
  event: WorkspaceChangeEvent;
  eventAction: StudentActionType;
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

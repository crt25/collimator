import { Block } from "scratch-blocks";
import { CrtContextValue } from "../../contexts/CrtContext";
import { WorkspaceChangeEvent } from "../scratch-workspace";

export interface BaseStudentAppActivity extends Record<string, unknown> {
  blockId: string;
  blockType: string;
}

export interface BaseActivityRequest {
  sendRequest: CrtContextValue["sendRequest"];
  solution: Blob;
}

export interface BaseStudentAction {
  block: Block;
  sendRequest: CrtContextValue["sendRequest"];
  solution: Blob;
  event: WorkspaceChangeEvent;
}

export enum StudentAction {
  Create = "create",
  Move = "move",
  Delete = "delete",
}

export interface BasePipelineParams {
  event: WorkspaceChangeEvent;
  sendRequest: CrtContextValue["sendRequest"];
  solution: Blob;
}

export interface StudentActivityHandlerParams {
  event: WorkspaceChangeEvent;
  action: StudentAction;
  canEditTask: boolean | undefined;
  sendRequest: CrtContextValue["sendRequest"];
  solution: Blob;
  // For delete actions, the block may not be found in the workspace
  block: Block | null;
}

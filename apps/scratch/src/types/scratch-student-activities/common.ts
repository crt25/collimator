import { Block } from "scratch-blocks";
import { CrtContextValue } from "../../contexts/CrtContext";
import { WorkspaceChangeEvent } from "../scratch-workspace";

export interface StudentAppActivity {
  blockId: string;
  blockType: string;
}

export interface ActivityRequest {
  sendRequest: CrtContextValue["sendRequest"];
  solution: Blob;
}

export interface StudentActionContext {
  block: Block;
  sendRequest: CrtContextValue["sendRequest"];
  solution: Blob;
  event: WorkspaceChangeEvent;
}

export enum StudentActionType {
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
  action: StudentActionType;
  canEditTask: boolean | undefined;
  sendRequest: CrtContextValue["sendRequest"];
  solution: Blob;
  // For delete actions, the block may not be found in the workspace
  block: Block | null;
}

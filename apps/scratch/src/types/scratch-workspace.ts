export interface WorkspaceChangeEvent {
  type:
    | "create"
    | "change"
    | "move"
    | "dragOutside"
    | "endDrag"
    | "delete"
    | "remove"
    | "var_create"
    | "var_rename"
    | "var_delete"
    | "comment_create"
    | "comment_change"
    | "comment_move"
    | "comment_delete";

  blockId?: string;
  recordUndo?: boolean;
  xml?: Element;
  oldXml?: Element;
  newParentId?: string;
  oldParentId?: string;
}

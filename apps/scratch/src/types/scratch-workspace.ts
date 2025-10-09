// reverse engineered from https://github.com/scratchfoundation/scratch-vm/blob/613399e9a9a333eef5c8fb5e846d5c8f4f9536c6/src/engine/blocks.js#L312

export interface WorkspaceChangeEvent {
  type:
    | "create"
    | "change"
    | "move"
    | "dragOutside"
    | "endDrag"
    | "delete"
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
  oldParentId?: string | null;
  newParentId?: string | null;
}

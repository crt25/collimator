import { AddToListBlock } from "./add-to-list";
import { ChangeVariableByBlock } from "./change-variable-by";
import { DeleteAllOfListBlock } from "./delete-all-of-list";
import { DeleteOfListBlock } from "./delete-of-list";
import { HideListBlock } from "./hide-list";
import { HideVariableBlock } from "./hide-variable";
import { InsertAtListBlock } from "./insert-at-list";
import { ItemNumOfListBlock } from "./item-num-of-list";
import { ItemOfListBlock } from "./item-of-list";
import { LengthOfListBlock } from "./length-of-list";
import { ListContainsItemBlock } from "./list-contains-item";
import { ReplaceItemOfListBlock } from "./replace-item-of-list";
import { SetVariableToBlock } from "./set-variable-to";
import { ShowListBlock } from "./show-list";
import { ShowVariableBlock } from "./show-variable";

export * from "./add-to-list";
export * from "./change-variable-by";
export * from "./delete-all-of-list";
export * from "./delete-of-list";
export * from "./hide-list";
export * from "./hide-variable";
export * from "./insert-at-list";
export * from "./item-num-of-list";
export * from "./item-of-list";
export * from "./length-of-list";
export * from "./list-contains-item";
export * from "./replace-item-of-list";
export * from "./set-variable-to";
export * from "./show-list";
export * from "./show-variable";

export type DataHatBlock = never;

export type DataStatementBlock =
  | AddToListBlock
  | ChangeVariableByBlock
  | DeleteAllOfListBlock
  | DeleteOfListBlock
  | HideListBlock
  | HideVariableBlock
  | InsertAtListBlock
  | ReplaceItemOfListBlock
  | SetVariableToBlock
  | ShowListBlock
  | ShowVariableBlock;

export type DataExpressionBlock =
  | ItemOfListBlock
  | ItemNumOfListBlock
  | LengthOfListBlock
  | ListContainsItemBlock;

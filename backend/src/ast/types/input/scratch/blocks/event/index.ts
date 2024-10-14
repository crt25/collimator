import { BroadcastBlock } from "./broadcast";
import { BroadcastAndWaitBlock } from "./broadcast-and-wait";
import { BroadcastMenuBlock } from "./broadcast-menu";
import { WhenBackdropSwitchesToBlock } from "./when-backdrop-switches-to";
import { WhenBroadcastReceivedBlock } from "./when-broadcast-received";
import { WhenFlagClickedBlock } from "./when-flag-clicked";
import { WhenGreaterThanBlock } from "./when-greater-than";
import { WhenKeyPressedBlock } from "./when-key-pressed";
import { WhenStageIsClickedBlock } from "./when-stage-is-clicked";
import { WhenThisSpriteIsClickedBlock } from "./when-this-sprite-is-clicked";

export * from "./broadcast";
export * from "./broadcast-and-wait";
export * from "./when-backdrop-switches-to";
export * from "./when-broadcast-received";
export * from "./when-flag-clicked";
export * from "./when-greater-than";
export * from "./when-key-pressed";
export * from "./when-stage-is-clicked";
export * from "./when-this-sprite-is-clicked";

export type EventHatBlock =
  | WhenBackdropSwitchesToBlock
  | WhenBroadcastReceivedBlock
  | WhenFlagClickedBlock
  | WhenGreaterThanBlock
  | WhenKeyPressedBlock
  | WhenStageIsClickedBlock
  | WhenThisSpriteIsClickedBlock;

export type EventStatementBlock = BroadcastAndWaitBlock | BroadcastBlock;

export type EventExpressionBlock = BroadcastMenuBlock;

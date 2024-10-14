import { ChangeXByBlock } from "./change-x-by";
import { ChangeYByBlock } from "./change-y-by";
import { DirectionBlock } from "./direction";
import { GlideToBlock } from "./glide-to";
import { GlideToMenuBlock } from "./glide-to-menu";
import { GlideToXYBlock } from "./glide-to-x-y";
import { GoToBlock } from "./go-to";
import { GoToMenuBlock } from "./go-to-menu";
import { GoToXYBlock } from "./go-to-x-y";
import { IfOnEdgeBounceBlock } from "./if-on-edge-bounce";
import { MoveStepsBlock } from "./move-steps";
import { PointInDirectionBlock } from "./point-in-direction";
import { PointTowardsBlock } from "./point-towards";
import { PointTowardsMenuBlock } from "./point-towards-menu";
import { SetRotationStyleBlock } from "./set-rotation-style";
import { SetXBlock } from "./set-x";
import { SetYBlock } from "./set-y";
import { TurnLeftBlock } from "./turn-left";
import { TurnRightBlock } from "./turn-right";
import { XPositionBlock } from "./x-position";
import { YPositionBlock } from "./y-position";

export * from "./go-to-menu";
export * from "./glide-to-menu";
export * from "./point-towards-menu";
export * from "./change-x-by";
export * from "./change-y-by";
export * from "./direction";
export * from "./glide-to";
export * from "./glide-to-x-y";
export * from "./go-to";
export * from "./go-to-x-y";
export * from "./if-on-edge-bounce";
export * from "./move-steps";
export * from "./point-in-direction";
export * from "./point-towards";
export * from "./set-rotation-style";
export * from "./set-x";
export * from "./set-y";
export * from "./turn-left";
export * from "./turn-right";
export * from "./x-position";
export * from "./y-position";

export type MotionHatBlock = never;

export type MotionStatementBlock =
  | ChangeXByBlock
  | ChangeYByBlock
  | GlideToBlock
  | GlideToXYBlock
  | GoToXYBlock
  | GoToBlock
  | IfOnEdgeBounceBlock
  | MoveStepsBlock
  | PointInDirectionBlock
  | PointTowardsBlock
  | SetRotationStyleBlock
  | SetXBlock
  | SetYBlock
  | TurnLeftBlock
  | TurnRightBlock;

export type MotionExpressionBlock =
  | GlideToMenuBlock
  | GoToMenuBlock
  | PointTowardsMenuBlock
  | XPositionBlock
  | YPositionBlock
  | DirectionBlock;

import { BackdropNumberNameBlock } from "./backdrop-number-name";
import { BackdropsBlock } from "./backdrops";
import { ChangeEffectByBlock } from "./change-effect-by";
import { ChangeSizeByBlock } from "./change-size-by";
import { ClearGraphicsEffectsBlock } from "./clear-graphics-effects";
import { CostumeBlock } from "./costume";
import { CostumeNumberNameBlock } from "./costume-number-name";
import { GoForwardBackwardLayersBlock } from "./go-forward-backward-layers";
import { GoToFrontBackBlock } from "./go-to-front-back";
import { HideBlock } from "./hide";
import { NextBackdropBlock } from "./next-backdrop";
import { NextCostumeBlock } from "./next-costume";
import { SayBlock } from "./say";
import { SayForSecsBlock } from "./say-for-secs";
import { SetEffectToBlock } from "./set-effect-to";
import { SetSizeToBlock } from "./set-size-to";
import { ShowBlock } from "./show";
import { SizeBlock } from "./size";
import { SwitchBackDropToBlock } from "./switch-backdrop-to";
import { SwitchBackDropToAndWaitBlock } from "./switch-backdrop-to-and-wait";
import { SwitchCostumeToBlock } from "./switch-costume-to";
import { ThinkBlock } from "./think";
import { ThinkForSecsBlock } from "./think-for-secs";

export * from "./costume";
export * from "./backdrops";
export * from "./backdrop-number-name";
export * from "./change-effect-by";
export * from "./change-size-by";
export * from "./clear-graphics-effects";
export * from "./costume-number-name";
export * from "./go-forward-backward-layers";
export * from "./go-to-front-back";
export * from "./hide";
export * from "./next-backdrop";
export * from "./next-costume";
export * from "./say";
export * from "./say-for-secs";
export * from "./set-size-to";
export * from "./show";
export * from "./size";
export * from "./set-effect-to";
export * from "./switch-backdrop-to";
export * from "./switch-backdrop-to-and-wait";
export * from "./switch-costume-to";
export * from "./think";
export * from "./think-for-secs";

export type LooksHatBlock = never;

export type LooksCodeBlock =
  | ChangeEffectByBlock
  | ChangeSizeByBlock
  | ClearGraphicsEffectsBlock
  | GoForwardBackwardLayersBlock
  | GoToFrontBackBlock
  | HideBlock
  | NextBackdropBlock
  | NextCostumeBlock
  | SayForSecsBlock
  | SayBlock
  | SetEffectToBlock
  | SetSizeToBlock
  | ShowBlock
  | SwitchBackDropToAndWaitBlock
  | SwitchBackDropToBlock
  | SwitchCostumeToBlock
  | ThinkForSecsBlock
  | ThinkBlock;

export type LooksExpressionBlock =
  | CostumeBlock
  | BackdropsBlock
  | CostumeNumberNameBlock
  | BackdropNumberNameBlock
  | SizeBlock;

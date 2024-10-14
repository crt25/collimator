import { ChangeEffectByBlock } from "./change-effect-by";
import { ChangeVolumeByBlock } from "./change-volume-by";
import { ClearEffectsBlock } from "./clear-effects";
import { PlayBlock } from "./play";
import { PlayUntilDoneBlock } from "./play-until-done";
import { SetEffectToBlock } from "./set-effect-to";
import { SetVolumeToBlock } from "./set-volume-to";
import { VolumeBlock } from "./size";
import { SoundsMenuBlock } from "./sounds-menu";
import { StopAllSoundsBlock } from "./stop-all-sounds";

export * from "./change-effect-by";
export * from "./change-volume-by";
export * from "./clear-effects";
export * from "./play";
export * from "./play-until-done";
export * from "./set-effect-to";
export * from "./set-volume-to";
export * from "./size";
export * from "./stop-all-sounds";
export * from "./sounds-menu";

export type SoundHatBlock = never;

export type SoundCodeBlock =
  | ChangeEffectByBlock
  | ChangeVolumeByBlock
  | ClearEffectsBlock
  | PlayUntilDoneBlock
  | PlayBlock
  | SetEffectToBlock
  | SetVolumeToBlock
  | StopAllSoundsBlock;

export type SoundExpressionBlock = SoundsMenuBlock | VolumeBlock;

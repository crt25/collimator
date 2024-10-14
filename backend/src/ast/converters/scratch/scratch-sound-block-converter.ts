import { CodeNode } from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
import { NonHatBlock, TreeNode } from "./types";
import {
  isChangeEffectByBlock,
  ChangeEffectByBlock,
  ChangeVolumeByBlock,
  ClearEffectsBlock,
  isChangeVolumeByBlock,
  isClearEffectsBlock,
  isPlayBlock,
  isPlayUntilDoneBlock,
  isSetEffectToBlock,
  isSetVolumeToBlock,
  isStopAllSoundsBlock,
  isVolumeBlock,
  PlayBlock,
  PlayUntilDoneBlock,
  SetEffectToBlock,
  SetVolumeToBlock,
  SoundCodeBlock,
  StopAllSoundsBlock,
  VolumeBlock,
  SoundExpressionBlock,
  isSoundsMenuBlock,
  SoundsMenuBlock,
} from "src/ast/types/input/scratch/blocks/sound";
import {
  createFunctionCallBlock,
  createLiteralNode,
  createVariableExpressionBlock,
} from "./helpers";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/code-node/expression-node";

type SoundCodeTreeNode = SoundCodeBlock & TreeNode;
type SoundExpressionTreeNode = SoundExpressionBlock & TreeNode;

export const isSoundCodeBlock = (
  block: NonHatBlock,
): block is SoundCodeBlock & NonHatBlock =>
  isChangeEffectByBlock(block) ||
  isChangeVolumeByBlock(block) ||
  isClearEffectsBlock(block) ||
  isPlayUntilDoneBlock(block) ||
  isPlayBlock(block) ||
  isSetEffectToBlock(block) ||
  isSetVolumeToBlock(block) ||
  isStopAllSoundsBlock(block);

export const isSoundExpressionBlock = (
  block: NonHatBlock,
): block is SoundExpressionTreeNode =>
  isSoundsMenuBlock(block) || isVolumeBlock(block);

export const convertSoundBlockTreeToCode = (
  soundBlock: SoundCodeTreeNode,
): CodeNode[] =>
  match(soundBlock)
    .returnType<CodeNode[]>()
    .with(
      P.when(isChangeEffectByBlock),
      P.when(isChangeVolumeByBlock),
      P.when(isClearEffectsBlock),
      P.when(isPlayUntilDoneBlock),
      P.when(isPlayBlock),
      P.when(isSetEffectToBlock),
      P.when(isSetVolumeToBlock),
      P.when(isStopAllSoundsBlock),
      P.when(isVolumeBlock),
      (
        block: (
          | ChangeEffectByBlock
          | ChangeVolumeByBlock
          | ClearEffectsBlock
          | PlayUntilDoneBlock
          | PlayBlock
          | SetEffectToBlock
          | SetVolumeToBlock
          | StopAllSoundsBlock
          | VolumeBlock
        ) &
          SoundCodeTreeNode,
      ) => [createFunctionCallBlock(block)],
    )
    .exhaustive();

export const convertSoundBlockTreeToExpression = (
  soundBlock: SoundExpressionTreeNode,
): ExpressionNode =>
  match(soundBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isVolumeBlock),
      (block: VolumeBlock & SoundExpressionTreeNode) =>
        createVariableExpressionBlock(block.opcode),
    )
    .with(
      P.when(isSoundsMenuBlock),
      (block: SoundsMenuBlock & SoundExpressionTreeNode) =>
        createLiteralNode("string", block.fields.SOUND_MENU[0] ?? ""),
    )
    .exhaustive();

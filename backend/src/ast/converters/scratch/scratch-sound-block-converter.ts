import { StatementNode } from "src/ast/types/general-ast/ast-nodes";
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
  SoundStatementBlock,
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
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";

type SoundCodeTreeNode = SoundStatementBlock & TreeNode;
type SoundExpressionTreeNode = SoundExpressionBlock & TreeNode;

export const isSoundStatementBlock = (
  block: NonHatBlock,
): block is SoundStatementBlock & NonHatBlock =>
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

export const convertSoundBlockTreeToStatement = (
  soundBlock: SoundCodeTreeNode,
): StatementNode[] =>
  match(soundBlock)
    .returnType<StatementNode[]>()
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

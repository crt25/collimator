import { GeneralAst } from "src/ast/types/general-ast";
import ScratchInput from "src/ast/types/input/scratch";
import { convertTarget } from "./scratch-ast-converter";
import { SpriteTarget, StageTarget } from "./types";

export const convertScratchToGeneralAst = (input: ScratchInput): GeneralAst => {
  if (input.targets.length === 0) {
    return [];
  }

  const [stageTarget, ...spriteTargets] = input.targets as [
    StageTarget,
    ...SpriteTarget[],
  ];

  return [
    convertTarget(stageTarget),
    ...spriteTargets.map((spriteTarget) => convertTarget(spriteTarget)),
  ];
};

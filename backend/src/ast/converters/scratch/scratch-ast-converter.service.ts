import { Injectable } from "@nestjs/common";
import AstConverterService from "../converter.service";
import ScratchInput from "src/ast/types/input/scratch";
import { GeneralAst } from "src/ast/types/general-ast";
import { SpriteTarget, StageTarget } from "./types";
import { convertTarget } from "./scratch-ast-converter";

@Injectable()
export class ScratchAstConverterService extends AstConverterService<ScratchInput> {
  convertAst(input: ScratchInput): GeneralAst {
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
  }
}

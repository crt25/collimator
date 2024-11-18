import { Injectable } from "@nestjs/common";
import { Solution, TaskType } from "@prisma/client";
import { Piscina } from "piscina";
import { resolve } from "path";
import ScratchAsConversionWorker from "./converters/scratch/scratch-ast-conversion-worker.piscina";
import { GeneralAst } from "./types/general-ast";
import { TaskWithoutData } from "src/api/tasks/tasks.service";

type ConvertScratch = typeof ScratchAsConversionWorker;

@Injectable()
export class AstConversionService {
  private scratchConverter = new Piscina<
    Parameters<ConvertScratch>[0],
    ReturnType<ConvertScratch>
  >({
    filename: resolve(
      __dirname,
      // use the .js extension because NestJS compiles the typescript files
      "./converters/scratch/scratch-ast-conversion-worker.piscina.js",
    ),
  });

  constructor() {}

  /**
   * Convert submission ASTs to the generalized AST which
   * can be analyzed by the data analyzer.
   */
  async convertSolutionToAst(
    task: TaskWithoutData,
    solution: Solution,
  ): Promise<GeneralAst> {
    let ast: Promise<GeneralAst>;

    if (
      task.type === TaskType.SCRATCH &&
      solution.mimeType === "application/json"
    ) {
      ast = this.scratchConverter.run({
        input: solution.data.toString("utf-8"),
      });
    } else {
      throw new Error(
        `Unsupported (task, solution mime type) tuple '(${task.type}, ${solution.mimeType})'`,
      );
    }

    return ast;
  }
}

import { resolve } from "path";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Solution } from "@prisma/client";
import { Piscina } from "piscina";
import { TaskWithoutData } from "src/api/tasks/tasks.service";
import { getPiscinaPath } from "src/utilities/is-test";
import { GeneralAst } from "./types/general-ast";
import SolutionConversionWorker from "./converters/solution-conversion-worker.piscina";

type ConversionWorker = typeof SolutionConversionWorker;

@Injectable()
export class AstConversionService implements OnModuleDestroy {
  private readonly conversionWorker = new Piscina<
    Parameters<ConversionWorker>[0],
    ReturnType<ConversionWorker>
  >({
    filename: getPiscinaPath(
      resolve(
        __dirname,
        // use the .js extension because NestJS compiles the typescript files
        "./converters/solution-conversion-worker.piscina.js",
      ),
    ),
  });

  onModuleDestroy(): void {
    this.conversionWorker.destroy();
  }

  /**
   * Convert submission ASTs to the generalized AST which
   * can be analyzed by the data analyzer.
   */
  async convertSolutionToAst(
    task: TaskWithoutData,
    solution: Solution,
  ): Promise<GeneralAst> {
    return this.conversionWorker.run({
      solution,
      taskType: task.type,
    });
  }
}

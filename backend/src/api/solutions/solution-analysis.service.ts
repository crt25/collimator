import { Injectable } from "@nestjs/common";
import { AstVersion, Prisma, Solution, SolutionAnalysis } from "@prisma/client";
import { AstConversionService } from "src/ast/ast-conversion.service";
import { SolutionConversionStatus } from "src/ast/converters/solution-conversion-result";
import { PrismaService } from "src/prisma/prisma.service";
import { incrementFailedAnalysis } from "@prisma/client/sql";
import { TasksService } from "../tasks/tasks.service";
import { maximumNumberOfAnalysisRetries } from "./solution-analysis.constants";

export type SolutionAnalysisCreateInput = Omit<
  Prisma.SolutionAnalysisUncheckedCreateInput,
  "id"
>;

@Injectable()
export class SolutionAnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly astConversionService: AstConversionService,
  ) {}

  async performAnalysis(
    solution: Solution,
    newAstVersion: AstVersion,
  ): Promise<SolutionAnalysis | null> {
    const task = await this.tasksService.findByIdOrThrow(solution.taskId);

    try {
      const conversion = await this.astConversionService.convertSolutionToAst(
        task,
        solution,
      );

      if (conversion.status === SolutionConversionStatus.InvalidSyntax) {
        // invalid syntax is an expected state while a student is editing
        await this.prisma.solution.update({
          data: { failedAnalyses: maximumNumberOfAnalysisRetries },
          where: {
            taskId_hash: {
              taskId: solution.taskId,
              hash: solution.hash,
            },
          },
        });

        // resolve normally so sentry does not receive an unhandled rejection
        return null;
      }

      const genericAst = JSON.stringify(conversion.ast);

      // use an upsert to handle the case where the analysis has already been performed
      // this may happen if a re-analysis is triggered  because the initial analysis takes
      // longer than expected
      return this.prisma.solutionAnalysis.upsert({
        create: {
          taskId: solution.taskId,
          solutionHash: solution.hash,
          genericAst,
          astVersion: newAstVersion,
        },
        update: {
          genericAst,
          astVersion: newAstVersion,
        },
        where: {
          taskId_solutionHash: {
            taskId: solution.taskId,
            solutionHash: solution.hash,
          },
        },
      });
    } catch (e) {
      await this.prisma.$queryRawTyped(
        incrementFailedAnalysis(solution.taskId, solution.hash),
      );

      return Promise.reject(e);
    }
  }
}

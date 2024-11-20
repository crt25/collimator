import { Injectable } from "@nestjs/common";
import { Prisma, Solution, SolutionAnalysis } from "@prisma/client";
import { AstConversionService } from "src/ast/ast-conversion.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";
import { incrementFailedAnalysis } from "@prisma/client/sql";

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

  async performAnalysis(solution: Solution): Promise<SolutionAnalysis> {
    const task = await this.tasksService.findByIdOrThrow(solution.taskId);

    try {
      const ast = await this.astConversionService.convertSolutionToAst(
        task,
        solution,
      );

      // use an upsert to make sure we only add it if the analysis has not already been performed
      // this may happen if a re-analysis is trigerred because the initial analysis takes
      // longer than expected
      return this.prisma.solutionAnalysis.upsert({
        create: {
          solutionId: solution.id,
          genericAst: JSON.stringify(ast),
        },
        update: {},
        where: {
          solutionId: solution.id,
        },
      });
    } catch (e) {
      await this.prisma.$queryRawTyped(incrementFailedAnalysis(solution.id));

      return Promise.reject(e);
    }
  }
}

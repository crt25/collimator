import { Injectable } from "@nestjs/common";
import { Prisma, Solution, SolutionAnalysis } from "@prisma/client";
import { AstConversionService } from "src/ast/ast-conversion.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";

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

    const ast = await this.astConversionService.convertSolutionToAst(
      task,
      solution,
    );

    return this.prisma.solutionAnalysis.create({
      data: {
        solutionId: solution.id,
        genericAst: JSON.stringify(ast),
      },
    });
  }
}

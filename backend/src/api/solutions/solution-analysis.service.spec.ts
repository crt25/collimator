import { Logger } from "@nestjs/common";
import { AstVersion, Solution, TaskType } from "@prisma/client";
import { AstConversionService } from "src/ast/ast-conversion.service";
import { SolutionConversionStatus } from "src/ast/converters/solution-conversion-result";
import { PrismaService } from "src/prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";
import { permanentlyFailedAnalysisCount } from "./solution-analysis.constants";
import { SolutionAnalysisService } from "./solution-analysis.service";

describe("SolutionAnalysisService", () => {
  const solution: Solution = {
    taskId: 1,
    hash: Buffer.from("invalid-solution"),
    data: Buffer.from("invalid"),
    mimeType: "application/json",
    failedAnalyses: 0,
    deletedAt: null,
  };

  afterEach(() => jest.restoreAllMocks());

  it("logs invalid input, marks it permanently failed, and resolves null", async () => {
    const updateSolution = jest.fn().mockResolvedValue(solution);
    const upsertAnalysis = jest.fn();
    const incrementFailedAnalysis = jest.fn();
    const findTask = jest.fn().mockResolvedValue({
      id: solution.taskId,
      type: TaskType.JUPYTER,
    });
    const conversionErrors = [
      { message: "invalid syntax", line: 2, column: 4 },
    ];
    const convertSolutionToAst = jest.fn().mockResolvedValue({
      status: SolutionConversionStatus.InvalidInput,
      errors: conversionErrors,
    });
    const warn = jest.spyOn(Logger.prototype, "warn").mockImplementation();

    const service = new SolutionAnalysisService(
      {
        solution: { update: updateSolution },
        solutionAnalysis: { upsert: upsertAnalysis },
        $queryRawTyped: incrementFailedAnalysis,
      } as unknown as PrismaService,
      { findByIdOrThrow: findTask } as unknown as TasksService,
      { convertSolutionToAst } as unknown as AstConversionService,
    );

    await expect(
      service.performAnalysis(solution, AstVersion.v1),
    ).resolves.toBeNull();

    expect(updateSolution).toHaveBeenCalledWith({
      data: { failedAnalyses: permanentlyFailedAnalysisCount },
      where: {
        taskId_hash: {
          taskId: solution.taskId,
          hash: solution.hash,
        },
      },
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(JSON.stringify(conversionErrors)),
    );
    expect(upsertAnalysis).not.toHaveBeenCalled();
    expect(incrementFailedAnalysis).not.toHaveBeenCalled();
  });
});

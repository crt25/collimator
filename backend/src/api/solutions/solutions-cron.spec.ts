import { Solution } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";
import { SolutionAnalysisService } from "./solution-analysis.service";
import { SolutionsService } from "./solutions.service";

describe("SolutionsService analysis cron jobs", () => {
  const solution: Solution = {
    taskId: 1,
    hash: Buffer.from("solution"),
    data: Buffer.from("data"),
    mimeType: "application/json",
    failedAnalyses: 0,
    deletedAt: null,
  };

  const buildService = (): {
    service: SolutionsService;
    findSolutions: jest.Mock;
    findAnalyses: jest.Mock;
    performAnalysis: jest.Mock;
  } => {
    const findSolutions = jest.fn();
    const findAnalyses = jest.fn();
    const performAnalysis = jest
      .fn()
      .mockRejectedValue(new Error("conversion failed"));

    const service = new SolutionsService(
      {
        solution: { findMany: findSolutions },
        solutionAnalysis: { findMany: findAnalyses },
      } as unknown as PrismaService,
      {} as TasksService,
      { performAnalysis } as unknown as SolutionAnalysisService,
    );

    return { service, findSolutions, findAnalyses, performAnalysis };
  };

  it("continues when an unperformed analysis rejects", async () => {
    const { service, findSolutions, performAnalysis } = buildService();
    findSolutions.mockResolvedValue([solution]);

    await expect(service.runUnperformedAnalyes()).resolves.toBeUndefined();

    expect(performAnalysis).toHaveBeenCalledTimes(1);
  });

  it("continues when an analysis upgrade rejects", async () => {
    const { service, findAnalyses, performAnalysis } = buildService();
    findAnalyses.mockResolvedValue([{ solution }]);

    await expect(service.runUpgradeAnalyes()).resolves.toBeUndefined();

    expect(performAnalysis).toHaveBeenCalledTimes(1);
  });
});

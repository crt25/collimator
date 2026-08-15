import { Solution, TaskType } from "@prisma/client";
import SolutionConversionWorker from "./solution-conversion-worker.piscina";
import { SolutionConversionStatus } from "./solution-conversion-result";

const buildSolution = (
  data: unknown,
  mimeType = "application/json",
): Solution => ({
  taskId: 1,
  hash: Buffer.from("solution"),
  data: Buffer.from(JSON.stringify(data)),
  mimeType,
  failedAnalyses: 0,
  deletedAt: null,
});

describe("SolutionConversionWorker", () => {
  it("returns generic conversion details for invalid Python", () => {
    const solution = buildSolution({
      nbformat: 4,
      nbformat_minor: 0,
      metadata: {
        language_info: { name: "python", version: "3.10.4" },
      },
      cells: [
        {
          id: "invalid",
          cell_type: "code",
          source: "x = +\n",
          outputs: [],
          execution_count: 0,
          metadata: {},
        },
      ],
    });

    const result = SolutionConversionWorker({
      solution,
      taskType: TaskType.JUPYTER,
    });

    expect(result.status).toBe(SolutionConversionStatus.InvalidInput);
    if (result.status === SolutionConversionStatus.InvalidInput) {
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: expect.any(String) }),
        ]),
      );
    }
  });

  it("returns an invalid-input result for an unsupported MIME type", () => {
    const result = SolutionConversionWorker({
      solution: buildSolution({}, "text/plain"),
      taskType: TaskType.SCRATCH,
    });

    expect(result).toEqual({
      status: SolutionConversionStatus.InvalidInput,
      errors: [
        {
          message:
            "Unsupported (task, solution mime type) tuple '(SCRATCH, text/plain)'",
        },
      ],
    });
  });

  it("returns an invalid-input result for malformed JSON", () => {
    const solution = buildSolution({});
    solution.data = Buffer.from("{");

    const result = SolutionConversionWorker({
      solution,
      taskType: TaskType.JUPYTER,
    });

    expect(result.status).toBe(SolutionConversionStatus.InvalidInput);
    if (result.status === SolutionConversionStatus.InvalidInput) {
      expect(result.errors).toEqual([
        expect.objectContaining({ message: expect.any(String) }),
      ]);
    }
  });

  it.each([TaskType.JUPYTER, TaskType.SCRATCH])(
    "returns an invalid-input result for %s JSON with the wrong root shape",
    (taskType) => {
      const result = SolutionConversionWorker({
        solution: buildSolution(null),
        taskType,
      });

      expect(result).toEqual({
        status: SolutionConversionStatus.InvalidInput,
        errors: [{ message: `Invalid ${taskType} solution JSON structure` }],
      });
    },
  );
});

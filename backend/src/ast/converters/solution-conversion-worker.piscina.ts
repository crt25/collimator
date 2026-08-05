import { Solution, TaskType } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { GeneralAst } from "../types/general-ast";
import JupyterInput from "../types/input/jupyter";
import ScratchInput from "../types/input/scratch";
import { convertScratchToGeneralAst } from "./scratch";
import { convertJupyterToGeneralAst } from "./jupyter";
import {
  ConversionError,
  SolutionConversionResult,
  SolutionConversionStatus,
} from "./solution-conversion-result";

const parseSolutionJson = (solution: Solution): unknown => {
  try {
    return JSON.parse(new TextDecoder("utf-8").decode(solution.data));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ConversionError(error.message, [{ message: error.message }]);
    }

    throw error;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// TODO: Tighten this to validate the decoded value against the Jupyter notebook format
const isJupyterInput = (value: unknown): value is JupyterInput =>
  isRecord(value) && isRecord(value.metadata) && Array.isArray(value.cells);

// TODO: Tighten this to validate the decoded value against the Scratch project format
const isScratchInput = (value: unknown): value is ScratchInput =>
  isRecord(value) && Array.isArray(value.targets);

const invalidStructure = (taskType: TaskType): ConversionError => {
  const message = `Invalid ${taskType} solution JSON structure`;
  return new ConversionError(message, [{ message }]);
};

const SolutionConversionWorker = ({
  solution,
  taskType,
}: {
  taskType: TaskType;
  solution: Solution;
}): SolutionConversionResult => {
  return Sentry.withScope((scope) => {
    const hashHexVal = Buffer.from(solution.hash).toString("hex");

    scope.setTag("solution.taskId", solution.taskId.toString());
    scope.setTag("solution.hash", hashHexVal);
    scope.setTag("solution.taskType", taskType);
    scope.setTag("solution.mimeType", solution.mimeType);

    try {
      let ast: GeneralAst;

      if (
        taskType === TaskType.SCRATCH &&
        solution.mimeType === "application/json"
      ) {
        const input = parseSolutionJson(solution);

        if (!isScratchInput(input)) {
          throw invalidStructure(taskType);
        }

        ast = convertScratchToGeneralAst(input);
      } else if (
        taskType === TaskType.JUPYTER &&
        solution.mimeType === "application/json"
      ) {
        const input = parseSolutionJson(solution);

        if (!isJupyterInput(input)) {
          throw invalidStructure(taskType);
        }

        ast = convertJupyterToGeneralAst(input);
      } else {
        return {
          status: SolutionConversionStatus.InvalidInput,
          errors: [
            {
              message: `Unsupported (task, solution mime type) tuple '(${taskType}, ${solution.mimeType})'`,
            },
          ],
        };
      }

      return { status: SolutionConversionStatus.Success, ast };
    } catch (error) {
      if (error instanceof ConversionError) {
        return {
          status: SolutionConversionStatus.InvalidInput,
          errors: error.errors,
        };
      }

      throw error;
    }
  });
};

export default SolutionConversionWorker;

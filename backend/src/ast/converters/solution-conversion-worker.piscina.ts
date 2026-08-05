import { Solution, TaskType } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { GeneralAst } from "../types/general-ast";
import { convertScratchToGeneralAst } from "./scratch";
import { convertJupyterToGeneralAst } from "./jupyter";
import {
  ConversionError,
  SolutionConversionResult,
  SolutionConversionStatus,
} from "./solution-conversion-result";

const parseSolutionJson = <T>(solution: Solution): T => {
  try {
    return JSON.parse(new TextDecoder("utf-8").decode(solution.data)) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ConversionError(error.message, [{ message: error.message }]);
    }

    throw error;
  }
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
        ast = convertScratchToGeneralAst(parseSolutionJson(solution));
      } else if (
        taskType === TaskType.JUPYTER &&
        solution.mimeType === "application/json"
      ) {
        ast = convertJupyterToGeneralAst(parseSolutionJson(solution));
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

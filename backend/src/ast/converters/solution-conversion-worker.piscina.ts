import { Solution, TaskType } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { GeneralAst } from "../types/general-ast";
import { convertScratchToGeneralAst } from "./scratch";
import { convertJupyterToGeneralAst } from "./jupyter";

const SolutionConversionWorker = ({
  solution,
  taskType,
}: {
  taskType: TaskType;
  solution: Solution;
}): GeneralAst => {
  return Sentry.withScope((scope) => {
    const hashHexVal = Buffer.from(solution.hash).toString("hex");

    scope.setTag("solution.taskId", solution.taskId.toString());
    scope.setTag("solution.hash", hashHexVal);
    scope.setTag("solution.taskType", taskType);
    scope.setTag("solution.mimeType", solution.mimeType);

    let ast: GeneralAst;

    if (
      taskType === TaskType.SCRATCH &&
      solution.mimeType === "application/json"
    ) {
      ast = convertScratchToGeneralAst(
        JSON.parse(new TextDecoder("utf-8").decode(solution.data)),
      );
    } else if (
      taskType === TaskType.JUPYTER &&
      solution.mimeType === "application/json"
    ) {
      ast = convertJupyterToGeneralAst(
        JSON.parse(new TextDecoder("utf-8").decode(solution.data)),
      );
    } else {
      throw new Error(
        `Unsupported (task, solution mime type) tuple '(${taskType}, ${solution.mimeType})'`,
      );
    }

    return ast;
  });
};

export default SolutionConversionWorker;

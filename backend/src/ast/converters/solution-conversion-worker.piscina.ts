import { Solution, TaskType } from "@prisma/client";
import { GeneralAst } from "../types/general-ast";
import { convertScratchToGeneralAst } from "./scratch";

const SolutionConversionWorker = ({
  solution,
  taskType,
}: {
  taskType: TaskType;
  solution: Solution;
}): GeneralAst => {
  let ast: GeneralAst;

  if (
    taskType === TaskType.SCRATCH &&
    solution.mimeType === "application/json"
  ) {
    ast = convertScratchToGeneralAst(
      JSON.parse(new TextDecoder("utf-8").decode(solution.data)),
    );
  } else {
    throw new Error(
      `Unsupported (task, solution mime type) tuple '(${taskType}, ${solution.mimeType})'`,
    );
  }

  return ast;
};

export default SolutionConversionWorker;

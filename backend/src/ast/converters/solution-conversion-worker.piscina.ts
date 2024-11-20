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
      // do a Buffer.from() because either piscina or prisma
      // sometimes return an array instead of a buffer
      JSON.parse(Buffer.from(solution.data).toString("utf-8")),
    );
  } else {
    throw new Error(
      `Unsupported (task, solution mime type) tuple '(${taskType}, ${solution.mimeType})'`,
    );
  }

  return ast;
};

export default SolutionConversionWorker;

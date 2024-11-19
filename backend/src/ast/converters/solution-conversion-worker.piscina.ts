import { Solution, TaskType } from "@prisma/client";
import { TaskWithoutData } from "src/api/tasks/tasks.service";
import { GeneralAst } from "../types/general-ast";
import { convertScratchToGeneralAst } from "./scratch";

const SolutionConversionWorker = ({
  solution,
  task,
}: {
  task: TaskWithoutData;
  solution: Solution;
}): GeneralAst => {
  let ast: GeneralAst;

  if (
    task.type === TaskType.SCRATCH &&
    solution.mimeType === "application/json"
  ) {
    ast = convertScratchToGeneralAst(
      JSON.parse(solution.data.toString("utf-8")),
    );
  } else {
    throw new Error(
      `Unsupported (task, solution mime type) tuple '(${task.type}, ${solution.mimeType})'`,
    );
  }

  return ast;
};

export default SolutionConversionWorker;

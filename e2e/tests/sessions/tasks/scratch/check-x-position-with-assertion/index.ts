/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { readFile } from "fs/promises";
import path from "path";
import { TaskTemplateWithSolutions } from "../../task-template-with-solutions";
import { TaskType } from "@/api/collimator/generated/models";

const currentDirectory = import.meta.dirname;
const correctSolutionPath = path.join(currentDirectory, "solutions", "correct");
const incorrectSolutionPath = path.join(
  currentDirectory,
  "solutions",
  "incorrect",
);

const checkXPositionWithAssertion: TaskTemplateWithSolutions = {
  type: TaskType.SCRATCH,
  mimeType: {
    template: "application/x.scratch.sb3",
    solution: "application/json",
  },
  template: () => readFile(path.join(currentDirectory, "task.sb3")),
  solutions: {
    correct: [() => readFile(path.join(correctSolutionPath, "task.sb3"))],
    incorrect: [
      () => readFile(path.join(incorrectSolutionPath, "1-x-10.json")),
      () => readFile(path.join(incorrectSolutionPath, "loop-10-x-10.json")),
    ],
    unknown: [],
  },
};

export default checkXPositionWithAssertion;

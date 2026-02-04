/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { readFile } from "fs/promises";
import path from "path";
import { TaskTemplateWithSolutions } from "../task-template-with-solutions";
import { TaskType } from "@/api/collimator/generated/models";

const currentDirectory = import.meta.dirname;
const correctSolutionPath = path.join(currentDirectory, "solutions", "correct");
// const incorrectSolutionPath = path.join(
//   currentDirectory,
//   "solutions",
//   "incorrect",
// );

const jupyterTaskTemplate: TaskTemplateWithSolutions = {
  type: TaskType.SCRATCH,
  mimeType: {
    template: "application/zip",
    solution: "application/zip",
  },
  template: () => readFile(path.join(currentDirectory, "task.zip")),
  solutions: {
    correct: [() => readFile(path.join(correctSolutionPath, "task.zip"))],
    incorrect: [],
    unknown: [],
  },
};

export default jupyterTaskTemplate;

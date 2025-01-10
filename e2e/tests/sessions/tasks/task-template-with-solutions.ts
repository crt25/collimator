import { TaskType } from "@/api/collimator/generated/models";

type File = Buffer<ArrayBufferLike>;

export interface TaskTemplateWithSolutions {
  type: TaskType;
  mimeType: {
    template: string;
    solution: string;
  };
  template: () => Promise<File>;
  solutions: {
    correct: (() => Promise<File>)[];
    incorrect: (() => Promise<File>)[];
    unknown: (() => Promise<File>)[]; // for tasks that have no notion of correctness
  };
}

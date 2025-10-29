export enum TaskFormat {
  CrtInternal = "CrtInternal",
  GenericNotebook = "GenericNotebook",
}

export const CrtFileIdentifier = ".crt";

export const CrtInternalFiles = {
  Template: "template.ipynb",
  Student: "student.ipynb",
  Autograder: "autograder.zip",
  Data: "data",
  GradingData: "grading_data",
  Src: "src",
  GradingSrc: "grading_src",
};

export const GenericNotebookFiles = {
  Task: "task.ipynb",
  Data: "data",
  GradingData: "grading_data",
  Src: "src",
  GradingSrc: "grading_src",
};

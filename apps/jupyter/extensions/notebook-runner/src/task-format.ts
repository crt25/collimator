export enum TaskFormat {
  CrtInternal = "CrtInternal",
  ExternalCustom = "ExternalCustom",
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

export const ExternalCustomFiles = {
  Task: "task.ipynb",
  Data: "data",
  GradingData: "grading_data",
  Src: "src",
  GradingSrc: "grading_src",
};

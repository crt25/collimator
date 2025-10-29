export enum TaskFormat {
  CrtInternal = "CrtInternal",
  GenericNotebook = "GenericNotebook",
}

export const CrtFileIdentifier = ".crt";

export const CrtInternalFiles = {
  template: "template.ipynb",
  student: "student.ipynb",
  autograder: "autograder.zip",
  data: "data",
  gradingData: "grading_data",
  src: "src",
  gradingSrc: "grading_src",
};

export const GenericNotebookFiles = {
  task: "task.ipynb",
  data: "data",
  gradingData: "grading_data",
  src: "src",
  gradingSrc: "grading_src",
};

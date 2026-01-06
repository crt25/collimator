export const completeCrtTaskData = {
  taskTemplateFile: new Blob(["template content"]),
  studentTaskFile: new Blob(["student content"]),
  autograderFile: new Blob(["autograder content"]),
  data: new Map([["data.txt", new Blob(["data content"])]]),
  gradingData: new Map([["grading.txt", new Blob(["grading content"])]]),
  src: new Map([["code.py", new Blob(["print('hello')"])]]),
  gradingSrc: new Map([["test.py", new Blob(["print('test')"])]]),
};

export const emptyCrtTaskData = {
  taskTemplateFile: new Blob(["template"]),
  studentTaskFile: new Blob(["student"]),
  autograderFile: new Blob(["autograder"]),
  data: new Map(),
  gradingData: new Map(),
  src: new Map(),
  gradingSrc: new Map(),
};

export const completeGenericTaskData = {
  taskFile: new Blob(["task content"]),
  data: new Map([["data.txt", new Blob(["data content"])]]),
  gradingData: new Map([["grading.txt", new Blob(["grading content"])]]),
  src: new Map([["code.py", new Blob(["print('hello')"])]]),
  gradingSrc: new Map([["test.py", new Blob(["print('test')"])]]),
};

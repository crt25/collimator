import {
  CrtInternalTask,
  SharedDirectories,
  GenericNotebookTask,
} from "../../task-converter";

export const assertSharedDirectoriesEquality = async (
  actual: SharedDirectories,
  expected: SharedDirectories,
): Promise<void> => {
  expect(actual.data.size).toBe(expected.data.size);
  for (const [key, expectedBlob] of expected.data.entries()) {
    expect(actual.data.has(key)).toBe(true);
    expect(await actual.data.get(key)?.text()).toBe(await expectedBlob.text());
  }

  expect(actual.gradingData.size).toBe(expected.gradingData.size);
  for (const [key, expectedBlob] of expected.gradingData.entries()) {
    expect(actual.gradingData.has(key)).toBe(true);
    expect(await actual.gradingData.get(key)?.text()).toBe(
      await expectedBlob.text(),
    );
  }

  expect(actual.src.size).toBe(expected.src.size);
  for (const [key, expectedBlob] of expected.src.entries()) {
    expect(actual.src.has(key)).toBe(true);
    expect(await actual.src.get(key)?.text()).toBe(await expectedBlob.text());
  }

  expect(actual.gradingSrc.size).toBe(expected.gradingSrc.size);
  for (const [key, expectedBlob] of expected.gradingSrc.entries()) {
    expect(actual.gradingSrc.has(key)).toBe(true);
    expect(await actual.gradingSrc.get(key)?.text()).toBe(
      await expectedBlob.text(),
    );
  }
};

export const assertCrtInternalTaskEquality = async (
  actual: CrtInternalTask,
  expected: CrtInternalTask,
): Promise<void> => {
  expect(await actual.taskTemplateFile.text()).toBe(
    await expected.taskTemplateFile.text(),
  );
  expect(await actual.studentTaskFile.text()).toBe(
    await expected.studentTaskFile.text(),
  );
  expect(await actual.autograderFile.text()).toBe(
    await expected.autograderFile.text(),
  );

  await assertSharedDirectoriesEquality(actual, expected);
};

export const assertGenericNotebookTaskEquality = async (
  actual: GenericNotebookTask,
  expected: GenericNotebookTask,
): Promise<void> => {
  expect(await actual.taskFile.text()).toBe(await expected.taskFile.text());

  await assertSharedDirectoriesEquality(actual, expected);
};

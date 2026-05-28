export const ignoreConsoleErrors = (): void => {
  jest.spyOn(console, "error").mockImplementation(() => {});
};

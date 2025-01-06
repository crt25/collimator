export const isTestEnvironment = process.env.NODE_ENV === "test";

export const getPiscinaPath = (filename: string): string =>
  // loads the compiled file from dist/ if in test environment
  // note that this requires the backend to be compiled before running tests
  isTestEnvironment ? filename.replace("src", "dist") : filename;

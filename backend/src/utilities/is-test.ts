import { join } from "path";

export const isTestEnvironment = process.env.NODE_ENV === "test";

export const getPiscinaPath = (filename: string): string =>
  // loads the compiled file from dist/src if in test environment
  // note that this requires the backend to be compiled before running tests
  isTestEnvironment ? filename.replace("src", join("dist", "src")) : filename;

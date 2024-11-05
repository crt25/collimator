import { defineConfig } from "orval";

const config = defineConfig({
  collimator: {
    input: {
      target: "http://localhost:3000/api-json",
      validation: false,
    },
    output: {
      mode: "tags-split",
      target: "src/api/collimator/generated/endpoints",
      schemas: "src/api/collimator/generated/models",
      client: "fetch",
      httpClient: "fetch",
      mock: true,

      override: {
        fetch: {
          includeHttpStatusReturnType: false,
        },
        mutator: {
          path: "./src/api/fetch.ts",
          name: "fetchApi",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: {
        command: "yarn lint --fix",
        injectGeneratedDirsAndFiles: false,
      },
    },
  },
});

export default config;

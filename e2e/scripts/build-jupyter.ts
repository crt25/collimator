import { buildApp, CrtApp } from "../setup/helpers";

const main = async (): Promise<void> => {
  if (process.env.CI) {
    // the CI builds all apps in a step of its own before running the tests
    console.log("Skipping the Jupyter build: already built by the CI");
    return;
  }

  buildApp(CrtApp.jupyter);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

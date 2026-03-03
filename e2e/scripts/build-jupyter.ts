import { buildApp, CrtApp } from "../setup/helpers";

const main = async (): Promise<void> => {
  buildApp(CrtApp.jupyter);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

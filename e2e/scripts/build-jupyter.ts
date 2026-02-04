import { buildJupyterApp, JupyterApp } from "../setup/helpers";

const main = async (): Promise<void> => {
  buildJupyterApp(JupyterApp.jupyter);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

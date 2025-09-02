import { GeneralAst } from "src/ast/types/general-ast";
import JupyterInput from "src/ast/types/input/jupyter";
import { SupportedLanguage } from "./supported-languages";

export const convertJupyterToGeneralAst = (input: JupyterInput): GeneralAst => {
  if (!input.metadata.language_info) {
    throw new Error("Jupyter notebook is missing language info in metadata");
  }

  const language = input.metadata.language_info.name;

  if (!Object.values(SupportedLanguage).includes(language)) {
    throw new Error(`Unsupported programming language: ${language}`);
  }

  /*const version = input.metadata.language_info.version;

  const codeCells = input.cells.filter((c) => c.cell_type === "code");*/

  return [];
};

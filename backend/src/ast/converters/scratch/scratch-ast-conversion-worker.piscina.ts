import { GeneralAst } from "src/ast/types/general-ast";
import { convertScratchToGeneralAst } from ".";

const ScratchAsConversionWorker = ({ input }: { input: string }): GeneralAst =>
  convertScratchToGeneralAst(JSON.parse(input));

export default ScratchAsConversionWorker;

import { GeneralAst } from "../types/general-ast";

abstract class AstConverterService<T> {
  abstract convertAst(input: T): GeneralAst;
}

export default AstConverterService;

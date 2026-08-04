import { GeneralAst } from "../types/general-ast";
import { PythonSyntaxErrorDetail } from "./python/python-syntax-error";

export enum SolutionConversionStatus {
  Success = "success",
  InvalidSyntax = "invalid-syntax",
}

export type SolutionConversionResult =
  | { status: SolutionConversionStatus.Success; ast: GeneralAst }
  | {
      status: SolutionConversionStatus.InvalidSyntax;
      errors: PythonSyntaxErrorDetail[];
    };

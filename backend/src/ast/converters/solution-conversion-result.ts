import { GeneralAst } from "../types/general-ast";

export interface ConversionErrorDetail {
  message: string;
}

export class ConversionError<
  TDetail extends ConversionErrorDetail = ConversionErrorDetail,
> extends Error {
  constructor(
    message: string,
    readonly errors: TDetail[],
  ) {
    super(message);
    this.name = "ConversionError";
  }
}

export enum SolutionConversionStatus {
  Success = "success",
  InvalidInput = "invalid-input",
}

export type SolutionConversionResult =
  | { status: SolutionConversionStatus.Success; ast: GeneralAst }
  | {
      status: SolutionConversionStatus.InvalidInput;
      errors: ConversionErrorDetail[];
    };

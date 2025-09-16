import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Lambda_paramContext } from "../../generated/PythonParser";
import { Parameter } from "./param";

export const convertLambdaParam = (
  _visitor: IPythonAstVisitor,
  ctx: Lambda_paramContext,
): Parameter => {
  const name = ctx.name().getText();

  return {
    name,
    typeAnnotation: null,
    modifier: null,
    defaultValue: null,
  };
};

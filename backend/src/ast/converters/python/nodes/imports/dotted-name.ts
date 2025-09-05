import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Dotted_nameContext } from "../../generated/PythonParser";

export const convertDottedName = (
  _visitor: IPythonAstVisitor,
  ctx: Dotted_nameContext,
): string => ctx.getText();

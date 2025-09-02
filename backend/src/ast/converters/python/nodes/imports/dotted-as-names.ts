import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Dotted_as_namesContext } from "../../generated/PythonParser";
import { convertDottedAsName, PythonImport } from "./dotted-as-name";

export const convertDottedAsNames = (
  visitor: IPythonAstVisitor,
  ctx: Dotted_as_namesContext,
): PythonImport[] =>
  ctx.dotted_as_name_list().map((n) => convertDottedAsName(visitor, n));
